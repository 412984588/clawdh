'use client'

import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileUploadZone } from '@/components/forms/file-upload-zone'
import { submitWorkAction } from '@/lib/actions/worker.actions'
import { uploadSubmissionFile } from '@/lib/actions/upload.actions'
import { toast } from '@/hooks/use-toast'
import type { TicketAssignment } from '@/lib/types/database'

interface SubmissionUploadFormProps {
  ticketId: string
  assignment: TicketAssignment
}

export function SubmissionUploadForm({ ticketId, assignment }: SubmissionUploadFormProps) {
  const [deliverySummary, setDeliverySummary] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isEnabled = assignment.status === 'in_progress'

  if (!isEnabled) return null

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!deliverySummary.trim()) {
      setError('Please provide a delivery summary.')
      return
    }

    setLoading(true)
    setError(null)

    // Upload files to Supabase Storage and collect attachment IDs
    const attachmentIds: string[] = []
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading file ${i + 1}/${files.length}...`)
      const fd = new FormData()
      fd.append('file', files[i])
      const uploadResult = await uploadSubmissionFile(ticketId, fd)
      if (!uploadResult.success) {
        setError(`File upload failed: ${uploadResult.error}`)
        setLoading(false)
        setUploadProgress(null)
        return
      }
      attachmentIds.push(uploadResult.data!.attachmentId)
    }
    setUploadProgress(null)

    const result = await submitWorkAction({
      ticketId,
      deliverySummary,
      attachmentIds,
    })

    setLoading(false)

    if (!result.success) {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : Object.values(result.error ?? {}).flat().join(', ') || 'Submission failed.'
      setError(msg)
      toast({ title: 'Submission failed', description: msg, variant: 'destructive' })
      return
    }

    toast({ title: 'Work submitted' })
    setSuccess(true)
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50/40">
        <CardContent className="pt-6">
          <p className="text-sm text-green-700 font-medium">
            Work submitted successfully! It is now pending review.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Send className="w-4 h-4" />
          Submit Completed Work
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="deliverySummary">Delivery Summary</Label>
            <Textarea
              id="deliverySummary"
              rows={4}
              placeholder="Describe what was completed, any decisions made, and how to verify…"
              value={deliverySummary}
              onChange={(e) => setDeliverySummary(e.target.value)}
              className="resize-none text-sm"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Attachments (optional)</Label>
            <FileUploadZone
              onFilesChange={setFiles}
              maxFiles={5}
            />
            {/* files selected but not yet uploaded — noted for real impl */}
            {files.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {uploadProgress && (
            <p className="text-sm text-muted-foreground">{uploadProgress}</p>
          )}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          <Button type="submit" disabled={loading || !deliverySummary.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Work
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
