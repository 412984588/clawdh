'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { assignWorkerAction } from '@/lib/actions/admin.actions'

interface Worker {
  id: string
  nickname: string
  primary_skill: string
  approval_status: string
}

interface AdminAssignWorkerPanelProps {
  ticketId: string
  workers: Worker[]
}

// Admin selects and assigns a worker when ticket is queued
export function AdminAssignWorkerPanel({ ticketId, workers }: AdminAssignWorkerPanelProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approvedWorkers = workers.filter((w) => w.approval_status === 'approved')

  async function handleAssign() {
    if (!selectedWorkerId) return
    setLoading(true)
    setError(null)

    const result = await assignWorkerAction({
      ticketId,
      workerId: selectedWorkerId,
    })

    setLoading(false)

    if (!result.success) {
      setError(typeof result.error === 'string' ? result.error : 'Failed to assign worker')
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Assign Worker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvedWorkers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved workers available</p>
        ) : (
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
          >
            <option value="">Select a worker...</option>
            {approvedWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nickname} — {w.primary_skill.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        )}
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button
          size="sm"
          onClick={handleAssign}
          disabled={!selectedWorkerId || loading}
        >
          {loading ? 'Assigning...' : 'Assign Worker'}
        </Button>
      </CardContent>
    </Card>
  )
}
