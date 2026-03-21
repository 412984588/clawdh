import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRevenueMetrics,
  getSlaMetrics,
  getTicketDistribution,
  getTicketThroughput,
} from '@/lib/services/analytics-dashboard.service'
import { createMockSupabase, ok, okWithCount } from '../helpers/mock-supabase'

describe('getRevenueMetrics', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('calculates current and last month revenue', async () => {
    const supabase = createMockSupabase()
    const now = new Date()
    const currentMonthEntry = {
      amount: 500,
      created_at: new Date(now.getFullYear(), now.getMonth(), 15).toISOString(),
    }
    const lastMonthEntry = {
      amount: 300,
      created_at: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString(),
    }

    supabase.from.mockReturnValueOnce(ok([currentMonthEntry, lastMonthEntry]))

    const result = await getRevenueMetrics(supabase as any)
    expect(result.currentMonth).toBe(500)
    expect(result.lastMonth).toBe(300)
  })

  it('calculates MoM growth percentage', async () => {
    const supabase = createMockSupabase()
    const now = new Date()
    supabase.from.mockReturnValueOnce(ok([
      { amount: 600, created_at: new Date(now.getFullYear(), now.getMonth(), 5).toISOString() },
      { amount: 400, created_at: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString() },
    ]))

    const result = await getRevenueMetrics(supabase as any)
    // (600 - 400) / 400 * 100 = 50%
    expect(result.momGrowthPercent).toBe(50)
  })

  it('returns null MoM growth when last month is 0 (divide-by-zero protection)', async () => {
    const supabase = createMockSupabase()
    const now = new Date()
    supabase.from.mockReturnValueOnce(ok([
      { amount: 100, created_at: new Date(now.getFullYear(), now.getMonth(), 5).toISOString() },
    ]))

    const result = await getRevenueMetrics(supabase as any)
    expect(result.momGrowthPercent).toBeNull()
    expect(result.lastMonth).toBe(0)
  })

  it('returns 6 months in trend even with no data', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([]))

    const result = await getRevenueMetrics(supabase as any)
    expect(result.trend).toHaveLength(6)
    expect(result.trend.every((m) => m.amount === 0)).toBe(true)
  })
})

describe('getSlaMetrics', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('calculates average delivery hours and compliance rate', async () => {
    const supabase = createMockSupabase()
    // 2 completed tickets: one within SLA (24h), one outside (72h with 48h SLA)
    supabase.from
      .mockReturnValueOnce(ok([
        {
          paid_at: '2026-01-10T12:00:00Z',
          updated_at: '2026-01-11T12:00:00Z', // 24 hours
          sla_hours_business: 48,
        },
        {
          paid_at: '2026-01-10T12:00:00Z',
          updated_at: '2026-01-13T12:00:00Z', // 72 hours
          sla_hours_business: 48,
        },
      ]))
      .mockReturnValueOnce(okWithCount(null, 1)) // overdue count

    const result = await getSlaMetrics(supabase as any)
    // avg = (24 + 72) / 2 = 48
    expect(result.avgDeliveryHours).toBe(48)
    // 1 of 2 within SLA = 50%
    expect(result.complianceRate).toBe(50)
    expect(result.overdueCount).toBe(1)
  })

  it('returns null avg and 100% compliance when no completed tickets', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(ok([]))
      .mockReturnValueOnce(okWithCount(null, 0))

    const result = await getSlaMetrics(supabase as any)
    expect(result.avgDeliveryHours).toBeNull()
    expect(result.complianceRate).toBe(100)
    expect(result.overdueCount).toBe(0)
  })
})

describe('getTicketDistribution', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns counts for statuses with tickets', async () => {
    const supabase = createMockSupabase()
    // 10 statuses queried — mock each count response
    const counts = [3, 0, 1, 2, 0, 5, 0, 4, 1, 10]
    for (const c of counts) {
      supabase.from.mockReturnValueOnce(okWithCount(null, c))
    }

    const result = await getTicketDistribution(supabase as any)
    // Only non-zero statuses returned
    const nonZero = counts.filter((c) => c > 0)
    expect(result.distribution).toHaveLength(nonZero.length)
    expect(result.distribution.every((d) => d.count > 0)).toBe(true)
  })
})

describe('getTicketThroughput', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns created and completed counts for this month', async () => {
    const supabase = createMockSupabase()
    supabase.from
      .mockReturnValueOnce(okWithCount(null, 15))
      .mockReturnValueOnce(okWithCount(null, 8))

    const result = await getTicketThroughput(supabase as any)
    expect(result.createdThisMonth).toBe(15)
    expect(result.completedThisMonth).toBe(8)
  })
})
