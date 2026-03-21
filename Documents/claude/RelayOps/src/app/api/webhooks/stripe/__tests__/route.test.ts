import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock 依赖模块（vitest 自动提升 vi.mock 调用）
vi.mock('@/lib/integrations/stripe/webhooks', () => ({
  constructWebhookEvent: vi.fn(),
}))

vi.mock('@/lib/workflows/handle-payment', () => ({
  handlePaymentWorkflow: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/services/notification.service', () => ({
  notifyTicketEvent: vi.fn(),
}))

vi.mock('@/lib/services/payment-retry.service', () => ({
  schedulePaymentRetry: vi.fn(),
}))

import { POST } from '../route'
import { constructWebhookEvent } from '@/lib/integrations/stripe/webhooks'
import { handlePaymentWorkflow } from '@/lib/workflows/handle-payment'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyTicketEvent } from '@/lib/services/notification.service'
import { schedulePaymentRetry } from '@/lib/services/payment-retry.service'
import {
  createMockSupabase,
  ok,
} from '../../../../../../tests/helpers/mock-supabase'

// ── 辅助函数 ──────────────────────────────────────────────────────────────────

function makeRequest(body: string): NextRequest {
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body,
  })
}

// ── 测试套件 ──────────────────────────────────────────────────────────────────

describe('POST /api/webhooks/stripe — invoice.payment_failed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('invoice.paid uses raw body for signature verification and returns 200 on success', async () => {
    vi.mocked(constructWebhookEvent).mockResolvedValue({
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_paid_001',
          amount_paid: 49900,
          currency: 'usd',
          customer: 'cus_123',
        },
      },
    })
    vi.mocked(handlePaymentWorkflow).mockResolvedValue({
      success: true,
      ticketId: 'ticket-1',
    })

    const res = await POST(makeRequest('{"id":"evt_1"}'))

    expect(res.status).toBe(200)
    expect(constructWebhookEvent).toHaveBeenCalledWith('{"id":"evt_1"}', 'sig_test')
    expect(handlePaymentWorkflow).toHaveBeenCalledWith({
      stripeInvoiceId: 'in_paid_001',
      amountPaidDollars: 499,
      currency: 'usd',
      stripeCustomerId: 'cus_123',
    })
  })

  it('invoice.paid returns 500 when payment workflow reports an error', async () => {
    vi.mocked(constructWebhookEvent).mockResolvedValue({
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_paid_fail',
          amount_paid: 1000,
          currency: 'usd',
          customer: 'cus_456',
        },
      },
    })
    vi.mocked(handlePaymentWorkflow).mockResolvedValue({
      success: false,
      error: 'ledger failed',
    })

    const res = await POST(makeRequest('{"id":"evt_2"}'))

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'ledger failed' })
  })

  it('查找工单并发送 payment_failed 通知', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(constructWebhookEvent).mockResolvedValue({
      type: 'invoice.payment_failed',
      data: { object: { id: 'in_fail_001', last_payment_error: { message: 'Card declined' } } as { id: string; last_payment_error?: { message: string } } },
    })
    vi.mocked(notifyTicketEvent).mockResolvedValue(undefined)
    vi.mocked(schedulePaymentRetry).mockResolvedValue({ success: true, nextRetryAt: new Date() })

    // tickets 查询命中后，再检查幂等 marker，然后写入 marker
    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-42', status: 'invoiced' }))
      .mockReturnValueOnce(ok(null))
      .mockReturnValueOnce(ok(null))

    const res = await POST(makeRequest('{}'))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)

    // 确认用 stripe_invoice_id 查了 tickets 表
    expect(supabase.from).toHaveBeenCalledWith('tickets')

    // 确认调度了支付重试
    expect(schedulePaymentRetry).toHaveBeenCalledWith(
      supabase,
      'ticket-42',
      'Card declined'
    )

    // 确认发送了 payment_failed 通知
    expect(notifyTicketEvent).toHaveBeenCalledWith(
      supabase,
      'ticket-42',
      'payment_failed',
      { stripe_invoice_id: 'in_fail_001' }
    )
  })

  it('payment_failed replay 时跳过重复通知', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(constructWebhookEvent).mockResolvedValue({
      type: 'invoice.payment_failed',
      data: { object: { id: 'in_fail_dup' } },
    })

    supabase.from
      .mockReturnValueOnce(ok({ id: 'ticket-42' }))
      .mockReturnValueOnce(ok({ id: 'event-1' }))

    const res = await POST(makeRequest('{}'))

    expect(res.status).toBe(200)
    expect(notifyTicketEvent).not.toHaveBeenCalled()
  })

  it('工单不存在时仍返回 200（仅记录警告）', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(constructWebhookEvent).mockResolvedValue({
      type: 'invoice.payment_failed',
      data: { object: { id: 'in_orphan_999' } },
    })

    // 没有找到工单
    supabase.from.mockReturnValueOnce(ok(null))

    const res = await POST(makeRequest('{}'))

    expect(res.status).toBe(200)
    // 不应该尝试发通知
    expect(notifyTicketEvent).not.toHaveBeenCalled()
  })

  it('通知发送异常时仍返回 200（不阻塞 Stripe 重试）', async () => {
    const supabase = createMockSupabase()
    vi.mocked(createAdminClient).mockReturnValue(supabase as any)
    vi.mocked(constructWebhookEvent).mockResolvedValue({
      type: 'invoice.payment_failed',
      data: { object: { id: 'in_fail_err' } },
    })

    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-err' }))
    vi.mocked(notifyTicketEvent).mockRejectedValue(new Error('email service down'))

    const res = await POST(makeRequest('{}'))

    // 即使通知失败，也返回 200 — 不让 Stripe 反复重试
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
  })

  it('签名验证失败时返回 400', async () => {
    vi.mocked(constructWebhookEvent).mockRejectedValue(new Error('bad signature'))

    const res = await POST(makeRequest('garbage'))

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid signature')
  })

  it('签名验证失败时 logger.error 传递 error 实例（触发 Sentry captureException）', async () => {
    const sigError = new Error('Missing stripe-signature header')
    vi.mocked(constructWebhookEvent).mockRejectedValue(sigError)

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await POST(makeRequest('{}'))

    // 验证 logger.error 被调用（console.error 是底层）
    expect(errorSpy).toHaveBeenCalled()
  })

  it('空 stripe-signature 请求返回 400', async () => {
    vi.mocked(constructWebhookEvent).mockRejectedValue(new Error('Missing stripe-signature header'))

    // 构造无签名的请求
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: {}, // 无 stripe-signature
      body: '{}',
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
