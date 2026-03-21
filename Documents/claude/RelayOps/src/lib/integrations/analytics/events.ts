import { getAnalyticsProvider } from './provider'

// 事件名称常量 — 防止字符串拼写错误
export const ANALYTICS_EVENTS = {
  TICKET_CREATED: 'ticket_created',
  TICKET_STATUS_CHANGED: 'ticket_status_changed',
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  PAYMENT_FAILED: 'payment_failed',
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  PAGE_VIEWED: 'page_viewed',
} as const

// 事件属性类型
export interface AnalyticsEventMap {
  ticket_created: { ticketId: string; category: string }
  ticket_status_changed: { ticketId: string; from: string; to: string }
  payment_succeeded: { ticketId: string; amount: number; currency: string }
  payment_failed: { ticketId: string; invoiceId: string }
  user_registered: { userId: string; role: string }
  user_logged_in: { userId: string }
  page_viewed: { path: string }
}

type EventName = keyof AnalyticsEventMap

// 类型安全的事件追踪 — 编译期检查事件名和属性匹配
export function trackEvent<E extends EventName>(
  event: E,
  properties: AnalyticsEventMap[E]
): void {
  const provider = getAnalyticsProvider()
  provider.track(event, properties as Record<string, unknown>)
}

// 用户识别 — 注册/登录后调用
export function identifyUser(
  userId: string,
  traits?: { role?: string; organizationId?: string }
): void {
  const provider = getAnalyticsProvider()
  provider.identify(userId, traits)
}
