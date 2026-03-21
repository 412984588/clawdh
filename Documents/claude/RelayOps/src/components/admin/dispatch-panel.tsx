'use client'

import { useState } from 'react'
import { Loader2, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { assignWorkerAction } from '@/lib/actions/admin.actions'
import { toast } from '@/hooks/use-toast'
import type { WorkerProfile } from '@/lib/types/database'
import type { TicketAssignment } from '@/lib/types/database'

interface DispatchPanelProps {
  ticketId: string
  availableWorkers: WorkerProfile[]
  currentAssignment?: TicketAssignment | null
}

export function DispatchPanel({
  ticketId,
  availableWorkers,
  currentAssignment,
}: DispatchPanelProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (currentAssignment) {
    return (
      <Card className="border-blue-200 bg-blue-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            Worker Assigned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Assignment status:{' '}
            <span className="font-medium text-foreground">{currentAssignment.status}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Worker ID: <span className="font-mono">{currentAssignment.worker_id.slice(0, 8)}</span>
          </p>
        </CardContent>
      </Card>
    )
  }

  async function handleAssign() {
    if (!selectedWorkerId) {
      setError('Please select a worker.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await assignWorkerAction({ ticketId, workerId: selectedWorkerId })
    setLoading(false)

    if (!result.success) {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : Object.values(result.error ?? {}).flat().join(', ') || 'Failed to assign worker.'
      setError(msg)
      toast({ title: 'Failed to assign worker', description: msg, variant: 'destructive' })
      return
    }

    toast({ title: 'Worker assigned' })
    setSuccess(true)
  }

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-600" />
          Dispatch Worker
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Select an approved worker to assign to this queued ticket.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            Worker assigned successfully.
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="workerSelect">Available Workers</Label>
          <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId} disabled={loading || success}>
            <SelectTrigger id="workerSelect">
              <SelectValue placeholder="Select a worker…" />
            </SelectTrigger>
            <SelectContent>
              {availableWorkers.map((worker) => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.nickname}
                  {worker.primary_skill ? ` · ${worker.primary_skill}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <Button onClick={handleAssign} disabled={loading || success || !selectedWorkerId}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Assign Worker
        </Button>
      </CardContent>
    </Card>
  )
}
