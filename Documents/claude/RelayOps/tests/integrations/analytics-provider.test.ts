import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock env — 必须在 import provider 之前
vi.mock('@/lib/config/env', () => ({
  env: { INTEGRATION_MODE: 'mock' },
}))

import { getAnalyticsProvider } from '@/lib/integrations/analytics/provider'

describe('ConsoleAnalyticsProvider (mock mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('track logs event to console', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const provider = getAnalyticsProvider()
    provider.track('test_event', { key: 'value' })
    expect(spy).toHaveBeenCalledWith('[ANALYTICS MOCK] track', {
      event: 'test_event',
      properties: { key: 'value' },
    })
  })

  it('identify logs user to console', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const provider = getAnalyticsProvider()
    provider.identify('user-123', { role: 'partner' })
    expect(spy).toHaveBeenCalledWith('[ANALYTICS MOCK] identify', {
      userId: 'user-123',
      traits: { role: 'partner' },
    })
  })

  it('track works without properties', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const provider = getAnalyticsProvider()
    provider.track('simple_event')
    expect(spy).toHaveBeenCalledWith('[ANALYTICS MOCK] track', {
      event: 'simple_event',
      properties: undefined,
    })
  })
})
