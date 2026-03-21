import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Circle, Lock } from 'lucide-react'
import type { Ticket } from '@/lib/types/database'
import { TicketStatusBadge } from './ticket-status-badge'

const CATEGORY_LABELS: Record<string, string> = {
  data_cleanup_import_prep: 'Data Cleanup / Import Prep',
  data_normalization_report_prep: 'Data Normalization / Report Prep',
  crm_import_failure_diagnosis: 'CRM Import Failure Diagnosis',
}

const SENSITIVITY_LABELS: Record<string, string> = {
  standard: 'Standard',
  sensitive: 'Sensitive (PII)',
  highly_sensitive: 'Highly Sensitive (Financial/Legal)',
}

const SENSITIVITY_COLORS: Record<string, string> = {
  standard: 'bg-green-100 text-green-700',
  sensitive: 'bg-yellow-100 text-yellow-700',
  highly_sensitive: 'bg-red-100 text-red-700',
}

interface ScopeLockCardProps {
  ticket: Ticket
}

export function ScopeLockCard({ ticket }: ScopeLockCardProps) {
  const isLocked = ticket.status === 'scope_locked'

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-snug">{ticket.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isLocked && (
              <div className="flex items-center gap-1.5 text-blue-700 bg-blue-100 border border-blue-200 rounded-full px-2.5 py-1 text-xs font-semibold">
                <Lock className="w-3 h-3" />
                Scope Locked
              </div>
            )}
            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Problem summary */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Problem Summary
          </p>
          <p className="text-sm leading-relaxed">{ticket.problem_summary}</p>
        </div>

        <Separator />

        {/* Expected output */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Expected Output
          </p>
          <p className="text-sm leading-relaxed">{ticket.expected_output}</p>
        </div>

        <Separator />

        {/* Acceptance criteria */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Acceptance Criteria
          </p>
          <ul className="space-y-1.5">
            {ticket.acceptance_criteria_json.map((criterion) => (
              <li key={criterion.id} className="flex items-start gap-2 text-sm">
                {criterion.required ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <span className="leading-snug">
                  {criterion.description}
                  {criterion.required && (
                    <span className="ml-1 text-xs text-muted-foreground">(required)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Out of scope */}
        {ticket.out_of_scope_json.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Out of Scope
              </p>
              <ul className="space-y-1">
                {ticket.out_of_scope_json.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <Separator />

        {/* Estimates and sensitivity */}
        <div className="flex flex-wrap gap-2">
          {ticket.row_count_estimate && (
            <Badge variant="outline" className="text-xs">
              ~{ticket.row_count_estimate.toLocaleString()} rows
            </Badge>
          )}
          {ticket.file_count_estimate && (
            <Badge variant="outline" className="text-xs">
              {ticket.file_count_estimate} {ticket.file_count_estimate === 1 ? 'file' : 'files'}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-xs ${SENSITIVITY_COLORS[ticket.sensitivity_level]}`}
          >
            {SENSITIVITY_LABELS[ticket.sensitivity_level]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
