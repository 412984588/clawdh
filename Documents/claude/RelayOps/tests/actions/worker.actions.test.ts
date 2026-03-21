import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { submitWorkWorkflow } from '@/lib/workflows/submit-work'
import { transitionTicket } from '@/lib/state-machine/engine'
import { addComment } from '@/lib/services/comment.service'
import {
  acknowledgeAssignmentAction,
  startWorkAction,
  submitWorkAction,
  addWorkerCommentAction,
} from '@/lib/actions/worker.actions'

vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/workflows/submit-work', () => ({ submitWorkWorkflow: vi.fn() }))
vi.mock('@/lib/state-machine/engine', () => ({ transitionTicket: vi.fn() }))
vi.mock('@/lib/services/comment.service', () => ({ addComment: vi.fn() }))

const TICKET_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const ASSIGNMENT_ID = 'b2c3d4e5-f6a7-8901-bcde-f01234567891'
const AUTH_USER_ID = 'worker-user-1'
const WORKER_PROFILE_ID = 'worker-profile-1'
const WORKER_USER = { id: AUTH_USER_ID, role: 'worker_internal' }

describe('worker.actions', () => {
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

  /** Sets up authenticated worker user for getWorkerUser() */
  function setupWorker() {
    mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: AUTH_USER_ID } }, error: null })
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return ok(WORKER_USER) as any
      if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
      if (table === 'ticket_assignments') {
        return ok({ id: ASSIGNMENT_ID, ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID, status: 'acknowledged' }) as any
      }
      return ok(null) as any
    })
  }

  describe('acknowledgeAssignmentAction', () => {
    it('returns validation error for invalid input', async () => {
      const result = await acknowledgeAssignmentAction({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await acknowledgeAssignmentAction({ assignmentId: ASSIGNMENT_ID })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not a worker', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'users') return ok({ id: 'user-1', role: 'partner' }) as any
        return ok(null) as any
      })

      const result = await acknowledgeAssignmentAction({ assignmentId: ASSIGNMENT_ID })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns success when assignment is acknowledged', async () => {
      setupWorker()
      // Second from() call (the update) uses the default mock (error: null)

      const result = await acknowledgeAssignmentAction({ assignmentId: ASSIGNMENT_ID })
      expect(result.success).toBe(true)
      expect(mockAdmin.from).toHaveBeenCalledWith('ticket_assignments')
    })

    it('scopes assignment acknowledgement by worker profile id', async () => {
      setupWorker()

      await acknowledgeAssignmentAction({ assignmentId: ASSIGNMENT_ID })

      const updateCall = (mockAdmin.from as ReturnType<typeof vi.fn>).mock.results
        .find((r) => r.value?.update?.mock?.calls?.length > 0)

      expect(updateCall?.value?.eq).toHaveBeenCalledWith('worker_id', WORKER_PROFILE_ID)
    })

    it('returns error when update fails', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: AUTH_USER_ID } }, error: null })
      let assignmentCallCount = 0
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'users') return ok(WORKER_USER) as any
        if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
        if (table === 'ticket_assignments') {
          assignmentCallCount += 1
          if (assignmentCallCount === 1) {
            return ok({ id: ASSIGNMENT_ID, ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID }) as any
          }
          return err('constraint violation') as any
        }
        return ok(null) as any
      })

      const result = await acknowledgeAssignmentAction({ assignmentId: ASSIGNMENT_ID })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to acknowledge assignment')
    })
  })

  describe('startWorkAction', () => {
    const validData = { ticketId: TICKET_ID, assignmentId: ASSIGNMENT_ID }

    it('returns validation error for invalid input', async () => {
      const result = await startWorkAction({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await startWorkAction(validData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns error when assignment update fails', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: AUTH_USER_ID } }, error: null })
      let assignmentCallCount = 0
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'users') return ok(WORKER_USER) as any
        if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
        if (table === 'ticket_assignments') {
          assignmentCallCount += 1
          if (assignmentCallCount === 1) {
            return ok({ id: ASSIGNMENT_ID, ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID }) as any
          }
          return err('update failed') as any
        }
        return ok(null) as any
      })

      const result = await startWorkAction(validData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to start assignment')
    })

    it('returns success on valid start', async () => {
      setupWorker()
      // Second from() call (update assignment status) uses default (error: null)
      vi.mocked(transitionTicket).mockResolvedValue({ success: true } as any)

      const result = await startWorkAction(validData)
      expect(result.success).toBe(true)
    })

    it('uses worker profile id as the transition actor for start work', async () => {
      setupWorker()
      vi.mocked(transitionTicket).mockResolvedValue({ success: true } as any)

      await startWorkAction(validData)

      expect(transitionTicket).toHaveBeenCalledWith(
        mockAdmin as any,
        TICKET_ID,
        'in_progress',
        expect.objectContaining({ id: WORKER_PROFILE_ID, role: 'worker_internal' }),
        expect.any(Object)
      )
    })
  })

  describe('submitWorkAction', () => {
    const validData = {
      ticketId: TICKET_ID,
      deliverySummary: 'Here is the completed work with all requirements met.',
      attachmentIds: [],
    }

    it('returns validation error for invalid input', async () => {
      const result = await submitWorkAction({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await submitWorkAction(validData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not a worker', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'users') return ok({ id: 'user-1', role: 'admin' }) as any
        return ok(null) as any
      })

      const result = await submitWorkAction(validData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns submissionId on success', async () => {
      setupWorker()
      vi.mocked(submitWorkWorkflow).mockResolvedValue({
        success: true,
        submissionId: 'submission-1',
      } as any)

      const result = await submitWorkAction(validData)
      expect(result.success).toBe(true)
      expect((result as any).data?.submissionId).toBe('submission-1')
    })

    it('passes the worker profile id into submitWorkWorkflow', async () => {
      setupWorker()
      vi.mocked(submitWorkWorkflow).mockResolvedValue({
        success: true,
        submissionId: 'submission-1',
      } as any)

      await submitWorkAction(validData)

      expect(submitWorkWorkflow).toHaveBeenCalledWith(
        mockAdmin as any,
        expect.objectContaining({ workerId: WORKER_PROFILE_ID })
      )
    })

    it('returns workflow error on failure', async () => {
      setupWorker()
      vi.mocked(submitWorkWorkflow).mockResolvedValue({
        success: false,
        error: 'Ticket not in progress',
      } as any)

      const result = await submitWorkAction(validData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Ticket not in progress')
    })

    it('returns empty string submissionId when workflow returns undefined submissionId', async () => {
      // 验证 submissionId ?? '' 空值合并：workflow 未返回 submissionId 时不应抛出
      setupWorker()
      vi.mocked(submitWorkWorkflow).mockResolvedValue({
        success: true,
        submissionId: undefined,
      } as any)

      const result = await submitWorkAction(validData)
      expect(result.success).toBe(true)
      expect((result as any).data?.submissionId).toBe('')
    })
  })

  describe('addWorkerCommentAction', () => {
    const validData = {
      ticketId: TICKET_ID,
      body: 'Work is progressing well.',
    }

    it('returns validation error for invalid input', async () => {
      const result = await addWorkerCommentAction({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await addWorkerCommentAction(validData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns success on valid comment', async () => {
      setupWorker()
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'users') return ok(WORKER_USER) as any
        if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
        if (table === 'ticket_assignments') return ok({ id: ASSIGNMENT_ID, ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID }) as any
        return ok(null) as any
      })
      vi.mocked(addComment).mockResolvedValue({ data: { id: 'comment-1' }, error: null } as any)

      const result = await addWorkerCommentAction(validData)
      expect(result.success).toBe(true)
    })

    it('returns error when comment service fails', async () => {
      setupWorker()
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'users') return ok(WORKER_USER) as any
        if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
        if (table === 'ticket_assignments') return ok({ id: ASSIGNMENT_ID, ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID }) as any
        return ok(null) as any
      })
      vi.mocked(addComment).mockResolvedValue({ data: null, error: 'insert failed' } as any)

      const result = await addWorkerCommentAction(validData)
      expect(result.success).toBe(false)
      expect(result.error).toBe('insert failed')
    })

    it('returns error when worker is not assigned to the ticket', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: AUTH_USER_ID } }, error: null })
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'users') return ok(WORKER_USER) as any
        if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
        if (table === 'ticket_assignments') return ok(null) as any
        return ok(null) as any
      })
      vi.mocked(addComment).mockResolvedValue({ data: { id: 'comment-1' }, error: null } as any)

      const result = await addWorkerCommentAction(validData)
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/assigned/i)
    })
  })
})
