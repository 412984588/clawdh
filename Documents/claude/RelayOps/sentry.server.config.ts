import * as Sentry from '@sentry/nextjs'

// 服务端 Sentry 初始化 — DSN 未设置时不初始化
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}
