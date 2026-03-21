import { addHours } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const TZ = 'America/New_York'
const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR = 17

// 从 fromDate 开始，向前走 hoursToAdd 个工作小时（工作日 9-17 ET）
export function addBusinessHours(fromDate: Date, hoursToAdd: number): Date {
  let current = fromDate
  let remaining = hoursToAdd

  while (remaining > 0) {
    current = addHours(current, 1)
    const zoned = toZonedTime(current, TZ)
    const dayOfWeek = zoned.getDay() // 0=Sun, 6=Sat
    const hour = zoned.getHours()
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
    const isDuringBusiness = hour >= BUSINESS_START_HOUR && hour < BUSINESS_END_HOUR
    if (isWeekday && isDuringBusiness) {
      remaining--
    }
  }
  return current
}

// 判断给定时间是否在工作时间内（工作日 9-17 ET）
export function isWithinBusinessHours(date: Date): boolean {
  const zoned = toZonedTime(date, TZ)
  const dayOfWeek = zoned.getDay()
  const hour = zoned.getHours()
  return (
    dayOfWeek >= 1 &&
    dayOfWeek <= 5 &&
    hour >= BUSINESS_START_HOUR &&
    hour < BUSINESS_END_HOUR
  )
}

// 返回下一个工作日的 9:00 AM ET（如果当天已是工作日且尚未过 9 点，则返回当天 9 点）
export function getNextBusinessDayStart(date: Date): Date {
  let candidate = date
  // 最多循环 7 次，跳过周末
  for (let i = 0; i < 7; i++) {
    const zoned = toZonedTime(candidate, TZ)
    const dayOfWeek = zoned.getDay()
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // 构造当天 9:00 AM ET
      const startOfDay = new Date(zoned)
      startOfDay.setHours(BUSINESS_START_HOUR, 0, 0, 0)
      const result = fromZonedTime(startOfDay, TZ)
      // 如果结果还在过去（当天 9 点已过），推进到下一天继续循环
      if (result > candidate) {
        return result
      }
    }
    candidate = addHours(candidate, 24)
  }
  // 兜底：不应到达这里
  return candidate
}
