import { describe, it, expect } from 'vitest'
import { resolveDisputeWorkflow } from '@/lib/workflows/resolve-dispute'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const baseParams = {
  ticketId: 'ticket-1',
  disputeId: 'dispute-1',
  adminId: 'admin-1',
  resolutionSummary: 'Partial refund issued for incomplete deliverables.',
}

describe('resolveDisputeWorkflow', () => {
  it('full refund: creates ledger entry and transitions to resolved', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'open' }))  // fetch dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', organization_id: 'org-1' }))                // fetch ticket for org
      .mockReturnValueOnce(ok({ id: 'ledger-1' }))                                          // createLedgerEntry insert
      .mockReturnValueOnce(ok(null))                                                          // update dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'disputed' }))                      // engine: fetch
      .mockReturnValueOnce(ok(null))                                                          // engine: update
      .mockReturnValueOnce(ok(null))                                                          // engine: event
      .mockReturnValueOnce(ok(null))                                                          // dispute_resolved event

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_full_refund',
      refundAmountDollars: 299,
    })

    expect(result.success).toBe(true)
  })

  it('partial refund: creates ledger entry with partial amount', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'under_review' }))
      .mockReturnValueOnce(ok({ id: 'ticket-1', organization_id: 'org-1' }))
      .mockReturnValueOnce(ok({ id: 'ledger-1' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'disputed' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_partial_refund',
      refundAmountDollars: 150,
    })

    expect(result.success).toBe(true)
  })

  it('no refund: skips ledger entry creation', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'open' }))
      // no ticket fetch, no ledger insert
      .mockReturnValueOnce(ok(null))                                          // update dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'disputed' }))       // engine: fetch
      .mockReturnValueOnce(ok(null))                                           // engine: update
      .mockReturnValueOnce(ok(null))                                           // engine: event
      .mockReturnValueOnce(ok(null))                                           // dispute_resolved event

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_no_refund',
    })

    expect(result.success).toBe(true)
  })

  it('returns error when dispute not found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_no_refund',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Dispute not found')
  })

  it('returns error when dispute is already resolved', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(
      ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'resolved_no_refund' })
    )

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_no_refund',
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/resolved_no_refund/)
  })

  it('returns error when dispute update fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'open' }))
      .mockReturnValueOnce(err('update failed'))

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_no_refund',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to update dispute record')
  })

  it('returns error when ledger entry creation fails (full refund)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'open' })) // fetch dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', organization_id: 'org-1' }))               // fetch ticket for org
      .mockReturnValueOnce(err('ledger insertion failed'))                                   // createLedgerEntry insert

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_full_refund',
      refundAmountDollars: 299,
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Failed to create refund ledger entry/)
  })

  it('returns error when transition (disputed → resolved) fails (engine fetches wrong state)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'open' })) // fetch dispute
      // no refund → skip ledger
      .mockReturnValueOnce(ok(null))                                                          // update dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'completed' }))                     // engine: fetch wrong state

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_no_refund',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('resolved_full_refund without refundAmountDollars skips ledger and succeeds', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'open' })) // fetch dispute
      // refundAmountDollars undefined → ledger creation skipped
      .mockReturnValueOnce(ok(null))                                                          // update dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'disputed' }))                      // engine: fetch
      .mockReturnValueOnce(ok(null))                                                          // engine: update
      .mockReturnValueOnce(ok(null))                                                          // engine: event
      .mockReturnValueOnce(ok(null))                                                          // dispute_resolved event

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_full_refund',
      // no refundAmountDollars provided → condition `params.refundAmountDollars !== undefined` is false
    })

    expect(result.success).toBe(true)
  })

  it('returns error when dispute is in closed state (not open or under_review)', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(
      ok({ id: 'dispute-1', ticket_id: 'ticket-1', status: 'closed' })
    )

    const result = await resolveDisputeWorkflow(supabase as any, {
      ...baseParams,
      disputeStatus: 'resolved_no_refund',
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/closed/)
  })
})
