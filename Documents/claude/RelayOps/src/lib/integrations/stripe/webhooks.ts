import { env } from '@/lib/config/env'

// Minimal shape we actually use from Stripe webhook events
export interface WebhookEvent {
  type: string
  data: {
    object: {
      id: string
      metadata?: Record<string, string>
      status?: string
      // Stripe sends amounts in cents
      amount_paid?: number
      currency?: string
      customer?: string
    }
  }
}

export async function constructWebhookEvent(
  payload: string,
  signature: string
): Promise<WebhookEvent> {
  // Mock mode: parse the raw JSON body directly (no signature verification)
  if (env.INTEGRATION_MODE === 'mock') {
    return JSON.parse(payload) as WebhookEvent
  }

  // 空签名直接拒绝 — 不浪费 constructEvent 的计算
  if (!signature) {
    throw new Error('Missing stripe-signature header')
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  const { getStripeClient } = await import('./client')
  const stripe = getStripeClient()

  const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET)
  return event as unknown as WebhookEvent
}
