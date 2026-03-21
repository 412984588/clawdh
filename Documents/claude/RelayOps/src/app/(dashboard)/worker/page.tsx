import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import type { TicketAssignment } from '@/lib/types/database'
import { getWorkerContext } from '@/lib/worker-context'

export const metadata = {
  title: 'Dashboard — Worker — RelayOps',
}

export default async function WorkerDashboardPage() {
  const worker = await getWorkerContext()
  if (!worker) redirect('/login')

  const admin = createAdminClient()

  const { data: assignments } = await admin
    .from('ticket_assignments')
    .select('*, tickets ( title )')
    .eq('worker_id', worker.workerProfileId)
    .order('created_at', { ascending: false })
    .limit(20)

  const rows = (assignments ?? []) as (TicketAssignment & { tickets: { title: string } | null })[]

  return (
    <div className="dashboard-page-narrow">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Worker Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Your active assignments.</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No assignments yet.</p>
      ) : (
        <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
          {rows.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <Link
                href={`/worker/assignments/${a.id}`}
                className="font-medium text-slate-800 hover:underline truncate"
              >
                {a.tickets?.title ?? `Ticket ${a.ticket_id.slice(0, 8)}`}
              </Link>
              <Badge variant="outline" className="ml-4 shrink-0">
                {a.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
