import { describe, it, expect, vi } from 'vitest'
import { createStripeInvoicing } from '@/lib/integrations/stripe/invoicing'

// setup.ts sets INTEGRATION_MODE=mock → createStripeInvoicing returns MockStripeInvoicing

const params = {
  stripeCustomerId: 'cus_mock_123',
  ticketId: 'ticket-uuid-001',
  ticketTitle: 'Build new website',
  amountDollars: 299,
  organizationName: 'Acme Corp',
}

describe('createStripeInvoicing (mock mode)', () => {
  it('returns an object with createAndSendInvoice and voidInvoice methods', () => {
    const invoicing = createStripeInvoicing()
    expect(typeof invoicing.createAndSendInvoice).toBe('function')
    expect(typeof invoicing.voidInvoice).toBe('function')
  })

  it('createAndSendInvoice returns invoiceId, invoiceUrl, hostedUrl', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const invoicing = createStripeInvoicing()
    const result = await invoicing.createAndSendInvoice(params)
    expect(result.invoiceId).toMatch(/in_mock_/)
    expect(result.invoiceUrl).toContain(params.ticketId)
    expect(result.hostedUrl).toBeTruthy()
    consoleSpy.mockRestore()
  })

  it('voidInvoice resolves without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const invoicing = createStripeInvoicing()
    await expect(invoicing.voidInvoice('in_mock_xxx')).resolves.toBeUndefined()
    consoleSpy.mockRestore()
  })
})
