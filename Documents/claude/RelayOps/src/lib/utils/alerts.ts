import * as Sentry from '@sentry/nextjs'
import { logger } from './logger'
import type { LogContext } from './logger'

// 告警级别定义
export type AlertLevel = 'critical' | 'warning' | 'info'

export interface AlertRule {
  event: string
  level: AlertLevel
  message: string
}

// 告警规则注册表
const ALERT_RULES: AlertRule[] = [
  // Critical — 需要立即响应
  { event: 'payment_failed', level: 'critical', message: 'Payment processing failed' },
  { event: 'payment_retry_exhausted', level: 'critical', message: 'Payment retry attempts exhausted' },
  { event: 'ledger_inconsistency', level: 'critical', message: 'Ledger entry inconsistency detected' },
  { event: 'auth_anomaly', level: 'critical', message: 'Authentication anomaly detected' },

  // Warning — 需要关注
  { event: 'sla_timeout', level: 'warning', message: 'SLA deadline approaching' },
  { event: 'cron_partial_failure', level: 'warning', message: 'Cron job completed with partial failures' },
  { event: 'webhook_signature_invalid', level: 'warning', message: 'Invalid webhook signature received' },
  { event: 'rate_limit_triggered', level: 'warning', message: 'Rate limit triggered for IP' },

  // Info — 记录即可
  { event: 'ticket_status_changed', level: 'info', message: 'Ticket status changed' },
  { event: 'payment_confirmed', level: 'info', message: 'Payment confirmed successfully' },
  { event: 'cron_completed', level: 'info', message: 'Cron job completed successfully' },
]

// 按 event 索引规则，O(1) 查找
const ruleIndex = new Map<string, AlertRule>(
  ALERT_RULES.map((r) => [r.event, r])
)

// Sentry severity 映射
const SENTRY_LEVEL: Record<AlertLevel, 'fatal' | 'warning' | 'info'> = {
  critical: 'fatal',
  warning: 'warning',
  info: 'info',
}

/**
 * 触发告警 — 根据事件名查找规则并执行
 * 未注册的事件静默跳过（不阻断业务流程）
 */
export function triggerAlert(
  event: string,
  data?: Record<string, unknown>,
  meta?: LogContext
): void {
  const rule = ruleIndex.get(event)
  if (!rule) return

  const alertMeta: LogContext = {
    ...meta,
    context: meta?.context ?? 'alert',
    alertEvent: event,
    alertLevel: rule.level,
    ...data,
  }

  // 按级别路由到 logger
  if (rule.level === 'critical') {
    logger.error(`[ALERT:CRITICAL] ${rule.message}`, alertMeta)
  } else if (rule.level === 'warning') {
    logger.warn(`[ALERT:WARNING] ${rule.message}`, alertMeta)
  } else {
    logger.info(`[ALERT:INFO] ${rule.message}`, alertMeta)
  }

  // Critical 告警额外上报 Sentry event（带 tags 便于过滤）
  if (rule.level === 'critical') {
    Sentry.captureMessage(`CRITICAL: ${rule.message}`, {
      level: SENTRY_LEVEL[rule.level],
      tags: { alertEvent: event, alertLevel: rule.level },
      extra: data,
    })
  }
}

/**
 * 获取已注册的告警规则（供测试和文档使用）
 */
export function getAlertRules(): readonly AlertRule[] {
  return ALERT_RULES
}
