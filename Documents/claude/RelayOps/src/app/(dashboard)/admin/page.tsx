import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ticket, Clock, AlertCircle, Scale } from 'lucide-react'
import { format } from 'date-fns'
import type { TicketEvent } from '@/lib/types/database'
import { ACTIVE_STATUSES } from '@/lib/constants/ticket-statuses'

export const metadata = {
  title: 'Dashboard — Admin — RelayOps',
}

interface TicketEventWithTicket extends TicketEvent {
  tickets: { title: string } | null
}

async function getAdminMetrics() {
  const admin = createAdminClient()

  // 三个独立 count-only 查询 + 纠纷数 + 最近事件，全部并行
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

  const totalTickets = totalRes.count ?? 0
  const activeTickets = activeRes.count ?? 0
  const awaitingReview = awaitingRes.count ?? 0
  const openDisputes = disputesResult.count ?? 0
  const recentEvents = (recentEventsResult.data ?? []) as TicketEventWithTicket[]

  return { totalTickets, activeTickets, awaitingReview, openDisputes, recentEvents }
}

export default async function AdminDashboardPage() {
  const { totalTickets, activeTickets, awaitingReview, openDisputes, recentEvents } =
    await getAdminMetrics()

  const metricCards = [
    {
      title: 'Total Tickets',
      value: totalTickets,
      sub: 'All time',
      icon: Ticket,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Tickets',
      value: activeTickets,
      sub: 'Not in terminal state',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Awaiting Review',
      value: awaitingReview,
      sub: 'submitted_for_review',
      icon: AlertCircle,
      color: awaitingReview > 0 ? 'text-amber-600' : 'text-slate-500',
      bg: awaitingReview > 0 ? 'bg-amber-50' : 'bg-slate-50',
    },
    {
      title: 'Open Disputes',
      value: openDisputes,
      sub: 'Open or under review',
      icon: Scale,
      color: openDisputes > 0 ? 'text-red-600' : 'text-slate-500',
      bg: openDisputes > 0 ? 'bg-red-50' : 'bg-slate-50',
    },
  ]

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
                <CardTitle className="text-sm font-medium text-slate-500">
                  {card.title}
                </CardTitle>
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

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/tickets"
            className="px-3 py-1.5 rounded-md text-sm font-medium border bg-background text-foreground border-border hover:bg-muted transition-colors"
          >
            View all tickets
          </Link>
          <Link
            href="/admin/tickets?status=assigned"
            className="px-3 py-1.5 rounded-md text-sm font-medium border bg-background text-foreground border-border hover:bg-muted transition-colors"
          >
            View assignments
          </Link>
          <Link
            href="/admin/disputes"
            className="px-3 py-1.5 rounded-md text-sm font-medium border bg-background text-foreground border-border hover:bg-muted transition-colors"
          >
            View disputes
          </Link>
          <Link
            href="/admin/metrics"
            className="px-3 py-1.5 rounded-md text-sm font-medium border bg-background text-foreground border-border hover:bg-muted transition-colors"
          >
            Metrics &amp; revenue
          </Link>
          <Link
            href="/admin/payout-batches"
            className="px-3 py-1.5 rounded-md text-sm font-medium border bg-background text-foreground border-border hover:bg-muted transition-colors"
          >
            Payout batches
          </Link>
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
              <div
                key={event.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
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
