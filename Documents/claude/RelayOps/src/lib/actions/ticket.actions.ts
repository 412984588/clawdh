'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ticketCreateSchema } from '@/lib/validations/ticket'
import { submitExistingTicketWorkflow } from '@/lib/workflows/submit-ticket'
import { raiseDisputeWorkflow } from '@/lib/workflows/raise-dispute'
import { reviewSubmissionWorkflow } from '@/lib/workflows/review-submission'
import { transitionTicket } from '@/lib/state-machine/engine'
import { addComment } from '@/lib/services/comment.service'
import { createTicket } from '@/lib/services/ticket.service'
import type { ServerActionResult } from '@/lib/types/api'
import type { TicketStatus } from '@/lib/types/enums'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSessionUser } from '@/lib/utils/get-session-user'
import { logger } from '@/lib/utils/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

const partnerCommentSchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().min(1).max(5000),
})

const partnerReviewDecisionSchema = z.enum(['approved', 'revision_requested'])

// 接收 server client（带 RLS），让数据库直接保证权限过滤
async function getPartnerOwnedTicket(ticketId: string, organizationId: string, supabase: SupabaseClient) {
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, organization_id, status')
    .eq('id', ticketId)
    .single()

  if (!ticket || ticket.organization_id !== organizationId) return null
  return ticket
}

export async function createAndSubmitTicket(
  data: unknown
): Promise<ServerActionResult<{ ticketId: string }>> {
  const parsed = ticketCreateSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const userRecord = await getSessionUser()
  if (!userRecord) return { success: false, error: 'Unauthorized' }
  if (userRecord.role !== 'partner') {
    return { success: false, error: 'Only partners can submit tickets' }
  }
  if (!userRecord.organization_id) {
    return { success: false, error: 'User has no organization' }
  }

  const supabase = await createServerClient()
  const { data: ticket, error: createError } = await createTicket(
    supabase,
    parsed.data,
    userRecord.id,
    userRecord.organization_id
  )

  if (createError || !ticket) {
    return { success: false, error: createError || 'Failed to create ticket' }
  }

  const admin = createAdminClient()
  const result = await submitExistingTicketWorkflow(admin, ticket.id, {
    id: userRecord.id,
    role: userRecord.role,
    organizationId: userRecord.organization_id,
  })

  if (!result.success) {
    // 软删除（标记 cancelled），而非 hard delete。
    // 原因：若 workflow 实际成功但调用方误判失败，hard delete 会误删有效工单。
    // .eq('status', 'draft') 保护：只取消还在 draft 的工单，已成功提交的不受影响。
    const { error: cleanupError } = await admin
      .from('tickets')
      .update({
        status: 'cancelled',
        metadata_json: {
          cleanup_reason: 'workflow_failure',
          cleanup_at: new Date().toISOString(),
        },
      })
      .eq('id', ticket.id)
      .eq('status', 'draft')

    if (cleanupError) {
      logger.error('Failed to cancel draft ticket after submit failure', {
        context: 'ticket-actions',
        ticketId: ticket.id,
        error: cleanupError.message,
      })
    }
    return { success: false, error: result.error }
  }

  revalidatePath('/partner/tickets')
  return { success: true, data: { ticketId: result.ticketId! } }
}

export async function adminTransitionTicket(
  ticketId: string,
  toStatus: TicketStatus,
  metadata?: Record<string, unknown>
): Promise<ServerActionResult> {
  const userRecord = await getSessionUser()
  if (!userRecord) return { success: false, error: 'Unauthorized' }
  if (userRecord.role !== 'admin') {
    return { success: false, error: 'Admin only' }
  }

  const admin = createAdminClient()
  const result = await transitionTicket(
    admin,
    ticketId,
    toStatus,
    { id: userRecord.id, role: 'admin' },
    metadata
  )

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/admin/tickets')
  revalidatePath(`/admin/tickets/${ticketId}`)
  return { success: true }
}

