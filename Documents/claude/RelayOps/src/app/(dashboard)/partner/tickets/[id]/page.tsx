import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createServerClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/utils/get-session-user'
import { getTicket } from '@/lib/services/ticket.service'
import { ScopeLockCard } from '@/components/tickets/scope-lock-card'
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge'
import { TicketTimeline } from '@/components/tickets/ticket-timeline'
import { PartnerReviewActions } from './partner-review-actions'
import { PartnerDisputeActions } from './partner-dispute-actions'
import { CommentThread } from '@/components/tickets/comment-thread'
import { AttachmentList } from '@/components/tickets/attachment-list'

interface PartnerTicketDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PartnerTicketDetailPage({ params }: PartnerTicketDetailPageProps) {
  const { id } = await params

  const sessionUser = await requireRole('partner')
  if (!sessionUser) redirect('/login')

  // 使用 server client（遵守 RLS — partner 只能看到自己组织的 ticket）
  const supabase = await createServerClient()
  const { data: ticket, error } = await getTicket(supabase, id)

  if (error || !ticket) notFound()

  const canReview = ticket.status === 'submitted_for_review'
  const canDispute = ticket.status === 'approved'

  return (
    <div className="dashboard-page-detail">
      {/* Back navigation */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/partner/tickets">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Jobs
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{ticket.title}</h1>
          <p className="text-xs text-muted-foreground mt-1">Ticket #{ticket.id.slice(0, 8)}</p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Scope lock card */}
      <ScopeLockCard ticket={ticket} />

      {/* Partner review actions (visible when submitted_for_review) */}
      {canReview && (
        <PartnerReviewActions ticketId={ticket.id} />
      )}

      {/* Partner dispute actions (visible when approved) */}
      {canDispute && (
        <PartnerDisputeActions ticketId={ticket.id} />
      )}

      {/* Attachments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <AttachmentList ticketId={ticket.id} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={null}>
            <CommentThread ticketId={ticket.id} viewerRole="partner" />
          </Suspense>
        </CardContent>
      </Card>

      <Separator />

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Activity</CardTitle>
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
