import type { SupabaseClient } from '@supabase/supabase-js'

// ─── 收入指标 ─────────────────────────────────────────────────────────────

export interface MonthlyRevenue {
  month: string // YYYY-MM
  amount: number
}

export interface RevenueMetrics {
  currentMonth: number
  lastMonth: number
  momGrowthPercent: number | null // null = 上月为 0，无法计算
  trend: MonthlyRevenue[] // 最近 6 个月
}

export async function getRevenueMetrics(supabase: SupabaseClient): Promise<RevenueMetrics> {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // 查询最近 6 个月的确认收入
  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('amount, created_at')
    .eq('type', 'invoice_payment')
    .eq('status', 'confirmed')
    .gte('created_at', sixMonthsAgo.toISOString())

  const rows = entries ?? []

  // 按月分组
  const monthMap = new Map<string, number>()
  for (const entry of rows) {
    const d = new Date(entry.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, (monthMap.get(key) ?? 0) + (entry.amount as number))
  }

  // 生成最近 6 个月的趋势数组（含 0 值月份）
  const trend: MonthlyRevenue[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    trend.push({ month: key, amount: monthMap.get(key) ?? 0 })
  }

  const currentMonthKey = `${currentMonthStart.getFullYear()}-${String(currentMonthStart.getMonth() + 1).padStart(2, '0')}`
  const lastMonthKey = `${lastMonthStart.getFullYear()}-${String(lastMonthStart.getMonth() + 1).padStart(2, '0')}`

  const currentMonth = monthMap.get(currentMonthKey) ?? 0
  const lastMonth = monthMap.get(lastMonthKey) ?? 0

  // 除零保护
  const momGrowthPercent = lastMonth > 0
    ? Math.round(((currentMonth - lastMonth) / lastMonth) * 100)
    : null

  return { currentMonth, lastMonth, momGrowthPercent, trend }
}

// ─── SLA 指标 ──────────────────────────────────────────────────────────────

export interface SlaMetrics {
  avgDeliveryHours: number | null // null = 无已完成工单
  complianceRate: number // 0-100%
  overdueCount: number
}

export async function getSlaMetrics(supabase: SupabaseClient): Promise<SlaMetrics> {
  // 获取已完成工单的 SLA 数据（paid_at → completed 的时间差）
  const { data: completed } = await supabase
    .from('tickets')
    .select('paid_at, updated_at, sla_hours_business')
    .eq('status', 'completed')
    .not('paid_at', 'is', null)

  const completedRows = completed ?? []

  let totalHours = 0
  let withinSla = 0

  for (const ticket of completedRows) {
    if (!ticket.paid_at) continue
    const paidAt = new Date(ticket.paid_at).getTime()
    const completedAt = new Date(ticket.updated_at).getTime()
    const hours = (completedAt - paidAt) / 3_600_000

    totalHours += hours
    if (hours <= (ticket.sla_hours_business ?? Infinity)) {
      withinSla++
    }
  }

  const avgDeliveryHours = completedRows.length > 0
    ? Math.round((totalHours / completedRows.length) * 10) / 10
    : null

  const complianceRate = completedRows.length > 0
    ? Math.round((withinSla / completedRows.length) * 100)
    : 100

  // 超时工单数
  const { count: overdueCount } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('overdue_flag', true)

  return { avgDeliveryHours, complianceRate, overdueCount: overdueCount ?? 0 }
}

// ─── 工单统计 ──────────────────────────────────────────────────────────────

export interface StatusCount {
  status: string
  count: number
}

export interface TicketDistribution {
  distribution: StatusCount[]
}

export async function getTicketDistribution(supabase: SupabaseClient): Promise<TicketDistribution> {
  const statuses = [
    'submitted', 'needs_scope_review', 'scope_locked',
    'invoiced', 'paid', 'queued', 'assigned',
    'in_progress', 'submitted_for_review', 'completed',
  ]

  // 并行查询各状态的计数
  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', status)
      return { status, count: count ?? 0 }
    })
  )

  // 只返回有数据的状态
  return { distribution: results.filter((r) => r.count > 0) }
}

export interface TicketThroughput {
  createdThisMonth: number
  completedThisMonth: number
}

export async function getTicketThroughput(supabase: SupabaseClient): Promise<TicketThroughput> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ count: created }, { count: completed }] = await Promise.all([
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart),
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('updated_at', monthStart),
  ])

  return {
    createdThisMonth: created ?? 0,
    completedThisMonth: completed ?? 0,
  }
}