export async function partnerTransitionTicket(
  ticketId: string,
  toStatus: TicketStatus,
  metadata?: Record<string, unknown>
): Promise<ServerActionResult> {
  const userRecord = await getSessionUser()
  if (!userRecord) return { success: false, error: 'Unauthorized' }
  if (userRecord.role !== 'partner') {
    return { success: false, error: 'Partners only' }
  }
  if (!userRecord.organization_id) {
    return { success: false, error: 'User has no organization' }
  }

  const supabase = await createServerClient()
  const ticket = await getPartnerOwnedTicket(ticketId, userRecord.organization_id, supabase)
  if (!ticket) return { success: false, error: 'Ticket not found' }

  const admin = createAdminClient()
  const result = await transitionTicket(
    admin,
    ticketId,
    toStatus,
    { id: userRecord.id, role: 'partner' },
    metadata
  )

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/partner/tickets')
  revalidatePath(`/partner/tickets/${ticketId}`)
  return { success: true }
}

export async function partnerReviewSubmissionAction(
  ticketId: string,
  decision: 'approved' | 'revision_requested',
  note?: string
): Promise<ServerActionResult<{ reviewId: string }>> {
  const parsedDecision = partnerReviewDecisionSchema.safeParse(decision)
  if (!parsedDecision.success) {
    return { success: false, error: 'Invalid review decision' }
  }
  if (parsedDecision.data === 'revision_requested' && !note?.trim()) {
    return { success: false, error: 'Please explain what needs to be revised.' }
  }

  const userRecord = await getSessionUser()
  if (!userRecord) return { success: false, error: 'Unauthorized' }
  if (userRecord.role !== 'partner') {
    return { success: false, error: 'Partners only' }
  }
  if (!userRecord.organization_id) {
    return { success: false, error: 'User has no organization' }
  }

  const supabase = await createServerClient()
  const ticket = await getPartnerOwnedTicket(ticketId, userRecord.organization_id, supabase)
  if (!ticket) return { success: false, error: 'Ticket not found' }

  const admin = createAdminClient()
  const result = await reviewSubmissionWorkflow(admin, {
    ticketId,
    reviewerId: userRecord.id,
    reviewerRole: 'partner',
    decision: parsedDecision.data,
    acceptanceFailures: [],
    notes: note?.trim() || undefined,
  })

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/partner/tickets')
  revalidatePath(`/partner/tickets/${ticketId}`)
  return { success: true, data: { reviewId: result.reviewId! } }
}

export async function addPartnerCommentAction(
  data: unknown
): Promise<ServerActionResult> {
  const parsed = partnerCommentSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const userRecord = await getSessionUser()
  if (!userRecord) return { success: false, error: 'Unauthorized' }
  if (userRecord.role !== 'partner') {
    return { success: false, error: 'Partners only' }
  }
  if (!userRecord.organization_id) {
    return { success: false, error: 'User has no organization' }
  }

  const supabase = await createServerClient()
  const ticket = await getPartnerOwnedTicket(parsed.data.ticketId, userRecord.organization_id, supabase)
  if (!ticket) return { success: false, error: 'Ticket not found' }

  const admin = createAdminClient()
  const result = await addComment(admin, {
    ticketId: parsed.data.ticketId,
    authorId: userRecord.id,
    authorRole: 'partner',
    visibility: 'partner_admin',
    body: parsed.data.body,
  })

  if (result.error) return { success: false, error: result.error }

  revalidatePath('/partner/tickets')
  revalidatePath(`/partner/tickets/${parsed.data.ticketId}`)
  return { success: true }
}

// Partner 发起争议
export async function raiseDisputeAction(
  ticketId: string,
  reason: string
): Promise<ServerActionResult<{ disputeId: string }>> {
  if (!reason || reason.trim().length < 10) {
    return { success: false, error: 'Reason must be at least 10 characters' }
  }

  const userRecord = await getSessionUser()
  if (!userRecord) return { success: false, error: 'Unauthorized' }
  if (userRecord.role !== 'partner') {
    return { success: false, error: 'Partners only' }
  }
  if (!userRecord.organization_id) {
    return { success: false, error: 'User has no organization' }
  }

  const supabase = await createServerClient()
  const ticket = await getPartnerOwnedTicket(ticketId, userRecord.organization_id, supabase)
  if (!ticket) return { success: false, error: 'Ticket not found' }

  const admin = createAdminClient()
  const result = await raiseDisputeWorkflow(admin, {
    ticketId,
    raisedByUserId: userRecord.id,
    raisedByRole: 'partner',
    reason: reason.trim(),
  })

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/partner/tickets')
  revalidatePath(`/partner/tickets/${ticketId}`)
  return { success: true, data: { disputeId: result.disputeId! } }
}
