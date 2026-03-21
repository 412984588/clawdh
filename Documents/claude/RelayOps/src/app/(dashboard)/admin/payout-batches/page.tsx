import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createPayoutBatchAction } from './actions'
import type { PayoutBatch } from '@/lib/types/database'
import type { PayoutBatchStatus } from '@/lib/types/enums'
import { format } from 'date-fns'

export const metadata = {
  title: 'Payout Batches — Admin — RelayOps',
}

function formatUSD(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function batchStatusVariant(
  status: PayoutBatchStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'processing':
      return 'secondary'
    case 'failed':
      return 'destructive'
    default:
      return 'outline'
  }
}

async function getPayoutData() {
  const admin = createAdminClient()

  const [batchesResult, unpaidResult] = await Promise.all([
    admin
      .from('payout_batches')
      .select('*')
      .order('created_at', { ascending: false }),
    admin
      .from('ledger_entries')
      .select('amount')
      .eq('type', 'worker_payout')
      .eq('status', 'pending'),
  ])

  const batches = (batchesResult.data ?? []) as PayoutBatch[]
  const unpaidTotal = (unpaidResult.data ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  )
  const unpaidCount = (unpaidResult.data ?? []).length

  return { batches, unpaidTotal, unpaidCount }
}

export default async function AdminPayoutBatchesPage() {
  const { batches, unpaidTotal, unpaidCount } = await getPayoutData()

  return (
    <div className="dashboard-page">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payout Batches</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage worker payout disbursements
          </p>
        </div>

        {/* Create new batch button — uses server action via form */}
        <form action={createPayoutBatchAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Create New Batch
          </button>
        </form>
      </div>

      {/* Unpaid totals summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Unpaid Worker Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatUSD(unpaidTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {unpaidCount} pending payout entr{unpaidCount !== 1 ? 'ies' : 'y'}
          </p>
        </CardContent>
      </Card>

      {/* Batches table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Export File</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No payout batches yet. Click &quot;Create New Batch&quot; to get started.
                  </TableCell>
                </TableRow>
              )}
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="text-sm tabular-nums">
                    {format(new Date(batch.period_start), 'MMM d')} –{' '}
                    {format(new Date(batch.period_end), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={batchStatusVariant(
                        batch.status as PayoutBatchStatus
                      )}
                    >
                      {batch.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatUSD(Number(batch.total_amount))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {batch.export_file_path ? (
                      <span className="font-mono text-xs">{batch.export_file_path}</span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums whitespace-nowrap">
                    {format(new Date(batch.created_at), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
