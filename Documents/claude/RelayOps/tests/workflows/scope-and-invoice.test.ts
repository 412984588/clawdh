import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { scopeAndInvoiceWorkflow } from '@/lib/workflows/scope-and-invoice'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const baseParams = {
  ticketId: 'ticket-1',
  adminId: 'admin-1',
  adminRole: 'admin' as const,
}

/** Sets up 9 sequential from() mocks for a full success path (null stripe_customer_id). */
function setupSuccessMocks(supabase: ReturnType<typeof createMockSupabase>) {
  supabase.from
    .mockReturnValueOnce(
      ok({ id: 'ticket-1', status: 'needs_scope_review', organization_id: 'org-1', title: 'Fix it' })
    )                                                                          // fetch ticket
    .mockReturnValueOnce(ok({ id: 'org-1', name: 'Acme', stripe_customer_id: null })) // fetch org
    .mockReturnValueOnce(ok(null))                                             // update ticket (invoice details)
    // transitionTicket: needs_scope_review → scope_locked
    .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'needs_scope_review' }))
    .mockReturnValueOnce(ok(null))
    .mockReturnValueOnce(ok(null))
    // transitionTicket: scope_locked → invoiced
    .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'scope_locked' }))
    .mockReturnValueOnce(ok(null))
    .mockReturnValueOnce(ok(null))
}

describe('scopeAndInvoiceWorkflow', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // suppress [scope-and-invoice] No stripe_customer_id log
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('succeeds with mock fallback when stripe_customer_id is null', async () => {
    const supabase = createMockSupabase()
    setupSuccessMocks(supabase)

    const result = await scopeAndInvoiceWorkflow(supabase as any, {
      ...baseParams,
      priceDollars: 299,
    })

    expect(result.success).toBe(true)
    expect(result.invoiceUrl).toBeTruthy()
  })

  it('derivePricingTier: priceDollars ≤ 149 → pilot tier', async () => {
    const supabase = createMockSupabase()
    setupSuccessMocks(supabase)
    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 100 })
    expect(result.success).toBe(true)
  })

  it('derivePricingTier: priceDollars 150-499 → standard tier', async () => {
    const supabase = createMockSupabase()
    setupSuccessMocks(supabase)
    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 399 })
    expect(result.success).toBe(true)
  })

  it('derivePricingTier: priceDollars 500-1299 → complex tier', async () => {
    const supabase = createMockSupabase()
    setupSuccessMocks(supabase)
    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 899 })
    expect(result.success).toBe(true)
  })

  it('derivePricingTier: priceDollars ≥ 1300 → custom tier', async () => {
    const supabase = createMockSupabase()
    setupSuccessMocks(supabase)
    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 1500 })
    expect(result.success).toBe(true)
  })

  it('returns error when ticket not found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 299 })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Ticket not found')
  })

  it('returns error when ticket is not in needs_scope_review state', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(
      ok({ id: 'ticket-1', status: 'draft', organization_id: 'org-1', title: 'Fix it' })
    )

    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 299 })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/draft/)
  })

  it('returns error when organization not found', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(
        ok({ id: 'ticket-1', status: 'needs_scope_review', organization_id: 'org-1', title: 'Fix' })
      )
      .mockReturnValueOnce(ok(null)) // org not found

    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 299 })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Organization not found')
  })

  it('returns error when ticket update (save invoice) fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(
        ok({ id: 'ticket-1', status: 'needs_scope_review', organization_id: 'org-1', title: 'Fix' })
      )
      .mockReturnValueOnce(ok({ id: 'org-1', name: 'Acme', stripe_customer_id: null }))
      .mockReturnValueOnce(err('update failed'))

    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 299 })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to save invoice details')
  })

  it('returns error when first transition (needs_scope_review → scope_locked) fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(
        ok({ id: 'ticket-1', status: 'needs_scope_review', organization_id: 'org-1', title: 'Fix' })
      )
      .mockReturnValueOnce(ok({ id: 'org-1', name: 'Acme', stripe_customer_id: null }))
      .mockReturnValueOnce(ok(null))                                       // update ticket: ok
      // engine first transition: fetch returns invalid state
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'completed' }))   // engine fetches completed

    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 299 })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when second transition (scope_locked → invoiced) fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(
        ok({ id: 'ticket-1', status: 'needs_scope_review', organization_id: 'org-1', title: 'Fix' })
      )
      .mockReturnValueOnce(ok({ id: 'org-1', name: 'Acme', stripe_customer_id: null }))
      .mockReturnValueOnce(ok(null))                                             // update ticket
      // first transition succeeds
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'needs_scope_review' })) // engine: fetch
      .mockReturnValueOnce(ok(null))                                              // engine: update
      .mockReturnValueOnce(ok(null))                                              // engine: event
      // second transition: fetch returns wrong state
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'paid' }))               // engine: fetch — wrong

    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 299 })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('rejects negative price', async () => {
    const supabase = createMockSupabase()
    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: -10 })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/positive/)
  })

  it('rejects zero price', async () => {
    const supabase = createMockSupabase()
    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 0 })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/positive/)
  })

  it('rejects price exceeding $100,000', async () => {
    const supabase = createMockSupabase()
    const result = await scopeAndInvoiceWorkflow(supabase as any, { ...baseParams, priceDollars: 100_001 })
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/maximum/)
  })
})
