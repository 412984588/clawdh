import { describe, it, expect } from 'vitest'
import { canTransition } from '@/lib/state-machine/guards'
import { VALID_TRANSITIONS } from '@/lib/state-machine/transitions'
import type { TicketStatus, UserRole } from '@/lib/types/enums'

/**
 * 验证一条完整状态路径：
 * - 每一步 canTransition 必须返回 true
 * - 跳步（skip）和终态倒退必须返回 false
 */
function assertPath(
  steps: Array<{ from: TicketStatus; to: TicketStatus; role: UserRole }>
) {
  for (const { from, to, role } of steps) {
    expect(
      canTransition(from, to, role),
      `Expected canTransition(${from}, ${to}, ${role}) to be true`
    ).toBe(true)
  }
}

describe('状态机完整生命周期 — 分支1（主线 happy path）', () => {
  const path: Array<{ from: TicketStatus; to: TicketStatus; role: UserRole }> = [
    { from: 'draft', to: 'submitted', role: 'partner' },
    { from: 'submitted', to: 'needs_scope_review', role: 'admin' },
    { from: 'needs_scope_review', to: 'scope_locked', role: 'admin' },
    { from: 'scope_locked', to: 'invoiced', role: 'admin' },
    { from: 'invoiced', to: 'paid', role: 'admin' },
    { from: 'paid', to: 'queued', role: 'admin' },
    { from: 'queued', to: 'assigned', role: 'admin' },
    { from: 'assigned', to: 'in_progress', role: 'worker_internal' },
    { from: 'in_progress', to: 'submitted_for_review', role: 'worker_internal' },
    { from: 'submitted_for_review', to: 'approved', role: 'partner' },
    { from: 'approved', to: 'completed', role: 'admin' },
  ]

  it('所有步骤 canTransition 均返回 true', () => {
    assertPath(path)
  })

  it('draft 不能跳过直达 needs_scope_review', () => {
    expect(canTransition('draft', 'needs_scope_review', 'admin')).toBe(false)
  })

  it('draft 不能跳过直达 invoiced', () => {
    expect(canTransition('draft', 'invoiced', 'admin')).toBe(false)
  })

  it('queued 不能跳过直达 in_progress', () => {
    expect(canTransition('queued', 'in_progress', 'admin')).toBe(false)
  })

  it('in_progress 不能跳过直达 completed', () => {
    expect(canTransition('in_progress', 'completed', 'admin')).toBe(false)
  })

  it('completed 终态不能倒退到任何状态', () => {
    const roles: UserRole[] = ['admin', 'partner', 'worker_internal']
    const targets = VALID_TRANSITIONS.draft
    for (const role of roles) {
      for (const target of targets) {
        expect(canTransition('completed', target, role)).toBe(false)
      }
    }
  })
})

describe('状态机完整生命周期 — 分支2（修改循环 revision loop）', () => {
  it('submitted_for_review → revision_requested → in_progress → submitted_for_review → approved 路径合法', () => {
    assertPath([
      { from: 'submitted_for_review', to: 'revision_requested', role: 'partner' },
      { from: 'revision_requested', to: 'in_progress', role: 'worker_internal' },
      { from: 'in_progress', to: 'submitted_for_review', role: 'worker_internal' },
      { from: 'submitted_for_review', to: 'approved', role: 'partner' },
      { from: 'approved', to: 'completed', role: 'admin' },
    ])
  })

  it('revision_requested 不能直接跳到 approved', () => {
    expect(canTransition('revision_requested', 'approved', 'admin')).toBe(false)
  })

  it('revision_requested 不能直接跳到 completed', () => {
    expect(canTransition('revision_requested', 'completed', 'admin')).toBe(false)
  })
})

describe('状态机完整生命周期 — 分支3（争议 dispute）', () => {
  it('approved → disputed → resolved 路径合法', () => {
    assertPath([
      { from: 'approved', to: 'disputed', role: 'partner' },
      { from: 'disputed', to: 'resolved', role: 'admin' },
    ])
  })

  it('approved → disputed 不允许 worker_internal', () => {
    expect(canTransition('approved', 'disputed', 'worker_internal')).toBe(false)
  })

  it('disputed → resolved 只允许 admin', () => {
    expect(canTransition('disputed', 'resolved', 'partner')).toBe(false)
    expect(canTransition('disputed', 'resolved', 'worker_internal')).toBe(false)
    expect(canTransition('disputed', 'resolved', 'admin')).toBe(true)
  })

  it('resolved 终态不能继续流转', () => {
    expect(VALID_TRANSITIONS.resolved).toEqual([])
  })
})

describe('状态机完整生命周期 — 分支4（取消 cancellation）', () => {
  it('draft → cancelled 合法（partner/admin）', () => {
    expect(canTransition('draft', 'cancelled', 'partner')).toBe(true)
    expect(canTransition('draft', 'cancelled', 'admin')).toBe(true)
  })

  it('submitted → cancelled 合法（admin）', () => {
    expect(canTransition('submitted', 'cancelled', 'admin')).toBe(true)
  })

  it('invoiced → cancelled 合法（admin）', () => {
    expect(canTransition('invoiced', 'cancelled', 'admin')).toBe(true)
  })

  it('scope_locked → cancelled 合法（admin）', () => {
    expect(canTransition('scope_locked', 'cancelled', 'admin')).toBe(true)
  })

  it('cancelled 终态不能流转到任何其他状态', () => {
    expect(VALID_TRANSITIONS.cancelled).toEqual([])
  })

  it('in_progress 不允许直接取消（无 cancelled 出口）', () => {
    expect(VALID_TRANSITIONS.in_progress).not.toContain('cancelled')
  })
})

describe('状态机完整生命周期 — 分支5（过期 expiry）', () => {
  it('invoiced → expired 合法（admin）', () => {
    expect(canTransition('invoiced', 'expired', 'admin')).toBe(true)
  })

  it('expired 终态不能流转到任何其他状态', () => {
    expect(VALID_TRANSITIONS.expired).toEqual([])
  })

  it('paid 不能直接变为 expired', () => {
    expect(VALID_TRANSITIONS.paid).not.toContain('expired')
  })
})

describe('角色守卫 — 跨分支验证', () => {
  it('partner 不能锁定范围 needs_scope_review → scope_locked', () => {
    expect(canTransition('needs_scope_review', 'scope_locked', 'partner')).toBe(false)
  })

  it('worker_internal 不能提交票据 draft → submitted', () => {
    expect(canTransition('draft', 'submitted', 'worker_internal')).toBe(false)
  })

  it('partner 不能移动 queued → assigned', () => {
    expect(canTransition('queued', 'assigned', 'partner')).toBe(false)
  })

  it('worker_internal 不能完成票据 approved → completed', () => {
    expect(canTransition('approved', 'completed', 'worker_internal')).toBe(false)
  })

  it('worker_internal 不能创建发票 scope_locked → invoiced', () => {
    expect(canTransition('scope_locked', 'invoiced', 'worker_internal')).toBe(false)
  })
})
