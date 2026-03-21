import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils/cn'

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('merges multiple classes', () => {
    const result = cn('text-red-500', 'bg-blue-100')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-100')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    // tailwind-merge should keep only the last conflicting class
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles conditional classes via object syntax', () => {
    const result = cn({ 'font-bold': true, 'font-light': false })
    expect(result).toBe('font-bold')
    expect(result).not.toContain('font-light')
  })

  it('ignores falsy values', () => {
    const result = cn(undefined, null, false, '', 'px-4')
    expect(result).toBe('px-4')
  })

  it('returns empty string when no valid classes', () => {
    expect(cn(undefined, null, false)).toBe('')
  })
})
