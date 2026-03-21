import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/types/enums'
import { transitionTicket } from '@/lib/state-machine/engine'
import { notifyTicketEvent } from '@/lib/services/notification.service'

interface ReviewSubmissionParams {
  ticketId: string
  reviewerId: string
  reviewerRole: UserRole
  decision: 'approved' | 'revision_requested'
  acceptanceFailures: string[]
  notes?: string
}

interface ReviewSubmissionResult {
  success: boolean
  reviewId?: string
  error?: string
}

export async function reviewSubmissionWorkflow(
  supabase: SupabaseClient,
  params: ReviewSubmissionParams
): Promise<ReviewSubmissionResult> {
  // 1. Validate ticket is in 'submitted_for_review' state
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, status')
    .eq('id', params.ticketId)
    .single()

  if (!ticket) return { success: false, error: 'Ticket not found' }
  if (ticket.status !== 'submitted_for_review') {
    return {
      success: false,
      error: `Ticket is in "${ticket.status}" state, expected submitted_for_review`,
    }
  }

  // 2. Create review record
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      ticket_id: params.ticketId,
      reviewer_role: params.reviewerRole,
      reviewer_user_id: params.reviewerId,
      decision: params.decision,
      acceptance_failures_json: params.acceptanceFailures,
      notes: params.notes ?? null,
    })
    .select('id')
    .single()

  if (reviewError || !review) {
    return { success: false, error: 'Failed to create review record' }
  }

  // 3. Transition based on decision
  if (params.decision === 'approved') {
    // Transition: submitted_for_review → approved
    const transitionResult = await transitionTicket(
      supabase,
      params.ticketId,
      'approved',
      { id: params.reviewerId, role: params.reviewerRole },
      { review_id: review.id }
    )
    if (!transitionResult.success) return { success: false, error: transitionResult.error }
  } else {
    // decision === 'revision_requested'
    // Transition: submitted_for_review → revision_requested
    const toRevisionResult = await transitionTicket(
      supabase,
      params.ticketId,
      'revision_requested',
      { id: params.reviewerId, role: params.reviewerRole },
      { review_id: review.id, failures: params.acceptanceFailures }
    )
    if (!toRevisionResult.success) return { success: false, error: toRevisionResult.error }

    const reopenActor =
      params.reviewerRole === 'partner'
        ? { role: 'admin' as const }
        : { id: params.reviewerId, role: params.reviewerRole }

    // Also transition back: revision_requested → in_progress
    const toInProgressResult = await transitionTicket(
      supabase,
      params.ticketId,
      'in_progress',
      reopenActor,
      { review_id: review.id }
    )
    if (!toInProgressResult.success) return { success: false, error: toInProgressResult.error }
  }

  // 4. Insert review_submitted event
  await supabase.from('ticket_events').insert({
    ticket_id: params.ticketId,
    actor_user_id: params.reviewerId,
    actor_role: params.reviewerRole,
    event_type: 'review_submitted',
    payload_json: {
      review_id: review.id,
      decision: params.decision,
      acceptance_failures: params.acceptanceFailures,
    },
  })

  // 5. 通知：审核已提交
  await notifyTicketEvent(supabase, params.ticketId, 'review_submitted', {
    decision: params.decision,
    notes: params.notes ?? '',
  })

  return { success: true, reviewId: review.id }
}
