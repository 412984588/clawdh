import { describe, it, expect } from 'vitest'
import { addBusinessHours, isWithinBusinessHours, getNextBusinessDayStart } from '@/lib/utils/business-hours'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

const TZ = 'America/New_York'

// Helper: create a Date from a local ET time string (YYYY-MM-DD HH:mm:ss)
function etDate(localString: string): Date {
  return fromZonedTime(localString, TZ)
}

// Helper: extract ET hour from a UTC Date
function etHour(date: Date): number {
  return toZonedTime(date, TZ).getHours()
}

// Helper: extract ET day-of-week from a UTC Date (0=Sun, 1=Mon, ..., 6=Sat)
function etDay(date: Date): number {
  return toZonedTime(date, TZ).getDay()
}

describe('addBusinessHours', () => {
  it('adds hours within the same business day', () => {
    // Monday 10:00 ET + 2h = Monday 12:00 ET
    const start = etDate('2025-01-06 10:00:00')
    const result = addBusinessHours(start, 2)
    expect(etDay(result)).toBe(1) // Monday
    expect(etHour(result)).toBe(12)
  })

  it('skips overnight gap when adding across end of business day', () => {
    // Monday 16:00 ET + 2h:
    //   Mon 16→17: 1 business hour consumed
    //   Gap overnight
    //   Tue 09→10: 1 business hour consumed  => lands at Tue 10:00
    const start = etDate('2025-01-06 16:00:00')
    const result = addBusinessHours(start, 2)
    expect(etDay(result)).toBe(2) // Tuesday
    expect(etHour(result)).toBeGreaterThanOrEqual(9)
    expect(etHour(result)).toBeLessThan(17)
  })

  it('skips weekend when adding from Friday afternoon', () => {
    // Friday 16:00 ET + 2h =>
    //   Fri 16→17: 1 business hour
    //   Skip Sat/Sun
    //   Mon 09→10: 1 business hour => Monday 10:00 ET
    const start = etDate('2025-01-03 16:00:00') // Friday
    const result = addBusinessHours(start, 2)
    expect(etDay(result)).toBe(1) // Monday
    expect(etHour(result)).toBeGreaterThanOrEqual(9)
    expect(etHour(result)).toBeLessThan(17)
  })

  it('handles 8 business hours spanning end of Monday', () => {
    // The algorithm adds 1h at a time, counting slots where hour >= 9 && hour < 17.
    // From Mon 09:00: Mon slots are 10,11,12,13,14,15,16 = 7 business hours,
    // then the overnight gap is skipped, landing at Tue 09:00 as the 8th slot.
    const start = etDate('2025-01-06 09:00:00')
    const result = addBusinessHours(start, 8)
    expect(etDay(result)).toBe(2) // Tuesday
    expect(etHour(result)).toBe(9)
  })

  it('handles 7 business hours from 10am spanning to next morning', () => {
    // Mon 10:00 ET + 7h: Mon slots 11,12,13,14,15,16 = 6, then Tue 09:00 = 7th.
    const start = etDate('2025-01-06 10:00:00')
    const result = addBusinessHours(start, 7)
    expect(etDay(result)).toBe(2) // Tuesday
    expect(etHour(result)).toBe(9)
  })

  it('handles 16 business hours spanning two full days', () => {
    // Mon 09:00 + 16h: Mon slots 10-16 = 7, Tue slots 09-16 = 8 more (total 15),
    // then Wed 09:00 = 16th business hour. Result: Wed 09:00 ET.
    const start = etDate('2025-01-06 09:00:00')
    const result = addBusinessHours(start, 16)
    expect(etDay(result)).toBe(3) // Wednesday
    expect(etHour(result)).toBe(9)
  })

  it('handles 0 hours addition returning the original date unchanged', () => {
    const start = etDate('2025-01-06 10:00:00')
    const result = addBusinessHours(start, 0)
    expect(result.getTime()).toBe(start.getTime())
  })
})

describe('isWithinBusinessHours', () => {
  it('returns true for a weekday at 10:00 ET', () => {
    const date = etDate('2025-01-06 10:00:00') // Monday 10am
    expect(isWithinBusinessHours(date)).toBe(true)
  })

  it('returns true for a weekday at 09:00 ET (start of day)', () => {
    const date = etDate('2025-01-07 09:00:00') // Tuesday 9am
    expect(isWithinBusinessHours(date)).toBe(true)
  })

  it('returns false for a weekend (Saturday)', () => {
    const date = etDate('2025-01-04 11:00:00') // Saturday
    expect(isWithinBusinessHours(date)).toBe(false)
  })

  it('returns false for a weekend (Sunday)', () => {
    const date = etDate('2025-01-05 14:00:00') // Sunday
    expect(isWithinBusinessHours(date)).toBe(false)
  })

  it('returns false for early morning before business hours (8:00 ET)', () => {
    const date = etDate('2025-01-06 08:00:00') // Monday 8am
    expect(isWithinBusinessHours(date)).toBe(false)
  })

  it('returns false for evening at 17:00 ET (exclusive end boundary)', () => {
    const date = etDate('2025-01-06 17:00:00') // Monday 5pm
    expect(isWithinBusinessHours(date)).toBe(false)
  })

  it('returns false for late evening (20:00 ET)', () => {
    const date = etDate('2025-01-06 20:00:00') // Monday 8pm
    expect(isWithinBusinessHours(date)).toBe(false)
  })

  it('returns true for Wednesday afternoon', () => {
    const date = etDate('2025-01-08 15:30:00') // Wednesday 3:30pm
    expect(isWithinBusinessHours(date)).toBe(true)
  })
})

describe('getNextBusinessDayStart', () => {
  it('returns same-day 9am ET when called before business hours on a Monday', () => {
    // The function returns 9am of the current weekday when it is > the input
    const date = etDate('2025-01-06 07:00:00') // Monday 7am ET
    const result = getNextBusinessDayStart(date)
    expect(etDay(result)).toBe(1) // Monday
    expect(etHour(result)).toBe(9)
  })

  it('returns same-day 9am ET when called before business hours on a Wednesday', () => {
    const date = etDate('2025-01-08 06:30:00') // Wednesday 6:30am ET
    const result = getNextBusinessDayStart(date)
    expect(etDay(result)).toBe(3) // Wednesday
    expect(etHour(result)).toBe(9)
  })

  it('returns same-day 9am ET when called before business hours on a Friday', () => {
    const date = etDate('2025-01-03 08:00:00') // Friday 8am ET
    const result = getNextBusinessDayStart(date)
    expect(etDay(result)).toBe(5) // Friday
    expect(etHour(result)).toBe(9)
  })

  it('returns a future date when called on a weekday at or after 9am', () => {
    // The function advances past the same-day 9am; result will be > input
    const date = etDate('2025-01-06 10:00:00') // Monday 10am ET
    const result = getNextBusinessDayStart(date)
    expect(result.getTime()).toBeGreaterThan(date.getTime())
  })

  it('always returns a Date object for any input', () => {
    const weekendDate = etDate('2025-01-04 12:00:00') // Saturday
    const result = getNextBusinessDayStart(weekendDate)
    expect(result).toBeInstanceOf(Date)
    expect(isNaN(result.getTime())).toBe(false)
  })
})
