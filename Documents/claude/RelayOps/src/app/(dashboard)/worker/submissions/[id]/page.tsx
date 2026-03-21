import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { AttachmentList } from '@/components/tickets/attachment-list'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Submission, Ticket } from '@/lib/types/database'
import type { SubmissionStatus } from '@/lib/types/enums'
import { format } from 'date-fns'
import { getWorkerContext } from '@/lib/worker-context'

export const metadata = {
  title: 'Submission — Worker — RelayOps',
}

interface WorkerSubmissionPageProps {
  params: Promise<{ id: string }>
}

function statusVariant(
  status: SubmissionStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'approved':
      return 'default'
    case 'submitted':
    case 'under_review':
      return 'secondary'
    case 'revision_requested':
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default async function WorkerSubmissionPage({ params }: WorkerSubmissionPageProps) {
  const { id } = await params

  const worker = await getWorkerContext()
  if (!worker) redirect('/login')

  const admin = createAdminClient()

  // Fetch submission and verify it belongs to this worker
  const { data: submissionData } = await admin
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (!submissionData) notFound()
  if (submissionData.worker_id !== worker.workerProfileId) notFound()

  const submission = submissionData as Submission

  // Fetch the associated ticket title
  const { data: ticketData } = await admin
    .from('tickets')
    .select('id, title')
    .eq('id', submission.ticket_id)
    .single()

  const ticket = ticketData as Pick<Ticket, 'id' | 'title'> | null

  return (
    <div className="dashboard-page-detail">
      <div>
        <h1 className="text-2xl font-bold">Submission</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {ticket ? ticket.title : submission.ticket_id}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Submission Details</CardTitle>
            <Badge variant={statusVariant(submission.status)}>
              {submission.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Submitted At
            </p>
            <p className="text-sm">
              {format(new Date(submission.submitted_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>

          {submission.delivery_summary && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Delivery Summary
              </p>
              <p className="text-sm whitespace-pre-wrap">{submission.delivery_summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AttachmentList ticketId={submission.ticket_id} />
    </div>
  )
}
