/**
 * 标准负载测试 — 渐进到 50 VU × 5min
 * 建立性能基准线，验证系统在正常负载下的表现
 */

import { STAGES, THRESHOLDS } from './config.js'
import publicPages from './scenarios/public-pages.js'
import loginPage from './scenarios/login-page.js'
import stripeWebhook from './scenarios/stripe-webhook.js'

export const options = {
  stages: STAGES.load,
  thresholds: THRESHOLDS,
}

export { setup } from './scenarios/partner-tickets.js'
import partnerTickets from './scenarios/partner-tickets.js'

export default function (data) {
  // 按权重随机选择场景（模拟真实流量分布）
  const rand = Math.random()
  if (rand < 0.4) {
    // 40% — 公开页面浏览
    publicPages()
  } else if (rand < 0.55) {
    // 15% — 登录页
    loginPage()
  } else if (rand < 0.85) {
    // 30% — 工单操作（核心业务）
    partnerTickets(data)
  } else {
    // 15% — Webhook
    stripeWebhook()
  }
}

// 报告输出
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return {
    [`load-tests/reports/load-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js'
