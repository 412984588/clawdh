import type { RateLimitConfig } from './rate-limit'

const ONE_MINUTE = 60_000

// 各端点限流策略
const WEBHOOK_CONFIG: RateLimitConfig = {
  maxRequests: 30,
  windowMs: ONE_MINUTE,
}

const SERVER_ACTION_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: ONE_MINUTE,
}

const PUBLIC_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: ONE_MINUTE,
}

// 根据路径和方法返回对应限流配置，null 表示跳过限流
export function getConfigForPath(pathname: string, method: string): RateLimitConfig | null {
  // Cron 端点由 CRON_SECRET 保护，不限流
  if (pathname.startsWith('/api/cron')) {
    return null
  }

  // Webhook 端点：30 req/min/IP
  if (pathname.startsWith('/api/webhooks')) {
    return WEBHOOK_CONFIG
  }

  // 其他 API 路由：按 webhook 策略
  if (pathname.startsWith('/api/')) {
    return WEBHOOK_CONFIG
  }

  // Server Actions：POST 到非 /api 路径（Next.js server action 的请求特征）
  if (method === 'POST') {
    return SERVER_ACTION_CONFIG
  }

  // 公开页面 GET 请求：100 req/min/IP
  return PUBLIC_CONFIG
}
