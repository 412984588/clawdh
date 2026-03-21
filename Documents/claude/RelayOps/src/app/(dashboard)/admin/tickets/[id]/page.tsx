import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/utils/get-session-user'
import { getTicket } from '@/lib/services/ticket.service'
import { ScopeLockCard } from '@/components/tickets/scope-lock-card'
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge'
import { TicketTimeline } from '@/components/tickets/ticket-timeline'
import { ScopeReviewPanel } from '@/components/admin/scope-review-panel'
import { AdminTransitionPanel } from './admin-transition-panel'
import { AdminAssignWorkerPanel } from '@/components/admin/admin-assign-worker-panel'
import { CommentThread } from '@/components/tickets/comment-thread'

interface AdminTicketDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminTicketDetailPage({ params }: AdminTicketDetailPageProps) {
  const { id } = await params

  const sessionUser = await requireRole('admin')
  if (!sessionUser) redirect('/login')

  // Admin client 绕过 RLS 查询任意 ticket
  const adminClient = createAdminClient()
  const { data: ticket, error } = await getTicket(adminClient, id)
  if (error || !ticket) notFound()

  // 为 queued 状态的工单预加载 worker 列表
  let workers: { id: string; nickname: string; primary_skill: string; approval_status: string }[] = []
  if (ticket.status === 'queued') {
    const { data } = await adminClient
      .from('worker_profiles')
      .select('id, nickname, primary_skill, approval_status')
      .eq('approval_status', 'approved')
    workers = data ?? []
  }

  return (
    <div className="dashboard-page-detail">
      {/* Back nav */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/tickets">
          <ArrowLeft className="w-4 h-4 mr-1" />
          All Tickets
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{ticket.title}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Ticket #{ticket.id.slice(0, 8)} · org {ticket.organization_id.slice(0, 8)}
          </p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Scope review panel — only shows when needs_scope_review */}
      <ScopeReviewPanel ticket={ticket} />

      {/* Scope lock card (full details) */}
      <ScopeLockCard ticket={ticket} />

      {/* Assign worker panel — only when queued */}
      {ticket.status === 'queued' && (
        <AdminAssignWorkerPanel ticketId={ticket.id} workers={workers} />
      )}

      {/* Admin general transition panel */}
      <AdminTransitionPanel ticket={ticket} />

      {/* Comments */}
      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={null}>
            <CommentThread ticketId={ticket.id} viewerRole="admin" />
          </Suspense>
        </CardContent>
      </Card>

      <Separator />

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading activity…
              </div>
            }
          >
            <TicketTimeline ticketId={ticket.id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
