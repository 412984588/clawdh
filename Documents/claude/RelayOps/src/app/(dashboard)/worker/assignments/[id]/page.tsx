import { redirect, notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { AssignmentDetail } from '@/components/worker/assignment-detail'
import { SubmissionUploadForm } from '@/components/worker/submission-upload-form'
import { CommentThread } from '@/components/tickets/comment-thread'
import type { Ticket, TicketAssignment } from '@/lib/types/database'
import { getWorkerContext } from '@/lib/worker-context'

export const metadata = {
  title: 'Assignment — Worker — RelayOps',
}

interface WorkerAssignmentPageProps {
  params: Promise<{ id: string }>
}

export default async function WorkerAssignmentPage({ params }: WorkerAssignmentPageProps) {
  const { id } = await params

  const worker = await getWorkerContext()
  if (!worker) redirect('/login')

  const admin = createAdminClient()

  // Fetch assignment and verify it belongs to the current worker
  const { data: assignmentData } = await admin
    .from('ticket_assignments')
    .select('*')
    .eq('id', id)
    .single()

  if (!assignmentData) notFound()

  // Verify the assignment belongs to this worker
  if (assignmentData.worker_id !== worker.workerProfileId) notFound()

  const assignment = assignmentData as TicketAssignment

  // Fetch the associated ticket
  const { data: ticketData } = await admin
    .from('tickets')
    .select('*')
    .eq('id', assignment.ticket_id)
    .single()

  if (!ticketData) notFound()

  const ticket = ticketData as Ticket

  return (
    <div className="dashboard-page-detail">
      <div>
        <h1 className="text-2xl font-bold">Assignment</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review details and submit your completed work.
        </p>
      </div>

      <AssignmentDetail ticket={ticket} assignment={assignment} />

      {assignment.status === 'in_progress' && (
        <SubmissionUploadForm ticketId={ticket.id} assignment={assignment} />
      )}

      {/* Comments */}
      <CommentThread ticketId={ticket.id} viewerRole="worker_internal" />
    </div>
  )
}
