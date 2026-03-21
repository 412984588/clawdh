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
        <p className="text-muted-foreground">Your account is not linked to an organization yet.</p>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {result.total} {result.total === 1 ? 'ticket' : 'tickets'} total
          </p>
        </div>
        <Button asChild>
          <Link href="/partner/tickets/new">
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Link>
        </Button>
      </div>

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
