import * as Sentry from '@sentry/nextjs'

type LogLevel = 'info' | 'warn' | 'error'
type LogContext = { context?: string; traceId?: string; error?: unknown; [key: string]: unknown }

interface StructuredLog {
  timestamp: string
  level: LogLevel
  message: string
  context: string
  traceId?: string
  [key: string]: unknown
}

// 生产环境输出纯 JSON（Vercel 日志聚合友好），开发环境保留可读格式
const isProduction = process.env.NODE_ENV === 'production'

function buildLogEntry(level: LogLevel, msg: string, meta?: LogContext): StructuredLog {
  const { context, traceId, error: _error, ...rest } = meta ?? {}
  return {
    timestamp: new Date().toISOString(),
    level,
    message: msg,
    context: context ?? 'app',
    ...(traceId ? { traceId } : {}),
    ...rest,
  }
}

function formatOutput(entry: StructuredLog, meta?: LogContext): [string, ...unknown[]] {
  if (isProduction) {
    // 生产环境：纯 JSON 字符串（Vercel/CloudWatch 解析友好）
    return [JSON.stringify(entry)]
  }
  // 开发环境：人类可读格式 + 原始 meta 对象
  const prefix = entry.traceId
    ? `[${entry.context}] [${entry.traceId}]`
    : `[${entry.context}]`
  return [`${prefix} ${entry.message}`, ...(meta ? [meta] : [])]
}

// 轻量 logger + Sentry 上报
// info 不上报（避免噪音），warn 上报 warning 级别，error 上报异常
export const logger = {
  info(msg: string, meta?: LogContext) {
    const entry = buildLogEntry('info', msg, meta)
    console.info(...formatOutput(entry, meta))
  },
  warn(msg: string, meta?: LogContext) {
    const entry = buildLogEntry('warn', msg, meta)
    console.warn(...formatOutput(entry, meta))
    Sentry.captureMessage(msg, {
      level: 'warning',
      extra: { ...meta, traceId: entry.traceId },
    })
  },
  error(msg: string, meta?: LogContext) {
    const entry = buildLogEntry('error', msg, meta)
    console.error(...formatOutput(entry, meta))
    // 如果 meta.error 是 Error 实例，用 captureException 获得完整堆栈
    const err = meta?.error
    if (err instanceof Error) {
      Sentry.captureException(err, {
        extra: { message: msg, ...meta, traceId: entry.traceId },
      })
    } else {
      Sentry.captureMessage(msg, {
        level: 'error',
        extra: { ...meta, traceId: entry.traceId },
      })
    }
  },
}

export type { LogContext, StructuredLog }
