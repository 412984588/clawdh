'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { raiseDisputeAction } from '@/lib/actions/ticket.actions'

interface PartnerDisputeActionsProps {
  ticketId: string
}

// Partner 在 approved 状态下可发起争议
export function PartnerDisputeActions({ ticketId }: PartnerDisputeActionsProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const result = await raiseDisputeAction(ticketId, reason)
    setLoading(false)

    if (!result.success) {
      setError(typeof result.error === 'string' ? result.error : 'Failed to raise dispute')
      return
    }

    setOpen(false)
    setReason('')
  }

  if (!open) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Open Dispute
      </Button>
    )
  }

  return (
    <Card className="border-destructive">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-destructive">Open a Dispute</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Describe the issue with the delivered work (at least 10 characters)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={loading || reason.trim().length < 10}
          >
            {loading ? 'Submitting...' : 'Submit Dispute'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setError(null) }}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
