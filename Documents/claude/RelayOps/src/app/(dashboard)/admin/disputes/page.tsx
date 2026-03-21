import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/utils/get-session-user'
import { DisputeResolutionPanel } from '@/components/admin/dispute-resolution-panel'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'
import type { Dispute } from '@/lib/types/database'
import type { DisputeStatus } from '@/lib/types/enums'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'Open Disputes — Admin — RelayOps',
}

interface DisputeWithTicket extends Dispute {
  tickets: { title: string } | null
}

function disputeStatusVariant(
  status: DisputeStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'open':
      return 'destructive'
    case 'under_review':
      return 'secondary'
    default:
      return 'outline'
  }
}

export default async function AdminDisputesPage() {
  const sessionUser = await requireRole('admin')
  if (!sessionUser) redirect('/login')

  const admin = createAdminClient()
  const { data: disputes } = await admin
    .from('disputes')
    .select(`
      *,
      tickets ( title )
    `)
    .in('status', ['open', 'under_review'])
    .order('created_at', { ascending: true })

  const rows = (disputes ?? []) as DisputeWithTicket[]

  return (
    <div className="dashboard-page-narrow">
      <div>
        <h1 className="text-2xl font-bold">Open Disputes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {rows.length} dispute{rows.length !== 1 ? 's' : ''} requiring resolution
        </p>
      </div>

      {rows.length === 0 && (
        <p className="text-muted-foreground text-sm">No open disputes.</p>
      )}

      <div className="space-y-4">
        {rows.map((dispute) => (
          <Card key={dispute.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    {dispute.tickets?.title ?? `Ticket ${dispute.ticket_id.slice(0, 8)}`}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Raised {format(new Date(dispute.created_at), 'MMM d, yyyy')} ·{' '}
                    <span className="capitalize">{dispute.raised_by_role.replace('_', ' ')}</span>
                  </p>
                </div>
                <Badge variant={disputeStatusVariant(dispute.status as DisputeStatus)}>
                  {dispute.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <DisputeResolutionPanel
                dispute={dispute}
                ticketId={dispute.ticket_id}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
