import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/utils/get-session-user'
import { getLedgerEntriesForOrg } from '@/lib/services/ledger.service'
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
import type { LedgerEntry, Ticket } from '@/lib/types/database'
import { format } from 'date-fns'
import { logger } from '@/lib/utils/logger'

export const metadata = {
  title: 'Billing — RelayOps',
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)
}

// Only show payment/refund entries to partners (not internal adjustments or worker payouts)
const PARTNER_VISIBLE_TYPES = new Set(['invoice_payment', 'refund'])

function filterPartnerEntries(entries: LedgerEntry[]) {
  return entries.filter((e) => PARTNER_VISIBLE_TYPES.has(e.type))
}

// ─── page ─────────────────────────────────────────────────────────────────────

interface PartnerBillingPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PartnerBillingPage({ searchParams }: PartnerBillingPageProps) {
  const sessionUser = await requireRole('partner')
  if (!sessionUser) redirect('/login')

  if (!sessionUser.organization_id) {
    return (
      <div className="dashboard-page-narrow">
        <p className="text-muted-foreground">
          Your account is not linked to an organization yet.
        </p>
      </div>
    )
  }

  const { page: rawPage } = await searchParams
  const page = Math.max(1, parseInt(rawPage ?? '1', 10) || 1)

  const orgId = sessionUser.organization_id
  const admin = createAdminClient()

  // Fetch ledger entries + outstanding invoiced tickets in parallel
  const [ledgerResult, { data: invoicedTickets }] = await Promise.all([
    getLedgerEntriesForOrg(admin, orgId, { page }),
    admin
      .from('tickets')
      .select('id, title, invoice_url, stripe_invoice_id, status, updated_at')
      .eq('organization_id', orgId)
      .eq('status', 'invoiced')
      .order('updated_at', { ascending: false }),
  ])

  if (ledgerResult.error) {
    logger.error('Failed to load partner ledger entries', {
      context: 'partner-billing',
      organizationId: orgId,
      error: ledgerResult.error,
    })
  }

  const entries = filterPartnerEntries(ledgerResult.data)
  const outstanding = (invoicedTickets ?? []) as Pick<
    Ticket,
    'id' | 'title' | 'invoice_url' | 'stripe_invoice_id' | 'status' | 'updated_at'
  >[]

  return (
    <div className="dashboard-page">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Invoices, payments, and refunds for your organization
        </p>
      </div>

      {/* Outstanding invoices */}
      {outstanding.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">Outstanding Invoices</h2>
          <div className="space-y-2">
            {outstanding.map((ticket) => (
              <Card key={ticket.id} className="border-amber-200 bg-amber-50/40">
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div>
                    <p className="font-medium text-sm">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ticket #{ticket.id.slice(0, 8)} ·{' '}
                      {format(new Date(ticket.updated_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {ticket.invoice_url ? (
                    <a
                      href={ticket.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Pay Invoice
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Badge variant="outline">Awaiting URL</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Payment history */}
      <section>
        <h2 className="text-base font-semibold mb-3">Payment History</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No payment history yet.
                    </TableCell>
                  </TableRow>
                )}
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm tabular-nums whitespace-nowrap">
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.ticket_id ? (
                        <Link
                          href={`/partner/tickets/${entry.ticket_id}`}
                          className="font-mono text-xs text-blue-600 hover:underline"
                        >
                          {entry.ticket_id.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.type === 'refund' ? 'destructive' : 'secondary'}
                      >
                        {entry.type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums font-medium">
                      {formatAmount(entry.amount, entry.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === 'confirmed'
                            ? 'default'
                            : entry.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <PaginationNav
        page={ledgerResult.page}
        totalPages={ledgerResult.totalPages}
        buildHref={(p) => p > 1 ? `?page=${p}` : '?'}
      />
    </div>
  )
}
