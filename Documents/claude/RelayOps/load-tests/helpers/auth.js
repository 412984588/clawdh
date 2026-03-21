/**
 * Supabase 认证 helper
 * 通过 Supabase Admin API 获取测试用户 session，
 * 返回可用于 k6 HTTP 请求的 cookie jar 格式
 *
 * 前提：本地 Supabase 已启动，seed 数据中包含测试用户
 */

import http from 'k6/http'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js'

// 本地 Supabase seed 用户（需要在 seed.sql 中预置或用 env 传入）
const TEST_EMAIL = __ENV.TEST_USER_EMAIL || 'partner@test.relayops.com'
const TEST_PASSWORD = __ENV.TEST_USER_PASSWORD || 'test-password-123'

/**
 * 用 Supabase Auth Admin API 创建/获取测试用户 session
 * 返回 access_token 和 refresh_token
 */
export function getTestSession() {
  // 用密码登录获取 session（本地 Supabase 支持邮箱密码登录）
  const loginRes = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
    }
  )

  if (loginRes.status !== 200) {
    console.error(`认证失败: ${loginRes.status} - ${loginRes.body}`)
    return null
  }

  const body = JSON.parse(loginRes.body)
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  }
}

/**
 * 构建带 Supabase auth cookie 的请求参数
 * @supabase/ssr 的 cookie 格式：sb-<ref>-auth-token
 * 本地 Supabase ref 默认为 127.0.0.1 → cookie name 为 sb-127-auth-token（chunked）
 *
 * 实际中间件通过 getAll() 读取所有 cookie，然后由 @supabase/ssr 内部解析
 * k6 不支持 cookie chunking，所以我们直接设置完整的 auth token cookie
 */
export function getAuthHeaders(session) {
  if (!session) return {}

  // @supabase/ssr 在 cookie 中存储 base64(JSON) 格式的 session
  // cookie 名称基于 Supabase URL 的 host 部分
  const cookieValue = btoa(
    JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    })
  )

  // 本地 Supabase 的 cookie name：sb-<project-ref>-auth-token
  // 默认 project ref 从 supabase start 输出中获取，通常是 URL 的 hostname
  // k6 中通过 Cookie header 传递
  return {
    Cookie: `sb-127-auth-token=${cookieValue}`,
  }
}

/**
 * 获取认证后的默认请求参数
 */
export function getAuthParams(session) {
  return {
    headers: {
      ...getAuthHeaders(session),
      'Content-Type': 'application/json',
    },
  }
}
