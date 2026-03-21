import { describe, it, expect } from 'vitest'
import { raiseDisputeWorkflow } from '@/lib/workflows/raise-dispute'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const params = {
  ticketId: 'ticket-1',
  raisedByUserId: 'user-1',
  raisedByRole: 'partner' as const,
  reason: 'Work does not meet acceptance criteria',
}

describe('raiseDisputeWorkflow', () => {
  it('creates dispute and transitions to disputed on success', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' })) // fetch ticket
      .mockReturnValueOnce(ok({ id: 'dispute-1' }))                    // insert dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' })) // engine: fetch
      .mockReturnValueOnce(ok(null))                                     // engine: update
      .mockReturnValueOnce(ok(null))                                     // engine: event
      .mockReturnValueOnce(ok(null))                                     // dispute_opened event

    const result = await raiseDisputeWorkflow(supabase as any, params)

    expect(result.success).toBe(true)
    expect(result.disputeId).toBe('dispute-1')
  })

  it('returns error when ticket is not in approved state', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))

    const result = await raiseDisputeWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/in_progress/)
  })

  it('returns error when ticket not found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await raiseDisputeWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Ticket not found')
  })

  it('returns error when dispute insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' }))
      .mockReturnValueOnce(err('foreign key violation'))

    const result = await raiseDisputeWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to create dispute')
  })

  it('returns error when ticket is in completed state (not approved)', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'completed' }))

    const result = await raiseDisputeWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/completed/)
  })

  it('returns error when transition (approved → disputed) fails (engine fetches wrong state)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' }))    // fetch ticket
      .mockReturnValueOnce(ok({ id: 'dispute-1' }))                        // insert dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' })) // engine: fetch wrong state

    const result = await raiseDisputeWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('worker_internal role cannot raise dispute (role guard fails in engine)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' }))    // fetch ticket
      .mockReturnValueOnce(ok({ id: 'dispute-1' }))                        // insert dispute
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' }))    // engine: fetch (role guard will reject)

    const result = await raiseDisputeWorkflow(supabase as any, {
      ...params,
      raisedByRole: 'worker_internal',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when dispute data is null despite no insert error', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' }))
      .mockReturnValueOnce(ok(null)) // insert returns null (RLS silently blocked)

    const result = await raiseDisputeWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to create dispute')
  })
})
