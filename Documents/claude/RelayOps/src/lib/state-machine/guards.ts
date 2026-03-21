import type { TicketStatus, UserRole } from '@/lib/types/enums'
import { TRANSITION_ROLE_GUARDS } from './transitions'

// 检查角色是否有权触发该状态转移
export function canTransition(
  fromStatus: TicketStatus,
  toStatus: TicketStatus,
  role: UserRole
): boolean {
  const roleGuards = TRANSITION_ROLE_GUARDS[fromStatus]
  if (!roleGuards) return false

  const allowedRoles = (roleGuards as Partial<Record<TicketStatus, UserRole[]>>)[toStatus]
  if (!allowedRoles) return false

  return allowedRoles.includes(role)
}
