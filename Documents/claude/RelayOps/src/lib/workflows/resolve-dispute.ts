import type { SupabaseClient } from '@supabase/supabase-js'
import type { DisputeStatus } from '@/lib/types/enums'
import { transitionTicket } from '@/lib/state-machine/engine'
import { createLedgerEntry } from '@/lib/services/ledger.service'
import { notifyTicketEvent } from '@/lib/services/notification.service'

type ResolutionDisputeStatus =
  | 'resolved_full_refund'
  | 'resolved_partial_refund'
  | 'resolved_no_refund'

interface ResolveDisputeParams {
  ticketId: string
  disputeId: string
  adminId: string
  resolutionSummary: string
  disputeStatus: ResolutionDisputeStatus
  refundAmountDollars?: number
}

interface ResolveDisputeResult {
  success: boolean
  error?: string
}

export async function resolveDisputeWorkflow(
  supabase: SupabaseClient,
  params: ResolveDisputeParams
): Promise<ResolveDisputeResult> {
  // 1. Validate dispute is 'open' or 'under_review'
  const { data: dispute } = await supabase
    .from('disputes')
    .select('id, ticket_id, status')
    .eq('id', params.disputeId)
    .single()

  if (!dispute) return { success: false, error: 'Dispute not found' }

  const validStatuses: DisputeStatus[] = ['open', 'under_review']
  if (!validStatuses.includes(dispute.status as DisputeStatus)) {
    return {
      success: false,
      error: `Dispute is in "${dispute.status}" state, expected open or under_review`,
    }
  }

  // 2. Handle refund ledger entry if applicable
  let refundLedgerEntryId: string | null = null
  if (
    params.disputeStatus !== 'resolved_no_refund' &&
    params.refundAmountDollars !== undefined &&
    params.refundAmountDollars > 0
  ) {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('organization_id')
      .eq('id', params.ticketId)
      .single()

    const ledgerResult = await createLedgerEntry(supabase, {
      ticketId: params.ticketId,
      organizationId: ticket?.organization_id ?? undefined,
      disputeId: params.disputeId,
      type: 'refund',
      amountDollars: params.refundAmountDollars,
      metadata: {
        dispute_resolution: params.disputeStatus,
        resolution_summary: params.resolutionSummary,
      },
    })

    if (ledgerResult.error) {
      return { success: false, error: `Failed to create refund ledger entry: ${ledgerResult.error}` }
    }

    refundLedgerEntryId = ledgerResult.data?.id ?? null
  }

  // 3. Update dispute record with resolution
  const { error: updateError } = await supabase
    .from('disputes')
    .update({
      status: params.disputeStatus,
      resolution_summary: params.resolutionSummary,
      resolved_by_user_id: params.adminId,
      resolved_at: new Date().toISOString(),
      refund_ledger_entry_id: refundLedgerEntryId,
    })
    .eq('id', params.disputeId)

  if (updateError) {
    return { success: false, error: 'Failed to update dispute record' }
  }

  // 4. Transition ticket: disputed → resolved
  const transitionResult = await transitionTicket(
    supabase,
    params.ticketId,
    'resolved',
    { id: params.adminId, role: 'admin' },
    {
      dispute_id: params.disputeId,
      resolution: params.disputeStatus,
    }
  )

  if (!transitionResult.success) return { success: false, error: transitionResult.error }

  // 5. Insert dispute_resolved event
  await supabase.from('ticket_events').insert({
    ticket_id: params.ticketId,
    actor_user_id: params.adminId,
    actor_role: 'admin',
    event_type: 'dispute_resolved',
    payload_json: {
      dispute_id: params.disputeId,
      resolution: params.disputeStatus,
      refund_amount: params.refundAmountDollars ?? 0,
    },
  })

  // 6. 通知：争议已解决
  await notifyTicketEvent(supabase, params.ticketId, 'dispute_resolved', {
    resolution: params.disputeStatus,
  })

  return { success: true }
}
