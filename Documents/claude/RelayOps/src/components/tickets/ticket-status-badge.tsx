import { Badge } from '@/components/ui/badge'
import type { TicketStatus } from '@/lib/types/enums'
import { cn } from '@/lib/utils/cn'

interface TicketStatusBadgeProps {
  status: TicketStatus
  className?: string
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  needs_scope_review: 'Needs Scope Review',
  scope_locked: 'Scope Locked',
  invoiced: 'Invoiced',
  paid: 'Paid',
  queued: 'Queued',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  submitted_for_review: 'Submitted for Review',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  disputed: 'Disputed',
  completed: 'Completed',
  resolved: 'Resolved',
  expired: 'Expired',
  admin_closed_no_response: 'Closed — No Response',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<TicketStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  needs_scope_review: 'bg-blue-100 text-blue-700 border-blue-200',
  scope_locked: 'bg-blue-100 text-blue-700 border-blue-200',
  invoiced: 'bg-amber-100 text-amber-700 border-amber-200',
  paid: 'bg-amber-100 text-amber-700 border-amber-200',
  queued: 'bg-amber-100 text-amber-700 border-amber-200',
  assigned: 'bg-amber-100 text-amber-700 border-amber-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  submitted_for_review: 'bg-blue-100 text-blue-700 border-blue-200',
  revision_requested: 'bg-blue-100 text-blue-700 border-blue-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  disputed: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  expired: 'bg-gray-100 text-gray-500 border-gray-200',
  admin_closed_no_response: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', STATUS_COLORS[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
