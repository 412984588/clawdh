'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { partnerReviewSubmissionAction } from '@/lib/actions/ticket.actions'

interface PartnerReviewActionsProps {
  ticketId: string
}

// Partner 对已提交审核工作的 approve / request revision
export function PartnerReviewActions({ ticketId }: PartnerReviewActionsProps) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'revision' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setLoading('approve')
    setError(null)
    const result = await partnerReviewSubmissionAction(ticketId, 'approved', note)
    setLoading(null)
    if (!result.success) {
      setError(typeof result.error === 'string' ? result.error : 'Action failed.')
      return
    }
    router.refresh()
  }

  async function handleRequestRevision() {
    if (!note.trim()) {
      setError('Please explain what needs to be revised.')
      return
    }
    setLoading('revision')
    setError(null)
    const result = await partnerReviewSubmissionAction(ticketId, 'revision_requested', note)
    setLoading(null)
    if (!result.success) {
      setError(typeof result.error === 'string' ? result.error : 'Action failed.')
      return
    }
    router.refresh()
  }

  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Review Submitted Work</CardTitle>
        <p className="text-xs text-muted-foreground">
          The operator has submitted their work for your review. Approve to mark as complete, or
          request a revision.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={3}
          placeholder="Add a note (required if requesting revision)…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none text-sm"
        />

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <div className="flex gap-2">
          <Button
            onClick={handleApprove}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === 'approve' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={handleRequestRevision}
            disabled={loading !== null}
          >
            {loading === 'revision' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Request Revision
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
