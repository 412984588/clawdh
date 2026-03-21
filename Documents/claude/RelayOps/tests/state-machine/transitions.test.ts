import { describe, it, expect } from 'vitest'
import { VALID_TRANSITIONS, TRANSITION_ROLE_GUARDS } from '@/lib/state-machine/transitions'
import type { TicketStatus } from '@/lib/types/enums'

describe('VALID_TRANSITIONS', () => {
  it('all TicketStatus keys are present', () => {
    const expectedStatuses: TicketStatus[] = [
      'draft', 'submitted', 'needs_scope_review', 'scope_locked',
      'invoiced', 'paid', 'queued', 'assigned', 'in_progress',
      'submitted_for_review', 'revision_requested', 'approved', 'disputed',
      'completed', 'resolved', 'expired', 'admin_closed_no_response', 'cancelled',
    ]
    for (const status of expectedStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status)
    }
  })

  it('terminal states have no transitions', () => {
    const terminalStates: TicketStatus[] = [
      'completed', 'resolved', 'expired', 'admin_closed_no_response', 'cancelled',
    ]
    for (const status of terminalStates) {
      expect(VALID_TRANSITIONS[status]).toEqual([])
    }
  })

  it('draft can go to submitted and cancelled', () => {
    expect(VALID_TRANSITIONS.draft).toContain('submitted')
    expect(VALID_TRANSITIONS.draft).toContain('cancelled')
  })

  it('submitted cannot skip directly to scope_locked', () => {
    expect(VALID_TRANSITIONS.submitted).not.toContain('scope_locked')
  })

  it('invoiced can go to paid, expired, or cancelled', () => {
    expect(VALID_TRANSITIONS.invoiced).toContain('paid')
    expect(VALID_TRANSITIONS.invoiced).toContain('expired')
    expect(VALID_TRANSITIONS.invoiced).toContain('cancelled')
  })

  it('approved can lead to completed or disputed', () => {
    expect(VALID_TRANSITIONS.approved).toContain('completed')
    expect(VALID_TRANSITIONS.approved).toContain('disputed')
  })
})

describe('TRANSITION_ROLE_GUARDS', () => {
  it('only admin can move submitted to needs_scope_review', () => {
    const roles = TRANSITION_ROLE_GUARDS.submitted?.needs_scope_review
    expect(roles).toEqual(['admin'])
  })

  it('partner and admin can submit a draft ticket', () => {
    const roles = TRANSITION_ROLE_GUARDS.draft?.submitted
    expect(roles).toContain('partner')
    expect(roles).toContain('admin')
    expect(roles).not.toContain('worker_internal')
  })

  it('worker_internal can move assigned ticket to in_progress', () => {
    const roles = TRANSITION_ROLE_GUARDS.assigned?.in_progress
    expect(roles).toContain('worker_internal')
  })

  it('partner can approve submitted_for_review', () => {
    const roles = TRANSITION_ROLE_GUARDS.submitted_for_review?.approved
    expect(roles).toContain('partner')
  })

  it('partner can request revision on submitted_for_review', () => {
    const roles = TRANSITION_ROLE_GUARDS.submitted_for_review?.revision_requested
    expect(roles).toContain('partner')
    expect(roles).toContain('admin')
  })

  it('only admin can resolve a disputed ticket', () => {
    const roles = TRANSITION_ROLE_GUARDS.disputed?.resolved
    expect(roles).toEqual(['admin'])
  })
})

describe('VALID_TRANSITIONS — illegal jump assertions (all must be false)', () => {
  it('draft cannot jump directly to paid', () => {
    expect(VALID_TRANSITIONS.draft).not.toContain('paid')
  })

  it('submitted cannot jump to completed', () => {
    expect(VALID_TRANSITIONS.submitted).not.toContain('completed')
  })

  it('assigned cannot jump to completed', () => {
    expect(VALID_TRANSITIONS.assigned).not.toContain('completed')
  })

  it('in_progress cannot jump to paid', () => {
    expect(VALID_TRANSITIONS.in_progress).not.toContain('paid')
  })

  it('revision_requested cannot jump to approved', () => {
    expect(VALID_TRANSITIONS.revision_requested).not.toContain('approved')
  })

  it('submitted_for_review cannot revert to in_progress directly', () => {
    expect(VALID_TRANSITIONS.submitted_for_review).not.toContain('in_progress')
  })

  it('completed is terminal — cannot go back to submitted', () => {
    expect(VALID_TRANSITIONS.completed).not.toContain('submitted')
    expect(VALID_TRANSITIONS.completed).toEqual([])
  })

  it('resolved is terminal — cannot go back to in_progress', () => {
    expect(VALID_TRANSITIONS.resolved).not.toContain('in_progress')
    expect(VALID_TRANSITIONS.resolved).toEqual([])
  })

  it('cancelled is terminal — cannot go to scope_locked', () => {
    expect(VALID_TRANSITIONS.cancelled).not.toContain('scope_locked')
    expect(VALID_TRANSITIONS.cancelled).toEqual([])
  })

  it('expired is terminal — cannot go to invoiced', () => {
    expect(VALID_TRANSITIONS.expired).not.toContain('invoiced')
    expect(VALID_TRANSITIONS.expired).toEqual([])
  })

  it('admin_closed_no_response is terminal — cannot go back to submitted', () => {
    expect(VALID_TRANSITIONS.admin_closed_no_response).not.toContain('submitted')
    expect(VALID_TRANSITIONS.admin_closed_no_response).toEqual([])
  })
})
