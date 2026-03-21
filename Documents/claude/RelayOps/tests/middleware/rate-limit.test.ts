import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryStore, checkRateLimit } from '@/lib/middleware/rate-limit'
import type { RateLimitConfig } from '@/lib/middleware/rate-limit'

describe('MemoryStore', () => {
  let store: MemoryStore

  beforeEach(() => {
    store = new MemoryStore()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts requests within the window', () => {
    const windowMs = 60_000
    const r1 = store.increment('ip-1', windowMs)
    expect(r1.count).toBe(1)

    const r2 = store.increment('ip-1', windowMs)
    expect(r2.count).toBe(2)

    const r3 = store.increment('ip-1', windowMs)
    expect(r3.count).toBe(3)
  })

  it('isolates counts by key', () => {
    const windowMs = 60_000
    store.increment('ip-a', windowMs)
    store.increment('ip-a', windowMs)
    const rB = store.increment('ip-b', windowMs)
    expect(rB.count).toBe(1)
  })

  it('slides window: old timestamps drop off after window expires', () => {
    const windowMs = 60_000

    store.increment('ip-1', windowMs)
    store.increment('ip-1', windowMs)
    expect(store.increment('ip-1', windowMs).count).toBe(3)

    // 推进时间超过窗口
    vi.advanceTimersByTime(windowMs + 1)

    // 新请求应只计为 1（旧的 3 个已过期）
    const result = store.increment('ip-1', windowMs)
    expect(result.count).toBe(1)
  })

  it('cleans up stale entries after cleanup interval', () => {
    const windowMs = 60_000

    store.increment('ip-stale', windowMs)
    expect(store.size).toBe(1)

    // 推进 5 分钟 + cleanup interval（60s），触发惰性清理
    vi.advanceTimersByTime(5 * 60_000 + 61_000)

    // 触发一次 increment 来激活惰性清理
    store.increment('ip-fresh', windowMs)

    // ip-stale 应该被清理掉
    expect(store.size).toBe(1) // 只剩 ip-fresh
  })
})

describe('checkRateLimit', () => {
  let store: MemoryStore

  beforeEach(() => {
    store = new MemoryStore()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const config: RateLimitConfig = {
    maxRequests: 3,
    windowMs: 60_000,
  }

  it('allows requests under the limit', () => {
    const r1 = checkRateLimit('1.2.3.4', config, store)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = checkRateLimit('1.2.3.4', config, store)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = checkRateLimit('1.2.3.4', config, store)
    expect(r3.allowed).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it('blocks the request exceeding the limit', () => {
    checkRateLimit('1.2.3.4', config, store)
    checkRateLimit('1.2.3.4', config, store)
    checkRateLimit('1.2.3.4', config, store)

    const r4 = checkRateLimit('1.2.3.4', config, store)
    expect(r4.allowed).toBe(false)
    expect(r4.remaining).toBe(0)
    expect(r4.resetAt).toBeGreaterThan(Date.now())
  })

  it('resets after window slides', () => {
    checkRateLimit('1.2.3.4', config, store)
    checkRateLimit('1.2.3.4', config, store)
    checkRateLimit('1.2.3.4', config, store)

    // 第 4 次被拒
    expect(checkRateLimit('1.2.3.4', config, store).allowed).toBe(false)

    // 推进窗口
    vi.advanceTimersByTime(config.windowMs + 1)

    // 窗口滑动后重新允许
    const result = checkRateLimit('1.2.3.4', config, store)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('whitelisted IP always passes', () => {
    const whitelistConfig: RateLimitConfig = {
      maxRequests: 1,
      windowMs: 60_000,
      whitelist: ['10.0.0.1'],
    }

    // 白名单 IP：即使超过限制也放行
    checkRateLimit('10.0.0.1', whitelistConfig, store)
    checkRateLimit('10.0.0.1', whitelistConfig, store)
    const r3 = checkRateLimit('10.0.0.1', whitelistConfig, store)
    expect(r3.allowed).toBe(true)
    expect(r3.remaining).toBe(1) // 白名单返回满额 remaining
  })

  it('non-whitelisted IP is still limited', () => {
    const whitelistConfig: RateLimitConfig = {
      maxRequests: 1,
      windowMs: 60_000,
      whitelist: ['10.0.0.1'],
    }

    checkRateLimit('99.99.99.99', whitelistConfig, store)
    const r2 = checkRateLimit('99.99.99.99', whitelistConfig, store)
    expect(r2.allowed).toBe(false)
  })
})
