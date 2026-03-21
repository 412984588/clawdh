import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TicketAssignment } from '@/lib/types/database'
import { getWorkerContext } from '@/lib/worker-context'
import { formatDate } from '@/lib/utils/format'

export const metadata = {
  title: 'Assignments — Worker — RelayOps',
}

type AssignmentWithTicket = TicketAssignment & {
  tickets: { title: string; status: string; due_at: string | null } | null
}

export default async function WorkerAssignmentsPage() {
  const worker = await getWorkerContext()
  if (!worker) redirect('/login')

  const admin = createAdminClient()

  const { data: assignments } = await admin
    .from('ticket_assignments')
    .select('*, tickets ( title, status, due_at )')
    .eq('worker_id', worker.workerProfileId)
    .order('assigned_at', { ascending: false })

  const rows = (assignments ?? []) as AssignmentWithTicket[]

  // 按 active（pending/acknowledged/in_progress）和 done（completed/reassigned）分组
  const active = rows.filter(
    (a) => a.status === 'pending' || a.status === 'acknowledged' || a.status === 'in_progress'
  )
  const done = rows.filter((a) => a.status === 'completed' || a.status === 'reassigned')

  return (
    <div className="dashboard-page-narrow">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>
        <p className="text-sm text-slate-500 mt-1">
          All tickets assigned to you — active and completed.
        </p>
      </div>

      {/* 活跃任务 */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">
            No active assignments.
          </p>
        ) : (
          <AssignmentList rows={active} />
        )}
      </section>

      {/* 已完成 */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Completed / Reassigned ({done.length})
        </h2>
        {done.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">
            No completed assignments yet.
          </p>
        ) : (
          <AssignmentList rows={done} />
        )}
      </section>
    </div>
  )
}

function AssignmentList({ rows }: { rows: AssignmentWithTicket[] }) {
  return (
    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
      {rows.map((a) => (
        <div key={a.id} className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="min-w-0">
            <Link
              href={`/worker/assignments/${a.id}`}
              className="text-sm font-medium text-slate-800 hover:underline truncate block"
            >
              {a.tickets?.title ?? `Ticket ${a.ticket_id.slice(0, 8)}`}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned {formatDate(a.assigned_at)}
              {a.tickets?.due_at ? ` · Due ${formatDate(a.tickets.due_at)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs">
              {a.status}
            </Badge>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/worker/assignments/${a.id}`}>View</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
