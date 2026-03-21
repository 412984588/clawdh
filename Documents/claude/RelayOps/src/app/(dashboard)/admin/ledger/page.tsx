import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/utils/get-session-user'
import { getAllLedgerEntries } from '@/lib/services/ledger.service'
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
import { PaginationNav } from '@/components/ui/pagination-nav'
import type { Metadata } from 'next'
import type { LedgerType, LedgerStatus } from '@/lib/types/enums'
import { format } from 'date-fns'
import { logger } from '@/lib/utils/logger'

export const metadata: Metadata = {
  title: 'Ledger — Admin — RelayOps',
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function ledgerTypeBadgeVariant(type: LedgerType) {
  switch (type) {
    case 'invoice_payment':
      return 'default'
    case 'worker_payout':
      return 'secondary'
    case 'refund':
      return 'destructive'
    case 'credit':
    case 'adjustment':
      return 'outline'
    default:
      return 'outline'
  }
}

function statusBadgeVariant(status: LedgerStatus) {
  switch (status) {
    case 'confirmed':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'failed':
    case 'reversed':
      return 'destructive'
    default:
      return 'outline'
  }
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)
}

// ─── filter helper ──────────────────────────────────────────────────────────

type TypeFilter = LedgerType | 'all'

const VALID_TYPES = new Set(['invoice_payment', 'worker_payout', 'refund', 'credit', 'adjustment'])

interface AdminLedgerPageProps {
  searchParams: Promise<{ type?: string; page?: string }>
}

export default async function AdminLedgerPage({ searchParams }: AdminLedgerPageProps) {
  const sessionUser = await requireRole('admin')
  if (!sessionUser) redirect('/login')

  const { type: rawType, page: rawPage } = await searchParams
  const typeFilter: TypeFilter = VALID_TYPES.has(rawType ?? '') ? (rawType as LedgerType) : 'all'
  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1)

  const admin = createAdminClient()

  // 分页查询（含服务端 type 过滤）
  const result = await getAllLedgerEntries(
    admin,
    { page },
    typeFilter !== 'all' ? { type: typeFilter } : undefined
  )

  if (result.error) {
    logger.error('Failed to load admin ledger entries', {
      context: 'admin-ledger',
      error: result.error,
    })
  }

  // Revenue summary 需要全量统计 — 用单独查询获取确认收入总额
  const { data: revenueRows } = await admin
    .from('ledger_entries')
    .select('amount')
    .eq('type', 'invoice_payment')
    .eq('status', 'confirmed')
  const totalRevenue = (revenueRows ?? []).reduce((sum, r) => sum + (r as { amount: number }).amount, 0)
  const confirmedCount = revenueRows?.length ?? 0

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `?${qs}` : '?'
  }

  const filterLinks: { label: string; value: TypeFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Payments', value: 'invoice_payment' },
    { label: 'Refunds', value: 'refund' },
    { label: 'Worker Payouts', value: 'worker_payout' },
  ]

  return (
    <div className="dashboard-page">
      <div>
        <h1 className="text-2xl font-bold">Ledger</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Financial activity across all organizations
        </p>
      </div>

      {/* Revenue summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Confirmed Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatAmount(totalRevenue, 'USD')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {confirmedCount} confirmed payments
          </p>
        </CardContent>
      </Card>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {filterLinks.map(({ label, value }) => (
          <Link
            key={value}
            href={value === 'all' ? '/admin/ledger' : `/admin/ledger?type=${value}`}
            className={[
              'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
              typeFilter === value
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-border hover:bg-muted',
            ].join(' ')}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Entries table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No ledger entries found.
                  </TableCell>
                </TableRow>
              )}
              {result.data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm tabular-nums whitespace-nowrap">
                    {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ledgerTypeBadgeVariant(entry.type) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                      {entry.type.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums font-medium">
                    {formatAmount(entry.amount, entry.currency)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground uppercase">
                    {entry.currency}
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.ticket_id ? (
                      <Link
                        href={`/admin/tickets/${entry.ticket_id}`}
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {entry.ticket_id.slice(0, 8)}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {entry.organization_id ? entry.organization_id.slice(0, 8) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(entry.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaginationNav
        page={result.page}
        totalPages={result.totalPages}
        buildHref={pageHref}
      />
    </div>
  )
}
