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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform activity overview.</p>
      </div>

      {/* Metric cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className={`relative overflow-hidden border-t-2 ${card.color.replace('text-', 'border-')}`}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold tracking-tight text-slate-900">{card.value}</span>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Revenue Section ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Revenue</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" /> This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{formatCurrency(revenue.currentMonth)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Last Month</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-slate-600">{formatCurrency(revenue.lastMonth)}</span>
            </CardContent>
          </Card>
          <Card>
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
                <span className="text-2xl font-bold text-slate-400">—</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 6-month revenue bar chart (CSS) */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end gap-2 h-32">
              {revenue.trend.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {m.amount > 0 ? formatCurrency(m.amount) : ''}
                  </span>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all"
                    style={{ height: `${Math.max((m.amount / maxRevenue) * 100, 2)}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{m.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SLA Section ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">SLA Performance</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
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
          <Card>
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
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${sla.complianceRate >= 90 ? 'bg-green-500' : sla.complianceRate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${sla.complianceRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
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
      </div>

      {/* ── Ticket Distribution ───────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Ticket Distribution
          <span className="text-xs font-normal text-slate-400 ml-2">
            This month: {throughput.createdThisMonth} created / {throughput.completedThisMonth} completed
          </span>
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-2">
            {distribution.distribution.length === 0 ? (
              <p className="text-sm text-slate-500">No active tickets.</p>
            ) : (
              distribution.distribution.map((item) => {
                const maxCount = Math.max(...distribution.distribution.map((d) => d.count), 1)
                return (
                  <div key={item.status} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-36 truncate text-right">
                      {statusLabel(item.status)}
                    </span>
                    <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded transition-all"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-8 text-right tabular-nums">
                      {item.count}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
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
              className="px-3 py-1.5 rounded-md text-sm font-medium border bg-background text-foreground border-border hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Activity</h2>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : (
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="outline" className="text-xs shrink-0">
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
      </div>
    </div>
  )
}
