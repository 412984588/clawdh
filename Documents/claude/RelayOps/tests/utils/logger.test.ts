import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

// mock @sentry/nextjs — 必须在 import logger 之前
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))

import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/utils/logger'

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => { vi.restoreAllMocks() })

  it('delegates info to console.info with context prefix', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    logger.info('hello', { context: 'test' })
    // 开发环境：人类可读格式 [context] message
    expect(spy).toHaveBeenCalledWith('[test] hello', { context: 'test' })
  })

  it('info does not report to Sentry', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    logger.info('hello', { context: 'test' })
    expect(Sentry.captureException).not.toHaveBeenCalled()
    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('delegates warn to console.warn and reports to Sentry as warning', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logger.warn('caution', { context: 'webhook' })
    expect(spy).toHaveBeenCalledWith('[webhook] caution', { context: 'webhook' })
    expect(Sentry.captureMessage).toHaveBeenCalledWith('caution', {
      level: 'warning',
      extra: { context: 'webhook', traceId: undefined },
    })
  })

  it('delegates error to console.error and reports string error to Sentry via captureMessage', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.error('fail', { context: 'payment' })
    expect(spy).toHaveBeenCalledWith('[payment] fail', { context: 'payment' })
    expect(Sentry.captureMessage).toHaveBeenCalledWith('fail', {
      level: 'error',
      extra: { context: 'payment', traceId: undefined },
    })
  })

  it('reports Error instance via captureException with full stack', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('db connection failed')
    logger.error('Database error', { context: 'db', error: err })
    expect(Sentry.captureException).toHaveBeenCalledWith(err, {
      extra: { message: 'Database error', context: 'db', error: err, traceId: undefined },
    })
    // captureMessage 不应被调用（走 captureException 分支）
    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('uses "app" as default context when none provided', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    logger.info('no context')
    expect(spy).toHaveBeenCalledWith('[app] no context')
  })

  it('includes traceId in output when provided', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    logger.info('traced', { context: 'test', traceId: 'abc-123' })
    expect(spy).toHaveBeenCalledWith(
      '[test] [abc-123] traced',
      { context: 'test', traceId: 'abc-123' }
    )
  })

  it('passes traceId to Sentry extra on warn', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    logger.warn('traced warn', { context: 'test', traceId: 'trace-456' })
    expect(Sentry.captureMessage).toHaveBeenCalledWith('traced warn', {
      level: 'warning',
      extra: { context: 'test', traceId: 'trace-456' },
    })
  })
})
