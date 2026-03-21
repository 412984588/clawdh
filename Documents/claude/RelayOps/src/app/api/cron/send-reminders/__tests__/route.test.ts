import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/integrations/email/provider', () => ({
  createEmailProvider: vi.fn(),
}))

vi.mock('@/lib/config/env', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    CRON_SECRET: 'test-cron-secret-remind',
    ADMIN_NOTIFICATION_EMAIL: 'admin@test.com',
  },
}))

import { env } from '@/lib/config/env'
import { GET } from '../route'
import { createAdminClient } from '@/lib/supabase/admin'
import { createEmailProvider } from '@/lib/integrations/email/provider'
import {
  createMockSupabase,
  ok,
  err,
  makeChain,
} from '../../../../../../tests/helpers/mock-supabase'

// ── 辅助函数 ──────────────────────────────────────────────────────────────────

function makeRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (secret !== undefined) {
    headers['authorization'] = `Bearer ${secret}`
  }
  return new NextRequest('http://localhost/api/cron/send-reminders', { headers })
}

/** 构造一个空结果的 supabase chain（data: null） */
function emptyChain() {
  return ok(null)
}

/** 构造一个空数组结果的 supabase chain */
function emptyArrayChain() {
  return ok([])
}

// ── 测试套件 ──────────────────────────────────────────────────────────────────

