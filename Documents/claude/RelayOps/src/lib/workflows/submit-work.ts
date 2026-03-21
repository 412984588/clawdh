import type { SupabaseClient } from '@supabase/supabase-js'
import { transitionTicket } from '@/lib/state-machine/engine'
import { notifyTicketEvent } from '@/lib/services/notification.service'
import { logger } from '@/lib/utils/logger'

interface SubmitWorkParams {
  ticketId: string
  workerId: string
  deliverySummary: string
  attachmentIds: string[]
}

interface SubmitWorkResult {
  success: boolean
  submissionId?: string
  error?: string
}

async function rollbackSubmissionArtifacts(
  supabase: SupabaseClient,
  submissionId: string,
  ticketId: string,
  assignmentId: string,
  originalAssignmentStatus: string,
  attachmentIds: string[]
): Promise<void> {
  if (attachmentIds.length > 0) {
    await supabase
      .from('attachments')
      .update({ submission_id: null })
      .in('id', attachmentIds)
      .eq('ticket_id', ticketId)
  }

  await supabase
    .from('ticket_assignments')
    .update({ status: originalAssignmentStatus })
    .eq('id', assignmentId)

  await supabase.from('submissions').delete().eq('id', submissionId)
}

export async function submitWorkWorkflow(
  supabase: SupabaseClient,
  params: SubmitWorkParams
): Promise<SubmitWorkResult> {
  // 1. Validate ticket is in 'in_progress' state
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, status')
    .eq('id', params.ticketId)
    .single()

  if (!ticket) return { success: false, error: 'Ticket not found' }
  if (ticket.status !== 'in_progress') {
    return {
      success: false,
      error: `Ticket is in "${ticket.status}" state, expected in_progress`,
    }
  }

  // 2. Validate worker is assigned to this ticket
  const { data: assignment } = await supabase
    .from('ticket_assignments')
    .select('id, status')
    .eq('ticket_id', params.ticketId)
    .eq('worker_id', params.workerId)
    .in('status', ['in_progress', 'acknowledged'])
    .single()

  if (!assignment) {
    return { success: false, error: 'Worker is not assigned to this ticket' }
  }

  // 3. Create submission record (status: 'submitted')
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .insert({
      ticket_id: params.ticketId,
      worker_id: params.workerId,
      delivery_summary: params.deliverySummary,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
    })
    .select('id')
    .single()

  if (submissionError || !submission) {
    return { success: false, error: 'Failed to create submission' }
  }

  // 4. Link attachments to this submission if provided
  if (params.attachmentIds.length > 0) {
    const { error: attachmentError } = await supabase
      .from('attachments')
      .update({ submission_id: submission.id })
      .in('id', params.attachmentIds)
      .eq('ticket_id', params.ticketId)
    if (attachmentError) {
      logger.error('Failed to link attachments to submission', {
        context: 'submit-work-workflow',
        submissionId: submission.id,
        error: attachmentError.message,
      })
    }
  }

  // 5. Mark assignment as completed
  const { error: assignmentUpdateError } = await supabase
    .from('ticket_assignments')
    .update({ status: 'completed' })
    .eq('id', assignment.id)

  if (assignmentUpdateError) {
    await rollbackSubmissionArtifacts(
      supabase,
      submission.id,
      params.ticketId,
      assignment.id,
      assignment.status,
      params.attachmentIds
    )
    return { success: false, error: assignmentUpdateError.message }
  }

  // 6. Transition ticket: in_progress → submitted_for_review
  const transitionResult = await transitionTicket(
    supabase,
    params.ticketId,
    'submitted_for_review',
    { id: params.workerId, role: 'worker_internal' },
    { submission_id: submission.id }
  )

  if (!transitionResult.success) {
    await rollbackSubmissionArtifacts(
      supabase,
      submission.id,
      params.ticketId,
      assignment.id,
      assignment.status,
      params.attachmentIds
    )
    return { success: false, error: transitionResult.error }
  }

  // 7. Insert work_submitted event with submission id in payload
  const { error: eventError } = await supabase.from('ticket_events').insert({
    ticket_id: params.ticketId,
    actor_user_id: params.workerId,
    actor_role: 'worker_internal',
    event_type: 'work_submitted',
    payload_json: {
      submission_id: submission.id,
      attachment_ids: params.attachmentIds,
    },
  })
  if (eventError) {
    logger.error('Failed to log work_submitted event', {
      context: 'submit-work-workflow',
      submissionId: submission.id,
      error: eventError.message,
    })
  }

  // 8. 通知：工作已提交
  await notifyTicketEvent(supabase, params.ticketId, 'work_submitted', {
    submission_id: submission.id,
  })

  return { success: true, submissionId: submission.id }
}
