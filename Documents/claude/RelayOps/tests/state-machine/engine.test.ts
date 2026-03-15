import { describe, it, expect, vi } from 'vitest'
import { transitionTicket } from '@/lib/state-machine/engine'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const actor = { id: 'user-1', role: 'admin' as const }
const ticketId = 'ticket-uuid-001'

describe('transitionTicket', () => {
  it('returns error when ticket is not found (fetch error)', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('not found'))

    const result = await transitionTicket(supabase as any, ticketId, 'queued', actor)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Ticket not found')
  })

  it('returns error when ticket data is null', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await transitionTicket(supabase as any, ticketId, 'queued', actor)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Ticket not found')
  })

  it('returns error for invalid transition', async () => {
    const supabase = createMockSupabase()
    // Ticket is in 'completed' — no valid transitions from completed
    supabase.from.mockReturnValueOnce(ok({ id: ticketId, status: 'completed' }))

    const result = await transitionTicket(supabase as any, ticketId, 'draft', actor)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Cannot transition/)
  })

  it('returns error when role guard rejects the transition', async () => {
    const supabase = createMockSupabase()
    // queued → assigned is valid but admin-only; use 'partner' role to trigger guard
    supabase.from.mockReturnValueOnce(ok({ id: ticketId, status: 'queued' }))

    const result = await transitionTicket(
      supabase as any,
      ticketId,
      'assigned',
      { id: 'user-2', role: 'partner' }
    )
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/cannot transition/)
  })

  it('returns error when DB update fails', async () => {
    const supabase = createMockSupabase()
    // assigned → in_progress is a valid transition for admin
    supabase.from
      .mockReturnValueOnce(ok({ id: ticketId, status: 'assigned' })) // fetch
      .mockReturnValueOnce(err('DB write error'))                      // update

    const result = await transitionTicket(supabase as any, ticketId, 'in_progress', actor)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to update ticket status')
  })

  it('succeeds even when event insert fails (non-fatal)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: ticketId, status: 'assigned' })) // fetch
      .mockReturnValueOnce(ok(null))                                   // update ok
      .mockReturnValueOnce(err('event table unavailable'))             // event insert fails

    const result = await transitionTicket(supabase as any, ticketId, 'in_progress', actor)
    expect(result.success).toBe(true)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('returns success on a fully valid transition', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: ticketId, status: 'assigned' })) // fetch
      .mockReturnValueOnce(ok(null))                                   // update ok
      .mockReturnValueOnce(ok(null))                                   // event insert ok

    const result = await transitionTicket(supabase as any, ticketId, 'in_progress', actor)
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })
})