describe('GET /api/cron/send-reminders', () => {
  const CRON_SECRET = 'test-cron-secret-remind'

  let mockSend: ReturnType<typeof vi.fn>
  let supabase: ReturnType<typeof createMockSupabase>

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = CRON_SECRET
    process.env.ADMIN_NOTIFICATION_EMAIL = 'admin@test.com'

    // 设置邮件发送 mock
    mockSend = vi.fn().mockResolvedValue(undefined)
    vi.mocked(createEmailProvider).mockResolvedValue({ send: mockSend } as any)

    // 默认 supabase mock（全部返回空）
    supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)

    // 默认：所有 from() 调用返回空数组，避免测试间干扰
    supabase.from.mockReturnValue(emptyArrayChain())
  })

  // ── 鉴权 ────────────────────────────────────────────────────────────────────

  it('缺少 Authorization 头时返回 401', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('Authorization 密钥错误时返回 401', async () => {
    const res = await GET(makeRequest('bad-secret'))
    expect(res.status).toBe(401)
  })

  it('CRON_SECRET 未配置时也返回 401（fail closed）', async () => {
    const original = env.CRON_SECRET
    ;(env as { CRON_SECRET?: string }).CRON_SECRET = undefined

    const res = await GET(makeRequest())

    ;(env as { CRON_SECRET?: string }).CRON_SECRET = original
    expect(res.status).toBe(401)
  })

  // ── 24h 审核提醒 ─────────────────────────────────────────────────────────────

  it('向等待 24-48h 审核的合作方发送邮件', async () => {
    const ticket = {
      id: 't-24h',
      title: '待审核工单',
      organization_id: 'org-1',
      organizations: [{ name: 'ACME Corp', users: [{ email: 'partner@acme.com' }] }],
    }

    // 第1次 from：24h 工单查询
    supabase.from
      .mockReturnValueOnce(ok([ticket]))  // 24h remind
      .mockReturnValueOnce(emptyArrayChain())  // 72h remind
      .mockReturnValueOnce(emptyArrayChain())  // invoiced remind
      .mockReturnValueOnce(emptyArrayChain())  // sla remind

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'partner@acme.com' })
    )

    const body = await res.json()
    expect(body.reminders_sent).toBe(1)
  })

  it('合作方邮箱不存在时跳过发送', async () => {
    const ticket = {
      id: 't-no-email',
      title: '无邮箱工单',
      organization_id: 'org-2',
      organizations: [{ name: 'No Email Org', users: [] }],
    }

    supabase.from
      .mockReturnValueOnce(ok([ticket]))
      .mockReturnValue(emptyArrayChain())

    const res = await GET(makeRequest(CRON_SECRET))
    expect(mockSend).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.reminders_sent).toBe(0)
  })

  // ── 72h 审核提醒 ─────────────────────────────────────────────────────────────

  it('向等待 72-96h 审核的合作方发送邮件', async () => {
    const ticket = {
      id: 't-72h',
      title: '超期工单',
      organization_id: 'org-3',
      organizations: [{ name: 'ACME Corp', users: [{ email: 'partner@acme.com' }] }],
    }

    supabase.from
      .mockReturnValueOnce(emptyArrayChain())  // 24h：无
      .mockReturnValueOnce(ok([ticket]))       // 72h
      .mockReturnValueOnce(emptyArrayChain())  // invoiced
      .mockReturnValueOnce(emptyArrayChain())  // sla

    const res = await GET(makeRequest(CRON_SECRET))
    expect(mockSend).toHaveBeenCalledOnce()

    const body = await res.json()
    expect(body.reminders_sent).toBe(1)
  })

  // ── 发票到期提醒（幂等）────────────────────────────────────────────────────

  it('发票已超 5 天时向合作方发送到期提醒', async () => {
    const ticket = {
      id: 't-inv',
      title: '待付款工单',
      organization_id: 'org-4',
      organizations: [{ name: 'Invoice Org', users: [{ email: 'pay@invoice.com' }] }],
    }

    // 幂等检查：无已发送记录（data: null）
    const idempotencyChain = makeChain({ data: null, error: null })

    supabase.from
      .mockReturnValueOnce(emptyArrayChain())  // 24h
      .mockReturnValueOnce(emptyArrayChain())  // 72h
      .mockReturnValueOnce(ok([ticket]))       // invoiced tickets
      .mockReturnValueOnce(idempotencyChain)   // 幂等检查（ticket_events）
      .mockReturnValueOnce(emptyChain())       // 写入 ticket_events
      .mockReturnValueOnce(emptyArrayChain())  // sla

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'pay@invoice.com' })
    )

    const body = await res.json()
    expect(body.reminders_sent).toBe(1)
  })

  it('发票提醒已发送（幂等）时跳过', async () => {
    const ticket = {
      id: 't-inv-dup',
      title: '重复工单',
      organization_id: 'org-5',
      organizations: [{ name: 'Dup Org', users: [{ email: 'dup@org.com' }] }],
    }

    // 幂等检查：存在已发送记录
    const existingChain = makeChain({ data: { id: 'event-exists' }, error: null })

    supabase.from
      .mockReturnValueOnce(emptyArrayChain())  // 24h
      .mockReturnValueOnce(emptyArrayChain())  // 72h
      .mockReturnValueOnce(ok([ticket]))       // invoiced tickets
      .mockReturnValueOnce(existingChain)      // 幂等检查：已存在
      .mockReturnValueOnce(emptyArrayChain())  // sla

    const res = await GET(makeRequest(CRON_SECRET))
    // 幂等保护：不重复发送邮件
    expect(mockSend).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.reminders_sent).toBe(0)
  })

  // ── SLA 到期提醒（幂等）─────────────────────────────────────────────────────

  it('距 due_at 不足 24h 时向 admin 发送 SLA 提醒', async () => {
    const now = Date.now()
    // due_at 设为 12 小时后（在 24h 窗口内）
    const dueAt = new Date(now + 12 * 3600 * 1000).toISOString()
    const ticket = { id: 'sla-001', title: 'SLA 工单', due_at: dueAt }

    // 幂等检查：无已发送记录
    const noEventChain = makeChain({ data: null, error: null })

    supabase.from
      .mockReturnValueOnce(emptyArrayChain())  // 24h
      .mockReturnValueOnce(emptyArrayChain())  // 72h
      .mockReturnValueOnce(emptyArrayChain())  // invoiced
      .mockReturnValueOnce(ok([ticket]))       // sla tickets
      .mockReturnValueOnce(noEventChain)       // 幂等检查
      .mockReturnValueOnce(emptyChain())       // 写入 ticket_events

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'admin@test.com' })
    )

    const body = await res.json()
    expect(body.reminders_sent).toBe(1)
  })

  it('SLA 提醒已发送（幂等）时跳过', async () => {
    const dueAt = new Date(Date.now() + 6 * 3600 * 1000).toISOString()
    const ticket = { id: 'sla-dup', title: 'SLA 重复', due_at: dueAt }

    // 幂等检查：已存在
    const existingChain = makeChain({ data: { id: 'ev-123' }, error: null })

    supabase.from
      .mockReturnValueOnce(emptyArrayChain())
      .mockReturnValueOnce(emptyArrayChain())
      .mockReturnValueOnce(emptyArrayChain())
      .mockReturnValueOnce(ok([ticket]))       // sla tickets
      .mockReturnValueOnce(existingChain)      // 幂等检查：已存在

    await GET(makeRequest(CRON_SECRET))
    expect(mockSend).not.toHaveBeenCalled()
  })

  // ── 邮件发送异常不中断流程 ──────────────────────────────────────────────────

  it('单封邮件发送失败时静默跳过，继续处理其余工单', async () => {
    const tickets = [
      {
        id: 't-fail',
        title: '发送失败工单',
        organization_id: 'org-f',
        organizations: [{ name: 'Fail Org', users: [{ email: 'fail@org.com' }] }],
      },
      {
        id: 't-ok',
        title: '正常工单',
        organization_id: 'org-ok',
        organizations: [{ name: 'OK Org', users: [{ email: 'ok@org.com' }] }],
      },
    ]

    mockSend
      .mockRejectedValueOnce(new Error('SMTP timeout'))
      .mockResolvedValueOnce(undefined)

    supabase.from
      .mockReturnValueOnce(ok(tickets))        // 24h
      .mockReturnValueOnce(emptyArrayChain())  // 72h
      .mockReturnValueOnce(emptyArrayChain())  // invoiced
      .mockReturnValueOnce(emptyArrayChain())  // sla

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(207)

    // 第一封失败，第二封成功
    const body = await res.json()
    expect(body.reminders_sent).toBe(1)
    expect(body.errors).toHaveLength(1)
    expect(body.errors[0]).toContain('SMTP timeout')
  })

  it('首个 DB 查询失败时返回 500 并记录 results.errors', async () => {
    supabase.from.mockReturnValueOnce(err('24h query failed'))

    const res = await GET(makeRequest(CRON_SECRET))

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.reminders_sent).toBe(0)
    expect(body.errors).toContain('24h query failed')
  })

  // ── 无待处理工单 ────────────────────────────────────────────────────────────

  it('无任何待处理工单时返回 reminders_sent: 0', async () => {
    // 全部 from() 调用返回空数组（已由 beforeEach 设置为默认）
    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.reminders_sent).toBe(0)
    expect(mockSend).not.toHaveBeenCalled()
  })
})
