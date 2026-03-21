'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminTransitionTicket } from '@/lib/actions/ticket.actions'
import { VALID_TRANSITIONS } from '@/lib/state-machine/transitions'
import { canTransition } from '@/lib/state-machine/guards'
import type { Ticket } from '@/lib/types/database'
import type { TicketStatus } from '@/lib/types/enums'

const STATUS_LABELS: Partial<Record<TicketStatus, string>> = {
  submitted: 'Submitted',
  needs_scope_review: 'Move to Scope Review',
  scope_locked: 'Lock Scope',
  invoiced: 'Mark Invoiced',
  paid: 'Mark Paid',
  queued: 'Move to Queue',
  assigned: 'Assign',
  in_progress: 'Mark In Progress',
  submitted_for_review: 'Submit for Review',
  approved: 'Approve',
  revision_requested: 'Request Revision',
  completed: 'Mark Completed',
  resolved: 'Mark Resolved',
  cancelled: 'Cancel',
  expired: 'Mark Expired',
  admin_closed_no_response: 'Close — No Response',
  disputed: 'Open Dispute',
}

// 在 needs_scope_review 时由 ScopeReviewPanel 处理，这里跳过
const EXCLUDED_FROM_PANEL: TicketStatus[] = ['needs_scope_review', 'scope_locked', 'admin_closed_no_response']

interface AdminTransitionPanelProps {
  ticket: Ticket
}

export function AdminTransitionPanel({ ticket }: AdminTransitionPanelProps) {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validNext = VALID_TRANSITIONS[ticket.status].filter(
    (s) =>
      canTransition(ticket.status, s, 'admin') &&
      !EXCLUDED_FROM_PANEL.includes(s)
  )

  if (validNext.length === 0) return null

  async function handleTransition() {
    if (!selectedStatus) {
      setError('Please select a target status.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await adminTransitionTicket(ticket.id, selectedStatus as TicketStatus)
    setLoading(false)

    if (!result.success) {
      setError(typeof result.error === 'string' ? result.error : 'Transition failed.')
      return
    }

    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Admin Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Select
            value={selectedStatus}
            onValueChange={(v) => setSelectedStatus(v as TicketStatus)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select next status…" />
            </SelectTrigger>
            <SelectContent>
              {validNext.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status] ?? status.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleTransition}
            disabled={!selectedStatus || loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive mt-2" role="alert">{error}</p>}
      </CardContent>
    </Card>
  )
}
