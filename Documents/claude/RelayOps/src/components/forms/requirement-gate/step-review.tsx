'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import type { WizardFormData } from './wizard-shell'

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

interface StepReviewProps {
  data: WizardFormData
  confirmed: boolean
  onConfirmedChange: (checked: boolean) => void
}

export function StepReview({ data, confirmed, onConfirmedChange }: StepReviewProps) {
  const { deliverables, scope, dataSource } = data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review &amp; Confirm</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your job submission carefully. Once submitted, the scope will be reviewed by an
          admin before it is locked.
        </p>
      </div>

      {/* Job details */}
      <div className="rounded-md border p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</p>
          <p className="text-sm mt-0.5 font-medium">{deliverables.title || '—'}</p>
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</p>
          <p className="text-sm mt-0.5">
            {deliverables.category ? CATEGORY_LABELS[deliverables.category] : '—'}
          </p>
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Problem Summary</p>
          <p className="text-sm mt-0.5 leading-relaxed text-muted-foreground">
            {scope.problemSummary || '—'}
          </p>
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expected Output</p>
          <p className="text-sm mt-0.5 leading-relaxed text-muted-foreground">
            {scope.expectedOutput || '—'}
          </p>
        </div>
      </div>

      {/* Acceptance criteria preview */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Acceptance Criteria
        </p>
        {deliverables.acceptanceCriteria.length > 0 ? (
          <ul className="space-y-1.5">
            {deliverables.acceptanceCriteria.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                {c.required ? (
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <span>{c.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-destructive">No acceptance criteria added.</p>
        )}
      </div>

      {/* Out of scope */}
      {scope.outOfScope.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Out of Scope
          </p>
          <div className="flex flex-wrap gap-1.5">
            {scope.outOfScope.map((item) => (
              <Badge key={item} variant="secondary" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Data estimates */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Data Details
        </p>
        <div className="flex flex-wrap gap-2">
          {dataSource.rowCountEstimate && (
            <Badge variant="outline" className="text-xs">
              ~{parseInt(dataSource.rowCountEstimate).toLocaleString()} rows
            </Badge>
          )}
          {dataSource.fileCountEstimate && (
            <Badge variant="outline" className="text-xs">
              {dataSource.fileCountEstimate} files
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-xs ${SENSITIVITY_COLORS[dataSource.sensitivity]}`}
          >
            {SENSITIVITY_LABELS[dataSource.sensitivity]}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Scope lock notice */}
      <div className="rounded-md bg-purple-50 border border-purple-200 px-4 py-3">
        <p className="text-sm font-medium text-purple-900">What happens after you submit?</p>
        <ol className="mt-2 space-y-1 text-xs text-purple-800 list-decimal list-inside">
          <li>An admin reviews your scope and may request clarifications.</li>
          <li>Once scope is agreed, it is locked — no changes without a new ticket.</li>
          <li>You will receive an invoice based on the scoped price.</li>
          <li>Work begins after payment is confirmed.</li>
        </ol>
      </div>

      {/* Confirmation checkbox */}
      <div className="flex items-start gap-3 rounded-md border p-4">
        <Checkbox
          id="confirmScope"
          checked={confirmed}
          onCheckedChange={(checked) => onConfirmedChange(Boolean(checked))}
          className="mt-0.5"
        />
        <Label htmlFor="confirmScope" className="text-sm font-normal cursor-pointer leading-relaxed">
          I confirm this scope is accurate and I agree to be invoiced based on the admin&apos;s
          scoped price once scope is locked.
        </Label>
      </div>
    </div>
  )
}
