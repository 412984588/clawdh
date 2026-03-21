import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

// mockAdmin captured by closure — updated in beforeEach before each test
let mockAdmin: ReturnType<typeof createMockSupabase>

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdmin,
}))

import { handlePaymentWorkflow } from '@/lib/workflows/handle-payment'

const params = {
  stripeInvoiceId: 'in_stripe_123',
  amountPaidDollars: 299,
  currency: 'usd',
  stripeCustomerId: 'cus_abc',
}

describe('handlePaymentWorkflow', () => {
  beforeEach(() => {
    mockAdmin = createMockSupabase()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('processes payment: atomic claim, creates ledger, double-transitions invoiced→paid→queued, then confirms ledger', async () => {
    mockAdmin.from
      // 1. conditional update claim: status='invoiced' → success
      .mockReturnValueOnce(ok({ id: 'ticket-1', organization_id: 'org-1' }))
      // 2. createLedgerEntry insert
      .mockReturnValueOnce(ok({ id: 'ledger-1' }))
      // 3. transitionTicket invoiced → paid (engine: fetch, update, event)
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'invoiced' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
      // 4. transitionTicket paid → queued (engine: fetch, update, event)
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'paid' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
      // 5. confirmLedgerEntry update (after both transitions succeed)
      .mockReturnValueOnce(ok(null))

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(true)
    expect(result.ticketId).toBe('ticket-1')
  })

  it('recovers a paid ticket by creating a missing ledger entry', async () => {
    mockAdmin.from
      // conditional update: no match (status != invoiced)
      .mockReturnValueOnce(ok(null))
      // fallback select: find existing ticket with status='paid'
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'paid', organization_id: 'org-1' }))
      // no existing invoice_payment ledger entry
      .mockReturnValueOnce(ok(null))
      // create a replacement pending ledger entry
      .mockReturnValueOnce(ok({ id: 'ledger-1', status: 'pending' }))
      // transitionTicket paid → queued
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'paid' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
      // confirm the newly created ledger entry
      .mockReturnValueOnce(ok(null))

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(true)
    expect(result.ticketId).toBe('ticket-1')
    expect(mockAdmin.from).toHaveBeenCalledWith('ledger_entries')
  })

  it('idempotency: returns success immediately when ticket is already queued', async () => {
    mockAdmin.from
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(true)
    expect(mockAdmin.from).toHaveBeenCalledTimes(2)
  })

  it('recovers a partially processed payment when ticket is already paid', async () => {
    mockAdmin.from
      // conditional update: no match because ticket is already paid
      .mockReturnValueOnce(ok(null))
      // fallback select: find existing ticket stuck in paid
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'paid', organization_id: 'org-1' }))
      // lookup existing invoice_payment ledger entry
      .mockReturnValueOnce(ok({
        id: 'ledger-1',
        status: 'pending',
        metadata_json: { stripe_invoice_id: params.stripeInvoiceId },
      }))
      // transitionTicket paid → queued
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'paid' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
      // confirm pending ledger after recovery
      .mockReturnValueOnce(ok(null))

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(true)
    expect(result.ticketId).toBe('ticket-1')
    expect(mockAdmin.from).toHaveBeenCalledWith('ledger_entries')
  })

  it('returns error when no ticket found for invoice', async () => {
    mockAdmin.from
      // conditional update: no match
      .mockReturnValueOnce(ok(null))
      // fallback select: no ticket found
      .mockReturnValueOnce(ok(null))

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Ticket not found for this invoice')
  })

  it('returns error when ticket is in unexpected status (not invoiced/paid/queued)', async () => {
    mockAdmin.from
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'draft' }))

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/draft/)
  })

  it('returns error and does not transition when ledger entry creation fails', async () => {
    mockAdmin.from
      // 1. conditional update claim: success
      .mockReturnValueOnce(ok({ id: 'ticket-1', organization_id: 'org-1' }))
      // 2. createLedgerEntry insert fails
      .mockReturnValueOnce(err('ledger insert failed'))

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to create payment ledger entry')
  })

  it('returns error when recovery ledger creation fails for an already paid ticket', async () => {
    mockAdmin.from
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'paid', organization_id: 'org-1' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(err('ledger insert failed'))

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to create recovery ledger entry')
  })

  it('succeeds when audit event fails on invoiced→paid (audit degraded to warn)', async () => {
    mockAdmin.from
      // 1. conditional update claim: success
      .mockReturnValueOnce(ok({ id: 'ticket-1', organization_id: 'org-1' }))
      // 2. createLedgerEntry insert
      .mockReturnValueOnce(ok({ id: 'ledger-1' }))
      // 3. engine invoiced→paid: fetch + update succeed, but event insert fails → warn, success: true
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'invoiced' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(err('db error on event insert'))
      // 4. engine paid→queued: fetch + update + event (all succeed)
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'paid' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
      // 5. confirmLedgerEntry update
      .mockReturnValueOnce(ok(null))
      // notifyTicketEvent uses default mock (null/null → silently ok)

    const result = await handlePaymentWorkflow(params)

    expect(result.success).toBe(true)
    expect(result.ticketId).toBe('ticket-1')
  })
})
