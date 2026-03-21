import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createServerClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/utils/get-session-user'
import { listTickets } from '@/lib/services/ticket.service'
import { TicketListTable } from '@/components/tickets/ticket-list-table'
import { PaginationNav } from '@/components/ui/pagination-nav'

export const metadata = {
  title: 'My Jobs — RelayOps',
}

interface PartnerTicketsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PartnerTicketsPage({ searchParams }: PartnerTicketsPageProps) {
  const sessionUser = await requireRole('partner')
  if (!sessionUser) redirect('/login')

  if (!sessionUser.organization_id) {
    return (
      <div className="dashboard-page-narrow">
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center text-sm text-slate-500">
          Your account is not linked to an organization yet.
        </div>
      </div>
    )
  }

  const { page: rawPage } = await searchParams
  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1)

  // RLS-scoped client: partner 只能看到自己组织的 ticket
  const supabase = await createServerClient()
  const result = await listTickets(supabase, {
    organizationId: sessionUser.organization_id,
    page,
  })

  function pageHref(p: number) {
    return p > 1 ? `?page=${p}` : '?'
  }

  return (
    <div className="dashboard-page">
      <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.94))] px-6 py-6 shadow-[0_34px_90px_-60px_rgba(15,23,42,0.45)] sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm">
              Job Queue
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              My Jobs
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {result.total} {result.total === 1 ? 'ticket' : 'tickets'} total
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
              {result.page}/{Math.max(result.totalPages, 1)} pages
            </div>
            <Button asChild className="rounded-full shadow-sm">
              <Link href="/partner/tickets/new">
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <TicketListTable
        tickets={result.data}
        basePath="/partner/tickets"
        emptyMessage="You haven't submitted any jobs yet."
      />

      <PaginationNav
        page={result.page}
        totalPages={result.totalPages}
        buildHref={pageHref}
      />
    </div>
  )
}
