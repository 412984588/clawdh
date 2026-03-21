import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/integrations/stripe/webhooks'
import { handlePaymentWorkflow } from '@/lib/workflows/handle-payment'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyTicketEvent } from '@/lib/services/notification.service'
import { schedulePaymentRetry } from '@/lib/services/payment-retry.service'
import { logger } from '@/lib/utils/logger'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/integrations/analytics/events'

// Stripe sends the raw body as a string for signature verification —
// disable Next.js body parsing so we receive it as text.
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  let event: Awaited<ReturnType<typeof constructWebhookEvent>>

  try {
    event = await constructWebhookEvent(payload, signature)
  } catch (err) {
    logger.error('Invalid signature or payload', { context: 'stripe-webhook', error: err })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── invoice.paid ──────────────────────────────────────────────────────────
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object
    // Stripe sends amounts in cents; convert to dollars at the boundary
    const amountPaid = (invoice.amount_paid ?? 0) / 100
    const currency = invoice.currency ?? 'usd'
    const customerId = invoice.customer ?? ''

    try {
      const result = await handlePaymentWorkflow({
        stripeInvoiceId: invoice.id,
        amountPaidDollars: amountPaid,
        currency,
        stripeCustomerId: customerId,
      })

      if (!result.success) {
        logger.error('Payment processing failed', { context: 'stripe-webhook', error: result.error })
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

    } catch (err) {
      logger.error('Unexpected error processing invoice.paid', { context: 'stripe-webhook', error: err })
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
  }

  // ── invoice.payment_failed ────────────────────────────────────────────────
  // Stripe 会自动重试失败的支付，应用层调度指数退避重试
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const stripeInvoiceId = invoice.id
    const errorMessage = ((invoice as unknown as Record<string, unknown>)?.last_payment_error as { message?: string } | undefined)?.message ?? 'Payment failed'

    logger.warn(`Payment failed for invoice ${stripeInvoiceId}`, { context: 'stripe-webhook' })

    trackEvent(ANALYTICS_EVENTS.PAYMENT_FAILED, {
      ticketId: stripeInvoiceId, // 此时还不知道 ticketId，用 invoiceId 暂代
      invoiceId: stripeInvoiceId,
    })

    try {
      const admin = createAdminClient()
      const { data: ticket } = await admin
        .from('tickets')
        .select('id, status')
        .eq('stripe_invoice_id', stripeInvoiceId)
        .single()

      if (!ticket) {
        logger.warn(`No ticket found for failed invoice ${stripeInvoiceId}`, { context: 'stripe-webhook' })
        return NextResponse.json({ received: true })
      }

      // Only schedule retry if ticket is still in invoiced status
      if (ticket.status !== 'invoiced') {
        logger.info(`Skipping retry scheduling for ticket ${ticket.id} with status ${ticket.status}`, {
          context: 'stripe-webhook',
        })
        return NextResponse.json({ received: true })
      }

      // Schedule payment retry with exponential backoff
      const retryResult = await schedulePaymentRetry(admin, ticket.id, errorMessage)

      if (retryResult.success) {
        logger.info(`Payment retry scheduled for ticket ${ticket.id}`, {
          context: 'stripe-webhook',
          nextRetryAt: retryResult.nextRetryAt,
        })
      } else {
        logger.error(`Failed to schedule payment retry for ticket ${ticket.id}`, {
          context: 'stripe-webhook',
          error: retryResult.error,
        })
      }

      // Send payment failed notification (only once per failure)
      const { data: existingFailureNotice } = await admin
        .from('ticket_events')
        .select('id')
        .eq('ticket_id', ticket.id)
        .eq('event_type', 'payment_failed_notification_sent')
        .maybeSingle()

      if (!existingFailureNotice) {
        await notifyTicketEvent(admin, ticket.id, 'payment_failed', {
          stripe_invoice_id: stripeInvoiceId,
        })

        await admin.from('ticket_events').insert({
          ticket_id: ticket.id,
          actor_role: 'admin',
          event_type: 'payment_failed_notification_sent',
          payload_json: {
            stripe_invoice_id: stripeInvoiceId,
          },
        })
      }
    } catch (err) {
      // 通知失败不应阻止 200 响应 — Stripe 会重复投递，而且支付重试独立于通知
      logger.error('Error handling invoice.payment_failed', { context: 'stripe-webhook', error: err })
    }
  }

  return NextResponse.json({ received: true })
}
