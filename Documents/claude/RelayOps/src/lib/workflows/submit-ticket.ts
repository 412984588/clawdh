import type { SupabaseClient } from '@supabase/supabase-js'
import type { TicketCreateInput } from '@/lib/validations/ticket'
import { createTicket } from '@/lib/services/ticket.service'
import { transitionTicket } from '@/lib/state-machine/engine'
import type { UserRole } from '@/lib/types/enums'
import { notifyTicketEvent } from '@/lib/services/notification.service'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/integrations/analytics/events'

interface SubmitTicketActor {
  id: string
  role: UserRole
  organizationId: string
}

interface SubmitTicketResult {
  success: boolean
  ticketId?: string
  error?: string
}

export async function submitExistingTicketWorkflow(
  supabase: SupabaseClient,
  ticketId: string,
  actor: SubmitTicketActor
): Promise<SubmitTicketResult> {
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return { success: false, error: 'Ticket not found' }
  }

  // 2. 转移到 submitted 状态
  const transition = await transitionTicket(supabase, ticketId, 'submitted', actor, {
    note: 'Submitted by partner',
  })

  if (!transition.success) {
    return { success: false, error: transition.error }
  }

  // 3. 通知：工单已提交
  await notifyTicketEvent(supabase, ticketId, 'ticket_submitted', {})

  return { success: true, ticketId }
}

// 原子工作流：创建草稿 → 立即转移到 submitted
export async function submitTicketWorkflow(
  supabase: SupabaseClient,
  input: TicketCreateInput,
  actor: SubmitTicketActor
): Promise<SubmitTicketResult> {
  // 1. 以 draft 状态创建 ticket
  const { data: ticket, error: createError } = await createTicket(
    supabase,
    input,
    actor.id,
    actor.organizationId
  )

  if (createError || !ticket) {
    return { success: false, error: createError || 'Failed to create ticket' }
  }

  // 追踪工单创建事件
  trackEvent(ANALYTICS_EVENTS.TICKET_CREATED, {
    ticketId: ticket.id,
    category: input.category,
  })

  return submitExistingTicketWorkflow(supabase, ticket.id, actor)
}
