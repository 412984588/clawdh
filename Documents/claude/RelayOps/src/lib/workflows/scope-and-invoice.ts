import type { SupabaseClient } from '@supabase/supabase-js'
import { createStripeInvoicing } from '@/lib/integrations/stripe/invoicing'
import { transitionTicket } from '@/lib/state-machine/engine'
import type { PricingTier } from '@/lib/types/enums'
import { notifyTicketEvent } from '@/lib/services/notification.service'

interface ScopeAndInvoiceParams {
  ticketId: string
  priceDollars: number
  adminId: string
  adminRole: 'admin'
}

interface ScopeAndInvoiceResult {
  success: boolean
  invoiceUrl?: string
  error?: string
}

// Derive pricing tier from dollar amount
// 定价层边界与前端展示起价对齐：Standard $399+, Complex $899+, Custom $1,300+
function derivePricingTier(dollars: number): PricingTier {
  if (dollars <= 149) return 'pilot'
  if (dollars <= 499) return 'standard'
  if (dollars <= 1299) return 'complex'
  return 'custom'
}

export async function scopeAndInvoiceWorkflow(
  supabase: SupabaseClient,
  params: ScopeAndInvoiceParams
): Promise<ScopeAndInvoiceResult> {
  // 1. Fetch ticket + validate current state
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, title, organization_id, status')
    .eq('id', params.ticketId)
    .single()

  if (!ticket) return { success: false, error: 'Ticket not found' }

  if (ticket.status !== 'needs_scope_review') {
    return {
      success: false,
      error: `Ticket is in "${ticket.status}" state, expected needs_scope_review`,
    }
  }

  // 2. Fetch organization (stripe_customer_id may be null in dev/mock)
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, stripe_customer_id')
    .eq('id', ticket.organization_id)
    .single()

  if (!org) return { success: false, error: 'Organization not found' }

  // 3. Create Stripe invoice (mock or live)
  const invoicing = createStripeInvoicing()
  let invoiceResult: { invoiceId: string; hostedUrl: string }

  if (!org.stripe_customer_id) {
    // Graceful fallback for dev: no real Stripe customer yet
    invoiceResult = {
      invoiceId: `in_mock_${Date.now()}`,
      hostedUrl: `https://invoice.stripe.com/i/mock_${params.ticketId}`,
    }
  } else {
    invoiceResult = await invoicing.createAndSendInvoice({
      stripeCustomerId: org.stripe_customer_id,
      ticketId: params.ticketId,
      ticketTitle: ticket.title,
      amountDollars: params.priceDollars,
      organizationName: org.name,
    })
  }

  // 4. Persist invoice details + pricing tier on the ticket
  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      stripe_invoice_id: invoiceResult.invoiceId,
      invoice_url: invoiceResult.hostedUrl,
      pricing_tier: derivePricingTier(params.priceDollars),
    })
    .eq('id', params.ticketId)

  if (updateError) return { success: false, error: 'Failed to save invoice details' }

  // 5a. Transition: needs_scope_review → scope_locked
  const scopeLockResult = await transitionTicket(
    supabase,
    params.ticketId,
    'scope_locked',
    { id: params.adminId, role: params.adminRole },
    { price_dollars: params.priceDollars }
  )

  if (!scopeLockResult.success) return { success: false, error: scopeLockResult.error }

  // 5b. Transition: scope_locked → invoiced
  const invoicedResult = await transitionTicket(
    supabase,
    params.ticketId,
    'invoiced',
    { id: params.adminId, role: params.adminRole },
    { invoice_id: invoiceResult.invoiceId }
  )

  if (!invoicedResult.success) return { success: false, error: invoicedResult.error }

  // 6. 通知：发票已生成
  await notifyTicketEvent(supabase, params.ticketId, 'invoice_generated', {
    invoice_url: invoiceResult.hostedUrl,
    amount: `$${params.priceDollars}`,
  })

  return { success: true, invoiceUrl: invoiceResult.hostedUrl }
}
