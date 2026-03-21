import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/utils/get-session-user'
import { listTickets } from '@/lib/services/ticket.service'
import { TicketListTable } from '@/components/tickets/ticket-list-table'
import { TicketStatusFilter } from './ticket-status-filter'
import { PaginationNav } from '@/components/ui/pagination-nav'
import type { Metadata } from 'next'
import type { TicketStatus } from '@/lib/types/enums'

export const metadata: Metadata = {
  title: 'All Tickets — Admin — RelayOps',
}

interface AdminTicketsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminTicketsPage({ searchParams }: AdminTicketsPageProps) {
  // Layout guarantees admin role; requireRole shares cache to avoid extra DB call
  const sessionUser = await requireRole('admin')
  if (!sessionUser) redirect('/login')

  const { status: rawStatus, page: rawPage } = await searchParams
  const statusFilter = rawStatus as TicketStatus | undefined
  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1)

  const admin = createAdminClient()
  const result = await listTickets(admin, {
    status: statusFilter,
    page,
  })

  // 构建分页链接的查询字符串
  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `?${qs}` : '?'
  }

  return (
    <div className="dashboard-page">
      <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.94))] px-6 py-6 shadow-[0_34px_90px_-60px_rgba(15,23,42,0.45)] sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm">
              Ticket Queue
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              All Tickets
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {result.total} {result.total === 1 ? 'ticket' : 'tickets'}
              {statusFilter ? ` filtered by "${statusFilter}"` : ' across all statuses'}
            </p>
          </div>

          <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
            {result.total} {result.total === 1 ? 'ticket' : 'tickets'}
          </div>
        </div>
      </section>

      <TicketStatusFilter currentStatus={statusFilter} />

      <TicketListTable
        tickets={result.data}
        basePath="/admin/tickets"
        emptyMessage="No tickets match the current filter."
      />

      <PaginationNav
        page={result.page}
        totalPages={result.totalPages}
        buildHref={pageHref}
      />
    </div>
  )
}
