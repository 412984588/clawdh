import * as Sentry from '@sentry/nextjs'

type LogContext = { context?: string; error?: unknown; [key: string]: unknown }

// 轻量 logger + Sentry 上报
// info 不上报（避免噪音），warn 上报 warning 级别，error 上报异常
export const logger = {
  info(msg: string, meta?: LogContext) {
    console.info(`[${meta?.context ?? 'app'}] ${msg}`, meta)
  },
  warn(msg: string, meta?: LogContext) {
    console.warn(`[${meta?.context ?? 'app'}] ${msg}`, meta)
    Sentry.captureMessage(msg, {
      level: 'warning',
      extra: meta,
    })
  },
  error(msg: string, meta?: LogContext) {
    console.error(`[${meta?.context ?? 'app'}] ${msg}`, meta)
    // 如果 meta.error 是 Error 实例，用 captureException 获得完整堆栈
    const err = meta?.error
    if (err instanceof Error) {
      Sentry.captureException(err, {
        extra: { message: msg, ...meta },
      })
    } else {
      Sentry.captureMessage(msg, {
        level: 'error',
        extra: meta,
      })
    }
  },
}
