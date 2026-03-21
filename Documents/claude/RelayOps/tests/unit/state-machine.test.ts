import { describe, it, expect } from 'vitest'
import { VALID_TRANSITIONS, TRANSITION_ROLE_GUARDS } from '@/lib/state-machine/transitions'
import type { TicketStatus } from '@/lib/types/enums'

const ALL_STATUSES: TicketStatus[] = [
  'draft',
  'submitted',
  'needs_scope_review',
  'scope_locked',
  'invoiced',
  'paid',
  'queued',
  'assigned',
  'in_progress',
  'submitted_for_review',
  'revision_requested',
  'approved',
  'disputed',
  'completed',
  'resolved',
  'expired',
  'admin_closed_no_response',
  'cancelled',
]

const TERMINAL_STATUSES: TicketStatus[] = [
  'completed',
  'resolved',
  'expired',
  'admin_closed_no_response',
  'cancelled',
]

describe('VALID_TRANSITIONS', () => {
  it('should have entries for all TicketStatus values', () => {
    for (const status of ALL_STATUSES) {
      expect(VALID_TRANSITIONS).toHaveProperty(status)
    }
  })

  it('terminal states should have empty transition arrays', () => {
    for (const status of TERMINAL_STATUSES) {
      expect(VALID_TRANSITIONS[status]).toEqual([])
    }
  })

  it('draft can only go to submitted or cancelled', () => {
    expect(VALID_TRANSITIONS.draft).toContain('submitted')
    expect(VALID_TRANSITIONS.draft).toContain('cancelled')
    expect(VALID_TRANSITIONS.draft).toHaveLength(2)
  })

  it('paid can only go to queued', () => {
    expect(VALID_TRANSITIONS.paid).toEqual(['queued'])
  })

  it('submitted cannot skip directly to scope_locked', () => {
    expect(VALID_TRANSITIONS.submitted).not.toContain('scope_locked')
  })

  it('submitted can go to needs_scope_review or cancelled', () => {
    expect(VALID_TRANSITIONS.submitted).toContain('needs_scope_review')
    expect(VALID_TRANSITIONS.submitted).toContain('cancelled')
  })

  it('in_progress can only go to submitted_for_review', () => {
    expect(VALID_TRANSITIONS.in_progress).toEqual(['submitted_for_review'])
  })

  it('submitted_for_review can go to approved or revision_requested', () => {
    expect(VALID_TRANSITIONS.submitted_for_review).toContain('approved')
    expect(VALID_TRANSITIONS.submitted_for_review).toContain('revision_requested')
  })

  it('approved can lead to completed or disputed', () => {
    expect(VALID_TRANSITIONS.approved).toContain('completed')
    expect(VALID_TRANSITIONS.approved).toContain('disputed')
  })

  it('revision_requested leads back to in_progress', () => {
    expect(VALID_TRANSITIONS.revision_requested).toEqual(['in_progress'])
  })

  it('disputed can only go to resolved', () => {
    expect(VALID_TRANSITIONS.disputed).toEqual(['resolved'])
  })

  it('assigned can go to in_progress or back to queued', () => {
    expect(VALID_TRANSITIONS.assigned).toContain('in_progress')
    expect(VALID_TRANSITIONS.assigned).toContain('queued')
  })
})

describe('TRANSITION_ROLE_GUARDS', () => {
  it('partner cannot submit another flow — worker_internal is not in draft->submitted guard', () => {
    const roles = TRANSITION_ROLE_GUARDS.draft?.submitted
    expect(roles).toBeDefined()
    expect(roles).not.toContain('worker_internal')
  })

  it('admin can transition draft to submitted', () => {
    const roles = TRANSITION_ROLE_GUARDS.draft?.submitted
    expect(roles).toContain('admin')
  })

  it('partner can transition draft to submitted', () => {
    const roles = TRANSITION_ROLE_GUARDS.draft?.submitted
    expect(roles).toContain('partner')
  })

  it('partner can transition submitted_for_review to approved', () => {
    const roles = TRANSITION_ROLE_GUARDS.submitted_for_review?.approved
    expect(roles).toContain('partner')
  })

  it('worker_internal can transition in_progress to submitted_for_review', () => {
    const roles = TRANSITION_ROLE_GUARDS.in_progress?.submitted_for_review
    expect(roles).toContain('worker_internal')
  })

  it('only admin can move submitted to needs_scope_review', () => {
    const roles = TRANSITION_ROLE_GUARDS.submitted?.needs_scope_review
    expect(roles).toEqual(['admin'])
  })

  it('only admin can resolve a disputed ticket', () => {
    const roles = TRANSITION_ROLE_GUARDS.disputed?.resolved
    expect(roles).toEqual(['admin'])
  })

  it('only admin can move paid to queued', () => {
    const roles = TRANSITION_ROLE_GUARDS.paid?.queued
    expect(roles).toEqual(['admin'])
  })

  it('only admin can mark scope_locked as invoiced', () => {
    const roles = TRANSITION_ROLE_GUARDS.scope_locked?.invoiced
    expect(roles).toEqual(['admin'])
  })

  it('admin and partner can request revision on submitted_for_review', () => {
    const roles = TRANSITION_ROLE_GUARDS.submitted_for_review?.revision_requested
    expect(roles).toContain('admin')
    expect(roles).toContain('partner')
  })

  it('worker_internal can move assigned to in_progress', () => {
    const roles = TRANSITION_ROLE_GUARDS.assigned?.in_progress
    expect(roles).toContain('worker_internal')
    expect(roles).toContain('admin')
  })

  it('admin and partner can raise a dispute on approved ticket', () => {
    const roles = TRANSITION_ROLE_GUARDS.approved?.disputed
    expect(roles).toContain('admin')
    expect(roles).toContain('partner')
  })

  it('only admin can complete an approved ticket', () => {
    const roles = TRANSITION_ROLE_GUARDS.approved?.completed
    expect(roles).toEqual(['admin'])
  })

  it('worker_internal can move revision_requested back to in_progress', () => {
    const roles = TRANSITION_ROLE_GUARDS.revision_requested?.in_progress
    expect(roles).toContain('worker_internal')
  })
})
