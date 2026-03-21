import type { SupabaseClient } from '@supabase/supabase-js'
import type { Attachment } from '@/lib/types/database'
import type { UserRole, AttachmentRole } from '@/lib/types/enums'

interface CreateAttachmentParams {
  ticketId: string
  submissionId?: string
  uploadedByUserId: string
  uploadedByRole: UserRole
  fileName: string
  storagePath: string
  mimeType: string
  byteSize: number
  attachmentRole: AttachmentRole
  version?: number
}

export async function createAttachmentRecord(
  supabase: SupabaseClient,
  params: CreateAttachmentParams
): Promise<{ data: Attachment | null; error: string | null }> {
  const { data, error } = await supabase
    .from('attachments')
    .insert({
      ticket_id: params.ticketId,
      submission_id: params.submissionId ?? null,
      uploaded_by_user_id: params.uploadedByUserId,
      uploaded_by_role: params.uploadedByRole,
      file_name: params.fileName,
      storage_path: params.storagePath,
      mime_type: params.mimeType,
      byte_size: params.byteSize,
      attachment_role: params.attachmentRole,
      version: params.version ?? 1,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Attachment, error: null }
}

export async function getAttachmentsForTicket(
  supabase: SupabaseClient,
  ticketId: string
): Promise<{ data: Attachment[]; error: string | null }> {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data: (data as Attachment[]) ?? [], error: null }
}

export async function getAttachmentById(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: Attachment | null; error: string | null }> {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: (data as Attachment) ?? null, error: null }
}
