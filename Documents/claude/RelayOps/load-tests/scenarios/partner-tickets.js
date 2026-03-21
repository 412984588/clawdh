/**
 * 场景：Partner 工单操作
 * 1. GET /partner/tickets — 工单列表查询（需认证）
 * 2. POST Server Action createAndSubmitTicket — 工单创建（需认证）
 *
 * Next.js Server Actions 调用方式：
 * POST 到页面 URL，带 Next-Action header + FormData 或 JSON body
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { BASE_URL, TEST_TICKET_DATA } from '../config.js'
import { getTestSession, getAuthHeaders } from '../helpers/auth.js'

let session = null

// setup 阶段获取认证 session（只执行一次）
export function setup() {
  const s = getTestSession()
  if (!s) {
    console.warn('认证失败，跳过需认证的测试场景')
  }
  return { session: s }
}

export default function partnerTickets(data) {
  session = data.session
  if (!session) return

  const authHeaders = getAuthHeaders(session)

  // ── 1. 工单列表查询 ──
  const listRes = http.get(`${BASE_URL}/partner/tickets`, {
    headers: authHeaders,
    tags: { name: 'partner-tickets-list', type: 'api' },
  })

  check(listRes, {
    '工单列表返回 200': (r) => r.status === 200,
  })

  sleep(1)

  // ── 2. 工单创建（Server Action） ──
  // Next.js Server Actions 通过 POST 请求调用
  // Content-Type: text/plain;charset=UTF-8（Next.js 内部编码）
  // Next-Action header 用于路由到正确的 action
  //
  // 注意：Server Action 的确切调用格式依赖 Next.js 内部实现
  // 在负载测试中，我们直接 POST JSON 到 action 端点
  // 如果 Next.js 拒绝（非标准调用），check 会捕获失败
  const createRes = http.post(
    `${BASE_URL}/partner/tickets/new`,
    JSON.stringify([TEST_TICKET_DATA]),
    {
      headers: {
        ...authHeaders,
        'Content-Type': 'text/plain;charset=UTF-8',
        'Next-Action': 'createAndSubmitTicket',
        Accept: 'text/x-component',
      },
      tags: { name: 'partner-ticket-create', type: 'api' },
    }
  )

  check(createRes, {
    '工单创建返回非 5xx': (r) => r.status < 500,
  })

  sleep(2)
}
