import { describe, it, expect } from 'vitest'

/**
 * 安全头测试 — 直接测试 next.config.ts 的 headers() 输出
 * 不需要启动 dev server，只验证配置正确性
 */

// 动态导入 next.config.ts 以获取 headers 配置
// 由于 next.config.ts 使用了 withSentryConfig 和 bundleAnalyzer 包裹，
// 我们直接解析配置对象中的 headers 值
async function getConfiguredHeaders(): Promise<
  { key: string; value: string }[]
> {
  // next.config.ts 导出的是包裹后的配置，headers 函数仍然可调用
  // 但 Sentry/bundleAnalyzer 包裹不影响 headers()
  const configModule = await import('../../next.config')
  const config = configModule.default

  // withSentryConfig 返回的对象仍有 headers 方法
  if (typeof config === 'object' && config !== null && 'headers' in config) {
    const headersFn = (config as { headers: () => Promise<{ headers: { key: string; value: string }[] }[]> }).headers
    if (typeof headersFn === 'function') {
      const result = await headersFn()
      return result[0]?.headers ?? []
    }
  }

  throw new Error('无法从 next.config.ts 提取 headers 配置')
}

describe('安全响应头', () => {
  let headers: { key: string; value: string }[]

  // 所有测试共享一次 headers 读取
  it('能正确读取 next.config.ts headers 配置', async () => {
    headers = await getConfiguredHeaders()
    expect(headers.length).toBeGreaterThan(0)
  })

  it('X-Frame-Options = DENY（防 clickjacking）', async () => {
    if (!headers) headers = await getConfiguredHeaders()
    const header = headers.find((h) => h.key === 'X-Frame-Options')
    expect(header).toBeDefined()
    expect(header!.value).toBe('DENY')
  })

  it('X-Content-Type-Options = nosniff（防 MIME 嗅探）', async () => {
    if (!headers) headers = await getConfiguredHeaders()
    const header = headers.find((h) => h.key === 'X-Content-Type-Options')
    expect(header).toBeDefined()
    expect(header!.value).toBe('nosniff')
  })

  it('Referrer-Policy 已设置', async () => {
    if (!headers) headers = await getConfiguredHeaders()
    const header = headers.find((h) => h.key === 'Referrer-Policy')
    expect(header).toBeDefined()
    expect(header!.value).toBe('strict-origin-when-cross-origin')
  })

  it('Permissions-Policy 禁用危险权限', async () => {
    if (!headers) headers = await getConfiguredHeaders()
    const header = headers.find((h) => h.key === 'Permissions-Policy')
    expect(header).toBeDefined()
    expect(header!.value).toContain('camera=()')
    expect(header!.value).toContain('microphone=()')
    expect(header!.value).toContain('geolocation=()')
  })

  it('Content-Security-Policy 已设置且包含关键指令', async () => {
    if (!headers) headers = await getConfiguredHeaders()
    const header = headers.find((h) => h.key === 'Content-Security-Policy')
    expect(header).toBeDefined()
    const csp = header!.value
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain('connect-src')
  })

  // HSTS 仅在 NODE_ENV=production 时启用
  it('HSTS 在生产环境启用（开发环境正确跳过）', async () => {
    if (!headers) headers = await getConfiguredHeaders()
    const header = headers.find(
      (h) => h.key === 'Strict-Transport-Security'
    )
    if (process.env.NODE_ENV === 'production') {
      expect(header).toBeDefined()
      expect(header!.value).toContain('max-age=31536000')
      expect(header!.value).toContain('includeSubDomains')
    } else {
      // 开发/测试环境不应有 HSTS
      expect(header).toBeUndefined()
    }
  })
})
