'use client'

import { useState } from 'react'
import { Loader2, Lock, MessageSquare, ExternalLink, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { scopeAndInvoiceTicket } from '@/lib/actions/billing.actions'
import { adminTransitionTicket } from '@/lib/actions/ticket.actions'
import { toast } from '@/hooks/use-toast'
import type { Ticket } from '@/lib/types/database'

interface ScopeReviewPanelProps {
  ticket: Ticket
  onTransitioned?: () => void
}

export function ScopeReviewPanel({ ticket, onTransitioned }: ScopeReviewPanelProps) {
  const [price, setPrice] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [loading, setLoading] = useState<'invoice' | 'close' | 'cancel' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)

  // Panel only renders for the relevant state
  if (ticket.status !== 'needs_scope_review') return null

  async function handleLockAndInvoice() {
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price.')
      return
    }

    setLoading('invoice')
    setError(null)

    const result = await scopeAndInvoiceTicket({
      ticketId: ticket.id,
      priceDollars: priceNum,
    })

    setLoading(null)

    if (!result.success) {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : Object.values(result.error ?? {}).flat().join(', ') || 'Failed to lock scope.'
      setError(msg)
      toast({ title: 'Failed to lock scope', description: msg, variant: 'destructive' })
      return
    }

    toast({ title: 'Scope locked & invoice sent' })
    // Show the invoice URL so the admin can verify before navigating away
    if (result.data?.invoiceUrl) {
      setInvoiceUrl(result.data.invoiceUrl)
    }

    onTransitioned?.()
  }

  async function handleCloseNoResponse() {
    setLoading('close')
    setError(null)

    const result = await adminTransitionTicket(ticket.id, 'admin_closed_no_response', {
      admin_note: adminNote || 'Closed due to no partner response.',
    })

    setLoading(null)
    if (!result.success) {
      const msg = typeof result.error === 'string' ? result.error : 'Transition failed.'
      setError(msg)
      toast({ title: 'Failed to close ticket', description: msg, variant: 'destructive' })
      return
    }
    toast({ title: 'Ticket closed' })
    onTransitioned?.()
  }

  async function handleCancel() {
    setLoading('cancel')
    setError(null)

    const result = await adminTransitionTicket(ticket.id, 'cancelled', {
      admin_note: adminNote || 'Cancelled by admin during scope review.',
    })

    setLoading(null)
    if (!result.success) {
      const msg = typeof result.error === 'string' ? result.error : 'Transition failed.'
      setError(msg)
      toast({ title: 'Failed to cancel ticket', description: msg, variant: 'destructive' })
      return
    }
    toast({ title: 'Ticket cancelled' })
    onTransitioned?.()
  }

  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          Scope Review
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Set a price, lock scope, and send the Stripe invoice to the partner in one step.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Invoice URL confirmation banner */}
        {invoiceUrl && (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            <span className="flex-1">Invoice sent!</span>
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium hover:underline"
            >
              View Invoice
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Price input */}
        <div className="space-y-1.5">
          <Label htmlFor="scopePrice">Scoped Price (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              $
            </span>
            <Input
              id="scopePrice"
              type="number"
              min={1}
              step={0.01}
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-6"
              disabled={loading !== null || invoiceUrl !== null}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ≤ $149 → Pilot · ≤ $399 → Standard · ≤ $799 → Complex · &gt; $799 → Custom
          </p>
        </div>

        {/* Admin note */}
        <div className="space-y-1.5">
          <Label htmlFor="adminNote" className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Internal Note (optional)
          </Label>
          <Textarea
            id="adminNote"
            rows={3}
            placeholder="Notes visible to admin only…"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="resize-none text-sm"
            disabled={loading !== null}
          />
        </div>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleLockAndInvoice}
            disabled={loading !== null || invoiceUrl !== null}
            className="flex-1 sm:flex-none"
          >
            {loading === 'invoice' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Lock Scope &amp; Send Invoice
          </Button>

          <Button
            variant="outline"
            onClick={handleCloseNoResponse}
            disabled={loading !== null}
          >
            {loading === 'close' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Close — No Response
          </Button>

          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading !== null}
            className="text-destructive hover:text-destructive"
          >
            {loading === 'cancel' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}
            Cancel Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
