import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMockSupabase, ok, err } from '../helpers/mock-supabase'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createEmailProvider } from '@/lib/integrations/email/provider'
import { logger } from '@/lib/utils/logger'
import { submitPartnerApplication, approvePartner, rejectPartner } from '@/lib/actions/partner.actions'

vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/integrations/email/provider', () => ({ createEmailProvider: vi.fn() }))
vi.mock('@/lib/utils/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }))

const ORG_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const validApplication = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  company_name: 'Acme Corp',
  country: 'US',
  service_focus: 'We specialize in CRM integrations and data pipelines.',
  monthly_ticket_estimate: 10,
  data_handling_agreement: true as const,
}

describe('partner.actions', () => {
  let mockServer: ReturnType<typeof createMockSupabase>
  let mockAdmin: ReturnType<typeof createMockSupabase>

  beforeEach(() => {
    mockServer = createMockSupabase()
    mockAdmin = createMockSupabase()
    vi.mocked(createServerClient).mockResolvedValue(mockServer as any)
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as any)
    // 默认 email provider：send 成功静默
    vi.mocked(createEmailProvider).mockReturnValue({ send: vi.fn().mockResolvedValue({}) } as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  /** Sets up authenticated admin user for getAdminUser() */
  function setupAdmin() {
    mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockAdmin.from.mockReturnValueOnce(ok({ id: 'admin-1', role: 'admin' }))
  }

  describe('submitPartnerApplication', () => {
    it('returns validation error for invalid input', async () => {
      const result = await submitPartnerApplication({})
      expect(result.success).toBe(false)
    })

    it('returns error when org insert fails', async () => {
      // No website → skips duplicate check, goes straight to org insert
      const data = { ...validApplication }
      mockAdmin.from.mockReturnValueOnce(err('constraint violation')) // org insert fails

      const result = await submitPartnerApplication(data)
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/Failed to create organization/)
    })

    it('returns error when profile insert fails', async () => {
      const data = { ...validApplication }
      mockAdmin.from.mockReturnValueOnce(ok({ id: ORG_ID })) // org insert succeeds
      mockAdmin.from.mockReturnValueOnce(err('profile error')) // profile insert fails
      // Cleanup delete uses default mock (success)

      const result = await submitPartnerApplication(data)
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/Failed to save application/)
      // Verify compensating delete was called to clean up the orphaned org
      expect(mockAdmin.from).toHaveBeenCalledWith('organizations')
    })

    it('returns org id on success (no website)', async () => {
      const data = { ...validApplication }
      mockAdmin.from.mockReturnValueOnce(ok({ id: ORG_ID })) // org insert
      // Profile insert and notes update use default mocks (error: null)

      const result = await submitPartnerApplication(data)
      expect(result.success).toBe(true)
      expect((result as any).data?.id).toBe(ORG_ID)
    })

    it('returns error when website already exists', async () => {
      const data = { ...validApplication, website: 'https://acme.com' }
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'existing-org' })) // existing org found

      const result = await submitPartnerApplication(data)
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/already exists/)
    })

    it('returns org id on success (with website, no duplicate)', async () => {
      const data = { ...validApplication, website: 'https://acme.com' }
      mockAdmin.from.mockReturnValueOnce(ok(null))      // no existing org (maybeSingle)
      mockAdmin.from.mockReturnValueOnce(ok({ id: ORG_ID })) // org insert
      // Profile insert and notes update use default mocks

      const result = await submitPartnerApplication(data)
      expect(result.success).toBe(true)
      expect((result as any).data?.id).toBe(ORG_ID)
    })
  })

  describe('approvePartner', () => {
    /** 为 approvePartner 设置完整的 auth.admin mock */
    function setupAuthAdmin(userId = 'new-partner-uid') {
      const createUserMock = vi.fn().mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      })
      ;(mockAdmin as any).auth = {
        ...((mockAdmin as any).auth ?? {}),
        admin: { createUser: createUserMock },
      }
      return createUserMock
    }

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await approvePartner(ORG_ID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not admin', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner' }))

      const result = await approvePartner(ORG_ID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('creates auth user and users record on approval', async () => {
      const createUserMock = setupAuthAdmin()
      setupAdmin()
      mockAdmin.from.mockReturnValueOnce(ok(null))                                                 // call #2: update (no error)
      mockAdmin.from.mockReturnValueOnce(ok({ notes: 'Contact email: newpartner@example.com' }))  // call #3: notes fetch
      mockAdmin.from.mockReturnValueOnce(ok(null))                                                 // call #4: user existence check (doesn't exist)
      // call #5: users insert → default (success)

      const result = await approvePartner(ORG_ID)
      expect(result.success).toBe(true)
      expect(createUserMock).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newpartner@example.com', email_confirm: true })
      )
    })

    it('skips account creation when user already exists (idempotent)', async () => {
      const createUserMock = setupAuthAdmin()
      setupAdmin()
      mockAdmin.from.mockReturnValueOnce(ok(null))                                               // call #2: update (no error)
      mockAdmin.from.mockReturnValueOnce(ok({ notes: 'Contact email: existing@example.com' }))  // call #3: notes fetch
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'existing-user-id' }))                        // call #4: user exists

      const result = await approvePartner(ORG_ID)
      expect(result.success).toBe(true)
      expect(createUserMock).not.toHaveBeenCalled()
    })

    it('returns error when no contact email in notes', async () => {
      setupAuthAdmin()
      setupAdmin()
      mockAdmin.from.mockReturnValueOnce(ok(null))                                               // call #2: update (no error)
      mockAdmin.from.mockReturnValueOnce(ok({ notes: 'Some other note without email' }))        // call #3: notes without email

      const result = await approvePartner(ORG_ID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('No contact email found for this partner')
    })

    it('returns error when update fails', async () => {
      setupAdmin()
      mockAdmin.from.mockReturnValueOnce(err('update failed'))

      const result = await approvePartner(ORG_ID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to approve partner.')
    })

    it('returns error when auth user creation fails', async () => {
      ;(mockAdmin as any).auth = {
        ...((mockAdmin as any).auth ?? {}),
        admin: {
          createUser: vi.fn().mockResolvedValue({ data: null, error: { message: 'email conflict' } }),
        },
      }
      setupAdmin()
      mockAdmin.from.mockReturnValueOnce(ok(null))                                              // call #2: update (no error)
      mockAdmin.from.mockReturnValueOnce(ok({ notes: 'Contact email: fail@example.com' }))     // call #3: notes fetch
      mockAdmin.from.mockReturnValueOnce(ok(null))                                              // call #4: user doesn't exist

      const result = await approvePartner(ORG_ID)
      expect(result.success).toBe(false)
      expect(result.error).toMatch(/Failed to create account/)
    })

    it('logs logger.error when approval email send fails', async () => {
      const sendMock = vi.fn().mockRejectedValue(new Error('SMTP connection refused'))
      vi.mocked(createEmailProvider).mockReturnValueOnce({ send: sendMock } as any)

      const createUserMock = setupAuthAdmin()
      setupAdmin()
      mockAdmin.from.mockReturnValueOnce(ok(null))                                                 // update
      mockAdmin.from.mockReturnValueOnce(ok({ notes: 'Contact email: newpartner@example.com' }))  // notes fetch
      mockAdmin.from.mockReturnValueOnce(ok(null))                                                 // user doesn't exist
      // user insert uses default mock

      const result = await approvePartner(ORG_ID)
      expect(result.success).toBe(true)
      expect(createUserMock).toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalledWith('Partner approval email send failed', expect.objectContaining({
        context: 'partner-actions',
      }))
    })
  })

  describe('rejectPartner', () => {
    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await rejectPartner(ORG_ID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not admin', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner' }))

      const result = await rejectPartner(ORG_ID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns success when partner is rejected', async () => {
      setupAdmin()
      // Second from() call (the update) uses default mock (success)

      const result = await rejectPartner(ORG_ID)
      expect(result.success).toBe(true)
    })

    it('returns error when update fails', async () => {
      setupAdmin()
      mockAdmin.from.mockReturnValueOnce(err('update failed'))

      const result = await rejectPartner(ORG_ID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to reject partner.')
    })
  })
})
