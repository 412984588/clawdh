import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createMockSupabase, ok } from '../helpers/mock-supabase'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scopeAndInvoiceWorkflow } from '@/lib/workflows/scope-and-invoice'
import { scopeAndInvoiceTicket } from '@/lib/actions/billing.actions'

vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/workflows/scope-and-invoice', () => ({ scopeAndInvoiceWorkflow: vi.fn() }))

const TICKET_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

describe('billing.actions', () => {
  let mockServer: ReturnType<typeof createMockSupabase>
  let mockAdmin: ReturnType<typeof createMockSupabase>

  beforeEach(() => {
    mockServer = createMockSupabase()
    mockAdmin = createMockSupabase()
    vi.mocked(createServerClient).mockResolvedValue(mockServer as any)
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as any)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('scopeAndInvoiceTicket', () => {
    it('returns validation error for invalid input', async () => {
      const result = await scopeAndInvoiceTicket({})
      expect(result.success).toBe(false)
    })

    it('returns Unauthorized when not authenticated', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const result = await scopeAndInvoiceTicket({ ticketId: TICKET_ID, priceDollars: 299 })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns Unauthorized when user is not admin', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'user-1', role: 'partner' }))

      const result = await scopeAndInvoiceTicket({ ticketId: TICKET_ID, priceDollars: 299 })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })

    it('returns invoiceUrl on success', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'admin-1', role: 'admin' }))
      vi.mocked(scopeAndInvoiceWorkflow).mockResolvedValue({
        success: true,
        invoiceUrl: 'https://invoice.example.com/123',
      } as any)

      const result = await scopeAndInvoiceTicket({ ticketId: TICKET_ID, priceDollars: 299 })
      expect(result.success).toBe(true)
      expect((result as any).data?.invoiceUrl).toBe('https://invoice.example.com/123')
    })

    it('returns workflow error on failure', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'admin-1', role: 'admin' }))
      vi.mocked(scopeAndInvoiceWorkflow).mockResolvedValue({
        success: false,
        error: 'Ticket not in correct state',
      } as any)

      const result = await scopeAndInvoiceTicket({ ticketId: TICKET_ID, priceDollars: 299 })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Ticket not in correct state')
    })

    it('coerces string priceDollars to number', async () => {
      mockServer.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
      mockAdmin.from.mockReturnValueOnce(ok({ id: 'admin-1', role: 'admin' }))
      vi.mocked(scopeAndInvoiceWorkflow).mockResolvedValue({
        success: true,
        invoiceUrl: 'https://invoice.example.com/123',
      } as any)

      // Schema uses z.coerce.number() so string '299' should be valid
      const result = await scopeAndInvoiceTicket({ ticketId: TICKET_ID, priceDollars: '299' })
      expect(result.success).toBe(true)
    })
  })
})
