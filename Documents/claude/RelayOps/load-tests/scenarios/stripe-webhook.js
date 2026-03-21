/**
 * 场景：Stripe Webhook 端点
 * POST /api/webhooks/stripe
 *
 * 注意：真实 Stripe webhook 需要有效签名
 * 本地 dev 环境如果 STRIPE_WEBHOOK_SECRET 未设置，签名验证会失败（400）
 * 这里测试的是端点的响应能力和错误处理性能
 *
 * 若要测试完整流程，需要：
 * 1. 设置 STRIPE_WEBHOOK_SECRET 环境变量
 * 2. 用 stripe CLI 的 test secret 签名 payload
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import crypto from 'k6/crypto'
import { BASE_URL } from '../config.js'

// Stripe webhook 签名密钥（本地测试用，从环境变量传入）
const WEBHOOK_SECRET = __ENV.STRIPE_WEBHOOK_SECRET || ''

// 模拟 invoice.paid 事件 payload
function makeInvoicePaidPayload() {
  return JSON.stringify({
    id: `evt_test_${Date.now()}`,
    object: 'event',
    type: 'invoice.paid',
    data: {
      object: {
        id: `in_test_${Date.now()}`,
        object: 'invoice',
        amount_paid: 15000, // $150.00（cents）
        currency: 'usd',
        customer: 'cus_test_loadtest',
        status: 'paid',
      },
    },
  })
}

/**
 * 生成 Stripe webhook 签名
 * 格式：t=timestamp,v1=hmac_sha256(timestamp.payload, secret)
 */
function signPayload(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000)
  const signedPayload = `${timestamp}.${payload}`
  const signature = crypto.hmac('sha256', secret, signedPayload, 'hex')
  return `t=${timestamp},v1=${signature}`
}

export default function stripeWebhook() {
  const payload = makeInvoicePaidPayload()

  const headers = {
    'Content-Type': 'application/json',
  }

  // 如果有 webhook secret，生成有效签名
  if (WEBHOOK_SECRET) {
    headers['stripe-signature'] = signPayload(payload, WEBHOOK_SECRET)
  } else {
    // 无签名 — 预期返回 400（测试错误处理性能）
    headers['stripe-signature'] = 'invalid_signature'
  }

  const res = http.post(`${BASE_URL}/api/webhooks/stripe`, payload, {
    headers,
    tags: { name: 'stripe-webhook', type: 'api' },
  })

  // 有签名时预期 200，无签名时预期 400（拒绝无效签名）
  if (WEBHOOK_SECRET) {
    check(res, {
      'webhook 返回 200': (r) => r.status === 200,
      'webhook 响应 received': (r) => {
        try {
          return JSON.parse(r.body).received === true
        } catch {
          return false
        }
      },
    })
  } else {
    check(res, {
      'webhook 拒绝无效签名 (400)': (r) => r.status === 400,
    })
  }

  sleep(1)
}
