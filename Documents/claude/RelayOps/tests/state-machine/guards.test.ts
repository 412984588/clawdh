import { describe, it, expect } from 'vitest'
import { canTransition } from '@/lib/state-machine/guards'

describe('canTransition', () => {
  it('returns true when role is allowed', () => {
    expect(canTransition('draft', 'submitted', 'partner')).toBe(true)
    expect(canTransition('draft', 'submitted', 'admin')).toBe(true)
  })

  it('returns false when role is not allowed', () => {
    // worker_internal cannot submit a draft
    expect(canTransition('draft', 'submitted', 'worker_internal')).toBe(false)
  })

  it('only admin can move submitted to needs_scope_review', () => {
    expect(canTransition('submitted', 'needs_scope_review', 'admin')).toBe(true)
    expect(canTransition('submitted', 'needs_scope_review', 'partner')).toBe(false)
    expect(canTransition('submitted', 'needs_scope_review', 'worker_internal')).toBe(false)
  })

  it('returns false for invalid transition regardless of role', () => {
    // There is no draft -> paid transition
    expect(canTransition('draft', 'paid', 'admin')).toBe(false)
    expect(canTransition('completed', 'submitted', 'admin')).toBe(false)
  })

  it('partner can approve submitted_for_review', () => {
    expect(canTransition('submitted_for_review', 'approved', 'partner')).toBe(true)
  })

  it('worker_internal can move assigned to in_progress', () => {
    expect(canTransition('assigned', 'in_progress', 'worker_internal')).toBe(true)
  })

  it('worker_internal cannot lock scope', () => {
    expect(canTransition('needs_scope_review', 'scope_locked', 'worker_internal')).toBe(false)
  })

  it('returns false for undefined from-status guard entry', () => {
    // Terminal states have no guards — completed has no outbound transitions
    expect(canTransition('completed', 'disputed', 'admin')).toBe(false)
  })
})
