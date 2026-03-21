import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock provider
const mockTrack = vi.fn()
const mockIdentify = vi.fn()
vi.mock('@/lib/integrations/analytics/provider', () => ({
  getAnalyticsProvider: () => ({
    track: mockTrack,
    identify: mockIdentify,
  }),
}))

import { trackEvent, identifyUser, ANALYTICS_EVENTS } from '@/lib/integrations/analytics/events'

describe('trackEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tracks ticket_created with correct properties', () => {
    trackEvent(ANALYTICS_EVENTS.TICKET_CREATED, {
      ticketId: 'ticket-1',
      category: 'crm_import',
    })
    expect(mockTrack).toHaveBeenCalledWith('ticket_created', {
      ticketId: 'ticket-1',
      category: 'crm_import',
    })
  })

  it('tracks ticket_status_changed', () => {
    trackEvent(ANALYTICS_EVENTS.TICKET_STATUS_CHANGED, {
      ticketId: 'ticket-2',
      from: 'draft',
      to: 'submitted',
    })
    expect(mockTrack).toHaveBeenCalledWith('ticket_status_changed', {
      ticketId: 'ticket-2',
      from: 'draft',
      to: 'submitted',
    })
  })

  it('tracks payment_succeeded', () => {
    trackEvent(ANALYTICS_EVENTS.PAYMENT_SUCCEEDED, {
      ticketId: 'ticket-3',
      amount: 499,
      currency: 'usd',
    })
    expect(mockTrack).toHaveBeenCalledWith('payment_succeeded', {
      ticketId: 'ticket-3',
      amount: 499,
      currency: 'usd',
    })
  })

  it('tracks payment_failed', () => {
    trackEvent(ANALYTICS_EVENTS.PAYMENT_FAILED, {
      ticketId: 'ticket-4',
      invoiceId: 'in_123',
    })
    expect(mockTrack).toHaveBeenCalledWith('payment_failed', {
      ticketId: 'ticket-4',
      invoiceId: 'in_123',
    })
  })
})

describe('identifyUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('identifies user with traits', () => {
    identifyUser('user-abc', { role: 'admin', organizationId: 'org-1' })
    expect(mockIdentify).toHaveBeenCalledWith('user-abc', {
      role: 'admin',
      organizationId: 'org-1',
    })
  })

  it('identifies user without traits', () => {
    identifyUser('user-xyz')
    expect(mockIdentify).toHaveBeenCalledWith('user-xyz', undefined)
  })
})
