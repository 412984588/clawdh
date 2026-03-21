# RelayOps 可观测性指南

## 日志格式

### 生产环境（JSON）

每条日志输出为单行 JSON，便于 Vercel Log Drain / CloudWatch 解析：

```json
{
  "timestamp": "2026-03-21T10:00:00.000Z",
  "level": "info",
  "message": "Payment confirmed successfully",
  "context": "handlePayment",
  "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "ticketId": "ticket-123",
  "amountDollars": 150
}
```

### 开发环境（可读格式）

```
[handlePayment] [a1b2c3d4-...] Payment confirmed successfully { ticketId: 'ticket-123', ... }
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| timestamp | ISO 8601 | 日志生成时间（UTC） |
| level | info/warn/error | 日志级别 |
| message | string | 人类可读描述 |
| context | string | 来源模块（handlePayment / state-machine-engine / cron-xxx） |
| traceId | UUID | 请求追踪 ID（来自 middleware x-trace-id header） |

## 请求追踪（TraceId）

### 生成

`middleware.ts` 在每个请求入口生成 `crypto.randomUUID()` 并：
1. 设置到 `request.headers['x-trace-id']`（传递给后续 Server Action / API Route）
2. 设置到 `response.headers['x-trace-id']`（返回给客户端）

### 使用

在 logger 调用时通过 `meta.traceId` 传递：

```typescript
logger.info('Operation completed', {
  context: 'myModule',
  traceId: request.headers.get('x-trace-id') ?? undefined,
  operationId: '...',
})
```

### 排查流程

1. 从错误报告/Sentry 事件获取 `traceId`
2. 在 Vercel Logs 中搜索该 traceId
3. 所有关联日志条目会包含相同 traceId

## 告警规则

### 级别定义

| 级别 | 含义 | 响应要求 | Sentry 级别 |
|------|------|----------|------------|
| **critical** | 系统功能受损 | 立即响应 | fatal |
| **warning** | 潜在风险 | 工作时间内处理 | warning |
| **info** | 正常业务事件 | 仅记录 | info（不上报） |

### 已注册规则

| 事件 | 级别 | 触发条件 |
|------|------|----------|
| payment_failed | critical | 支付处理失败 |
| payment_retry_exhausted | critical | 支付重试次数用尽 |
| ledger_inconsistency | critical | 账本条目不一致 |
| auth_anomaly | critical | 认证异常 |
| sla_timeout | warning | SLA 截止时间临近 |
| cron_partial_failure | warning | Cron 任务部分失败（207） |
| webhook_signature_invalid | warning | 无效 Webhook 签名 |
| rate_limit_triggered | warning | IP 触发限流 |
| ticket_status_changed | info | 工单状态变更 |
| payment_confirmed | info | 支付确认 |
| cron_completed | info | Cron 任务完成 |

### 触发方式

```typescript
import { triggerAlert } from '@/lib/utils/alerts'

triggerAlert('payment_failed', {
  ticketId: 'ticket-123',
  stripeInvoiceId: 'inv_xxx',
  error: 'Card declined',
}, { context: 'stripe-webhook', traceId })
```

## Sentry 集成

### 上报策略

| 日志级别 | Sentry 行为 |
|----------|------------|
| info | 不上报（避免噪音） |
| warn | captureMessage(level: warning) |
| error | captureException（Error 实例）或 captureMessage(level: error) |
| critical alert | 额外 captureMessage(level: fatal, tags: alertEvent) |

### Sentry 查询

```
# 所有 critical 告警
tags.alertLevel:critical

# 特定 traceId 的所有事件
extra.traceId:a1b2c3d4-...

# 支付相关错误
tags.alertEvent:payment_failed OR tags.alertEvent:payment_retry_exhausted
```

## 监控仪表盘建议

| 指标 | 数据源 | 阈值 |
|------|--------|------|
| 支付成功率 | payment_confirmed / (payment_confirmed + payment_failed) | > 99% |
| Cron 健康度 | cron_completed / (cron_completed + cron_partial_failure) | > 95% |
| 错误率 | Sentry error count per hour | < 10 |
| P95 响应时间 | Vercel Analytics | < 500ms (API) |
