import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock supabase middleware 和 admin client — 避免真实数据库调用
vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn().mockResolvedValue({
    supabaseResponse: { status: 200 },
    user: null,
  }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

// mock rate-limit 模块，控制限流行为
const mockCheckRateLimit = vi.fn()
const mockGetConfigForPath = vi.fn()

vi.mock('@/lib/middleware/rate-limit', () => ({
  MemoryStore: vi.fn(),
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}))

vi.mock('@/lib/middleware/rate-limit-config', () => ({
  getConfigForPath: (...args: unknown[]) => mockGetConfigForPath(...args),
}))

import { middleware } from '../../middleware'
import { NextRequest } from 'next/server'

function createRequest(path: string, method = 'GET', ip = '1.2.3.4') {
  const url = `http://localhost:3000${path}`
  const req = new NextRequest(url, { method })
  // NextRequest 不支持直接设置 headers，用 x-forwarded-for 传 IP
  req.headers.set('x-forwarded-for', ip)
  return req
}

describe('middleware rate limiting integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 429 when rate limit exceeded', async () => {
    mockGetConfigForPath.mockReturnValue({ maxRequests: 10, windowMs: 60_000 })
    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    })

    const req = createRequest('/api/webhooks/stripe', 'POST')
    const res = await middleware(req)

    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeTruthy()
    expect(res.headers.get('X-RateLimit-Limit')).toBe('10')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')

    const body = await res.json()
    expect(body.error).toBe('Too many requests')
  })

  it('passes through when rate limit allows', async () => {
    mockGetConfigForPath.mockReturnValue({ maxRequests: 100, windowMs: 60_000 })
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 99,
      resetAt: Date.now() + 60_000,
    })

    const req = createRequest('/', 'GET')
    const res = await middleware(req)

    // 不是 429，请求正常通过
    expect(res.status).not.toBe(429)
  })

  it('skips rate limiting when config is null (cron routes)', async () => {
    mockGetConfigForPath.mockReturnValue(null)

    const req = createRequest('/api/cron/check-timeouts', 'GET')
    const res = await middleware(req)

    // checkRateLimit 不应该被调用
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
    expect(res.status).not.toBe(429)
  })
})
