import type { SupabaseClient } from '@supabase/supabase-js'
import { transitionTicket } from '@/lib/state-machine/engine'
import { notifyTicketEvent } from '@/lib/services/notification.service'

interface AssignWorkerParams {
  ticketId: string
  workerId: string
  adminId: string
}

interface AssignWorkerResult {
  success: boolean
  assignmentId?: string
  error?: string
}

export async function assignWorkerWorkflow(
  supabase: SupabaseClient,
  params: AssignWorkerParams
): Promise<AssignWorkerResult> {
  // 1. Validate ticket is in 'queued' state
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, status')
    .eq('id', params.ticketId)
    .single()

  if (!ticket) return { success: false, error: 'Ticket not found' }
  if (ticket.status !== 'queued') {
    return {
      success: false,
      error: `Ticket is in "${ticket.status}" state, expected queued`,
    }
  }

  // 2. Validate worker exists, is approved, and KYC verified
  const { data: workerProfile } = await supabase
    .from('worker_profiles')
    .select('id, approval_status, kyc_status, nickname')
    .eq('id', params.workerId)
    .single()

  if (!workerProfile) return { success: false, error: 'Worker not found' }
  if (workerProfile.approval_status !== 'approved') {
    return { success: false, error: 'Worker is not approved' }
  }
  if (workerProfile.kyc_status !== 'verified') {
    return { success: false, error: 'Worker KYC is not verified' }
  }

  // 3. Create ticket_assignments record (status: 'pending')
  const { data: assignment, error: assignError } = await supabase
    .from('ticket_assignments')
    .insert({
      ticket_id: params.ticketId,
      worker_id: params.workerId,
      assigned_by: params.adminId,
      assigned_at: new Date().toISOString(),
      status: 'pending',
    })
    .select('id')
    .single()

  if (assignError || !assignment) {
    return { success: false, error: 'Failed to create assignment' }
  }

  // 4. Transition ticket: queued → assigned
  const transitionResult = await transitionTicket(
    supabase,
    params.ticketId,
    'assigned',
    { id: params.adminId, role: 'admin' },
    { assignment_id: assignment.id, worker_id: params.workerId }
  )

  if (!transitionResult.success) {
    await supabase.from('ticket_assignments').delete().eq('id', assignment.id)
    return { success: false, error: transitionResult.error }
  }

  // 5. Insert assignment_created event
  await supabase.from('ticket_events').insert({
    ticket_id: params.ticketId,
    actor_user_id: params.adminId,
    actor_role: 'admin',
    event_type: 'assignment_created',
    payload_json: {
      assignment_id: assignment.id,
      worker_id: params.workerId,
    },
  })

  // 6. 通知：工人已分配（传入 nickname 供邮件模板使用）
  await notifyTicketEvent(supabase, params.ticketId, 'assignment_created', {
    worker_id: params.workerId,
    worker_nickname: workerProfile.nickname,
  })

  return { success: true, assignmentId: assignment.id }
}
