import type { TicketStatus, UserRole } from '@/lib/types/enums'

// 合法的状态转移映射
export const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['needs_scope_review', 'cancelled', 'admin_closed_no_response'],
  needs_scope_review: ['scope_locked', 'cancelled', 'admin_closed_no_response'],
  scope_locked: ['invoiced', 'cancelled'],
  invoiced: ['paid', 'expired', 'cancelled'],
  paid: ['queued'],
  queued: ['assigned'],
  assigned: ['in_progress', 'queued'],
  in_progress: ['submitted_for_review'],
  submitted_for_review: ['approved', 'revision_requested'],
  revision_requested: ['in_progress'],
  approved: ['completed', 'disputed'],
  disputed: ['resolved'],
  completed: [],
  resolved: [],
  expired: [],
  admin_closed_no_response: [],
  cancelled: [],
}

// 每个转移允许的角色守卫
export const TRANSITION_ROLE_GUARDS: Partial<
  Record<TicketStatus, Partial<Record<TicketStatus, UserRole[]>>>
> = {
  draft: {
    submitted: ['partner', 'admin'],
    cancelled: ['partner', 'admin'],
  },
  submitted: {
    needs_scope_review: ['admin'],
    cancelled: ['admin'],
    admin_closed_no_response: ['admin'],  // cron 超时关闭
  },
  needs_scope_review: {
    scope_locked: ['admin'],
    cancelled: ['admin'],
    admin_closed_no_response: ['admin'],
  },
  scope_locked: {
    invoiced: ['admin'],
    cancelled: ['admin'],
  },
  invoiced: {
    paid: ['admin'],
    expired: ['admin'],
    cancelled: ['admin'],
  },
  paid: {
    queued: ['admin'],
  },
  queued: {
    assigned: ['admin'],
  },
  assigned: {
    in_progress: ['admin', 'worker_internal'],
    queued: ['admin'],
  },
  in_progress: {
    submitted_for_review: ['admin', 'worker_internal'],
  },
  submitted_for_review: {
    approved: ['admin', 'partner'],
    revision_requested: ['admin', 'partner'],
  },
  revision_requested: {
    in_progress: ['admin', 'worker_internal'],
  },
  approved: {
    completed: ['admin'],
    disputed: ['admin', 'partner'],
  },
  disputed: {
    resolved: ['admin'],
  },
}
