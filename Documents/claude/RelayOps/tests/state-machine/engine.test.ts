import { describe, it, expect } from 'vitest'
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
    const fetchChain = ok({ id: ticketId, status: 'completed' })
    const eventChain = ok(null)
    supabase.from
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(eventChain)

    const result = await transitionTicket(supabase as any, ticketId, 'draft', actor)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Cannot transition/)
    expect(eventChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ticket_id: ticketId,
        actor_user_id: actor.id,
        actor_role: actor.role,
        event_type: 'status_change_rejected',
        payload_json: expect.objectContaining({
          from: 'completed',
          to: 'draft',
          reason: 'invalid_transition',
        }),
      })
    )
  })

  it('returns error when role guard rejects the transition', async () => {
    const supabase = createMockSupabase()
    // queued → assigned is valid but admin-only; use 'partner' role to trigger guard
    const fetchChain = ok({ id: ticketId, status: 'queued' })
    const eventChain = ok(null)
    supabase.from
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(eventChain)

    const result = await transitionTicket(
      supabase as any,
      ticketId,
      'assigned',
      { id: 'user-2', role: 'partner' }
    )
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/cannot transition/)
    expect(eventChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ticket_id: ticketId,
        actor_user_id: 'user-2',
        actor_role: 'partner',
        event_type: 'status_change_rejected',
        payload_json: expect.objectContaining({
          from: 'queued',
          to: 'assigned',
          reason: 'guard_rejected',
        }),
      })
    )
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

  it('returns success even when event insert fails (audit degraded to warn)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: ticketId, status: 'assigned' })) // fetch
      .mockReturnValueOnce(ok(null))                                   // update ok
      .mockReturnValueOnce(err('event table unavailable'))             // event insert fails

    const result = await transitionTicket(supabase as any, ticketId, 'in_progress', actor)
    // 审计事件写入失败降级为 warn，状态转移本身成功，workflow 不卡死
    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
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
