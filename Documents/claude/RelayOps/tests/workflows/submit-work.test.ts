import { vi, describe, it, expect } from 'vitest'
import { submitWorkWorkflow } from '@/lib/workflows/submit-work'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'
import { logger } from '@/lib/utils/logger'

vi.mock('@/lib/utils/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }))

const params = {
  ticketId: 'ticket-1',
  workerId: 'worker-1',
  deliverySummary: 'All tasks completed successfully.',
  attachmentIds: ['att-1'],
}

describe('submitWorkWorkflow', () => {
  it('creates submission and transitions to submitted_for_review', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))           // fetch ticket
      .mockReturnValueOnce(ok({ id: 'assignment-1', status: 'acknowledged' }))       // fetch assignment
      .mockReturnValueOnce(ok({ id: 'submission-1' }))                               // insert submission
      .mockReturnValueOnce(ok(null))                                                   // update attachments
      .mockReturnValueOnce(ok(null))                                                   // update assignment status
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))            // engine: fetch
      .mockReturnValueOnce(ok(null))                                                   // engine: update
      .mockReturnValueOnce(ok(null))                                                   // engine: event
      .mockReturnValueOnce(ok(null))                                                   // work_submitted event

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(true)
    expect(result.submissionId).toBe('submission-1')
  })

  it('skips attachment update when no attachments provided', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: 'assignment-1', status: 'acknowledged' }))
      .mockReturnValueOnce(ok({ id: 'submission-1' }))
      // no attachment update (attachmentIds=[])
      .mockReturnValueOnce(ok(null))                                    // update assignment status
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))                                    // work_submitted event

    const result = await submitWorkWorkflow(supabase as any, { ...params, attachmentIds: [] })

    expect(result.success).toBe(true)
    expect(result.submissionId).toBe('submission-1')
  })

  it('returns error when ticket is not in_progress', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'assigned' }))

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/assigned/)
  })

  it('returns error when ticket not found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Ticket not found')
  })

  it('returns error when worker is not assigned', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))
      .mockReturnValueOnce(ok(null)) // no assignment

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Worker is not assigned to this ticket')
  })

  it('returns error when submission insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: 'assignment-1', status: 'acknowledged' }))
      .mockReturnValueOnce(err('constraint violation'))

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to create submission')
  })

  it('returns error when assignment update status fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: 'assignment-1', status: 'acknowledged' }))
      .mockReturnValueOnce(ok({ id: 'submission-1' }))
      .mockReturnValueOnce(ok(null))                                           // update attachments
      .mockReturnValueOnce(err('assignment status update failed'))              // update assignment status

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when transition to submitted_for_review fails (DB update error)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: 'assignment-1', status: 'acknowledged' }))
      .mockReturnValueOnce(ok({ id: 'submission-1' }))
      .mockReturnValueOnce(ok(null))                                           // update attachments
      .mockReturnValueOnce(ok(null))                                           // update assignment status
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))    // engine: fetch
      .mockReturnValueOnce(err('update failed'))                               // engine: update fails

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('rolls back submission side effects when transition fails', async () => {
    const supabase = createMockSupabase()
    const attachmentRollbackChain = ok(null)
    const assignmentRollbackChain = ok(null)
    const submissionDeleteChain = ok(null)

    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))
      .mockReturnValueOnce(ok({ id: 'assignment-1', status: 'acknowledged' }))
      .mockReturnValueOnce(ok({ id: 'submission-1' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))
      .mockReturnValueOnce(err('update failed'))
      .mockReturnValueOnce(attachmentRollbackChain)
      .mockReturnValueOnce(assignmentRollbackChain)
      .mockReturnValueOnce(submissionDeleteChain)

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(attachmentRollbackChain.update).toHaveBeenCalledWith({ submission_id: null })
    expect(assignmentRollbackChain.update).toHaveBeenCalledWith({ status: 'acknowledged' })
    expect(submissionDeleteChain.delete).toHaveBeenCalled()
  })

  it('returns error when ticket is not in_progress (e.g. queued)', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('logs logger.error but succeeds when attachment update fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))           // fetch ticket
      .mockReturnValueOnce(ok({ id: 'assignment-1', status: 'acknowledged' }))       // fetch assignment
      .mockReturnValueOnce(ok({ id: 'submission-1' }))                               // insert submission
      .mockReturnValueOnce(err('attachment update failed'))                           // update attachments → error, but not blocking
      .mockReturnValueOnce(ok(null))                                                   // update assignment status
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))            // engine: fetch
      .mockReturnValueOnce(ok(null))                                                   // engine: update
      .mockReturnValueOnce(ok(null))                                                   // engine: event
      .mockReturnValueOnce(ok(null))                                                   // work_submitted event

    const result = await submitWorkWorkflow(supabase as any, params)

    expect(result.success).toBe(true)
    expect(result.submissionId).toBe('submission-1')
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to link attachments to submission',
      expect.objectContaining({
        context: 'submit-work-workflow',
        submissionId: 'submission-1',
      })
    )
  })
})
