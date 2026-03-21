import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'
import type { TicketStatus } from '@/lib/types/enums'

export const metadata: Metadata = {
  title: 'Metrics — Admin — RelayOps',
}

function formatUSD(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatPct(value: number) {
  return `${Number(value).toFixed(1)}%`
}

function statusBadgeVariant(status: TicketStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (['completed', 'resolved'].includes(status)) return 'default'
  if (['cancelled', 'expired', 'admin_closed_no_response'].includes(status)) return 'destructive'
  return 'secondary'
}

async function getMetricsData() {
  const admin = createAdminClient()

  const [ledgerResult, ticketsResult, workerProfilesResult] = await Promise.all([
    admin
      .from('ledger_entries')
      .select('type, amount, status')
      .eq('type', 'invoice_payment')
      .eq('status', 'confirmed'),
    admin.from('tickets').select('status'),
    admin
      .from('worker_profiles')
      .select('nickname, on_time_rate, first_pass_rate, dispute_rate, approval_status')
      .eq('approval_status', 'approved')
      .order('nickname'),
  ])

  const confirmedPayments = ledgerResult.data ?? []
  const totalRevenue = confirmedPayments.reduce((sum, e) => sum + Number(e.amount), 0)
  const paymentCount = confirmedPayments.length

  const tickets = ticketsResult.data ?? []
  const byStatus = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})

  const workers = workerProfilesResult.data ?? []

  return { totalRevenue, paymentCount, byStatus, workers }
}

export default async function AdminMetricsPage() {
  const { totalRevenue, paymentCount, byStatus, workers } = await getMetricsData()

  const statusEntries = Object.entries(byStatus).sort(([, a], [, b]) => b - a)

  return (
    <div className="dashboard-page">
      <div>
        <h1 className="text-2xl font-bold">Metrics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Platform performance and financial summary
        </p>
      </div>

      {/* Revenue */}
      <section>
        <h2 className="text-base font-semibold mb-3">Revenue</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Confirmed Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatUSD(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {paymentCount} confirmed invoice payment{paymentCount !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Time to Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">—</p>
              <p className="text-xs text-muted-foreground mt-1">
                Detailed SLA tracking coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tickets by status */}
      <section>
        <h2 className="text-base font-semibold mb-3">Tickets by Status</h2>
        {statusEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tickets yet.</p>
        ) : (
          <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-2">
            {statusEntries.map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
              >
                <Badge
                  variant={statusBadgeVariant(status as TicketStatus)}
                  className="text-xs capitalize"
                >
                  {status.replace(/_/g, ' ')}
                </Badge>
                <span className="text-sm font-semibold text-slate-900 ml-2">{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Worker performance */}
      <section>
        <h2 className="text-base font-semibold mb-3">Worker Performance</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead className="text-right">On-Time Rate</TableHead>
                  <TableHead className="text-right">First Pass Rate</TableHead>
                  <TableHead className="text-right">Dispute Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No approved workers yet.
                    </TableCell>
                  </TableRow>
                )}
                {workers.map((worker) => (
                  <TableRow key={worker.nickname}>
                    <TableCell className="font-medium text-sm font-mono">
                      {worker.nickname}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {formatPct(worker.on_time_rate)}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {formatPct(worker.first_pass_rate)}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      <span
                        className={
                          Number(worker.dispute_rate) > 5
                            ? 'text-red-600 font-semibold'
                            : 'text-slate-700'
                        }
                      >
                        {formatPct(worker.dispute_rate)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
