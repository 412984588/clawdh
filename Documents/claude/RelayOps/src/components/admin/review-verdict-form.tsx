'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { submitReviewAction } from '@/lib/actions/admin.actions'
import { toast } from '@/hooks/use-toast'
import type { Ticket, AcceptanceCriterion } from '@/lib/types/database'

interface ReviewVerdictFormProps {
  ticket: Ticket
}

export function ReviewVerdictForm({ ticket }: ReviewVerdictFormProps) {
  const [decision, setDecision] = useState<'approved' | 'revision_requested' | null>(null)
  const [failedCriteriaIds, setFailedCriteriaIds] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (ticket.status !== 'submitted_for_review') return null

  const criteria: AcceptanceCriterion[] = ticket.acceptance_criteria_json ?? []

  function toggleCriterion(id: string) {
    setFailedCriteriaIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleSubmit() {
    if (!decision) {
      setError('Please select a verdict.')
      return
    }
    if (decision === 'revision_requested' && failedCriteriaIds.size === 0) {
      setError('Select at least one failed criterion when requesting revision.')
      return
    }

    setLoading(true)
    setError(null)

    const failedDescriptions = criteria
      .filter((c) => failedCriteriaIds.has(c.id))
      .map((c) => c.description)

    const result = await submitReviewAction({
      ticketId: ticket.id,
      decision,
      acceptanceFailures: failedDescriptions,
      notes: notes || undefined,
    })

    setLoading(false)

    if (!result.success) {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : Object.values(result.error ?? {}).flat().join(', ') || 'Review submission failed.'
      setError(msg)
      toast({ title: 'Review submission failed', description: msg, variant: 'destructive' })
      return
    }

    toast({ title: 'Review submitted' })
    setSuccess(true)
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50/40">
        <CardContent className="pt-6">
          <p className="text-sm text-green-700 font-medium">
            Review submitted successfully — ticket has been {decision === 'approved' ? 'approved' : 'sent back for revision'}.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Review Verdict</CardTitle>
        <p className="text-xs text-muted-foreground">
          Evaluate the submitted work against the acceptance criteria.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Verdict selection */}
        <div className="space-y-2">
          <Label>Decision</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDecision('approved')}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors',
                decision === 'approved'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-border bg-background hover:bg-muted',
              ].join(' ')}
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>

            <button
              type="button"
              onClick={() => setDecision('revision_requested')}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors',
                decision === 'revision_requested'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-border bg-background hover:bg-muted',
              ].join(' ')}
            >
              <XCircle className="w-4 h-4" />
              Request Revision
            </button>
          </div>
        </div>

        {/* Failed criteria checklist — shown when requesting revision */}
        {decision === 'revision_requested' && criteria.length > 0 && (
          <div className="space-y-2">
            <Label>Failed Acceptance Criteria</Label>
            <div className="space-y-2 pl-1">
              {criteria.map((criterion) => (
                <label
                  key={criterion.id}
                  className="flex items-start gap-2 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={failedCriteriaIds.has(criterion.id)}
                    onCheckedChange={() => toggleCriterion(criterion.id)}
                    className="mt-0.5"
                  />
                  <span>{criterion.description}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="reviewNotes">Notes (optional)</Label>
          <Textarea
            id="reviewNotes"
            rows={3}
            placeholder="Additional feedback for the worker…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none text-sm"
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <Button onClick={handleSubmit} disabled={loading || !decision}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Submit Review
        </Button>
      </CardContent>
    </Card>
  )
}
