import { env } from '@/lib/config/env'

interface CreateInvoiceParams {
  stripeCustomerId: string
  ticketId: string
  ticketTitle: string
  amountDollars: number
  organizationName: string
}

interface InvoiceResult {
  invoiceId: string
  invoiceUrl: string
  hostedUrl: string
}

// Mock implementation — used when INTEGRATION_MODE=mock
class MockStripeInvoicing {
  async createAndSendInvoice(params: CreateInvoiceParams): Promise<InvoiceResult> {
    const fakeId = `in_mock_${Date.now()}`
    const fakeUrl = `https://invoice.stripe.com/i/mock_${params.ticketId}`
    console.warn(
      `[MOCK STRIPE] Created invoice for ticket ${params.ticketId}: $${params.amountDollars}`
    )
    return {
      invoiceId: fakeId,
      invoiceUrl: fakeUrl,
      hostedUrl: fakeUrl,
    }
  }

  async voidInvoice(stripeInvoiceId: string): Promise<void> {
    console.warn(`[MOCK STRIPE] Voided invoice ${stripeInvoiceId}`)
  }
}

// Live implementation — used when INTEGRATION_MODE=live
class LiveStripeInvoicing {
  async createAndSendInvoice(params: CreateInvoiceParams): Promise<InvoiceResult> {
    const { getStripeClient } = await import('./client')
    const stripe = getStripeClient()

    // Create line-item on the customer
    await stripe.invoiceItems.create({
      customer: params.stripeCustomerId,
      // Stripe operates in cents; convert dollars at the integration boundary
      amount: Math.round(params.amountDollars * 100),
      currency: 'usd',
      description: `RelayOps Job: ${params.ticketTitle}`,
      metadata: { ticket_id: params.ticketId },
    })

    // Create the invoice shell
    const invoice = await stripe.invoices.create({
      customer: params.stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: { ticket_id: params.ticketId },
      // Let Stripe auto-advance through draft → open
      auto_advance: true,
    })

    // Finalise and dispatch the hosted invoice email
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
    await stripe.invoices.sendInvoice(invoice.id)

    return {
      invoiceId: invoice.id,
      invoiceUrl: finalized.hosted_invoice_url ?? '',
      hostedUrl: finalized.hosted_invoice_url ?? '',
    }
  }

  async voidInvoice(stripeInvoiceId: string): Promise<void> {
    const { getStripeClient } = await import('./client')
    const stripe = getStripeClient()
    await stripe.invoices.voidInvoice(stripeInvoiceId)
  }
}

export function createStripeInvoicing(): MockStripeInvoicing | LiveStripeInvoicing {
  if (env.INTEGRATION_MODE === 'mock') return new MockStripeInvoicing()
  return new LiveStripeInvoicing()
}
