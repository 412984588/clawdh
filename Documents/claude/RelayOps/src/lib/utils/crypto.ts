/**
 * 加密工具 — Edge Runtime 兼容
 * 使用 Web Crypto API（非 Node.js crypto 模块）以兼容 Vercel Edge Runtime
 */

/**
 * 定时安全字符串比较 — 防止 timing attack
 * 无论字符串内容如何，比较时间始终一致
 *
 * 使用 XOR 逐字节比较而非短路返回，确保执行时间不泄露信息
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }

  // 长度不同时仍需完整比较，避免泄露长度信息
  // 以较长字符串为基准
  const len = Math.max(a.length, b.length)
  if (len === 0) return true

  // 填充到相同长度（使用 NUL 字符，不影响比较结果）
  const paddedA = a.padEnd(len, '\0')
  const paddedB = b.padEnd(len, '\0')

  let mismatch = a.length !== b.length ? 1 : 0

  for (let i = 0; i < len; i++) {
    mismatch |= paddedA.charCodeAt(i) ^ paddedB.charCodeAt(i)
  }

  return mismatch === 0
}
