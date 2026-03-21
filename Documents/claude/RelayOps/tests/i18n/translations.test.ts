import { describe, it, expect } from 'vitest'
import en from '../../messages/en.json'
import zh from '../../messages/zh.json'

/**
 * 翻译完整性测试
 * 确保 en.json 和 zh.json 的 key 结构完全一致
 */

// 递归提取所有 key 路径
function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value as Record<string, unknown>, path))
    } else {
      keys.push(path)
    }
  }
  return keys.sort()
}

describe('i18n 翻译完整性', () => {
  const enKeys = extractKeys(en)
  const zhKeys = extractKeys(zh)

  it('en.json 和 zh.json 的 key 数量一致', () => {
    expect(enKeys.length).toBe(zhKeys.length)
  })

  it('en.json 中的每个 key 在 zh.json 中都存在', () => {
    const zhKeySet = new Set(zhKeys)
    const missingInZh = enKeys.filter((k) => !zhKeySet.has(k))
    expect(missingInZh).toEqual([])
  })

  it('zh.json 中的每个 key 在 en.json 中都存在', () => {
    const enKeySet = new Set(enKeys)
    const missingInEn = zhKeys.filter((k) => !enKeySet.has(k))
    expect(missingInEn).toEqual([])
  })

  it('所有翻译值非空', () => {
    function checkNonEmpty(obj: Record<string, unknown>, path = '', locale = '') {
      const empty: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          empty.push(...checkNonEmpty(value as Record<string, unknown>, fullPath, locale))
        } else if (typeof value === 'string' && value.trim() === '') {
          empty.push(`${locale}:${fullPath}`)
        }
      }
      return empty
    }

    const emptyEn = checkNonEmpty(en, '', 'en')
    const emptyZh = checkNonEmpty(zh, '', 'zh')
    expect([...emptyEn, ...emptyZh]).toEqual([])
  })

  it('routing 配置包含 en 和 zh', async () => {
    const { routing } = await import('@/i18n/routing')
    expect(routing.locales).toContain('en')
    expect(routing.locales).toContain('zh')
    expect(routing.defaultLocale).toBe('en')
  })
})
