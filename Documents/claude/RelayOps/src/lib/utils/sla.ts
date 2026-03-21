import { addBusinessHours } from './business-hours'

// 根据付款时间和 SLA 小时数计算工单到期时间
export function calculateDueAt(paidAt: Date, slaHoursBusiness: number): Date {
  return addBusinessHours(paidAt, slaHoursBusiness)
}

// 检查工单是否已超时
export function isOverdue(dueAt: Date | string | null | undefined): boolean {
  if (!dueAt) return false
  const due = typeof dueAt === 'string' ? new Date(dueAt) : dueAt
  return Date.now() > due.getTime()
}
