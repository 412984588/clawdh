import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react'
import type { TicketAssignment } from '@/lib/types/database'
import { getWorkerContext } from '@/lib/worker-context'
import { getKycStatus, type KycStatus } from '@/lib/services/kyc.service'

export const metadata = {
  title: 'Dashboard — Worker — RelayOps',
}

function KycStatusCard({ status, rejectionReason }: { status: KycStatus; rejectionReason: string | null }) {
  if (status === 'verified') {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">KYC Verified</p>
            <p className="text-sm text-green-700">You are eligible to receive ticket assignments.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === 'rejected') {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">KYC Rejected</p>
              <p className="text-sm text-red-700">Your KYC verification was not approved.</p>
            </div>
          </div>
          {rejectionReason && (
            <div className="ml-8 p-3 bg-red-100 rounded text-sm text-red-800">
              <span className="font-medium">Reason:</span> {rejectionReason}
            </div>
          )}
          <div className="ml-8 mt-3">
            <Button size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-1" />
              Resubmit Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">KYC Pending</p>
            <p className="text-sm text-yellow-700">Please submit your KYC documents to receive assignments.</p>
          </div>
        </div>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-1" />
          Submit KYC
        </Button>
      </CardContent>
    </Card>
  )
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

  const kycResult = await getKycStatus(admin, worker.workerProfileId)
  const kycStatus = kycResult.data?.status ?? 'pending'
  const rejectionReason = kycResult.data?.rejectionReason ?? null

  return (
    <div className="dashboard-page-narrow">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Worker Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Your active assignments.</p>
      </div>

      <KycStatusCard status={kycStatus} rejectionReason={rejectionReason} />

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
