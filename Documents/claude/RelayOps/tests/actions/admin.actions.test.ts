import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMockSupabase, ok } from '../helpers/mock-supabase'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assignWorkerWorkflow } from '@/lib/workflows/assign-worker'
import { reviewSubmissionWorkflow } from '@/lib/workflows/review-submission'
import { resolveDisputeWorkflow } from '@/lib/workflows/resolve-dispute'
import { addComment } from '@/lib/services/comment.service'
import {
  assignWorkerAction,
  submitReviewAction,
  resolveDisputeAction,
  addCommentAction,
} from '@/lib/actions/admin.actions'

vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/workflows/assign-worker', () => ({ assignWorkerWorkflow: vi.fn() }))
vi.mock('@/lib/workflows/review-submission', () => ({ reviewSubmissionWorkflow: vi.fn() }))
vi.mock('@/lib/workflows/resolve-dispute', () => ({ resolveDisputeWorkflow: vi.fn() }))
vi.mock('@/lib/services/comment.service', () => ({ addComment: vi.fn() }))

const TICKET_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const WORKER_ID = 'b2c3d4e5-f6a7-8901-bcde-f01234567891'
const DISPUTE_ID = 'c3d4e5f6-a7b8-9012-cdef-012345678901'
const ADMIN_USER = { id: 'admin-1', role: 'admin' }

describe('admin.actions', () => {
  let mockServer: ReturnType<typeof createMockSupabase>
  let mockAdmin: ReturnType<typeof createMockSupabase>

  beforeEach(() => {
    mockServer = createMockSupabase()
    mockAdmin = createMockSupabase()
    vi.mocked(createServerClient).mockResolvedValue(mockServer as any)
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  /** Sets up authenticated admin user for getAdminUser() */
  function setupAdmin() {
    mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockAdmin.from.mockReturnValueOnce(ok(ADMIN_USER))
  }

  describe('assignWorkerAction', () => {
    it('returns validation error for invalid input', async () => {
      const result = await assignWorkerAction({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await assignWorkerAction({ ticketId: TICKET_ID, workerId: WORKER_ID })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not admin', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner' }))

      const result = await assignWorkerAction({ ticketId: TICKET_ID, workerId: WORKER_ID })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns assignmentId on success', async () => {
      setupAdmin()
      vi.mocked(assignWorkerWorkflow).mockResolvedValue({
        success: true,
        assignmentId: 'assign-1',
      } as any)

      const result = await assignWorkerAction({ ticketId: TICKET_ID, workerId: WORKER_ID })
      expect(result.success).toBe(true)
      expect((result as any).data?.assignmentId).toBe('assign-1')
    })

    it('returns workflow error on failure', async () => {
      setupAdmin()
      vi.mocked(assignWorkerWorkflow).mockResolvedValue({
        success: false,
        error: 'Worker not found',
      } as any)

      const result = await assignWorkerAction({ ticketId: TICKET_ID, workerId: WORKER_ID })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Worker not found')
    })
  })

  describe('submitReviewAction', () => {
    const validReview = {
      ticketId: TICKET_ID,
      decision: 'approved',
      acceptanceFailures: [],
      notes: 'Looks great!',
    }

    it('returns validation error for invalid input', async () => {
      const result = await submitReviewAction({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await submitReviewAction(validReview)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not admin', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner' }))

      const result = await submitReviewAction(validReview)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns success on valid review', async () => {
      setupAdmin()
      vi.mocked(reviewSubmissionWorkflow).mockResolvedValue({
        success: true,
        reviewId: 'review-1',
      } as any)

      const result = await submitReviewAction(validReview)
      expect(result.success).toBe(true)
    })
  })

  describe('resolveDisputeAction', () => {
    const validResolve = {
      disputeId: DISPUTE_ID,
      ticketId: TICKET_ID,
      resolutionSummary: 'Partial refund issued for incomplete deliverables.',
      disputeStatus: 'resolved_no_refund',
    }

    it('returns validation error for invalid input', async () => {
      const result = await resolveDisputeAction({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await resolveDisputeAction(validResolve)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not admin', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner' }))

      const result = await resolveDisputeAction(validResolve)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns success on valid resolution', async () => {
      setupAdmin()
      vi.mocked(resolveDisputeWorkflow).mockResolvedValue({ success: true } as any)

      const result = await resolveDisputeAction(validResolve)
      expect(result.success).toBe(true)
    })

    it('returns workflow error on failure', async () => {
      setupAdmin()
      vi.mocked(resolveDisputeWorkflow).mockResolvedValue({
        success: false,
        error: 'Dispute already resolved',
      } as any)

      const result = await resolveDisputeAction(validResolve)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Dispute already resolved')
    })
  })

  describe('addCommentAction', () => {
    const validComment = {
      ticketId: TICKET_ID,
      body: 'This is an admin comment.',
      visibility: 'partner_admin',
    }

    it('returns validation error for invalid input', async () => {
      const result = await addCommentAction({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await addCommentAction(validComment)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not admin', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner' }))

      const result = await addCommentAction(validComment)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns success on valid comment', async () => {
      setupAdmin()
      vi.mocked(addComment).mockResolvedValue({ data: { id: 'comment-1' }, error: null } as any)

      const result = await addCommentAction(validComment)
      expect(result.success).toBe(true)
    })

    it('returns error when comment service fails', async () => {
      setupAdmin()
      vi.mocked(addComment).mockResolvedValue({ data: null, error: 'DB error' } as any)

      const result = await addCommentAction(validComment)
      expect(result.success).toBe(false)
      expect(result.error).toBe('DB error')
    })
  })
})
