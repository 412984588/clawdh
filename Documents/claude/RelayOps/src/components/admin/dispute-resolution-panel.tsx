'use client'

import { useState } from 'react'
import { Loader2, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { resolveDisputeAction } from '@/lib/actions/admin.actions'
import { toast } from '@/hooks/use-toast'
import type { Dispute } from '@/lib/types/database'

type ResolutionOption = 'resolved_full_refund' | 'resolved_partial_refund' | 'resolved_no_refund'

interface DisputeResolutionPanelProps {
  dispute: Dispute
  ticketId: string
}

export function DisputeResolutionPanel({ dispute, ticketId }: DisputeResolutionPanelProps) {
  const [resolution, setResolution] = useState<ResolutionOption | ''>('')
  const [refundAmount, setRefundAmount] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const showRefundAmount =
    resolution === 'resolved_full_refund' || resolution === 'resolved_partial_refund'

  async function handleResolve() {
    if (!resolution) {
      setError('Please select a resolution.')
      return
    }
    if (!summary.trim()) {
      setError('Please provide a resolution summary.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await resolveDisputeAction({
      disputeId: dispute.id,
      ticketId,
      resolutionSummary: summary,
      disputeStatus: resolution,
      refundAmountDollars: showRefundAmount ? parseFloat(refundAmount) || 0 : undefined,
    })

    setLoading(false)

    if (!result.success) {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : Object.values(result.error ?? {}).flat().join(', ') || 'Resolution failed.'
      setError(msg)
      toast({ title: 'Resolution failed', description: msg, variant: 'destructive' })
      return
    }

    toast({ title: 'Dispute resolved' })
    setSuccess(true)
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50/40">
        <CardContent className="pt-6">
          <p className="text-sm text-green-700 font-medium">Dispute resolved successfully.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="w-4 h-4 text-red-600" />
          Resolve Dispute
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-medium text-foreground">Reason:</span> {dispute.reason}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="resolution">Resolution</Label>
          <Select
            value={resolution}
            onValueChange={(v) => setResolution(v as ResolutionOption)}
            disabled={loading}
          >
            <SelectTrigger id="resolution">
              <SelectValue placeholder="Select resolution…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resolved_full_refund">Full Refund</SelectItem>
              <SelectItem value="resolved_partial_refund">Partial Refund</SelectItem>
              <SelectItem value="resolved_no_refund">No Refund</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showRefundAmount && (
          <div className="space-y-1.5">
            <Label htmlFor="refundAmount">Refund Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id="refundAmount"
                type="number"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="pl-6"
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="resolutionSummary">Resolution Summary</Label>
          <Textarea
            id="resolutionSummary"
            rows={4}
            placeholder="Explain the resolution decision…"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="resize-none text-sm"
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <Button
          onClick={handleResolve}
          disabled={loading || !resolution || !summary.trim()}
          variant="destructive"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Resolve Dispute
        </Button>
      </CardContent>
    </Card>
  )
}
