'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { acknowledgeAssignmentAction, startWorkAction } from '@/lib/actions/worker.actions'
import { toast } from '@/hooks/use-toast'
import type { TicketAssignment } from '@/lib/types/database'

interface AssignmentActionButtonsProps {
  ticketId: string
  assignment: TicketAssignment
}

export function AssignmentActionButtons({ ticketId, assignment }: AssignmentActionButtonsProps) {
  const [status, setStatus] = useState(assignment.status)
  const [loading, setLoading] = useState<'acknowledge' | 'start' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAcknowledge() {
    setLoading('acknowledge')
    setError(null)

    const result = await acknowledgeAssignmentAction({ assignmentId: assignment.id })
    setLoading(null)

    if (!result.success) {
      const msg = typeof result.error === 'string' ? result.error : 'Failed to acknowledge.'
      setError(msg)
      toast({ title: 'Failed to acknowledge', description: msg, variant: 'destructive' })
      return
    }

    toast({ title: 'Assignment acknowledged' })
    setStatus('acknowledged')
  }

  async function handleStartWork() {
    setLoading('start')
    setError(null)

    const result = await startWorkAction({ ticketId, assignmentId: assignment.id })
    setLoading(null)

    if (!result.success) {
      const msg = typeof result.error === 'string' ? result.error : 'Failed to start work.'
      setError(msg)
      toast({ title: 'Failed to start work', description: msg, variant: 'destructive' })
      return
    }

    toast({ title: 'Work started' })
    setStatus('in_progress')
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Assignment Status</CardTitle>
          <Badge variant="outline" className="capitalize">
            {status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <div className="flex gap-2">
          {status === 'pending' && (
            <Button
              onClick={handleAcknowledge}
              disabled={loading !== null}
            >
              {loading === 'acknowledge' && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Acknowledge Assignment
            </Button>
          )}

          {status === 'acknowledged' && (
            <Button
              onClick={handleStartWork}
              disabled={loading !== null}
            >
              {loading === 'start' && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Start Work
            </Button>
          )}

          {status === 'in_progress' && (
            <p className="text-sm text-green-700 font-medium">
              Work in progress — submit your deliverable below.
            </p>
          )}

          {status === 'completed' && (
            <p className="text-sm text-muted-foreground">Work submitted for review.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
