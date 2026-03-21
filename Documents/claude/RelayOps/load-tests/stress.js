/**
 * 压力测试 — 渐进到 100 VU × 3min
 * 找出系统极限，识别降级拐点
 */

import { STAGES, THRESHOLDS } from './config.js'
import publicPages from './scenarios/public-pages.js'
import loginPage from './scenarios/login-page.js'
import stripeWebhook from './scenarios/stripe-webhook.js'

export const options = {
  stages: STAGES.stress,
  thresholds: {
    ...THRESHOLDS,
    // 压力测试放宽阈值 — 关注降级拐点而非绝对达标
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
}

export { setup } from './scenarios/partner-tickets.js'
import partnerTickets from './scenarios/partner-tickets.js'

export default function (data) {
  const rand = Math.random()
  if (rand < 0.4) {
    publicPages()
  } else if (rand < 0.55) {
    loginPage()
  } else if (rand < 0.85) {
    partnerTickets(data)
  } else {
    stripeWebhook()
  }
}

// 报告输出
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return {
    [`load-tests/reports/stress-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js'
