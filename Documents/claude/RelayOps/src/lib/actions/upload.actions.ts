'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { getStorageBucket } from '@/lib/integrations/storage/client'
import type { ServerActionResult } from '@/lib/types/api'
import { getWorkerContext } from '@/lib/worker-context'

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

// Worker 上传附件到 Supabase Storage，返回 attachment 记录 ID
export async function uploadSubmissionFile(
  ticketId: string,
  formData: FormData
): Promise<ServerActionResult<{ attachmentId: string }>> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  const worker = await getWorkerContext()
  if (!worker) return { success: false, error: 'Workers only' }

  const admin = createAdminClient()
  const { data: assignment } = await admin
    .from('ticket_assignments')
    .select('id, status')
    .eq('ticket_id', ticketId)
    .eq('worker_id', worker.workerProfileId)
    .in('status', ['acknowledged', 'in_progress'])
    .single()

  if (!assignment) {
    return { success: false, error: 'Worker is not assigned to this ticket' }
  }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' }
  }

  // 10MB 上限
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'File too large (max 10MB)' }
  }

  // MIME 类型白名单校验
  const ALLOWED_MIME_PREFIXES = ['image/']
  const ALLOWED_MIME_TYPES = new Set([
    'text/csv',
    'text/plain',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ])
  const mimeType = file.type || ''
  const isMimeAllowed =
    ALLOWED_MIME_TYPES.has(mimeType) ||
    ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
  if (!isMimeAllowed) {
    return { success: false, error: 'File type not allowed' }
  }

  // 上传到 Supabase Storage
  const storagePath = `${ticketId}/${Date.now()}-${sanitizeFileName(file.name)}`
  const bucket = getStorageBucket()
  const { error: uploadError } = await bucket.upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  })

  if (uploadError) {
    return { success: false, error: `Upload failed: ${uploadError.message}` }
  }

  // 创建 attachment 记录
  const { data: attachment, error: insertError } = await admin
    .from('attachments')
    .insert({
      ticket_id: ticketId,
      uploaded_by_user_id: worker.userId,
      uploaded_by_role: 'worker_internal',
      file_name: file.name,
      byte_size: file.size,
      mime_type: file.type || 'application/octet-stream',
      storage_path: storagePath,
      attachment_role: 'deliverable',
    })
    .select('id')
    .single()

  if (insertError || !attachment) {
    await bucket.remove([storagePath])
    return { success: false, error: 'Failed to save attachment record' }
  }

  return { success: true, data: { attachmentId: attachment.id } }
}
