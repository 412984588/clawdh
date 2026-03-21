/**
 * 场景：登录页面加载
 * 仅测试页面渲染性能，不测试 OTP 发送（那是 Supabase 客户端 SDK 行为）
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { BASE_URL } from '../config.js'

export default function loginPage() {
  const res = http.get(`${BASE_URL}/login`, {
    tags: { name: 'login-page', type: 'page' },
  })

  check(res, {
    '登录页返回 200': (r) => r.status === 200,
    '包含登录表单': (r) => r.body && r.body.includes('email'),
  })

  sleep(1)
}
