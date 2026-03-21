import type { SupabaseClient } from '@supabase/supabase-js'
import type { TicketStatus, UserRole } from '@/lib/types/enums'
import { VALID_TRANSITIONS } from './transitions'
import { canTransition } from './guards'
import { logger } from '@/lib/utils/logger'
import { triggerAlert } from '@/lib/utils/alerts'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/integrations/analytics/events'

export interface TransitionActor {
  id?: string  // cron/系统操作时可省略（无真实用户 ID）
  role: UserRole
}

export interface TransitionResult {
  success: boolean
  error?: string
}

export const SYSTEM_ACTOR: TransitionActor = { role: 'admin' }

async function logTransitionEvent(
  supabase: SupabaseClient,
  ticketId: string,
  actor: TransitionActor,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  await supabase.from('ticket_events').insert({
    ticket_id: ticketId,
    actor_user_id: actor.id ?? null,
    actor_role: actor.role,
    event_type: eventType,
    payload_json: payload,
  })
}

export async function transitionTicket(
  supabase: SupabaseClient,
  ticketId: string,
  toStatus: TicketStatus,
  actor: TransitionActor,
  metadata?: Record<string, unknown>
): Promise<TransitionResult> {
  // 1. 获取当前 ticket 状态
  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('id, status')
    .eq('id', ticketId)
    .single()

  if (fetchError || !ticket) {
    return { success: false, error: 'Ticket not found' }
  }

  const fromStatus = ticket.status as TicketStatus

  // 2. 验证状态转移是否合法
  const validNext = VALID_TRANSITIONS[fromStatus]
  if (!validNext.includes(toStatus)) {
    await logTransitionEvent(
      supabase,
      ticketId,
      actor,
      'status_change_rejected',
      {
        from: fromStatus,
        to: toStatus,
        reason: 'invalid_transition',
        ...metadata,
      }
    )
    return {
      success: false,
      error: `Cannot transition from ${fromStatus} to ${toStatus}`,
    }
  }

  // 3. 检查角色守卫
  if (!canTransition(fromStatus, toStatus, actor.role)) {
    await logTransitionEvent(
      supabase,
      ticketId,
      actor,
      'status_change_rejected',
      {
        from: fromStatus,
        to: toStatus,
        reason: 'guard_rejected',
        ...metadata,
      }
    )
    return {
      success: false,
      error: `Role ${actor.role} cannot transition from ${fromStatus} to ${toStatus}`,
    }
  }

  // 4. 更新 ticket 状态
  const { error: updateError } = await supabase
    .from('tickets')
    .update({ status: toStatus, updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  if (updateError) {
    return { success: false, error: 'Failed to update ticket status' }
  }

  // 5. 写入审计事件（失败时降级为 warn，不阻断状态转移）
  const { error: eventError } = await supabase.from('ticket_events').insert({
    ticket_id: ticketId,
    actor_user_id: actor.id ?? null,
    actor_role: actor.role,
    event_type: 'status_changed',
    payload_json: {
      from: fromStatus,
      to: toStatus,
      ...metadata,
    },
  })

  if (eventError) {
    // ⚠️ 审计事件写入失败：降级为 warn，不阻断状态转移。
    // 状态已成功变更，workflow 不应因审计丢失而卡死，可通过监控补偿。
    logger.warn('Audit event write failed after successful transition', {
      context: 'state-machine-engine',
      ticketId,
      from: fromStatus,
      to: toStatus,
      error: eventError.message,
    })
  }

  // 结构化日志：状态转换成功
  triggerAlert('ticket_status_changed', {
    ticketId,
    from: fromStatus,
    to: toStatus,
    actorRole: actor.role,
  }, { context: 'state-machine-engine' })

  // 用户行为追踪
  trackEvent(ANALYTICS_EVENTS.TICKET_STATUS_CHANGED, {
    ticketId,
    from: fromStatus,
    to: toStatus,
  })

  return { success: true }
}
