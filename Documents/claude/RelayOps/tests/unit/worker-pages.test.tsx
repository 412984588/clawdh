import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockSupabase, ok } from '../helpers/mock-supabase'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import WorkerDashboardPage from '@/app/(dashboard)/worker/page'
import WorkerAssignmentPage from '@/app/(dashboard)/worker/assignments/[id]/page'
import WorkerSubmissionPage from '@/app/(dashboard)/worker/submissions/[id]/page'

const navigation = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`)
  }),
  notFound: vi.fn(() => {
    throw new Error('notFound')
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: navigation.redirect,
  notFound: navigation.notFound,
}))
vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const AUTH_USER_ID = 'worker-user-1'
const WORKER_PROFILE_ID = 'worker-profile-1'
const ASSIGNMENT_ID = '11111111-2222-4333-8444-555555555555'
const SUBMISSION_ID = '66666666-7777-4888-9999-000000000000'
const TICKET_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'

describe('worker pages', () => {
  let mockServer: ReturnType<typeof createMockSupabase>
  let mockAdmin: ReturnType<typeof createMockSupabase>

  beforeEach(() => {
    vi.clearAllMocks()
    mockServer = createMockSupabase()
    mockAdmin = createMockSupabase()
    vi.mocked(createServerClient).mockResolvedValue(mockServer as any)
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as any)
    mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: AUTH_USER_ID } }, error: null })
  })

  it('worker dashboard resolves assignments through worker_profiles.user_id', async () => {
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return ok({ id: AUTH_USER_ID, role: 'worker_internal' }) as any
      }
      if (table === 'worker_profiles') {
        return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
      }
      if (table === 'ticket_assignments') {
        return ok([]) as any
      }
      return ok(null) as any
    })

    await expect(WorkerDashboardPage()).resolves.toBeTruthy()
    expect(mockAdmin.from).toHaveBeenCalledWith('worker_profiles')
  })

  it('assignment detail allows access when assignment belongs to worker profile id', async () => {
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'ticket_assignments') {
        return ok({ id: ASSIGNMENT_ID, ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID, status: 'in_progress' }) as any
      }
      if (table === 'users') {
        return ok({ id: AUTH_USER_ID, role: 'worker_internal' }) as any
      }
      if (table === 'worker_profiles') {
        return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
      }
      if (table === 'tickets') {
        return ok({ id: TICKET_ID, title: 'Ticket', status: 'in_progress' }) as any
      }
      return ok(null) as any
    })

    await expect(
      WorkerAssignmentPage({ params: Promise.resolve({ id: ASSIGNMENT_ID }) })
    ).resolves.toBeTruthy()
    expect(navigation.notFound).not.toHaveBeenCalled()
  })

  it('submission detail allows access when submission belongs to worker profile id', async () => {
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return ok({ id: AUTH_USER_ID, role: 'worker_internal' }) as any
      }
      if (table === 'worker_profiles') {
        return ok({ id: WORKER_PROFILE_ID, user_id: AUTH_USER_ID }) as any
      }
      if (table === 'submissions') {
        return ok({
          id: SUBMISSION_ID,
          ticket_id: TICKET_ID,
          worker_id: WORKER_PROFILE_ID,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        }) as any
      }
      if (table === 'tickets') {
        return ok({ id: TICKET_ID, title: 'Ticket title' }) as any
      }
      return ok(null) as any
    })

    await expect(
      WorkerSubmissionPage({ params: Promise.resolve({ id: SUBMISSION_ID }) })
    ).resolves.toBeTruthy()
    expect(navigation.notFound).not.toHaveBeenCalled()
  })
})
