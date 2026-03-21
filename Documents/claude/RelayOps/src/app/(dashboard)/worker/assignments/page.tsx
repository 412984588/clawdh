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

function assignmentBadgeClass(status: AssignmentWithTicket['status']) {
  switch (status) {
    case 'in_progress':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'acknowledged':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'pending':
      return 'border-slate-200 bg-slate-50 text-slate-700'
    case 'completed':
      return 'border-green-200 bg-green-50 text-green-700'
    case 'reassigned':
      return 'border-red-200 bg-red-50 text-red-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
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
      <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.94))] px-6 py-6 shadow-[0_34px_90px_-60px_rgba(15,23,42,0.45)] sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm">
              Work Queue
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              My Assignments
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              All tickets assigned to you, grouped by active work and completed history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              Active {active.length}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              Completed / Reassigned {done.length}
            </Badge>
          </div>
        </div>
      </section>

      {/* 活跃任务 */}
      <section className="rounded-[30px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.38)]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 py-8 text-center text-sm text-slate-500">
            No active assignments.
          </p>
        ) : (
          <AssignmentList rows={active} />
        )}
      </section>

      {/* 已完成 */}
      <section className="rounded-[30px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.38)]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Completed / Reassigned ({done.length})
        </h2>
        {done.length === 0 ? (
          <p className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 py-8 text-center text-sm text-slate-500">
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
    <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)]">
      {rows.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
        >
          <div className="min-w-0">
            <Link
              href={`/worker/assignments/${a.id}`}
              className="block truncate text-sm font-medium text-slate-900 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
            >
              {a.tickets?.title ?? `Ticket ${a.ticket_id.slice(0, 8)}`}
            </Link>
            <p className="mt-1 text-xs text-slate-500">
              Assigned {formatDate(a.assigned_at)}
              {a.tickets?.due_at ? ` · Due ${formatDate(a.tickets.due_at)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className={`rounded-full text-xs font-medium ${assignmentBadgeClass(a.status)}`}
            >
              {a.status}
            </Badge>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              <Link href={`/worker/assignments/${a.id}`}>View</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
