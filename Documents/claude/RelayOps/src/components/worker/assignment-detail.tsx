import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AcceptanceCriteriaChecklist } from '@/components/tickets/acceptance-criteria-checklist'
import type { Ticket, TicketAssignment } from '@/lib/types/database'
import { format } from 'date-fns'
import { AssignmentActionButtons } from './assignment-action-buttons'

interface AssignmentDetailProps {
  ticket: Ticket
  assignment: TicketAssignment
}

function sensitivityVariant(
  level: string
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (level) {
    case 'highly_sensitive':
      return 'destructive'
    case 'sensitive':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function AssignmentDetail({ ticket, assignment }: AssignmentDetailProps) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">{ticket.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Ticket #{ticket.id.slice(0, 8)}
              </p>
            </div>
            <Badge variant={sensitivityVariant(ticket.sensitivity_level)} className="shrink-0">
              {ticket.sensitivity_level.replace(/_/g, ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Problem Summary
            </p>
            <p className="text-sm">{ticket.problem_summary}</p>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Expected Output
            </p>
            <p className="text-sm">{ticket.expected_output}</p>
          </div>

          {ticket.out_of_scope_json.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Out of Scope
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {ticket.out_of_scope_json.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Separator />

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Acceptance Criteria
            </p>
            <AcceptanceCriteriaChecklist criteria={ticket.acceptance_criteria_json} readOnly />
          </div>

          {ticket.due_at && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  SLA Due
                </p>
                <p className="text-sm font-medium">
                  {format(new Date(ticket.due_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AssignmentActionButtons
        ticketId={ticket.id}
        assignment={assignment}
      />
    </div>
  )
}
