import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// 从环境变量读取生产域名（去掉 protocol，serverActions allowedOrigins 只需要 host:port）
const appUrl = process.env.NEXT_PUBLIC_APP_URL
const productionHost = appUrl ? appUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : null
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const isProduction = process.env.NODE_ENV === 'production'

// CSP 策略 — Next.js SSR 需要 unsafe-inline/unsafe-eval，Tailwind 需要 unsafe-inline style
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${supabaseUrl} https://*.supabase.co https://api.stripe.com https://*.sentry.io`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      allowedOrigins: productionHost
        ? [productionHost, 'localhost:3000']
        : ['localhost:3000'],
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          // HSTS 仅生产环境启用（开发环境用 HTTP，启用会导致浏览器拒绝连接）
          ...(isProduction
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ]
  },
}

// Sentry 包裹 — 不上传 source maps（需 auth token），保留 console 输出
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  silent: true,
})
