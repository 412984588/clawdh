import { loadTicketEvents } from '@/lib/loaders/ticket-details'
import { formatDateTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

const EVENT_LABELS: Record<string, string> = {
  status_changed: 'Status changed',
  comment_added: 'Comment added',
  attachment_uploaded: 'File uploaded',
  assignment_created: 'Assigned to worker',
  assignment_updated: 'Assignment updated',
  invoice_generated: 'Invoice generated',
  payment_confirmed: 'Payment confirmed',
  review_submitted: 'Review submitted',
  dispute_opened: 'Dispute opened',
  dispute_resolved: 'Dispute resolved',
}

const EVENT_COLORS: Record<string, string> = {
  status_changed: 'bg-blue-500',
  comment_added: 'bg-gray-400',
  attachment_uploaded: 'bg-green-500',
  assignment_created: 'bg-amber-500',
  invoice_generated: 'bg-yellow-500',
  payment_confirmed: 'bg-green-600',
  review_submitted: 'bg-blue-500',
  dispute_opened: 'bg-red-500',
  dispute_resolved: 'bg-green-500',
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  partner: 'Partner',
  worker_internal: 'Worker',
}

function formatEventDescription(eventType: string, payload: Record<string, unknown>): string {
  if (eventType === 'status_changed') {
    const from = payload.from as string
    const to = payload.to as string
    const fromLabel = from?.replace(/_/g, ' ')
    const toLabel = to?.replace(/_/g, ' ')
    return `Changed from "${fromLabel}" to "${toLabel}"`
  }
  return EVENT_LABELS[eventType] ?? eventType.replace(/_/g, ' ')
}

interface TicketTimelineProps {
  ticketId: string
}

// Server Component — fetches events directly
export async function TicketTimeline({ ticketId }: TicketTimelineProps) {
  const events = await loadTicketEvents(ticketId)

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No activity recorded yet.</p>
    )
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1
        const dotColor = EVENT_COLORS[event.event_type] ?? 'bg-gray-400'

        return (
          <li key={event.id} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', dotColor)} />
              {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
            </div>

            {/* Event content */}
            <div className={cn('pb-4', isLast && 'pb-0')}>
              <p className="text-sm font-medium leading-snug">
                {formatEventDescription(event.event_type, event.payload_json)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {event.actor_role ? ROLE_LABELS[event.actor_role] ?? event.actor_role : 'System'}
                {' · '}
                {formatDateTime(event.created_at)}
              </p>
              {typeof event.payload_json?.note === 'string' && event.payload_json.note && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  &ldquo;{event.payload_json.note}&rdquo;
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
