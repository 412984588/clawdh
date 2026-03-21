import { describe, it, expect } from 'vitest'
import { constructWebhookEvent } from '@/lib/integrations/stripe/webhooks'

// setup.ts sets INTEGRATION_MODE=mock, so env.INTEGRATION_MODE === 'mock'

const validEvent = {
  type: 'invoice.paid',
  data: {
    object: {
      id: 'in_test_123',
      metadata: { ticket_id: 'ticket-uuid' },
      status: 'paid',
      amount_paid: 50000,
      currency: 'usd',
    },
  },
}

describe('constructWebhookEvent (mock mode)', () => {
  it('parses a valid JSON payload without signature verification', async () => {
    const event = await constructWebhookEvent(JSON.stringify(validEvent), 'any-sig')
    expect(event.type).toBe('invoice.paid')
    expect(event.data.object.id).toBe('in_test_123')
    expect(event.data.object.amount_paid).toBe(50000)
  })

  it('returns metadata from the parsed event', async () => {
    const event = await constructWebhookEvent(JSON.stringify(validEvent), '')
    expect(event.data.object.metadata?.ticket_id).toBe('ticket-uuid')
  })

  it('throws on invalid JSON', async () => {
    await expect(constructWebhookEvent('not-json', '')).rejects.toThrow()
  })

  it('parses invoice.payment_failed event with status and amount', async () => {
    const failedEvent = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_failed_456',
          metadata: { ticket_id: 'ticket-uuid-2' },
          status: 'open',
          amount_paid: 0,
          currency: 'usd',
        },
      },
    }
    const event = await constructWebhookEvent(JSON.stringify(failedEvent), 'sig')
    expect(event.type).toBe('invoice.payment_failed')
    expect(event.data.object.id).toBe('in_failed_456')
    expect(event.data.object.status).toBe('open')
    expect(event.data.object.amount_paid).toBe(0)
  })

  it('parses charge.refunded event with customer field', async () => {
    const refundedEvent = {
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_refund_789',
          metadata: { ticket_id: 'ticket-uuid-3' },
          customer: 'cus_test_abc',
          currency: 'usd',
        },
      },
    }
    const event = await constructWebhookEvent(JSON.stringify(refundedEvent), 'sig')
    expect(event.type).toBe('charge.refunded')
    expect(event.data.object.customer).toBe('cus_test_abc')
  })

  it('parsing the same payload twice yields identical results (idempotency)', async () => {
    const payload = JSON.stringify(validEvent)
    const first = await constructWebhookEvent(payload, 'any-sig')
    const second = await constructWebhookEvent(payload, 'any-sig')
    expect(first.type).toBe(second.type)
    expect(first.data.object.id).toBe(second.data.object.id)
    expect(first.data.object.amount_paid).toBe(second.data.object.amount_paid)
  })
})
