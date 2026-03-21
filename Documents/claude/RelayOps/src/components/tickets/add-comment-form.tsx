'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addCommentAction } from '@/lib/actions/admin.actions'
import { addPartnerCommentAction } from '@/lib/actions/ticket.actions'
import { addWorkerCommentAction } from '@/lib/actions/worker.actions'
import { toast } from '@/hooks/use-toast'
import type { UserRole, CommentVisibility } from '@/lib/types/enums'

interface AddCommentFormProps {
  ticketId: string
  viewerRole: UserRole
}

export function AddCommentForm({ ticketId, viewerRole }: AddCommentFormProps) {
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState<CommentVisibility>('partner_admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Workers can only post worker_admin visibility
  const isWorker = viewerRole === 'worker_internal'
  const isAdmin = viewerRole === 'admin'

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!body.trim()) return

    setLoading(true)
    setError(null)

    let result
    if (isWorker) {
      result = await addWorkerCommentAction({ ticketId, body })
    } else if (isAdmin) {
      result = await addCommentAction({ ticketId, body, visibility })
    } else {
      result = await addPartnerCommentAction({ ticketId, body })
    }

    setLoading(false)

    if (!result.success) {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : Object.values(result.error ?? {}).flat().join(', ') || 'Failed to add comment.'
      setError(msg)
      toast({ title: 'Failed to post comment', description: msg, variant: 'destructive' })
      return
    }

    toast({ title: 'Comment posted' })
    setBody('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t">
      <Textarea
        placeholder="Add a comment…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="resize-none text-sm"
        disabled={loading}
      />

      {isAdmin && (
        <div className="space-y-1">
          <Label htmlFor="commentVisibility" className="text-xs">
            Visible to
          </Label>
          <Select
            value={visibility}
            onValueChange={(v) => setVisibility(v as CommentVisibility)}
            disabled={loading}
          >
            <SelectTrigger id="commentVisibility" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="partner_admin">Partner</SelectItem>
              <SelectItem value="worker_admin">Worker</SelectItem>
              <SelectItem value="internal_only">Internal only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}

      <Button type="submit" size="sm" disabled={loading || !body.trim()}>
        {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
        Post Comment
      </Button>
    </form>
  )
}
