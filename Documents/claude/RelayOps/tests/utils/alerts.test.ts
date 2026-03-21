import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

import * as Sentry from '@sentry/nextjs'
import { triggerAlert, getAlertRules } from '@/lib/utils/alerts'

describe('alerts', () => {
  beforeEach(() => { vi.clearAllMocks() })
  afterEach(() => { vi.restoreAllMocks() })

  it('critical 告警路由到 logger.error + Sentry captureMessage(fatal)', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    triggerAlert('payment_failed', { ticketId: 'ticket-1' })

    // logger.error 内部会调用 console.error
    expect(console.error).toHaveBeenCalled()
    // Sentry: logger.error 的 captureMessage + critical 的额外 captureMessage
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'CRITICAL: Payment processing failed',
      expect.objectContaining({
        level: 'fatal',
        tags: { alertEvent: 'payment_failed', alertLevel: 'critical' },
      })
    )
  })

  it('warning 告警路由到 logger.warn', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    triggerAlert('sla_timeout', { ticketId: 'ticket-2' })
    expect(console.warn).toHaveBeenCalled()
  })

  it('info 告警路由到 logger.info', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    triggerAlert('ticket_status_changed', { ticketId: 'ticket-3', from: 'submitted', to: 'paid' })
    expect(console.info).toHaveBeenCalled()
  })

  it('未注册的事件静默跳过', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    triggerAlert('unknown_event', { foo: 'bar' })
    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('告警携带自定义 context', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    triggerAlert('cron_partial_failure', { cronJob: 'test' }, { context: 'my-cron' })
    const callArgs = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(callArgs[0]).toContain('[my-cron]')
  })

  it('critical 告警不会因 Sentry 额外调用影响 logger.error 的 Sentry 上报', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    triggerAlert('auth_anomaly', { ip: '1.2.3.4' })
    // logger.error 调用 1 次 captureMessage + triggerAlert 额外调用 1 次 = 至少 2 次
    expect(Sentry.captureMessage).toHaveBeenCalledTimes(2)
  })

  it('getAlertRules 返回所有已注册规则', () => {
    const rules = getAlertRules()
    expect(rules.length).toBeGreaterThan(0)
    // 包含 critical / warning / info 三种级别
    const levels = new Set(rules.map((r) => r.level))
    expect(levels).toContain('critical')
    expect(levels).toContain('warning')
    expect(levels).toContain('info')
  })

  it('每个规则都有 event / level / message 字段', () => {
    for (const rule of getAlertRules()) {
      expect(rule.event).toBeTruthy()
      expect(rule.level).toBeTruthy()
      expect(rule.message).toBeTruthy()
    }
  })
})
