import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

let mockAdmin: ReturnType<typeof createMockSupabase>

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdmin,
}))

import { submitPilotInterest } from '@/lib/actions/pilot.actions'

describe('submitPilotInterest', () => {
  beforeEach(() => {
    mockAdmin = createMockSupabase()
  })

  it('有效邮箱 upsert 成功时返回 { success: true }', async () => {
    mockAdmin.from.mockReturnValueOnce(ok(null))

    const result = await submitPilotInterest({ email: 'test@example.com' })

    expect(result.success).toBe(true)
    expect(mockAdmin.from).toHaveBeenCalledWith('pilot_interests')
  })

  it('无效邮箱格式时返回 Zod 验证错误', async () => {
    const result = await submitPilotInterest({ email: 'not-an-email' })

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('email')
    // DB 不应被调用
    expect(mockAdmin.from).not.toHaveBeenCalled()
  })

  it('空对象（缺少 email 字段）时返回验证失败', async () => {
    const result = await submitPilotInterest({})

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('email')
  })

  it('重复邮箱（upsert 幂等）时仍返回 { success: true }', async () => {
    // ignoreDuplicates: true 时 upsert 不报错，DB 返回 null error
    mockAdmin.from.mockReturnValueOnce(ok(null))

    const result = await submitPilotInterest({ email: 'duplicate@example.com' })

    expect(result.success).toBe(true)
  })

  it('pilot_interests 表不存在（42P01）时静默降级返回 { success: true }', async () => {
    mockAdmin.from.mockReturnValueOnce(err('relation "pilot_interests" does not exist', '42P01'))

    const result = await submitPilotInterest({ email: 'test@example.com' })

    expect(result.success).toBe(true)
  })

  it('通用 DB 错误时返回 { success: false, error: string }', async () => {
    mockAdmin.from.mockReturnValueOnce(err('connection refused'))

    const result = await submitPilotInterest({ email: 'test@example.com' })

    expect(result.success).toBe(false)
    expect(typeof result.error).toBe('string')
    expect(result.error).toContain('Failed to save')
  })
})
