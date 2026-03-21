import { describe, it, expect } from 'vitest'
import { assignWorkerWorkflow } from '@/lib/workflows/assign-worker'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const params = { ticketId: 'ticket-1', workerId: 'worker-1', adminId: 'admin-1' }

describe('assignWorkerWorkflow', () => {
  it('creates assignment and transitions to assigned on success', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))            // fetch ticket
      .mockReturnValueOnce(ok({ id: 'worker-1', approval_status: 'approved', kyc_status: 'verified', nickname: 'Worker1' })) // fetch worker_profile
      .mockReturnValueOnce(ok({ id: 'assignment-1' }))                          // insert assignment
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))            // engine: fetch
      .mockReturnValueOnce(ok(null))                                              // engine: update
      .mockReturnValueOnce(ok(null))                                              // engine: event
      .mockReturnValueOnce(ok(null))                                              // assignment_created event
      .mockReturnValueOnce(ok(null))                                              // notifyTicketEvent

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(true)
    expect(result.assignmentId).toBe('assignment-1')
  })

  it('returns error when ticket not in queued state', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'assigned' }))

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/assigned/)
  })

  it('returns error when ticket not found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Ticket not found')
  })

  it('returns error when worker not found', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))
      .mockReturnValueOnce(ok(null)) // worker not found

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Worker not found')
  })

  it('returns error when worker is not approved', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))
      .mockReturnValueOnce(ok({ id: 'worker-1', approval_status: 'pending' }))

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Worker is not approved')
  })

  it('returns error when assignment insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))
      .mockReturnValueOnce(ok({ id: 'worker-1', approval_status: 'approved', kyc_status: 'verified', nickname: 'Worker1' }))
      .mockReturnValueOnce(err('insert failed'))

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to create assignment')
  })

  it('returns error when ticket is not in queued state (e.g. in_progress)', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when ticket is not in queued state (e.g. draft)', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'draft' }))

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when DB transition update fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))
      .mockReturnValueOnce(ok({ id: 'worker-1', approval_status: 'approved', kyc_status: 'verified', nickname: 'Worker1' }))
      .mockReturnValueOnce(ok({ id: 'assignment-1' }))                      // insert ok
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))        // engine: fetch
      .mockReturnValueOnce(err('update failed'))                              // engine: update fails

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('rolls back the assignment record when transition fails after insert', async () => {
    const supabase = createMockSupabase()
    const cleanupChain = ok(null)

    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))
      .mockReturnValueOnce(ok({ id: 'worker-1', approval_status: 'approved', kyc_status: 'verified', nickname: 'Worker1' }))
      .mockReturnValueOnce(ok({ id: 'assignment-1' }))
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))
      .mockReturnValueOnce(err('update failed'))
      .mockReturnValueOnce(cleanupChain)

    const result = await assignWorkerWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(cleanupChain.delete).toHaveBeenCalled()
    expect(cleanupChain.eq).toHaveBeenCalledWith('id', 'assignment-1')
  })
})
