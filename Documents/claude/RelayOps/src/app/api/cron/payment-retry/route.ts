import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRetryablePayments, markPaymentFailedFinal, formatRetryDelay } from '@/lib/services/payment-retry.service'
import { handlePaymentWorkflow } from '@/lib/workflows/handle-payment'
import { createEmailProvider } from '@/lib/integrations/email/provider'
import * as templates from '@/lib/integrations/email/templates'
import { env } from '@/lib/config/env'
import { timingSafeCompare } from '@/lib/utils/crypto'
import { logger } from '@/lib/utils/logger'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  if (!env.CRON_SECRET || !timingSafeCompare(secret, env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const email = await createEmailProvider()
  const results = { processed: 0, succeeded: 0, failed: 0, dead_lettered: 0, emails_sent: 0, errors: [] as string[] }

  const { data: retryablePayments, error: fetchError } = await getRetryablePayments(supabase)

  if (fetchError) {
    results.errors.push(fetchError)
    return NextResponse.json(results, { status: 500 })
  }

  for (const ticket of retryablePayments ?? []) {
    try {
      results.processed++

      // Fetch ticket details for notification
      const { data: ticketDetails } = await supabase
        .from('tickets')
        .select('title, stripe_invoice_id, organizations(name, users(email))')
        .eq('id', ticket.id)
        .single()

      if (!ticketDetails?.stripe_invoice_id) {
        results.errors.push(`Ticket ${ticket.id} has no stripe_invoice_id`)
        continue
      }

      // In mock mode, simulate the retry check
      // In live mode, would call Stripe API to check payment status
      const isPaid = false // Placeholder - would check Stripe

      if (isPaid) {
        // Payment succeeded - process through workflow
        const paymentResult = await handlePaymentWorkflow({
          stripeInvoiceId: ticketDetails.stripe_invoice_id,
          amountPaidDollars: 0, // Would get from Stripe
          currency: 'usd',
          stripeCustomerId: '', // Would get from Stripe
        })

        if (paymentResult.success) {
          results.succeeded++
        } else {
          results.failed++
          results.errors.push(`Payment workflow failed for ${ticket.id}: ${paymentResult.error}`)
        }
      } else {
        // Payment still failed - schedule next retry or dead letter
        if (ticket.payment_retry_count >= 3) {
          // Max retries reached - dead letter
          await markPaymentFailedFinal(supabase, ticket.id)
          results.dead_lettered++

          // Send dead letter notification to partner and admin
          try {
            const org = Array.isArray(ticketDetails.organizations)
              ? ticketDetails.organizations[0]
              : ticketDetails.organizations
            const partnerEmail = org?.users?.[0]?.email
            const adminEmail = env.ADMIN_NOTIFICATION_EMAIL ?? env.EMAIL_FROM

            if (partnerEmail) {
              const tpl = templates.paymentFailedFinalEmail({
                partnerName: org?.name ?? 'Partner',
                ticketTitle: ticketDetails.title,
                ticketUrl: `${env.NEXT_PUBLIC_APP_URL}/partner/tickets/${ticket.id}`,
                adminEmail: adminEmail ?? 'support@relayops.app',
              })
              await email.send({ to: partnerEmail, ...tpl })
              results.emails_sent++
            }

            if (adminEmail) {
              const adminTpl = templates.paymentFailedFinalEmail({
                partnerName: 'Admin',
                ticketTitle: ticketDetails.title,
                ticketUrl: `${env.NEXT_PUBLIC_APP_URL}/admin/tickets/${ticket.id}`,
                adminEmail: adminEmail,
              })
              await email.send({ to: adminEmail, ...adminTpl })
            }
          } catch (emailErr) {
            Sentry.captureException(emailErr, { extra: { ticketId: ticket.id, phase: 'dead-letter-email' } })
          }
        } else {
          // Will be retried again by webhook on next Stripe failure
          results.failed++
          logger.info(`Payment retry ${ticket.payment_retry_count} failed for ticket ${ticket.id}, will retry again`, {
            context: 'payment-retry-cron',
            ticketId: ticket.id,
            retryCount: ticket.payment_retry_count,
          })

          // Send retry notification
          try {
            const org = Array.isArray(ticketDetails.organizations)
              ? ticketDetails.organizations[0]
              : ticketDetails.organizations
            const partnerEmail = org?.users?.[0]?.email

            if (partnerEmail) {
              const tpl = templates.paymentRetryEmail({
                partnerName: org?.name ?? 'Partner',
                ticketTitle: ticketDetails.title,
                ticketUrl: `${env.NEXT_PUBLIC_APP_URL}/partner/tickets/${ticket.id}`,
                retryCount: ticket.payment_retry_count,
                nextRetryIn: formatRetryDelay(ticket.payment_retry_count + 1),
              })
              await email.send({ to: partnerEmail, ...tpl })
              results.emails_sent++
            }
          } catch (emailErr) {
            Sentry.captureException(emailErr, { extra: { ticketId: ticket.id, phase: 'retry-email' } })
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e, { extra: { ticketId: ticket.id, phase: 'payment-retry' } })
      results.errors.push(String(e))
      results.failed++
    }
  }

  await Sentry.flush(2000)

  const hasErrors = results.errors.length > 0
  const hasSuccesses = results.succeeded > 0 || results.dead_lettered > 0

  if (hasErrors && !hasSuccesses) {
    return NextResponse.json(results, { status: 500 })
  }
  if (hasErrors && hasSuccesses) {
    return NextResponse.json(results, { status: 207 })
  }

  return NextResponse.json(results)
}
