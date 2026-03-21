import { describe, it, expect, vi } from 'vitest'
import {
  calculateNextRetryAt,
  schedulePaymentRetry,
  getRetryablePayments,
  clearPaymentRetryFields,
  markPaymentFailedFinal,
  formatRetryDelay,
  DEFAULT_RETRY_CONFIG,
} from '@/lib/services/payment-retry.service'

describe('payment-retry.service', () => {
  describe('calculateNextRetryAt', () => {
    it('calculates correct delays for exponential backoff', () => {
      const now = Date.now()

      const retry0 = calculateNextRetryAt(0)
      expect(retry0).not.toBeNull()
      expect(retry0!.getTime()).toBeGreaterThanOrEqual(now + 60 * 60 * 1000 - 1000)
      expect(retry0!.getTime()).toBeLessThanOrEqual(now + 60 * 60 * 1000 + 1000)

      const retry1 = calculateNextRetryAt(1)
      expect(retry1).not.toBeNull()
      expect(retry1!.getTime()).toBeGreaterThanOrEqual(now + 6 * 60 * 60 * 1000 - 1000)
      expect(retry1!.getTime()).toBeLessThanOrEqual(now + 6 * 60 * 60 * 1000 + 1000)

      const retry2 = calculateNextRetryAt(2)
      expect(retry2).not.toBeNull()
      expect(retry2!.getTime()).toBeGreaterThanOrEqual(now + 24 * 60 * 60 * 1000 - 1000)
      expect(retry2!.getTime()).toBeLessThanOrEqual(now + 24 * 60 * 60 * 1000 + 1000)
    })

    it('returns null when max retries exceeded', () => {
      const result = calculateNextRetryAt(3)
      expect(result).toBeNull()
    })

    it('uses last delay for retries beyond configured delays', () => {
      const config = { maxRetries: 5, retryDelaysMs: [1000, 2000] }
      const retry3 = calculateNextRetryAt(3, config)
      expect(retry3).not.toBeNull()
      expect(retry3!.getTime() - Date.now()).toBeGreaterThanOrEqual(2000 - 100)
    })
  })

  describe('formatRetryDelay', () => {
    it('formats retry delays correctly', () => {
      expect(formatRetryDelay(1)).toBe('1 hour')
      expect(formatRetryDelay(2)).toBe('6 hours')
      expect(formatRetryDelay(3)).toBe('24 hours')
      expect(formatRetryDelay(4)).toBe('24 hours')
    })
  })

  describe('schedulePaymentRetry', () => {
    it('schedules first retry correctly', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { payment_retry_count: 0 },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      }

      const result = await schedulePaymentRetry(mockSupabase as unknown as Parameters<typeof schedulePaymentRetry>[0], 'ticket-1', 'Card declined')

      expect(result.success).toBe(true)
      expect(result.nextRetryAt).toBeDefined()
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_retry_count: 1,
          payment_last_error: 'Card declined',
        })
      )
    })

    it('fails when ticket not found', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      }

      const result = await schedulePaymentRetry(mockSupabase as unknown as Parameters<typeof schedulePaymentRetry>[0], 'ticket-1', 'Card declined')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Ticket not found')
    })

    it('fails when max retries exceeded', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { payment_retry_count: 3 },
          error: null,
        }),
      }

      const result = await schedulePaymentRetry(mockSupabase as unknown as Parameters<typeof schedulePaymentRetry>[0], 'ticket-1', 'Card declined')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Max retries exceeded')
    })
  })

  describe('getRetryablePayments', () => {
    it('fetches retryable payments correctly', async () => {
      const mockPayments = [
        { id: 'ticket-1', title: 'Test 1', payment_retry_count: 1, stripe_invoice_id: 'inv-1' },
        { id: 'ticket-2', title: 'Test 2', payment_retry_count: 2, stripe_invoice_id: 'inv-2' },
      ]

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockPayments,
          error: null,
        }),
      }

      const result = await getRetryablePayments(mockSupabase as unknown as Parameters<typeof getRetryablePayments>[0])

      expect(result.data).toHaveLength(2)
      expect(result.error).toBeUndefined()
    })

    it('handles errors gracefully', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }

      const result = await getRetryablePayments(mockSupabase as unknown as Parameters<typeof getRetryablePayments>[0])

      expect(result.data).toEqual([])
      expect(result.error).toBe('Database error')
    })
  })

  describe('clearPaymentRetryFields', () => {
    it('clears all retry fields', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      const result = await clearPaymentRetryFields(mockSupabase as unknown as Parameters<typeof clearPaymentRetryFields>[0], 'ticket-1')

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith({
        payment_retry_count: 0,
        payment_next_retry_at: null,
        payment_last_error: null,
        payment_failed_at: null,
      })
    })

    it('handles update errors', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      }

      const result = await clearPaymentRetryFields(mockSupabase as unknown as Parameters<typeof clearPaymentRetryFields>[0], 'ticket-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })

  describe('markPaymentFailedFinal', () => {
    it('marks payment as final failed', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      const result = await markPaymentFailedFinal(mockSupabase as unknown as Parameters<typeof markPaymentFailedFinal>[0], 'ticket-1')

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_failed_at: expect.any(String),
        })
      )
    })

    it('handles update errors', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      }

      const result = await markPaymentFailedFinal(mockSupabase as unknown as Parameters<typeof markPaymentFailedFinal>[0], 'ticket-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })

  describe('DEFAULT_RETRY_CONFIG', () => {
    it('has correct default values', () => {
      expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3)
      expect(DEFAULT_RETRY_CONFIG.retryDelaysMs).toHaveLength(3)
      expect(DEFAULT_RETRY_CONFIG.retryDelaysMs[0]).toBe(60 * 60 * 1000) // 1 hour
      expect(DEFAULT_RETRY_CONFIG.retryDelaysMs[1]).toBe(6 * 60 * 60 * 1000) // 6 hours
      expect(DEFAULT_RETRY_CONFIG.retryDelaysMs[2]).toBe(24 * 60 * 60 * 1000) // 24 hours
    })
  })
})
