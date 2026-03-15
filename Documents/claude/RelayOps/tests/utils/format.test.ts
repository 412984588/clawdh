import { describe, it, expect } from 'vitest'
import { formatCurrency, formatFileSize, formatDate, formatDateTime, formatRelative } from '@/lib/utils/format'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats negative amounts', () => {
    expect(formatCurrency(-250.5)).toBe('-$250.50')
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const d = new Date('2024-06-15T12:00:00Z')
    expect(formatDate(d)).toBe('Jun 15, 2024')
  })

  it('formats a date string', () => {
    // Use midday UTC to avoid timezone-boundary issues
    expect(formatDate('2024-01-01T12:00:00Z')).toBe('Jan 1, 2024')
  })
})

describe('formatDateTime', () => {
  it('formats a Date object with time', () => {
    // Use local time parsing to avoid TZ flakiness — just verify shape
    const result = formatDateTime(new Date('2024-06-15T14:30:00'))
    expect(result).toMatch(/Jun 15, 2024/)
    expect(result).toMatch(/\d+:\d{2} (AM|PM)/)
  })

  it('formats a date string with time', () => {
    const result = formatDateTime('2024-01-01T09:05:00')
    expect(result).toMatch(/Jan 1, 2024/)
    expect(result).toMatch(/\d+:\d{2} (AM|PM)/)
  })
})

describe('formatRelative', () => {
  it('returns a non-empty relative string for a past date', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    const result = formatRelative(past)
    expect(result).toBeTruthy()
    expect(result).toMatch(/ago/)
  })

  it('returns a non-empty relative string for a future date', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    const result = formatRelative(future)
    expect(result).toBeTruthy()
    expect(result).toMatch(/in /)
  })
})
