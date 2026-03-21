import { describe, it, expect } from 'vitest'
import { getConfigForPath } from '@/lib/middleware/rate-limit-config'

describe('getConfigForPath', () => {
  it('returns null for cron endpoints (no rate limiting)', () => {
    expect(getConfigForPath('/api/cron/check-timeouts', 'GET')).toBeNull()
    expect(getConfigForPath('/api/cron/send-reminders', 'GET')).toBeNull()
    expect(getConfigForPath('/api/cron/data-retention', 'GET')).toBeNull()
  })

  it('returns 30 req/min for webhook endpoints', () => {
    const config = getConfigForPath('/api/webhooks/stripe', 'POST')
    expect(config).not.toBeNull()
    expect(config!.maxRequests).toBe(30)
    expect(config!.windowMs).toBe(60_000)
  })

  it('returns 30 req/min for other API routes', () => {
    const config = getConfigForPath('/api/some-endpoint', 'GET')
    expect(config).not.toBeNull()
    expect(config!.maxRequests).toBe(30)
  })

  it('returns 60 req/min for POST to non-API paths (server actions)', () => {
    const config = getConfigForPath('/partner/tickets', 'POST')
    expect(config).not.toBeNull()
    expect(config!.maxRequests).toBe(60)
    expect(config!.windowMs).toBe(60_000)
  })

  it('returns 100 req/min for GET on public pages', () => {
    const config = getConfigForPath('/', 'GET')
    expect(config).not.toBeNull()
    expect(config!.maxRequests).toBe(100)
    expect(config!.windowMs).toBe(60_000)
  })

  it('returns 100 req/min for GET on dashboard pages', () => {
    const config = getConfigForPath('/admin/tickets', 'GET')
    expect(config).not.toBeNull()
    expect(config!.maxRequests).toBe(100)
  })
})
