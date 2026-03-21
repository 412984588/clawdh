import type { TicketStatus } from '@/lib/types/enums'

// 活跃状态：工单尚未进入终态（含 disputed，仍需人工处理）
export const ACTIVE_STATUSES: TicketStatus[] = [
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
  'disputed',
]

// 业务成功终态：工单已被合作方/Admin 确认完结（用于"已完成"计数）
export const COMPLETED_STATUSES: TicketStatus[] = [
  'completed',
  'resolved',
  'approved',
]

// 所有不可重入终态：工单不会再发生状态转换（用于 cron 超时/过期判断）
// ⚠️ 新增 TicketStatus 时，若属于终态请同步更新此列表
export const ALL_TERMINAL_STATUSES: TicketStatus[] = [
  'completed',
  'resolved',
  'approved',
  'expired',
  'cancelled',
  'admin_closed_no_response',
]
