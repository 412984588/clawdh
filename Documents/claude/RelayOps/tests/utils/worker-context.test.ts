import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabase, ok } from '../helpers/mock-supabase'

// React.cache 在测试环境直接透传，不做缓存
vi.mock('react', () => ({ cache: (fn: Function) => fn }))

let mockServerClient: ReturnType<typeof createMockSupabase>
let mockAdmin: ReturnType<typeof createMockSupabase>

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: async () => mockServerClient,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdmin,
}))

import { getWorkerContext } from '@/lib/worker-context'

const MOCK_USER_ID = 'user-worker-1'
const MOCK_PROFILE_ID = 'profile-worker-1'

describe('getWorkerContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockServerClient = createMockSupabase()
    mockAdmin = createMockSupabase()
  })

  it('未登录时返回 null', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await getWorkerContext()

    expect(result).toBeNull()
    expect(mockAdmin.from).not.toHaveBeenCalled()
  })

  it('用户角色不是 worker_internal 时返回 null', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    })
    // users 表返回 partner 角色
    mockAdmin.from.mockReturnValueOnce(ok({ id: MOCK_USER_ID, role: 'partner' }))

    const result = await getWorkerContext()

    expect(result).toBeNull()
  })

  it('users 查询返回 null 时返回 null', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    })
    mockAdmin.from.mockReturnValueOnce(ok(null))

    const result = await getWorkerContext()

    expect(result).toBeNull()
  })

  it('worker_profiles 不存在时返回 null', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    })
    mockAdmin.from
      .mockReturnValueOnce(ok({ id: MOCK_USER_ID, role: 'worker_internal' })) // users
      .mockReturnValueOnce(ok(null)) // worker_profiles

    const result = await getWorkerContext()

    expect(result).toBeNull()
  })

  it('所有查询成功时返回完整 WorkerContext', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    })
    mockAdmin.from
      .mockReturnValueOnce(ok({ id: MOCK_USER_ID, role: 'worker_internal' })) // users
      .mockReturnValueOnce(ok({ id: MOCK_PROFILE_ID, user_id: MOCK_USER_ID })) // worker_profiles

    const result = await getWorkerContext()

    expect(result).not.toBeNull()
    expect(result?.userId).toBe(MOCK_USER_ID)
    expect(result?.workerProfileId).toBe(MOCK_PROFILE_ID)
    expect(result?.role).toBe('worker_internal')
  })

  it('正确查询 users 表和 worker_profiles 表', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: MOCK_USER_ID } },
      error: null,
    })
    mockAdmin.from
      .mockReturnValueOnce(ok({ id: MOCK_USER_ID, role: 'worker_internal' }))
      .mockReturnValueOnce(ok({ id: MOCK_PROFILE_ID, user_id: MOCK_USER_ID }))

    await getWorkerContext()

    expect(mockAdmin.from).toHaveBeenCalledWith('users')
    expect(mockAdmin.from).toHaveBeenCalledWith('worker_profiles')
  })
})
