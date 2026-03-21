import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/types/enums'
import { transitionTicket } from '@/lib/state-machine/engine'
import { notifyTicketEvent } from '@/lib/services/notification.service'

interface RaiseDisputeParams {
  ticketId: string
  raisedByUserId: string
  raisedByRole: UserRole
  reason: string
}

interface RaiseDisputeResult {
  success: boolean
  disputeId?: string
  error?: string
}

export async function raiseDisputeWorkflow(
  supabase: SupabaseClient,
  params: RaiseDisputeParams
): Promise<RaiseDisputeResult> {
  // 1. Validate ticket is in 'approved' state
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, status')
    .eq('id', params.ticketId)
    .single()

  if (!ticket) return { success: false, error: 'Ticket not found' }
  if (ticket.status !== 'approved') {
    return {
      success: false,
      error: `Ticket is in "${ticket.status}" state, expected approved`,
    }
  }

  // 2. Create dispute record (status: 'open')
  const { data: dispute, error: disputeError } = await supabase
    .from('disputes')
    .insert({
      ticket_id: params.ticketId,
      raised_by_user_id: params.raisedByUserId,
      raised_by_role: params.raisedByRole,
      reason: params.reason,
      status: 'open',
    })
    .select('id')
    .single()

  if (disputeError || !dispute) {
    return { success: false, error: 'Failed to create dispute' }
  }

  // 3. Transition ticket: approved → disputed
  const transitionResult = await transitionTicket(
    supabase,
    params.ticketId,
    'disputed',
    { id: params.raisedByUserId, role: params.raisedByRole },
    { dispute_id: dispute.id }
  )

  if (!transitionResult.success) return { success: false, error: transitionResult.error }

  // 4. Insert dispute_opened event
  await supabase.from('ticket_events').insert({
    ticket_id: params.ticketId,
    actor_user_id: params.raisedByUserId,
    actor_role: params.raisedByRole,
    event_type: 'dispute_opened',
    payload_json: {
      dispute_id: dispute.id,
      reason: params.reason,
    },
  })

  // 5. 通知：争议已开启
  await notifyTicketEvent(supabase, params.ticketId, 'dispute_opened', {
    reason: params.reason,
  })

  return { success: true, disputeId: dispute.id }
}
