import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

export interface PaymentRetryConfig {
  maxRetries: number
  retryDelaysMs: number[]
}

export const DEFAULT_RETRY_CONFIG: PaymentRetryConfig = {
  maxRetries: 3,
  retryDelaysMs: [
    60 * 60 * 1000,
    6 * 60 * 60 * 1000,
    24 * 60 * 60 * 1000,
  ],
}

export interface RetryablePayment {
  id: string
  title: string
  organization_id: string
  payment_retry_count: number
  stripe_invoice_id: string | null
}

export function calculateNextRetryAt(
  retryCount: number,
  config: PaymentRetryConfig = DEFAULT_RETRY_CONFIG
): Date | null {
  if (retryCount >= config.maxRetries) {
    return null
  }

  const delayMs = config.retryDelaysMs[retryCount] ?? config.retryDelaysMs[config.retryDelaysMs.length - 1]
  return new Date(Date.now() + delayMs)
}

export async function schedulePaymentRetry(
  supabase: SupabaseClient,
  ticketId: string,
  error: string,
  config: PaymentRetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{ success: boolean; nextRetryAt?: Date; error?: string }> {
  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('payment_retry_count')
    .eq('id', ticketId)
    .single()

  if (fetchError || !ticket) {
    logger.error('Failed to fetch ticket for retry scheduling', {
      context: 'payment-retry',
      ticketId,
      error: fetchError?.message,
    })
    return { success: false, error: 'Ticket not found' }
  }

  const newRetryCount = ticket.payment_retry_count + 1

  if (newRetryCount > config.maxRetries) {
    return { success: false, error: 'Max retries exceeded' }
  }

  const nextRetryAt = calculateNextRetryAt(ticket.payment_retry_count, config)

  const updateData: Record<string, unknown> = {
    payment_retry_count: newRetryCount,
    payment_last_error: error,
  }

  if (nextRetryAt) {
    updateData.payment_next_retry_at = nextRetryAt.toISOString()
  }

  const { error: updateError } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', ticketId)

  if (updateError) {
    logger.error('Failed to schedule payment retry', {
      context: 'payment-retry',
      ticketId,
      error: updateError.message,
    })
    return { success: false, error: updateError.message }
  }

  logger.info('Payment retry scheduled', {
    context: 'payment-retry',
    ticketId,
    retryCount: newRetryCount,
    nextRetryAt,
  })

  return { success: true, nextRetryAt: nextRetryAt ?? undefined }
}

export async function getRetryablePayments(
  supabase: SupabaseClient
): Promise<{ data: RetryablePayment[]; error?: string }> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('tickets')
    .select('id, title, organization_id, payment_retry_count, stripe_invoice_id')
    .eq('status', 'invoiced')
    .gt('payment_retry_count', 0)
    .lte('payment_next_retry_at', now)
    .order('payment_next_retry_at', { ascending: true })

  if (error) {
    logger.error('Failed to fetch retryable payments', {
      context: 'payment-retry',
      error: error.message,
    })
    return { data: [], error: error.message }
  }

  return { data: data || [] }
}

export async function clearPaymentRetryFields(
  supabase: SupabaseClient,
  ticketId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('tickets')
    .update({
      payment_retry_count: 0,
      payment_next_retry_at: null,
      payment_last_error: null,
      payment_failed_at: null,
    })
    .eq('id', ticketId)

  if (error) {
    logger.error('Failed to clear payment retry fields', {
      context: 'payment-retry',
      ticketId,
      error: error.message,
    })
    return { success: false, error: error.message }
  }

  logger.info('Payment retry fields cleared', {
    context: 'payment-retry',
    ticketId,
  })

  return { success: true }
}

export async function markPaymentFailedFinal(
  supabase: SupabaseClient,
  ticketId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('tickets')
    .update({
      payment_failed_at: new Date().toISOString(),
    })
    .eq('id', ticketId)

  if (error) {
    logger.error('Failed to mark payment as final failed', {
      context: 'payment-retry',
      ticketId,
      error: error.message,
    })
    return { success: false, error: error.message }
  }

  logger.info('Payment marked as final failed', {
    context: 'payment-retry',
    ticketId,
  })

  return { success: true }
}

export function formatRetryDelay(retryCount: number): string {
  const delays = ['1 hour', '6 hours', '24 hours']
  return delays[retryCount - 1] ?? '24 hours'
}
