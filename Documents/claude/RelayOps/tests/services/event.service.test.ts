import { describe, it, expect } from 'vitest'
import { logEvent, getTicketEvents } from '@/lib/services/event.service'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const mockEvent = {
  id: 'evt-1',
  ticket_id: 'ticket-1',
  event_type: 'status_changed',
  actor_user_id: 'user-1',
  actor_role: 'admin',
  payload_json: { from: 'draft', to: 'submitted' },
  created_at: new Date().toISOString(),
}

describe('logEvent', () => {
  it('returns no error on success', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    await expect(
      logEvent(supabase as any, 'ticket-1', 'user-1', 'admin', 'status_changed', { from: 'draft' })
    ).resolves.toEqual({ error: null })
  })

  it('accepts null actor id and role', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    await expect(
      logEvent(supabase as any, 'ticket-1', null, null, 'system_event')
    ).resolves.toEqual({ error: null })
  })

  it('returns error when insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('insert failed'))

    await expect(
      logEvent(supabase as any, 'ticket-1', 'user-1', 'admin', 'status_changed')
    ).resolves.toEqual({ error: 'insert failed' })
  })
})

describe('getTicketEvents', () => {
  it('returns events array for a ticket', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([mockEvent]))

    const result = await getTicketEvents(supabase as any, 'ticket-1')
    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].event_type).toBe('status_changed')
  })

  it('returns empty array when no events exist', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([]))

    const result = await getTicketEvents(supabase as any, 'ticket-new')
    expect(result).toEqual({ data: [], error: null })
  })

  it('returns error when query fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('query failed'))

    const result = await getTicketEvents(supabase as any, 'ticket-1')
    expect(result).toEqual({ data: [], error: 'query failed' })
  })
})
