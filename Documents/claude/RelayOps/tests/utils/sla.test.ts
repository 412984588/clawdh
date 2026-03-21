import { describe, it, expect } from 'vitest'
import { isOverdue, calculateDueAt } from '@/lib/utils/sla'

describe('isOverdue', () => {
  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isOverdue(undefined)).toBe(false)
  })

  it('returns true for a past date', () => {
    const past = new Date(Date.now() - 1000)
    expect(isOverdue(past)).toBe(true)
  })

  it('returns false for a future date', () => {
    const future = new Date(Date.now() + 60_000)
    expect(isOverdue(future)).toBe(false)
  })
})

describe('calculateDueAt', () => {
  it('returns a Date in the future when given business hours', () => {
    const paidAt = new Date('2024-06-17T09:00:00') // Monday 9am
    const result = calculateDueAt(paidAt, 8)
    expect(result).toBeInstanceOf(Date)
    expect(result.getTime()).toBeGreaterThan(paidAt.getTime())
  })
})
