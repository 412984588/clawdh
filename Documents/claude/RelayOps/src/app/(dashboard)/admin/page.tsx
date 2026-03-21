import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ticket, Clock, AlertCircle, Scale, DollarSign, TrendingUp, Timer, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import type { TicketEvent } from '@/lib/types/database'
import { ACTIVE_STATUSES } from '@/lib/constants/ticket-statuses'
import {
  getRevenueMetrics,
  getSlaMetrics,
  getTicketDistribution,
  getTicketThroughput,
} from '@/lib/services/analytics-dashboard.service'

export const metadata = {
  title: 'Dashboard — Admin — RelayOps',
}

interface TicketEventWithTicket extends TicketEvent {
  tickets: { title: string } | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

async function getAdminMetrics() {
  const admin = createAdminClient()

  const [totalRes, activeRes, awaitingRes, disputesResult, recentEventsResult] =
    await Promise.all([
      admin.from('tickets').select('*', { count: 'exact', head: true }),
      admin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ACTIVE_STATUSES),
      admin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted_for_review'),
      admin
        .from('disputes')
        .select('id', { count: 'exact', head: true })
        .in('status', ['open', 'under_review']),
      admin
        .from('ticket_events')
        .select('*, tickets ( title )')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  return {
    totalTickets: totalRes.count ?? 0,
    activeTickets: activeRes.count ?? 0,
    awaitingReview: awaitingRes.count ?? 0,
    openDisputes: disputesResult.count ?? 0,
    recentEvents: (recentEventsResult.data ?? []) as TicketEventWithTicket[],
  }
}

export default async function AdminDashboardPage() {
  const admin = createAdminClient()

  // 并行获取所有数据
  const [metrics, revenue, sla, distribution, throughput] = await Promise.all([
    getAdminMetrics(),
    getRevenueMetrics(admin),
    getSlaMetrics(admin),
    getTicketDistribution(admin),
    getTicketThroughput(admin),
  ])

  const { totalTickets, activeTickets, awaitingReview, openDisputes, recentEvents } = metrics

  const metricCards = [
    { title: 'Total Tickets', value: totalTickets, sub: 'All time', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Tickets', value: activeTickets, sub: 'Not in terminal state', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Awaiting Review', value: awaitingReview, sub: 'submitted_for_review', icon: AlertCircle, color: awaitingReview > 0 ? 'text-amber-600' : 'text-slate-500', bg: awaitingReview > 0 ? 'bg-amber-50' : 'bg-slate-50' },
    { title: 'Open Disputes', value: openDisputes, sub: 'Open or under review', icon: Scale, color: openDisputes > 0 ? 'text-red-600' : 'text-slate-500', bg: openDisputes > 0 ? 'bg-red-50' : 'bg-slate-50' },
  ]

  // 收入趋势图最大值（用于 CSS 柱高百分比）
  const maxRevenue = Math.max(...revenue.trend.map((m) => m.amount), 1)

  return (
    <div className="dashboard-page">
      <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.94))] px-6 py-6 shadow-[0_34px_90px_-60px_rgba(15,23,42,0.45)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm">
              Operations Overview
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Platform activity overview across revenue, SLA health, ticket flow, and
              operational events.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-white/80 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
            >
              {revenue.trend.length}-month revenue trend
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-white/80 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
            >
              {recentEvents.length} recent events
            </Badge>
          </div>
        </div>
      </section>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.title}
              className={`relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)] ${card.color.replace('text-', 'border-t-4 border-')}`}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 ${card.bg}`}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </span>
                <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Revenue Section ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Revenue
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" /> This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{formatCurrency(revenue.currentMonth)}</span>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Last Month</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-slate-600">{formatCurrency(revenue.lastMonth)}</span>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> MoM Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenue.momGrowthPercent !== null ? (
                <span className={`text-2xl font-bold ${revenue.momGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenue.momGrowthPercent >= 0 ? '+' : ''}{revenue.momGrowthPercent}%
                </span>
              ) : (
                <span className="text-2xl font-bold text-slate-500">—</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 6-month revenue bar chart (CSS) */}
        <Card className="rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
          <CardContent className="pt-6">
            <div className="flex h-36 items-end gap-2">
              {revenue.trend.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {m.amount > 0 ? formatCurrency(m.amount) : ''}
                  </span>
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                    style={{ height: `${Math.max((m.amount / maxRevenue) * 100, 2)}%` }}
                  />
                  <span className="text-[10px] text-slate-600">{m.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── SLA Section ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          SLA Performance
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <Timer className="h-4 w-4" /> Avg Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {sla.avgDeliveryHours !== null ? `${sla.avgDeliveryHours}h` : '—'}
              </span>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-2xl font-bold ${sla.complianceRate >= 90 ? 'text-green-600' : sla.complianceRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                {sla.complianceRate}%
              </span>
              {/* 进度条 */}
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${sla.complianceRate >= 90 ? 'bg-green-500' : sla.complianceRate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${sla.complianceRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-2xl font-bold ${sla.overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {sla.overdueCount}
              </span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Ticket Distribution ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Ticket Distribution
          <span className="ml-2 text-xs font-medium normal-case tracking-normal text-slate-500">
            This month: {throughput.createdThisMonth} created / {throughput.completedThisMonth} completed
          </span>
        </h2>
        <Card className="rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
          <CardContent className="space-y-3 pt-6">
            {distribution.distribution.length === 0 ? (
              <p className="text-sm text-slate-500">No active tickets.</p>
            ) : (
              distribution.distribution.map((item) => {
                const maxCount = Math.max(...distribution.distribution.map((d) => d.count), 1)
                return (
                  <div key={item.status} className="flex items-center gap-4">
                    <span className="w-36 truncate text-right text-xs font-medium text-slate-500">
                      {statusLabel(item.status)}
                    </span>
                    <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold tabular-nums text-slate-700">
                      {item.count}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick links */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Quick Links
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { href: '/admin/tickets', label: 'View all tickets' },
            { href: '/admin/tickets?status=assigned', label: 'View assignments' },
            { href: '/admin/disputes', label: 'View disputes' },
            { href: '/admin/ledger', label: 'Ledger' },
            { href: '/admin/payout-batches', label: 'Payout batches' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4 text-sm font-medium text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)] transition-colors hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Recent Activity
        </h2>
        {recentEvents.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center text-sm text-slate-500">
            No activity yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)]">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge
                    variant="outline"
                    className="shrink-0 border-slate-200 bg-slate-50 text-xs font-medium text-slate-600"
                  >
                    {event.event_type.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-slate-700 truncate">
                    {event.tickets?.title ?? `Ticket ${event.ticket_id.slice(0, 8)}`}
                  </span>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                  {format(new Date(event.created_at), 'MMM d, HH:mm')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
