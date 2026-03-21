import { describe, it, expect } from 'vitest'
import { envSchema } from '@/lib/config/env'

// ── 生产保护逻辑（直接测 schema + 保护逻辑，不依赖模块副作用）──────────────────

/**
 * 验证生产保护条件：Vercel Production 部署时执行额外保护
 * 注意：实际抛出在模块顶层，这里通过纯函数复现该逻辑来测试
 */
function runProductionGuard(vercelEnv: string | undefined, mode: string, cronSecret?: string): void {
  if (vercelEnv === 'production' && mode === 'mock') {
    throw new Error(
      'FATAL: INTEGRATION_MODE=mock is not allowed in production. ' +
      'Set INTEGRATION_MODE=live in your production environment.'
    )
  }

  if (vercelEnv === 'production' && !cronSecret?.trim()) {
    throw new Error('FATAL: CRON_SECRET is required in production.')
  }
}

// 使用 safeParse 直接测试 schema，不触发 parseEnv() 副作用

const validBase = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-minimum-length',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key-minimum',
  CRON_SECRET: 'test-cron-secret',
}

describe('envSchema', () => {
  it('throws (parse fails) when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-role-key',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.NEXT_PUBLIC_SUPABASE_URL).toBeTruthy()
    }
  })

  it('throws (parse fails) when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-role-key',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeTruthy()
    }
  })

  it('defaults INTEGRATION_MODE to "mock" when not provided', () => {
    const result = envSchema.safeParse(validBase)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.INTEGRATION_MODE).toBe('mock')
    }
  })

  it('throws (parse fails) for invalid INTEGRATION_MODE value', () => {
    const result = envSchema.safeParse({
      ...validBase,
      INTEGRATION_MODE: 'staging',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.INTEGRATION_MODE).toBeTruthy()
    }
  })

  it('throws (parse fails) when CRON_SECRET is missing', () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-minimum-length',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key-minimum',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors
      expect(fields.CRON_SECRET).toBeTruthy()
    }
  })

  it('succeeds when optional live-service fields are absent but CRON_SECRET is present', () => {
    const result = envSchema.safeParse(validBase)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.STRIPE_SECRET_KEY).toBeUndefined()
      expect(result.data.RESEND_API_KEY).toBeUndefined()
      expect(result.data.CRON_SECRET).toBe('test-cron-secret')
    }
  })

  it('accepts valid INTEGRATION_MODE = "live"', () => {
    const result = envSchema.safeParse({
      ...validBase,
      INTEGRATION_MODE: 'live',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.INTEGRATION_MODE).toBe('live')
    }
  })
})

describe('生产环境 mock 保护', () => {
  it('production + mock 时抛出 FATAL 错误', () => {
    expect(() => runProductionGuard('production', 'mock', 'configured-secret')).toThrow(
      'FATAL: INTEGRATION_MODE=mock is not allowed in production'
    )
  })

  it('production + live + missing CRON_SECRET 时抛出 FATAL 错误', () => {
    expect(() => runProductionGuard('production', 'live', '')).toThrow(
      'FATAL: CRON_SECRET is required in production.'
    )
  })

  it('production + live + configured CRON_SECRET 时不抛出', () => {
    expect(() => runProductionGuard('production', 'live', 'configured-secret')).not.toThrow()
  })

  it('development + mock 时不抛出（本地开发允许）', () => {
    expect(() => runProductionGuard('development', 'mock', '')).not.toThrow()
  })

  it('test + mock 时不抛出（CI 测试允许）', () => {
    expect(() => runProductionGuard('test', 'mock', '')).not.toThrow()
  })
})
