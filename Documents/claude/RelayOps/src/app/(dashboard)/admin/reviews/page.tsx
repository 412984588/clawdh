import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/utils/get-session-user'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import type { Ticket } from '@/lib/types/database'

export const metadata = {
  title: 'Pending Reviews — Admin — RelayOps',
}

interface TicketWithOrg extends Ticket {
  organizations: { name: string } | null
  submissions: { submitted_at: string }[]
}

export default async function AdminReviewsPage() {
  const sessionUser = await requireRole('admin')
  if (!sessionUser) redirect('/login')

  const admin = createAdminClient()
  const { data: tickets } = await admin
    .from('tickets')
    .select(`
      *,
      organizations ( name ),
      submissions ( submitted_at )
    `)
    .eq('status', 'submitted_for_review')
    .order('updated_at', { ascending: true })

  const rows = (tickets ?? []) as TicketWithOrg[]

  return (
    <div className="dashboard-page">
      <div>
        <h1 className="text-2xl font-bold">Pending Reviews</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {rows.length} ticket{rows.length !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No tickets pending review.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((ticket) => {
                const latestSubmission = ticket.submissions[ticket.submissions.length - 1]
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {ticket.title}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">
                        {ticket.id.slice(0, 8)}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {ticket.organizations?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums whitespace-nowrap">
                      {latestSubmission
                        ? format(new Date(latestSubmission.submitted_at), 'MMM d, HH:mm')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.category.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Review →
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
