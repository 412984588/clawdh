'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approvePartner, rejectPartner } from '@/lib/actions/partner.actions'
import { Button } from '@/components/ui/button'

interface PartnerActionButtonsProps {
  organizationId: string
  currentStatus: string
}

export function PartnerActionButtons({
  organizationId,
  currentStatus,
}: PartnerActionButtonsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleApprove() {
    setLoading('approve')
    setError(null)
    const result = await approvePartner(organizationId)
    setLoading(null)
    if (!result.success) {
      setError(typeof result.error === 'string' ? result.error : 'Action failed')
    } else {
      router.refresh()
    }
  }

  async function handleReject() {
    setLoading('reject')
    setError(null)
    const result = await rejectPartner(organizationId)
    setLoading(null)
    if (!result.success) {
      setError(typeof result.error === 'string' ? result.error : 'Action failed')
    } else {
      router.refresh()
    }
  }

  if (currentStatus === 'approved') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={loading !== null}
        className="text-xs text-red-600 border-red-200 hover:bg-red-50"
      >
        {loading === 'reject' ? '...' : 'Revoke'}
      </Button>
    )
  }

  if (currentStatus === 'rejected') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleApprove}
        disabled={loading !== null}
        className="text-xs"
      >
        {loading === 'approve' ? '...' : 'Re-approve'}
      </Button>
    )
  }

  // Pending — show both
  return (
    <div className="flex items-center gap-2 justify-end">
      {error && <span className="text-xs text-red-500">{error}</span>}
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={loading !== null}
        className="text-xs text-red-600 border-red-200 hover:bg-red-50"
      >
        {loading === 'reject' ? '...' : 'Reject'}
      </Button>
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={loading !== null}
        className="text-xs"
      >
        {loading === 'approve' ? '...' : 'Approve'}
      </Button>
    </div>
  )
}
