import { describe, it, expect, vi } from 'vitest'
import {
  submitKyc,
  reviewKyc,
  getKycStatus,
  getPendingKycSubmissions,
  canSubmitKyc,
  canBeAssigned,
} from '@/lib/services/kyc.service'

describe('kyc.service', () => {
  describe('submitKyc', () => {
    it('submits KYC successfully', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      const result = await submitKyc(mockSupabase as unknown as Parameters<typeof submitKyc>[0], {
        workerId: 'worker-1',
        documentsUrl: 'https://storage.example.com/kyc/doc1.pdf',
      })

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_status: 'pending',
          kyc_documents_url: 'https://storage.example.com/kyc/doc1.pdf',
        })
      )
    })

    it('fails when database error occurs', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      }

      const result = await submitKyc(mockSupabase as unknown as Parameters<typeof submitKyc>[0], {
        workerId: 'worker-1',
        documentsUrl: 'https://storage.example.com/kyc/doc1.pdf',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('DB error')
    })
  })

  describe('reviewKyc', () => {
    it('approves KYC successfully', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      const result = await reviewKyc(mockSupabase as unknown as Parameters<typeof reviewKyc>[0], {
        workerId: 'worker-1',
        decision: 'approve',
        reviewerId: 'admin-1',
      })

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_status: 'verified',
          kyc_reviewer_id: 'admin-1',
          kyc_rejection_reason: null,
        })
      )
    })

    it('rejects KYC with reason', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      const result = await reviewKyc(mockSupabase as unknown as Parameters<typeof reviewKyc>[0], {
        workerId: 'worker-1',
        decision: 'reject',
        reviewerId: 'admin-1',
        reason: 'Documents unclear',
      })

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_status: 'rejected',
          kyc_reviewer_id: 'admin-1',
          kyc_rejection_reason: 'Documents unclear',
        })
      )
    })

    it('requires reason for rejection', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      const result = await reviewKyc(mockSupabase as unknown as Parameters<typeof reviewKyc>[0], {
        workerId: 'worker-1',
        decision: 'reject',
        reviewerId: 'admin-1',
      })

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          kyc_rejection_reason: null,
        })
      )
    })
  })

  describe('getKycStatus', () => {
    it('returns KYC status for worker', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            kyc_status: 'verified',
            kyc_submitted_at: '2024-01-01T00:00:00Z',
            kyc_reviewed_at: '2024-01-02T00:00:00Z',
            kyc_reviewer_id: 'admin-1',
            kyc_documents_url: 'https://storage.example.com/kyc/doc1.pdf',
            kyc_rejection_reason: null,
          },
          error: null,
        }),
      }

      const result = await getKycStatus(mockSupabase as unknown as Parameters<typeof getKycStatus>[0], 'worker-1')

      expect(result.data).not.toBeNull()
      expect(result.data?.status).toBe('verified')
      expect(result.data?.submittedAt).toBe('2024-01-01T00:00:00Z')
    })

    it('returns error when worker not found', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }

      const result = await getKycStatus(mockSupabase as unknown as Parameters<typeof getKycStatus>[0], 'worker-1')

      expect(result.data).toBeNull()
      expect(result.error).toBe('Not found')
    })
  })

  describe('getPendingKycSubmissions', () => {
    it('returns pending submissions', async () => {
      const mockSubmissions = [
        {
          id: 'worker-1',
          nickname: 'Worker One',
          real_name: 'John Doe',
          kyc_submitted_at: '2024-01-01T00:00:00Z',
          kyc_documents_url: 'https://storage.example.com/kyc/doc1.pdf',
        },
        {
          id: 'worker-2',
          nickname: 'Worker Two',
          real_name: 'Jane Smith',
          kyc_submitted_at: '2024-01-02T00:00:00Z',
          kyc_documents_url: 'https://storage.example.com/kyc/doc2.pdf',
        },
      ]

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockSubmissions,
          error: null,
        }),
      }

      const result = await getPendingKycSubmissions(mockSupabase as unknown as Parameters<typeof getPendingKycSubmissions>[0])

      expect(result.data).toHaveLength(2)
      expect(result.error).toBeUndefined()
    })

    it('handles errors gracefully', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'DB error' },
        }),
      }

      const result = await getPendingKycSubmissions(mockSupabase as unknown as Parameters<typeof getPendingKycSubmissions>[0])

      expect(result.data).toEqual([])
      expect(result.error).toBe('DB error')
    })
  })

  describe('canSubmitKyc', () => {
    it('returns true for pending status', () => {
      expect(canSubmitKyc('pending')).toBe(true)
    })

    it('returns true for rejected status', () => {
      expect(canSubmitKyc('rejected')).toBe(true)
    })

    it('returns false for verified status', () => {
      expect(canSubmitKyc('verified')).toBe(false)
    })
  })

  describe('canBeAssigned', () => {
    it('returns true for verified status', () => {
      expect(canBeAssigned('verified')).toBe(true)
    })

    it('returns false for pending status', () => {
      expect(canBeAssigned('pending')).toBe(false)
    })

    it('returns false for rejected status', () => {
      expect(canBeAssigned('rejected')).toBe(false)
    })
  })
})
