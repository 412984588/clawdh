import { describe, it, expect } from 'vitest'
import en from '../../messages/en.json'

/**
 * Translation completeness tests (EN only)
 */

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

describe('i18n translations', () => {
  it('en.json has translation keys', () => {
    const enKeys = extractKeys(en)
    expect(enKeys.length).toBeGreaterThan(0)
  })

  it('all translation values are non-empty', () => {
    function checkNonEmpty(obj: Record<string, unknown>, path = ''): string[] {
      const empty: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          empty.push(...checkNonEmpty(value as Record<string, unknown>, fullPath))
        } else if (typeof value === 'string' && value.trim() === '') {
          empty.push(fullPath)
        }
      }
      return empty
    }

    expect(checkNonEmpty(en)).toEqual([])
  })

  it('routing config has en as only locale', async () => {
    const { routing } = await import('@/i18n/routing')
    expect(routing.locales).toContain('en')
    expect(routing.locales).not.toContain('zh')
    expect(routing.defaultLocale).toBe('en')
  })
})
