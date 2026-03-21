import { describe, it, expect } from 'vitest'
import { createTicket, getTicket, listTickets } from '@/lib/services/ticket.service'
import { createMockSupabase, ok, err, okWithCount } from '../helpers/mock-supabase'

const mockTicket = {
  id: 'ticket-1',
  title: 'Fix homepage',
  status: 'draft',
  organization_id: 'org-1',
  created_by: 'user-1',
}

const createInput = {
  title: 'Fix the CRM import failure',
  category: 'crm_import_failure_diagnosis' as const,
  problem_summary: 'The CRM import is failing for all records since the last software update last week.',
  expected_output: 'All records successfully imported into the CRM system without errors.',
  acceptance_criteria_json: [{ id: '1', description: 'All 5000 records imported', required: true }],
  out_of_scope_json: [],
  sensitivity_level: 'standard' as const,
}

describe('createTicket', () => {
  it('returns ticket data on success', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(mockTicket))

    const result = await createTicket(supabase as any, createInput, 'user-1', 'org-1')
    expect(result.data).toMatchObject({ id: 'ticket-1', title: 'Fix homepage' })
    expect(result.error).toBeNull()
  })

  it('returns error when insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('duplicate key'))

    const result = await createTicket(supabase as any, createInput, 'user-1', 'org-1')
    expect(result.data).toBeNull()
    expect(result.error).toBe('duplicate key')
  })
})

describe('getTicket', () => {
  it('returns ticket data when found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(mockTicket))

    const result = await getTicket(supabase as any, 'ticket-1')
    expect(result.data?.id).toBe('ticket-1')
    expect(result.error).toBeNull()
  })

  it('returns error when ticket not found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('No rows found'))

    const result = await getTicket(supabase as any, 'missing-id')
    expect(result.data).toBeNull()
    expect(result.error).toBe('No rows found')
  })
})

describe('listTickets', () => {
  it('returns array of tickets', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([mockTicket]))

    const result = await listTickets(supabase as any, {})
    expect(result.data).toHaveLength(1)
    expect(result.error).toBeNull()
  })

  it('returns empty array when no tickets match', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([]))

    const result = await listTickets(supabase as any, { organizationId: 'org-999' })
    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })

  it('returns error on query failure', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('query error'))

    const result = await listTickets(supabase as any, {})
    expect(result.data).toEqual([])
    expect(result.error).toBe('query error')
  })

  it('applies both organizationId and status filters', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([mockTicket]))

    const result = await listTickets(supabase as any, { organizationId: 'org-1', status: 'draft' })
    expect(result.data).toHaveLength(1)
  })

  it('returns total count from paginated query', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount([mockTicket], 42))

    const result = await listTickets(supabase as any, {})
    expect(result.total).toBe(42)
    expect(result.error).toBeNull()
  })

  it('returns 0 total on query error', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('query failed'))

    const result = await listTickets(supabase as any, {})
    expect(result.total).toBe(0)
  })

  it('returns PaginatedResult shape with default pageSize=20', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount([mockTicket], 45))

    const result = await listTickets(supabase as any, {})
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(20)
    expect(result.totalPages).toBe(3) // ceil(45/20) = 3
  })

  it('respects custom pageSize', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount([mockTicket], 100))

    const result = await listTickets(supabase as any, { pageSize: 50 })
    expect(result.pageSize).toBe(50)
    expect(result.totalPages).toBe(2)
  })

  it('clamps negative page to 1', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount([mockTicket], 10))

    const result = await listTickets(supabase as any, { page: -3 })
    expect(result.page).toBe(1)
  })
})
