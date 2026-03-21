import { describe, it, expect } from 'vitest'
import {
  createAttachmentRecord,
  getAttachmentsForTicket,
  getAttachmentById,
} from '@/lib/services/attachment.service'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'

const mockAttachment = {
  id: 'att-1',
  ticket_id: 'ticket-1',
  uploaded_by_user_id: 'user-1',
  uploaded_by_role: 'partner',
  file_name: 'report.csv',
  storage_path: 'org/ticket-1/report.csv',
  mime_type: 'text/csv',
  byte_size: 2048,
  attachment_role: 'input',
  version: 1,
}

const createParams = {
  ticketId: 'ticket-1',
  uploadedByUserId: 'user-1',
  uploadedByRole: 'partner' as const,
  fileName: 'report.csv',
  storagePath: 'org/ticket-1/report.csv',
  mimeType: 'text/csv',
  byteSize: 2048,
  attachmentRole: 'input' as const,
}

describe('createAttachmentRecord', () => {
  it('returns attachment data on success', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(mockAttachment))

    const result = await createAttachmentRecord(supabase as any, createParams)
    expect(result.data?.id).toBe('att-1')
    expect(result.error).toBeNull()
  })

  it('returns error when insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('storage path conflict'))

    const result = await createAttachmentRecord(supabase as any, createParams)
    expect(result.data).toBeNull()
    expect(result.error).toBe('storage path conflict')
  })
})

describe('getAttachmentsForTicket', () => {
  it('returns list of attachments', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok([mockAttachment]))

    const result = await getAttachmentsForTicket(supabase as any, 'ticket-1')
    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].file_name).toBe('report.csv')
  })

  it('returns empty array when none exist', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await getAttachmentsForTicket(supabase as any, 'ticket-99')
    expect(result).toEqual({ data: [], error: null })
  })

  it('returns error when query fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('attachments query failed'))

    const result = await getAttachmentsForTicket(supabase as any, 'ticket-99')
    expect(result).toEqual({ data: [], error: 'attachments query failed' })
  })
})

describe('getAttachmentById', () => {
  it('returns attachment when found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(mockAttachment))

    const result = await getAttachmentById(supabase as any, 'att-1')
    expect(result.data?.id).toBe('att-1')
    expect(result.error).toBeNull()
  })

  it('returns null when not found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await getAttachmentById(supabase as any, 'missing')
    expect(result).toEqual({ data: null, error: null })
  })

  it('returns error when lookup fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('attachment lookup failed'))

    const result = await getAttachmentById(supabase as any, 'missing')
    expect(result).toEqual({ data: null, error: 'attachment lookup failed' })
  })
})
