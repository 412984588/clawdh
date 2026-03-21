import { describe, it, expect } from 'vitest'
import { submitTicketWorkflow } from '@/lib/workflows/submit-ticket'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const actor = { id: 'user-1', role: 'partner' as const, organizationId: 'org-1' }

const createInput = {
  title: 'Fix the CRM import failure',
  category: 'crm_import_failure_diagnosis' as const,
  problem_summary: 'Imports failing for all records since last update.',
  expected_output: 'All records imported without errors.',
  acceptance_criteria_json: [{ id: '1', description: 'All records imported', required: true }],
  out_of_scope_json: [],
  sensitivity_level: 'standard' as const,
}

const mockTicket = { id: 'ticket-1', title: 'Fix the CRM import failure', status: 'draft' }

describe('submitTicketWorkflow', () => {
  it('creates ticket and transitions to submitted on success', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok(mockTicket))                                  // createTicket insert
      .mockReturnValueOnce(ok({ id: 'ticket-1' }))                         // fetch existing ticket
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'draft' }))        // engine: fetch ticket
      .mockReturnValueOnce(ok(null))                                         // engine: update status
      .mockReturnValueOnce(ok(null))                                         // engine: insert event

    const result = await submitTicketWorkflow(supabase as any, createInput, actor)

    expect(result.success).toBe(true)
    expect(result.ticketId).toBe('ticket-1')
  })

  it('returns error when createTicket fails (DB error)', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('duplicate key'))

    const result = await submitTicketWorkflow(supabase as any, createInput, actor)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when transition fails (invalid state in engine)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok(mockTicket))                                    // createTicket insert
      .mockReturnValueOnce(ok({ id: 'ticket-1' }))                           // fetch existing ticket
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'completed' }))      // engine fetches wrong status

    const result = await submitTicketWorkflow(supabase as any, createInput, actor)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when ticket data is null despite no create error', async () => {
    const supabase = createMockSupabase()
    // supabase insert returns no error but null data (e.g. RLS silently blocked)
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await submitTicketWorkflow(supabase as any, createInput, actor)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('propagates specific createTicket error message to caller', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('foreign key constraint violation'))

    const result = await submitTicketWorkflow(supabase as any, createInput, actor)

    expect(result.success).toBe(false)
    expect(result.error).toContain('foreign key constraint violation')
  })

  it('returns error when DB update fails during transition', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok(mockTicket))                                   // createTicket insert
      .mockReturnValueOnce(ok({ id: 'ticket-1' }))                          // fetch existing ticket
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'draft' }))         // engine: fetch
      .mockReturnValueOnce(err('update timeout'))                             // engine: update fails

    const result = await submitTicketWorkflow(supabase as any, createInput, actor)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('succeeds even when event insert fails (audit degraded to warn, workflow not blocked)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok(mockTicket))                                   // createTicket insert
      .mockReturnValueOnce(ok({ id: 'ticket-1' }))                          // fetch existing ticket
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'draft' }))         // engine: fetch
      .mockReturnValueOnce(ok(null))                                          // engine: update ok
      .mockReturnValueOnce(err('events table unavailable'))                   // engine: event fails

    const result = await submitTicketWorkflow(supabase as any, createInput, actor)

    // 审计事件失败降级为 warn，工单状态已成功转移，workflow 返回成功
    expect(result.success).toBe(true)
    expect(result.ticketId).toBe('ticket-1')
  })
})
