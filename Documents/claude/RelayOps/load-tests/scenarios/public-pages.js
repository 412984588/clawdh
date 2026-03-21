/**
 * 场景：公开页面访问
 * 测试首页和 How It Works 页面的 SSR 渲染性能
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { BASE_URL } from '../config.js'

const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/how-it-works', name: 'how-it-works' },
  { path: '/for-partners', name: 'for-partners' },
]

export default function publicPages() {
  for (const page of PAGES) {
    const res = http.get(`${BASE_URL}${page.path}`, {
      tags: { name: page.name, type: 'page' },
    })

    check(res, {
      [`${page.name} 返回 200`]: (r) => r.status === 200,
      [`${page.name} 有 HTML 内容`]: (r) =>
        r.body && r.body.includes('<!DOCTYPE html'),
    })

    // 模拟用户浏览间隔
    sleep(1)
  }
}
