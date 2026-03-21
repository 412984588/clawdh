import { describe, it, expect } from 'vitest'
import { timingSafeCompare } from '@/lib/utils/crypto'

describe('timingSafeCompare', () => {
  it('相同字符串返回 true', () => {
    expect(timingSafeCompare('secret123', 'secret123')).toBe(true)
  })

  it('不同字符串返回 false', () => {
    expect(timingSafeCompare('secret123', 'wrong456')).toBe(false)
  })

  it('空字符串相等', () => {
    expect(timingSafeCompare('', '')).toBe(true)
  })

  it('长度不同返回 false', () => {
    expect(timingSafeCompare('short', 'a-much-longer-string')).toBe(false)
  })

  it('单字符差异返回 false', () => {
    expect(timingSafeCompare('abcdef', 'abcdeg')).toBe(false)
  })

  it('非字符串输入返回 false', () => {
    // @ts-expect-error — 测试运行时类型保护
    expect(timingSafeCompare(null, 'test')).toBe(false)
    // @ts-expect-error — 测试运行时类型保护
    expect(timingSafeCompare('test', undefined)).toBe(false)
    // @ts-expect-error — 测试运行时类型保护
    expect(timingSafeCompare(123, 'test')).toBe(false)
  })

  // timing-safe 特性通过代码审查保证（无短路返回，完整遍历）
  // 微基准在 vitest 中天然 flaky（JIT warmup + GC），不做时间断言

  it('完整遍历：相同前缀不同后缀仍返回 false', () => {
    // 确保不会因前缀匹配而提前返回 true
    expect(timingSafeCompare('secret-key-abc', 'secret-key-xyz')).toBe(false)
  })

  it('填充逻辑：极端长度差异仍能正确比较', () => {
    expect(timingSafeCompare('a', 'a'.repeat(1000))).toBe(false)
    expect(timingSafeCompare('a'.repeat(1000), 'a'.repeat(1000))).toBe(true)
  })
})
