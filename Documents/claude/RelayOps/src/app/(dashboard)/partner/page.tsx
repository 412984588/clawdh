import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/utils/get-session-user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Ticket } from '@/lib/types/database'
import type { TicketStatus } from '@/lib/types/enums'
import { format } from 'date-fns'
import { ACTIVE_STATUSES, COMPLETED_STATUSES } from '@/lib/constants/ticket-statuses'

export const metadata = {
  title: 'Dashboard — RelayOps',
}

function statusBadgeVariant(
  status: TicketStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (COMPLETED_STATUSES.includes(status)) return 'default'
  if (['cancelled', 'expired', 'admin_closed_no_response'].includes(status)) return 'destructive'
  if (status === 'disputed') return 'destructive'
  if (status === 'submitted_for_review') return 'secondary'
  return 'outline'
}

export default async function PartnerDashboardPage() {
  const sessionUser = await requireRole('partner')
  if (!sessionUser) redirect('/login')

  if (!sessionUser.organization_id) {
    return (
      <div className="dashboard-page-narrow">
        <p className="text-muted-foreground">
          Your account is not linked to an organization yet. Please contact support.
        </p>
      </div>
    )
  }

  const orgId = sessionUser.organization_id
  const admin = createAdminClient()

  // 拉最近 10 条用于列表展示
  const { data: ticketsData } = await admin
    .from('tickets')
    .select('id, title, status, category, created_at, updated_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(10)

  const tickets = (ticketsData ?? []) as Pick<
    Ticket,
    'id' | 'title' | 'status' | 'category' | 'created_at' | 'updated_at'
  >[]

  // Quick stats — 独立 count 查询，确保数字准确，不受 limit(10) 影响
  const [totalRes, activeRes, completedRes] = await Promise.all([
    admin
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    admin
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .in('status', ACTIVE_STATUSES),
    admin
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .in('status', COMPLETED_STATUSES),
  ])

  const totalTickets = totalRes.count ?? 0
  const activeTickets = activeRes.count ?? 0
  const completedTickets = completedRes.count ?? 0

  const hasActiveTickets = activeTickets > 0

  return (
    <div className="dashboard-page">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your recent jobs and account summary
          </p>
        </div>
        <Button asChild>
          <Link href="/partner/tickets/new">
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-t-2 border-blue-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{totalTickets}</p>
          </CardContent>
        </Card>
        <Card className="border-t-2 border-blue-400">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{activeTickets}</p>
          </CardContent>
        </Card>
        <Card className="border-t-2 border-green-500">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-slate-900">{completedTickets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Recent Jobs</h2>
          <Link
            href="/partner/tickets"
            className="text-sm text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-sm mb-4">
                You haven&apos;t submitted any jobs yet.
              </p>
              <Button asChild variant="outline">
                <Link href="/partner/tickets/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit your first job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/partner/tickets/${ticket.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.category.replace(/_/g, ' ')} ·{' '}
                    {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={statusBadgeVariant(ticket.status)}
                  className="ml-4 shrink-0 capitalize text-xs"
                >
                  {ticket.status.replace(/_/g, ' ')}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* CTA when no active tickets */}
        {!hasActiveTickets && tickets.length > 0 && (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-5 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              No active jobs right now.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/partner/tickets/new">
                <Plus className="w-4 h-4 mr-2" />
                Submit a new job
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
