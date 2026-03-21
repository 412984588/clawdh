import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabase, ok } from '../helpers/mock-supabase'

// React cache 直接透传，不做缓存（测试环境）
vi.mock('react', () => ({ cache: (fn: Function) => fn }))

let mockServerClient: ReturnType<typeof createMockSupabase>
let mockAdmin: ReturnType<typeof createMockSupabase>

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: async () => mockServerClient,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdmin,
}))

import { getSessionUser, requireRole } from '@/lib/utils/get-session-user'

const MOCK_USER = { id: 'user-1', email: 'test@example.com' }
const MOCK_RECORD = { id: 'user-1', role: 'partner', email: 'test@example.com', organization_id: 'org-1' }

describe('getSessionUser', () => {
  beforeEach(() => {
    mockServerClient = createMockSupabase()
    mockAdmin = createMockSupabase()
  })

  it('auth.getUser 返回 null 时返回 null', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await getSessionUser()

    expect(result).toBeNull()
    expect(mockAdmin.from).not.toHaveBeenCalled()
  })

  it('auth 成功 + admin 查询返回用户记录时返回完整对象', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockAdmin.from.mockReturnValueOnce(ok(MOCK_RECORD))

    const result = await getSessionUser()

    expect(result).not.toBeNull()
    expect(result?.authUser).toEqual(MOCK_USER)
    expect(result?.id).toBe('user-1')
    expect(result?.role).toBe('partner')
    expect(result?.organization_id).toBe('org-1')
  })

  it('auth 成功但 admin 查询返回 null 时返回 null', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockAdmin.from.mockReturnValueOnce(ok(null))

    const result = await getSessionUser()

    expect(result).toBeNull()
  })

  it('auth 返回 error 时 user 为 null，返回 null', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired' },
    })

    const result = await getSessionUser()

    expect(result).toBeNull()
  })

  it('返回对象同时包含 authUser 和展开的 DB 字段', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockAdmin.from.mockReturnValueOnce(ok(MOCK_RECORD))

    const result = await getSessionUser()

    expect(result).toMatchObject({
      authUser: MOCK_USER,
      id: 'user-1',
      role: 'partner',
      email: 'test@example.com',
      organization_id: 'org-1',
    })
  })

  it('requireRole: 角色匹配时返回完整 session 用户', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockAdmin.from.mockReturnValueOnce(ok(MOCK_RECORD))

    const result = await requireRole('partner')

    expect(result).toMatchObject({
      authUser: MOCK_USER,
      id: 'user-1',
      role: 'partner',
      organization_id: 'org-1',
    })
  })

  it('requireRole: 角色不匹配时返回 null', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
    mockAdmin.from.mockReturnValueOnce(ok(MOCK_RECORD))

    const result = await requireRole('admin')

    expect(result).toBeNull()
  })
})
