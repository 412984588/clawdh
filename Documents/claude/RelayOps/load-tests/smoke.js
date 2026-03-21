/**
 * 冒烟测试 — 1 VU × 30s
 * 快速验证所有场景脚本可正常执行
 */

import { STAGES, THRESHOLDS } from './config.js'
import publicPages from './scenarios/public-pages.js'
import loginPage from './scenarios/login-page.js'
import stripeWebhook from './scenarios/stripe-webhook.js'

export const options = {
  stages: STAGES.smoke,
  thresholds: THRESHOLDS,
}

export { setup } from './scenarios/partner-tickets.js'
import partnerTickets from './scenarios/partner-tickets.js'

export default function (data) {
  publicPages()
  loginPage()
  partnerTickets(data)
  stripeWebhook()
}

// HTML + JSON 报告输出
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return {
    [`load-tests/reports/smoke-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}

// k6 内置 textSummary（需要导入）
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js'
