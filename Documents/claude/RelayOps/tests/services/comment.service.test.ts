import { describe, it, expect } from 'vitest'
import { addComment, getCommentsForTicket } from '@/lib/services/comment.service'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const mockComment = {
  id: 'comment-1',
  ticket_id: 'ticket-1',
  author_user_id: 'user-1',
  author_role: 'admin',
  visibility: 'partner_admin',
  body: 'Looks good!',
  created_at: new Date().toISOString(),
}

describe('addComment', () => {
  it('returns comment data on success', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(mockComment))

    const result = await addComment(supabase as any, {
      ticketId: 'ticket-1',
      authorId: 'user-1',
      authorRole: 'admin',
      visibility: 'partner_admin',
      body: 'Looks good!',
    })
    expect(result.data?.id).toBe('comment-1')
    expect(result.error).toBeNull()
  })

  it('returns error when insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('insert error'))

    const result = await addComment(supabase as any, {
      ticketId: 'ticket-1',
      authorId: 'user-1',
      authorRole: 'admin',
      visibility: 'partner_admin',
      body: 'Hmm',
    })
    expect(result.data).toBeNull()
    expect(result.error).toBe('insert error')
  })
})

describe('getCommentsForTicket', () => {
  it('admin role: retrieves all comments without visibility filter', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([mockComment]))

    const result = await getCommentsForTicket(supabase as any, 'ticket-1', 'admin')
    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
  })

  it('partner role: applies partner_admin visibility filter', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([mockComment]))

    const result = await getCommentsForTicket(supabase as any, 'ticket-1', 'partner')
    expect(result.data).toHaveLength(1)
  })

  it('worker_internal role: applies worker_admin visibility filter', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([{ ...mockComment, visibility: 'worker_admin' }]))

    const result = await getCommentsForTicket(supabase as any, 'ticket-1', 'worker_internal')
    expect(result.data).toHaveLength(1)
  })

  it('returns empty array when no comments found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await getCommentsForTicket(supabase as any, 'ticket-1', 'admin')
    expect(result).toEqual({ data: [], error: null })
  })

  it('returns error when query fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('comment query failed'))

    const result = await getCommentsForTicket(supabase as any, 'ticket-1', 'admin')
    expect(result).toEqual({ data: [], error: 'comment query failed' })
  })
})
