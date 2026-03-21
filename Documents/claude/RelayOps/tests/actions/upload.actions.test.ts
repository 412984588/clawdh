import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStorageBucket } from '@/lib/integrations/storage/client'
import { uploadSubmissionFile } from '@/lib/actions/upload.actions'

vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('@/lib/integrations/storage/client', () => ({ getStorageBucket: vi.fn() }))

const TICKET_ID = 'aaaaaaaa-0000-0000-0000-000000000001'
const USER_ID   = 'bbbbbbbb-0000-0000-0000-000000000002'
const WORKER_PROFILE_ID = 'dddddddd-0000-0000-0000-000000000004'
const ATTACH_ID = 'cccccccc-0000-0000-0000-000000000003'

function makeFile(name = 'test.csv', size = 1024, type = 'text/csv') {
  return new File(['x'.repeat(size)], name, { type })
}

function makeFormData(file: File) {
  const fd = new FormData()
  fd.set('file', file)
  return fd
}

describe('uploadSubmissionFile', () => {
  let mockServer: ReturnType<typeof createMockSupabase>
  let mockAdmin: ReturnType<typeof createMockSupabase>
  let mockBucket: { upload: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    mockServer = createMockSupabase()
    mockAdmin  = createMockSupabase()
    mockBucket = {
      upload: vi.fn().mockResolvedValue({ error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    }

    vi.mocked(createServerClient).mockResolvedValue(mockServer as any)
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as any)
    vi.mocked(getStorageBucket).mockReturnValue(mockBucket as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  /** 设置 worker 认证 */
  function setupWorker() {
    mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: USER_ID } }, error: null })
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return ok({ id: USER_ID, role: 'worker_internal' }) as any
      if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: USER_ID }) as any
      if (table === 'ticket_assignments') {
        return ok({ id: 'assignment-1', ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID, status: 'in_progress' }) as any
      }
      return ok(null) as any
    })
  }

  it('returns Unauthorized when not logged in', async () => {
    mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await uploadSubmissionFile(TICKET_ID, makeFormData(makeFile()))
    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('returns error for non-worker role', async () => {
    mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: USER_ID } }, error: null })
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return ok({ id: USER_ID, role: 'partner' }) as any
      return ok(null) as any
    })

    const result = await uploadSubmissionFile(TICKET_ID, makeFormData(makeFile()))
    expect(result.success).toBe(false)
    expect(result.error).toBe('Workers only')
  })

  it('returns error when worker is not assigned to the ticket', async () => {
    mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: USER_ID } }, error: null })
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return ok({ id: USER_ID, role: 'worker_internal' }) as any
      if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: USER_ID }) as any
      if (table === 'ticket_assignments') return ok(null) as any
      return ok(null) as any
    })

    const result = await uploadSubmissionFile(TICKET_ID, makeFormData(makeFile()))
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/assigned/i)
    expect(mockAdmin.from).toHaveBeenCalledWith('ticket_assignments')
  })

  it('returns error when no file in FormData', async () => {
    setupWorker()

    const fd = new FormData() // no 'file' key
    const result = await uploadSubmissionFile(TICKET_ID, fd)
    expect(result.success).toBe(false)
    expect(result.error).toBe('No file provided')
  })

  it('returns error when file exceeds 10 MB', async () => {
    setupWorker()

    const bigFile = makeFile('huge.csv', 11 * 1024 * 1024)
    const result = await uploadSubmissionFile(TICKET_ID, makeFormData(bigFile))
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/too large/)
  })

  it('returns error when storage upload fails', async () => {
    setupWorker()
    mockBucket.upload.mockResolvedValueOnce({ error: { message: 'storage unavailable' } })

    const result = await uploadSubmissionFile(TICKET_ID, makeFormData(makeFile()))
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Upload failed/)
  })

  it('returns error when DB insert fails', async () => {
    setupWorker()
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return ok({ id: USER_ID, role: 'worker_internal' }) as any
      if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: USER_ID }) as any
      if (table === 'ticket_assignments') {
        return ok({ id: 'assignment-1', ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID, status: 'in_progress' }) as any
      }
      if (table === 'attachments') return err('insert error') as any
      return ok(null) as any
    })

    const result = await uploadSubmissionFile(TICKET_ID, makeFormData(makeFile()))
    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to save attachment record')
    expect(mockBucket.remove).toHaveBeenCalledOnce()
  })

  it('INSERT uses correct schema field names matching 00005_attachments.sql', async () => {
    setupWorker()
    mockAdmin.from.mockImplementation((table: string) => {
      if (table === 'users') return ok({ id: USER_ID, role: 'worker_internal' }) as any
      if (table === 'worker_profiles') return ok({ id: WORKER_PROFILE_ID, user_id: USER_ID }) as any
      if (table === 'ticket_assignments') {
        return ok({ id: 'assignment-1', ticket_id: TICKET_ID, worker_id: WORKER_PROFILE_ID, status: 'in_progress' }) as any
      }
      if (table === 'attachments') return ok({ id: ATTACH_ID }) as any
      return ok(null) as any
    })

    const result = await uploadSubmissionFile(TICKET_ID, makeFormData(makeFile('report.csv', 2048, 'text/csv')))
    expect(result.success).toBe(true)
    expect((result as any).data?.attachmentId).toBe(ATTACH_ID)

    // 验证 INSERT 调用了正确的表
    expect(mockAdmin.from).toHaveBeenCalledWith('attachments')

    // 取最后一次 insert 调用，验证传入的字段名
    const insertCall = (mockAdmin.from as ReturnType<typeof vi.fn>).mock.results
      .find(r => r.value?.insert?.mock?.calls?.length > 0)
    const insertArgs = insertCall?.value?.insert?.mock?.calls?.[0]?.[0]

    // 正确字段名（与 00005_attachments.sql schema 一致）
    expect(insertArgs).toHaveProperty('uploaded_by_user_id')
    expect(insertArgs).toHaveProperty('uploaded_by_role', 'worker_internal')
    expect(insertArgs).toHaveProperty('byte_size')
    expect(insertArgs).toHaveProperty('attachment_role', 'deliverable')

    // 错误字段名不应存在
    expect(insertArgs).not.toHaveProperty('uploaded_by')
    expect(insertArgs).not.toHaveProperty('file_size')
  })
})
