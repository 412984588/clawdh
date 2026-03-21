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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Tickets</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {result.total} {result.total === 1 ? 'ticket' : 'tickets'}
            {statusFilter ? ` · filtered by "${statusFilter}"` : ''}
          </p>
        </div>
      </div>

      <TicketStatusFilter currentStatus={statusFilter} />

      <div className="mt-4">
        <TicketListTable
          tickets={result.data}
          basePath="/admin/tickets"
          emptyMessage="No tickets match the current filter."
        />
      </div>

      <PaginationNav
        page={result.page}
        totalPages={result.totalPages}
        buildHref={pageHref}
      />
    </div>
  )
}
