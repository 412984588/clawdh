import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// 在 import 之前声明 mock（vitest 会提升 vi.mock 调用）
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/config/env', () => ({
  env: { CRON_SECRET: 'test-cron-secret-check' },
}))

vi.mock('@/lib/state-machine/engine', () => ({
  SYSTEM_ACTOR: { role: 'admin' },
  transitionTicket: vi.fn(),
}))

vi.mock('@/lib/integrations/email/provider', () => ({
  createEmailProvider: vi.fn(),
}))

import { env } from '@/lib/config/env'
import { GET } from '../route'
import { createAdminClient } from '@/lib/supabase/admin'
import { transitionTicket } from '@/lib/state-machine/engine'
import { createEmailProvider } from '@/lib/integrations/email/provider'
import {
  createMockSupabase,
  ok,
  err,
} from '../../../../../../tests/helpers/mock-supabase'

// ── 辅助函数 ──────────────────────────────────────────────────────────────────

/** 构造带 Authorization 头的 GET 请求 */
function makeRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (secret !== undefined) {
    headers['authorization'] = `Bearer ${secret}`
  }
  return new NextRequest('http://localhost/api/cron/check-timeouts', { headers })
}

// ── 测试套件 ──────────────────────────────────────────────────────────────────

describe('GET /api/cron/check-timeouts', () => {
  const CRON_SECRET = 'test-cron-secret-check'

  let mockSend: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // 设置邮件发送 mock（createEmailProvider 是 async 函数）
    mockSend = vi.fn().mockResolvedValue(undefined)
    vi.mocked(createEmailProvider).mockResolvedValue({ send: mockSend } as any)
  })

  // ── 鉴权 ────────────────────────────────────────────────────────────────────

  it('缺少 Authorization 头时返回 401', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('Authorization 密钥错误时返回 401', async () => {
    const res = await GET(makeRequest('wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('CRON_SECRET 未配置时也返回 401（fail closed）', async () => {
    const original = env.CRON_SECRET
    ;(env as { CRON_SECRET?: string }).CRON_SECRET = undefined

    const res = await GET(makeRequest())

    ;(env as { CRON_SECRET?: string }).CRON_SECRET = original
    expect(res.status).toBe(401)
  })

  // ── 过期发票处理（invoiced → expired）──────────────────────────────────────

  it('调用 transitionTicket 将超期 invoiced 工单转换为 expired', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(transitionTicket).mockResolvedValue({ success: true })

    // 第1次 from('tickets')：查询超期 invoiced 工单（含组织和邮箱信息）
    supabase.from.mockReturnValueOnce(
      ok([
        { id: 'ticket-001', title: '工单A', organizations: [{ name: 'Org1', users: [{ email: 'a@org1.com' }] }] },
        { id: 'ticket-002', title: '工单B', organizations: [{ name: 'Org2', users: [{ email: 'b@org2.com' }] }] },
      ])
    )
    // 第2次 from('tickets')：更新 overdue_flag（无过期工单）
    supabase.from.mockReturnValueOnce(ok(null))
    // 第3次 from('tickets')：查询 stale 工单（无结果）
    supabase.from.mockReturnValueOnce(ok([]))

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    // 两个 invoiced 工单均被转换
    expect(transitionTicket).toHaveBeenCalledTimes(2)
    expect(transitionTicket).toHaveBeenCalledWith(
      supabase,
      'ticket-001',
      'expired',
      { role: 'admin' },
      { reason: 'invoice_unpaid_timeout' }
    )
    expect(transitionTicket).toHaveBeenCalledWith(
      supabase,
      'ticket-002',
      'expired',
      { role: 'admin' },
      { reason: 'invoice_unpaid_timeout' }
    )

    const body = await res.json()
    expect(body.expired).toBe(2)
    expect(body.emails_sent).toBe(2)
  })

  it('transitionTicket 失败时记录错误但继续处理其他工单', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)

    // 第一个工单失败，第二个成功
    vi.mocked(transitionTicket)
      .mockResolvedValueOnce({ success: false, error: 'transition blocked' })
      .mockResolvedValueOnce({ success: true })

    supabase.from.mockReturnValueOnce(
      ok([
        { id: 'ticket-001', title: '失败工单', organizations: [{ name: 'Org1', users: [{ email: 'a@org1.com' }] }] },
        { id: 'ticket-002', title: '成功工单', organizations: [{ name: 'Org2', users: [{ email: 'b@org2.com' }] }] },
      ])
    )
    supabase.from.mockReturnValueOnce(ok(null)) // overdue update
    supabase.from.mockReturnValueOnce(ok([]))   // stale tickets

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(207)

    const body = await res.json()
    expect(body.expired).toBe(1)
    expect(body.errors).toHaveLength(1)
    expect(body.errors[0]).toContain('ticket-001')
  })

  it('无超期 invoiced 工单时不调用 transitionTicket', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)

    supabase.from.mockReturnValueOnce(ok([]))   // 无 invoiced 工单
    supabase.from.mockReturnValueOnce(ok(null)) // overdue update
    supabase.from.mockReturnValueOnce(ok([]))   // stale tickets

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)
    expect(transitionTicket).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.expired).toBe(0)
  })

  // ── overdue_flag 更新 ──────────────────────────────────────────────────────

  it('overdue 更新成功时递增 overdue 计数', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(transitionTicket).mockResolvedValue({ success: true })

    supabase.from.mockReturnValueOnce(ok([]))                        // 无 invoiced 工单
    supabase.from.mockReturnValueOnce(ok([{ id: 'overdue-001' }]))  // overdue update 返回受影响行
    supabase.from.mockReturnValueOnce(ok([]))                        // stale tickets

    const res = await GET(makeRequest(CRON_SECRET))
    const body = await res.json()
    expect(body.overdue).toBe(1)
  })

  it('overdue 更新失败时记录错误', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)

    supabase.from.mockReturnValueOnce(ok([]))                    // 无 invoiced 工单
    supabase.from.mockReturnValueOnce(err('overdue update fail')) // overdue update 失败
    supabase.from.mockReturnValueOnce(ok([]))                    // stale tickets

    const res = await GET(makeRequest(CRON_SECRET))
    const body = await res.json()
    expect(body.errors).toContain('overdue update fail')
    expect(body.overdue).toBe(0)
  })

  it('首个 DB 查询失败时返回 500 并将错误写入 results.errors', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)

    supabase.from.mockReturnValueOnce(err('tickets query failed'))

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(500)

    const body = await res.json()
    expect(body.errors).toContain('tickets query failed')
    expect(body.expired).toBe(0)
    expect(body.admin_closed).toBe(0)
  })

  // ── 无响应关闭（admin_closed_no_response）────────────────────────────────────

  it('调用 transitionTicket 将超 14 天无响应工单关闭', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(transitionTicket).mockResolvedValue({ success: true })

    supabase.from.mockReturnValueOnce(ok([]))   // 无 invoiced 工单
    supabase.from.mockReturnValueOnce(ok([]))   // overdue update（无受影响行）
    supabase.from.mockReturnValueOnce(ok([{
      id: 'stale-001',
      title: '无响应工单',
      organizations: [{ name: 'Stale Org', users: [{ email: 'stale@org.com' }] }],
    }]))

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    expect(transitionTicket).toHaveBeenCalledWith(
      supabase,
      'stale-001',
      'admin_closed_no_response',
      { role: 'admin' },
      { reason: 'no_admin_response_14_days' }
    )

    const body = await res.json()
    expect(body.admin_closed).toBe(1)
    expect(body.emails_sent).toBe(1)
  })

  // ── 完整结果结构 ────────────────────────────────────────────────────────────

  it('成功执行时返回正确的计数结构', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(transitionTicket).mockResolvedValue({ success: true })

    supabase.from.mockReturnValueOnce(ok([{
      id: 't1', title: '发票工单',
      organizations: [{ name: 'Org', users: [{ email: 'p@org.com' }] }],
    }]))
    supabase.from.mockReturnValueOnce(ok([{ id: 'overdue-001' }]))  // overdue update 返回受影响行
    supabase.from.mockReturnValueOnce(ok([{
      id: 't2', title: '无响应工单',
      organizations: [{ name: 'Org2', users: [{ email: 'q@org2.com' }] }],
    }]))

    const res = await GET(makeRequest(CRON_SECRET))
    const body = await res.json()

    expect(body).toMatchObject({
      expired: 1,
      overdue: 1,
      admin_closed: 1,
      emails_sent: 2,
      errors: [],
    })
  })

  // ── 邮件通知 ──────────────────────────────────────────────────────────────────

  it('expired 转换成功后向合作方发送 invoiceExpiredEmail', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(transitionTicket).mockResolvedValue({ success: true })

    supabase.from.mockReturnValueOnce(ok([{
      id: 'inv-001',
      title: '过期发票工单',
      organizations: [{ name: 'ACME Corp', users: [{ email: 'partner@acme.com' }] }],
    }]))
    supabase.from.mockReturnValueOnce(ok(null)) // overdue
    supabase.from.mockReturnValueOnce(ok([]))   // stale

    await GET(makeRequest(CRON_SECRET))

    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'partner@acme.com',
        subject: expect.stringContaining('过期发票工单'),
      })
    )
  })

  it('admin_closed 转换成功后向合作方发送 adminClosedNoResponseEmail', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(transitionTicket).mockResolvedValue({ success: true })

    supabase.from.mockReturnValueOnce(ok([]))   // invoiced
    supabase.from.mockReturnValueOnce(ok(null)) // overdue
    supabase.from.mockReturnValueOnce(ok([{
      id: 'stale-002',
      title: '长期无响应',
      organizations: [{ name: 'Beta Inc', users: [{ email: 'contact@beta.com' }] }],
    }]))

    await GET(makeRequest(CRON_SECRET))

    expect(mockSend).toHaveBeenCalledOnce()
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'contact@beta.com',
        subject: expect.stringContaining('长期无响应'),
      })
    )
  })

  it('合作方邮箱不存在时跳过邮件发送但仍完成转换', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(transitionTicket).mockResolvedValue({ success: true })

    supabase.from.mockReturnValueOnce(ok([{
      id: 'no-email-001',
      title: '无邮箱工单',
      organizations: [{ name: 'Empty Org', users: [] }],
    }]))
    supabase.from.mockReturnValueOnce(ok(null)) // overdue
    supabase.from.mockReturnValueOnce(ok([]))   // stale

    const res = await GET(makeRequest(CRON_SECRET))
    const body = await res.json()

    // 转换成功但不发邮件
    expect(body.expired).toBe(1)
    expect(body.emails_sent).toBe(0)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('邮件发送失败时不影响转换结果', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(transitionTicket).mockResolvedValue({ success: true })

    mockSend.mockRejectedValue(new Error('SMTP timeout'))

    supabase.from.mockReturnValueOnce(ok([{
      id: 'mail-fail-001',
      title: '邮件失败工单',
      organizations: [{ name: 'Fail Org', users: [{ email: 'fail@org.com' }] }],
    }]))
    supabase.from.mockReturnValueOnce(ok(null)) // overdue
    supabase.from.mockReturnValueOnce(ok([]))   // stale

    const res = await GET(makeRequest(CRON_SECRET))
    const body = await res.json()

    // 转换成功，邮件失败不影响计数
    expect(body.expired).toBe(1)
    expect(body.emails_sent).toBe(0)
    expect(body.errors).toHaveLength(0)
  })
})
