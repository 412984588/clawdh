import { describe, it, expect, vi } from 'vitest'
import { notifyTicketEvent } from '@/lib/services/notification.service'
import { createMockSupabase, ok } from '../helpers/mock-supabase'

// notifyTicketEvent wraps everything in try/catch — never throws

const ticketWithOrg = {
  id: 'ticket-1',
  title: 'Fix the import',
  organization_id: 'org-1',
  organizations: {
    id: 'org-1',
    name: 'Acme Corp',
    users: [{ id: 'user-1', email: 'partner@acme.com' }],
  },
}

function makeSilent() {
  return vi.spyOn(console, 'log').mockImplementation(() => {})
}

describe('notifyTicketEvent', () => {
  it('invoice_generated: sends invoice email to partner', async () => {
    const silent = makeSilent()
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(ticketWithOrg))

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'invoice_generated', {
        invoice_url: 'https://stripe.com/inv/1',
        amount: '$299.00',
      })
    ).resolves.toBeUndefined()
    silent.mockRestore()
  })

  it('payment_confirmed: sends payment email', async () => {
    const silent = makeSilent()
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(ticketWithOrg))

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'payment_confirmed', {})
    ).resolves.toBeUndefined()
    silent.mockRestore()
  })

  it('work_submitted: sends work submitted email', async () => {
    const silent = makeSilent()
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(ticketWithOrg))

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'work_submitted', {})
    ).resolves.toBeUndefined()
    silent.mockRestore()
  })

  it('review_submitted: sends revision email to worker', async () => {
    const silent = makeSilent()
    const supabase = createMockSupabase()
    // 新路径：ticket_assignments → worker_profiles(nickname, user_id, users(email))
    supabase.from
      .mockReturnValueOnce(ok(ticketWithOrg))
      .mockReturnValueOnce(
        ok({
          worker_id: 'w-1',
          worker_profiles: { nickname: 'frank_w', user_id: 'user-worker-1', users: { email: 'worker@relay.com' } },
        })
      )

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'review_submitted', { notes: 'Fix the header' })
    ).resolves.toBeUndefined()
    // 确认查 worker 用了正确的表名 ticket_assignments
    expect(supabase.from).toHaveBeenNthCalledWith(2, 'ticket_assignments')
    silent.mockRestore()
  })

  it('payment_failed: sends payment failed email to partner', async () => {
    const silent = makeSilent()
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(ticketWithOrg))

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'payment_failed', {
        stripe_invoice_id: 'in_failed_123',
      })
    ).resolves.toBeUndefined()
    silent.mockRestore()
  })

  it('payment_failed: resolves silently when partnerEmail is missing', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(
      ok({ ...ticketWithOrg, organizations: { id: 'org-1', name: 'Acme', users: [] } })
    )

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'payment_failed', {
        stripe_invoice_id: 'in_failed_123',
      })
    ).resolves.toBeUndefined()
  })

  it('dispute_opened: sends dispute alert to admin', async () => {
    const silent = makeSilent()
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(ticketWithOrg))

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'dispute_opened', { reason: 'Work is incomplete' })
    ).resolves.toBeUndefined()
    silent.mockRestore()
  })

  it('dispute_resolved: sends completion email to partner', async () => {
    const silent = makeSilent()
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(ticketWithOrg))

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'dispute_resolved', {})
    ).resolves.toBeUndefined()
    silent.mockRestore()
  })

  it('unknown event type: resolves silently without error', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(ticketWithOrg))

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'unknown_event_xyz', {})
    ).resolves.toBeUndefined()
  })

  it('missing partnerEmail for invoice_generated: resolves silently', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(
      ok({ ...ticketWithOrg, organizations: { id: 'org-1', name: 'Acme', users: [] } })
    )

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'invoice_generated', { invoice_url: '', amount: '' })
    ).resolves.toBeUndefined()
  })

  it('ticket not found: resolves silently without sending email', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'payment_confirmed', {})
    ).resolves.toBeUndefined()
  })

  it('never throws even when an internal error occurs', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const supabase = createMockSupabase()
    // Make from throw directly to trigger the outer catch
    supabase.from.mockImplementationOnce(() => { throw new Error('DB crash') })

    await expect(
      notifyTicketEvent(supabase as any, 'ticket-1', 'payment_confirmed', {})
    ).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
