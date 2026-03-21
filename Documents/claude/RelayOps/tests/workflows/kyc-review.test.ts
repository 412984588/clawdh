import { describe, it, expect, vi, beforeEach } from 'vitest'
import { approveKycWorkflow, rejectKycWorkflow } from '@/lib/workflows/kyc-review'
import * as kycService from '@/lib/services/kyc.service'

const sendEmailSpy = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/services/kyc.service', () => ({
  reviewKyc: vi.fn(),
}))

vi.mock('@/lib/services/notification.service', () => ({
  notifyTicketEvent: vi.fn(),
}))

vi.mock('@/lib/integrations/email/provider', () => ({
  createEmailProvider: vi.fn().mockResolvedValue({
    send: sendEmailSpy,
  }),
}))

vi.mock('@/lib/integrations/email/templates', () => ({
  kycApprovedEmail: vi.fn().mockReturnValue({
    subject: 'KYC Approved',
    html: '<h1>Approved</h1>',
    text: 'Approved',
  }),
  kycRejectedEmail: vi.fn().mockReturnValue({
    subject: 'KYC Rejected',
    html: '<h1>Rejected</h1>',
    text: 'Rejected',
  }),
}))

describe('kyc-review workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendEmailSpy.mockClear()
  })

  describe('approveKycWorkflow', () => {
    it('approves KYC successfully', async () => {
      vi.mocked(kycService.reviewKyc).mockResolvedValue({ success: true })

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            nickname: 'Worker One',
            user_id: 'user-1',
            users: { email: 'worker@example.com' },
          },
          error: null,
        }),
      }

      const result = await approveKycWorkflow(mockSupabase as unknown as Parameters<typeof approveKycWorkflow>[0], {
        workerId: 'worker-1',
        reviewerId: 'admin-1',
      })

      expect(result.success).toBe(true)
      expect(kycService.reviewKyc).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          workerId: 'worker-1',
          decision: 'approve',
          reviewerId: 'admin-1',
        })
      )
    })

    it('fails when reviewKyc fails', async () => {
      vi.mocked(kycService.reviewKyc).mockResolvedValue({ success: false, error: 'DB error' })

      const mockSupabase = {}

      const result = await approveKycWorkflow(mockSupabase as unknown as Parameters<typeof approveKycWorkflow>[0], {
        workerId: 'worker-1',
        reviewerId: 'admin-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('DB error')
    })

    it('sends approval email when joined user data is returned as an array', async () => {
      vi.mocked(kycService.reviewKyc).mockResolvedValue({ success: true })

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            nickname: 'Worker One',
            user_id: 'user-1',
            users: [{ email: 'worker@example.com' }],
          },
          error: null,
        }),
      }

      const result = await approveKycWorkflow(mockSupabase as unknown as Parameters<typeof approveKycWorkflow>[0], {
        workerId: 'worker-1',
        reviewerId: 'admin-1',
      })

      expect(result.success).toBe(true)
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'worker@example.com',
          subject: 'KYC Approved',
        })
      )
    })
  })

  describe('rejectKycWorkflow', () => {
    it('rejects KYC successfully with reason', async () => {
      vi.mocked(kycService.reviewKyc).mockResolvedValue({ success: true })

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            nickname: 'Worker One',
            user_id: 'user-1',
            users: { email: 'worker@example.com' },
          },
          error: null,
        }),
      }

      const result = await rejectKycWorkflow(mockSupabase as unknown as Parameters<typeof rejectKycWorkflow>[0], {
        workerId: 'worker-1',
        reviewerId: 'admin-1',
        reason: 'Documents unclear',
      })

      expect(result.success).toBe(true)
      expect(kycService.reviewKyc).toHaveBeenCalledWith(
        mockSupabase,
        expect.objectContaining({
          workerId: 'worker-1',
          decision: 'reject',
          reviewerId: 'admin-1',
          reason: 'Documents unclear',
        })
      )
    })

    it('fails when reason is not provided', async () => {
      const mockSupabase = {}

      const result = await rejectKycWorkflow(mockSupabase as unknown as Parameters<typeof rejectKycWorkflow>[0], {
        workerId: 'worker-1',
        reviewerId: 'admin-1',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rejection reason is required')
    })
  })
})
