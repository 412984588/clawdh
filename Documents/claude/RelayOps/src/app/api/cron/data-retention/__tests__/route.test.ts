import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/config/env', () => ({
  env: { CRON_SECRET: 'test-cron-secret-retention' },
}))

import { env } from '@/lib/config/env'
import { GET } from '../route'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createMockSupabase,
  ok,
  err,
} from '../../../../../../tests/helpers/mock-supabase'

// ── 辅助函数 ──────────────────────────────────────────────────────────────────

function makeRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (secret !== undefined) {
    headers['authorization'] = `Bearer ${secret}`
  }
  return new NextRequest('http://localhost/api/cron/data-retention', { headers })
}

// ── 测试套件 ──────────────────────────────────────────────────────────────────

describe('GET /api/cron/data-retention', () => {
  const CRON_SECRET = 'test-cron-secret-retention'

  let supabase: ReturnType<typeof createMockSupabase>
  let storageMock: { remove: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()

    supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)

    // 默认：所有表查询返回空（不删除任何内容）
    supabase.from.mockReturnValue(ok([]))

    // 获取 storage mock 引用
    storageMock = supabase.storage.from('ticket-files') as any
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

  // ── 无数据时不删除任何内容 ──────────────────────────────────────────────────

  it('无符合条件的工单时返回 deleted: 0', async () => {
    // 每条保留规则都会查询 tickets 表
    // 4 条规则 → 4 次 from('tickets') 调用，全部返回空数组
    supabase.from.mockReturnValue(ok([]))

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.deleted).toBe(0)
    expect(storageMock.remove).not.toHaveBeenCalled()
  })

  // ── 按状态删除附件 ────────────────────────────────────────────────────────

  it('对符合条件的 expired/cancelled 工单删除附件', async () => {
    const ticketIds = [{ id: 'expired-001' }]
    const attachments = [
      { id: 'att-001', storage_path: 'files/att-001.pdf' },
      { id: 'att-002', storage_path: 'files/att-002.jpg' },
    ]

    // 规则1（expired/cancelled，7天）：tickets 查询 → attachments 查询 → 删除 DB
    supabase.from
      .mockReturnValueOnce(ok(ticketIds))    // tickets: expired/cancelled
      .mockReturnValueOnce(ok(attachments))  // attachments: 要删除的记录
      .mockReturnValueOnce(ok(null))         // attachments: DELETE 操作
      // 其余 3 条规则的 tickets 查询全部返回空
      .mockReturnValue(ok([]))

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    // 验证 Storage 删除调用
    expect(storageMock.remove).toHaveBeenCalledWith([
      'files/att-001.pdf',
      'files/att-002.jpg',
    ])

    // 验证 DB 删除调用（第3次 from()）
    const thirdFromCall = supabase.from.mock.results[2].value
    expect(thirdFromCall.delete).toHaveBeenCalled()

    const body = await res.json()
    expect(body.deleted).toBe(2)
  })

  // ── 有工单但无附件时跳过删除 ───────────────────────────────────────────────

  it('有符合条件工单但无附件时跳过删除操作', async () => {
    // 规则1：tickets 找到 → attachments 返回空
    supabase.from
      .mockReturnValueOnce(ok([{ id: 'ticket-001' }]))  // tickets
      .mockReturnValueOnce(ok([]))                       // attachments：无
      // 其余规则
      .mockReturnValue(ok([]))

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    expect(storageMock.remove).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.deleted).toBe(0)
  })

  // ── 按 tier 删除附件（pilot 规则）──────────────────────────────────────────

  it('按 pricing_tier 查询工单并删除附件', async () => {
    const pilotAttachments = [{ id: 'att-pilot', storage_path: 'pilot/file.zip' }]

    // 4 条规则依次执行：
    // 规则1（expired/cancelled）：无工单
    // 规则2（pilot tier）：有工单 + 有附件
    // 规则3（completed）：无工单
    // 规则4（resolved）：无工单
    supabase.from
      .mockReturnValueOnce(ok([]))                              // 规则1: tickets（expired/cancelled）
      .mockReturnValueOnce(ok([{ id: 'pilot-ticket-1' }]))     // 规则2: tickets（pilot tier）
      .mockReturnValueOnce(ok(pilotAttachments))                // 规则2: attachments
      .mockReturnValueOnce(ok(null))                            // 规则2: DELETE attachments
      .mockReturnValueOnce(ok([]))                              // 规则3: tickets（completed）
      .mockReturnValueOnce(ok([]))                              // 规则4: tickets（resolved）

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    expect(storageMock.remove).toHaveBeenCalledWith(['pilot/file.zip'])

    const body = await res.json()
    expect(body.deleted).toBe(1)
  })

  it('pilot 规则不会删除仍处于进行中的工单附件', async () => {
    const pilotTicketsChain = ok([])

    supabase.from
      .mockReturnValueOnce(ok([])) // 规则1 tickets（expired/cancelled）
      .mockReturnValueOnce(pilotTicketsChain) // 规则2 tickets（pilot tier）
      .mockReturnValueOnce(ok([])) // 规则3 tickets
      .mockReturnValueOnce(ok([])) // 规则4 tickets

    const res = await GET(makeRequest(CRON_SECRET))
    const body = await res.json()

    expect(pilotTicketsChain.eq).toHaveBeenCalledWith('pricing_tier', 'pilot')
    expect(pilotTicketsChain.in).toHaveBeenCalledWith(
      'status',
      expect.arrayContaining(['completed', 'resolved', 'expired', 'cancelled', 'admin_closed_no_response'])
    )
    expect(storageMock.remove).not.toHaveBeenCalled()
    expect(body.deleted).toBe(0)
  })

  // ── 规则3 disputed 状态覆盖 ───────────────────────────────────────────────

  it('规则3（completed/rejected/disputed，30天）能匹配 disputed 工单并清理附件', async () => {
    const disputedAttachments = [{ id: 'att-disp', storage_path: 'disputed/file.txt' }]

    supabase.from
      .mockReturnValueOnce(ok([]))                                                  // 规则1 tickets（无）
      .mockReturnValueOnce(ok([]))                                                  // 规则2 tickets（无）
      .mockReturnValueOnce(ok([{ id: 'disputed-ticket' }]))                         // 规则3 tickets（disputed 命中）
      .mockReturnValueOnce(ok(disputedAttachments))                                 // 规则3 attachments
      .mockReturnValueOnce(ok(null))                                                 // 规则3 DELETE
      .mockReturnValueOnce(ok([]))                                                   // 规则4 tickets（无）

    const res = await GET(makeRequest(CRON_SECRET))
    expect(res.status).toBe(200)

    expect(storageMock.remove).toHaveBeenCalledWith(['disputed/file.txt'])

    const body = await res.json()
    expect(body.deleted).toBe(1)
  })

  // ── 多规则累计删除 ────────────────────────────────────────────────────────

  it('多条规则均有匹配时累计 deleted 计数', async () => {
    // 规则1（expired/cancelled）：2 个附件
    // 规则2（pilot）：无工单
    // 规则3（completed，30天）：1 个附件
    // 规则4（resolved，90天）：无工单
    supabase.from
      .mockReturnValueOnce(ok([{ id: 'ticket-exp' }]))                            // 规则1 tickets
      .mockReturnValueOnce(ok([{ id: 'a1', storage_path: 'p1' }, { id: 'a2', storage_path: 'p2' }])) // 规则1 attachments
      .mockReturnValueOnce(ok(null))                                               // 规则1 DELETE
      .mockReturnValueOnce(ok([]))                                                 // 规则2 tickets
      .mockReturnValueOnce(ok([{ id: 'ticket-comp' }]))                           // 规则3 tickets
      .mockReturnValueOnce(ok([{ id: 'a3', storage_path: 'p3' }]))                // 规则3 attachments
      .mockReturnValueOnce(ok(null))                                               // 规则3 DELETE
      .mockReturnValueOnce(ok([]))                                                 // 规则4 tickets

    const res = await GET(makeRequest(CRON_SECRET))
    const body = await res.json()
    expect(body.deleted).toBe(3)
  })

  it('首个 tickets 查询失败时返回 500 并记录 results.errors', async () => {
    supabase.from.mockReturnValueOnce(err('retention ticket query failed'))

    const res = await GET(makeRequest(CRON_SECRET))

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.deleted).toBe(0)
    expect(body.errors).toContain('retention ticket query failed')
  })

  it('storage 删除失败时返回 207 并保留错误信息', async () => {
    supabase.from
      .mockReturnValueOnce(ok([{ id: 'expired-001' }]))
      .mockReturnValueOnce(ok([{ id: 'att-001', storage_path: 'files/att-001.pdf' }]))
      .mockReturnValueOnce(ok(null))
      .mockReturnValue(ok([]))

    storageMock.remove.mockResolvedValueOnce({ error: { message: 'storage remove failed' } })

    const res = await GET(makeRequest(CRON_SECRET))

    expect(res.status).toBe(207)
    const body = await res.json()
    expect(body.deleted).toBe(1)
    expect(body.errors).toContain('storage remove failed')
  })
})
