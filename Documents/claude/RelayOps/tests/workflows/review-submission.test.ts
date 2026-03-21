import { describe, it, expect } from 'vitest'
import { reviewSubmissionWorkflow } from '@/lib/workflows/review-submission'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const approvedParams = {
  ticketId: 'ticket-1',
  reviewerId: 'admin-1',
  reviewerRole: 'admin' as const,
  decision: 'approved' as const,
  acceptanceFailures: [],
  notes: 'Looks great!',
}

const revisionParams = {
  ticketId: 'ticket-1',
  reviewerId: 'admin-1',
  reviewerRole: 'admin' as const,
  decision: 'revision_requested' as const,
  acceptanceFailures: ['Header alignment is off'],
  notes: 'Please fix the header',
}

describe('reviewSubmissionWorkflow', () => {
  describe('approved decision', () => {
    it('creates review, transitions to approved, returns reviewId', async () => {
      const supabase = createMockSupabase()
      supabase.from
        .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // fetch ticket
        .mockReturnValueOnce(ok({ id: 'review-1' }))                                 // insert review
        .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // engine: fetch
        .mockReturnValueOnce(ok(null))                                                 // engine: update
        .mockReturnValueOnce(ok(null))                                                 // engine: event
        .mockReturnValueOnce(ok(null))                                                 // review_submitted event

      const result = await reviewSubmissionWorkflow(supabase as any, approvedParams)

      expect(result.success).toBe(true)
      expect(result.reviewId).toBe('review-1')
    })
  })

  describe('revision_requested decision', () => {
    it('creates review, does double transition (revision_requested → in_progress)', async () => {
      const supabase = createMockSupabase()
      supabase.from
        .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // fetch ticket
        .mockReturnValueOnce(ok({ id: 'review-1' }))                                 // insert review
        // First transition: submitted_for_review → revision_requested
        .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // engine: fetch
        .mockReturnValueOnce(ok(null))                                                 // engine: update
        .mockReturnValueOnce(ok(null))                                                 // engine: event
        // Second transition: revision_requested → in_progress
        .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'revision_requested' }))   // engine: fetch
        .mockReturnValueOnce(ok(null))                                                 // engine: update
        .mockReturnValueOnce(ok(null))                                                 // engine: event
        .mockReturnValueOnce(ok(null))                                                 // review_submitted event

      const result = await reviewSubmissionWorkflow(supabase as any, revisionParams)

      expect(result.success).toBe(true)
      expect(result.reviewId).toBe('review-1')
    })

    it('returns error when second transition (revision_requested → in_progress) fails', async () => {
      const supabase = createMockSupabase()
      supabase.from
        .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' }))
        .mockReturnValueOnce(ok({ id: 'review-1' }))
        // First transition succeeds
        .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' }))
        .mockReturnValueOnce(ok(null))
        .mockReturnValueOnce(ok(null))
        // Second transition: engine fetch returns wrong state → transition fails
        .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' })) // wrong status

      const result = await reviewSubmissionWorkflow(supabase as any, revisionParams)

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  it('returns error when ticket is not in submitted_for_review state', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'in_progress' }))

    const result = await reviewSubmissionWorkflow(supabase as any, approvedParams)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/in_progress/)
  })

  it('returns error when ticket not found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await reviewSubmissionWorkflow(supabase as any, approvedParams)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Ticket not found')
  })

  it('returns error when review insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' }))
      .mockReturnValueOnce(err('insert failed'))

    const result = await reviewSubmissionWorkflow(supabase as any, approvedParams)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to create review record')
  })

  it('returns error when approved transition fails (engine fetches wrong state)', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // fetch ticket
      .mockReturnValueOnce(ok({ id: 'review-1' }))                                  // insert review
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'completed' }))             // engine: fetch wrong state

    const result = await reviewSubmissionWorkflow(supabase as any, approvedParams)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns error when first transition (submitted_for_review → revision_requested) fails', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // fetch ticket
      .mockReturnValueOnce(ok({ id: 'review-1' }))                                  // insert review
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'approved' }))              // engine: fetch wrong state

    const result = await reviewSubmissionWorkflow(supabase as any, revisionParams)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('partner role can approve a submission', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // fetch ticket
      .mockReturnValueOnce(ok({ id: 'review-1' }))                                  // insert review
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // engine: fetch
      .mockReturnValueOnce(ok(null))                                                  // engine: update
      .mockReturnValueOnce(ok(null))                                                  // engine: event
      .mockReturnValueOnce(ok(null))                                                  // review_submitted event

    const result = await reviewSubmissionWorkflow(supabase as any, {
      ...approvedParams,
      reviewerRole: 'partner',
    })

    expect(result.success).toBe(true)
    expect(result.reviewId).toBe('review-1')
  })

  it('partner role can request revision and return the ticket to in_progress', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // fetch ticket
      .mockReturnValueOnce(ok({ id: 'review-1' }))                                  // insert review
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'submitted_for_review' })) // first transition fetch
      .mockReturnValueOnce(ok(null))                                                 // first transition update
      .mockReturnValueOnce(ok(null))                                                 // first transition event
      .mockReturnValueOnce(ok({ id: 'ticket-1', status: 'revision_requested' }))   // second transition fetch
      .mockReturnValueOnce(ok(null))                                                 // second transition update
      .mockReturnValueOnce(ok(null))                                                 // second transition event
      .mockReturnValueOnce(ok(null))                                                 // review_submitted event

    const result = await reviewSubmissionWorkflow(supabase as any, {
      ...revisionParams,
      reviewerRole: 'partner',
      reviewerId: 'partner-1',
    })

    expect(result.success).toBe(true)
    expect(result.reviewId).toBe('review-1')
  })

  it('returns error when ticket is in queued state (not submitted_for_review)', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-1', status: 'queued' }))

    const result = await reviewSubmissionWorkflow(supabase as any, approvedParams)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/queued/)
  })
})
