'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { assignWorkerWorkflow } from '@/lib/workflows/assign-worker'
import { reviewSubmissionWorkflow } from '@/lib/workflows/review-submission'
import { resolveDisputeWorkflow } from '@/lib/workflows/resolve-dispute'
import { addComment } from '@/lib/services/comment.service'
import { reviewSubmitSchema } from '@/lib/validations/review'
import { addCommentSchema } from '@/lib/validations/comment'
import type { ServerActionResult } from '@/lib/types/api'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/lib/utils/get-session-user'

const assignWorkerSchema = z.object({
  ticketId: z.string().uuid(),
  workerId: z.string().uuid(),
})

const resolveDisputeSchema = z.object({
  disputeId: z.string().uuid(),
  ticketId: z.string().uuid(),
  resolutionSummary: z.string().min(1).max(2000),
  disputeStatus: z.enum([
    'resolved_full_refund',
    'resolved_partial_refund',
    'resolved_no_refund',
  ]),
  refundAmountDollars: z.coerce.number().nonnegative().optional(),
})

export async function assignWorkerAction(
  data: unknown
): Promise<ServerActionResult<{ assignmentId: string }>> {
  const parsed = assignWorkerSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const adminUser = await requireRole('admin')
  if (!adminUser) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const result = await assignWorkerWorkflow(admin, {
    ticketId: parsed.data.ticketId,
    workerId: parsed.data.workerId,
    adminId: adminUser.id,
  })

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/admin/tickets')
  revalidatePath(`/admin/tickets/${parsed.data.ticketId}`)

  return { success: true, data: { assignmentId: result.assignmentId! } }
}

export async function submitReviewAction(
  data: unknown
): Promise<ServerActionResult> {
  const parsed = reviewSubmitSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const adminUser = await requireRole('admin')
  if (!adminUser) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const result = await reviewSubmissionWorkflow(admin, {
    ticketId: parsed.data.ticketId,
    reviewerId: adminUser.id,
    reviewerRole: 'admin',
    decision: parsed.data.decision,
    acceptanceFailures: parsed.data.acceptanceFailures,
    notes: parsed.data.notes,
  })

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/admin/tickets')
  revalidatePath(`/admin/tickets/${parsed.data.ticketId}`)
  revalidatePath('/admin/reviews')

  return { success: true }
}

export async function resolveDisputeAction(
  data: unknown
): Promise<ServerActionResult> {
  const parsed = resolveDisputeSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const adminUser = await requireRole('admin')
  if (!adminUser) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const result = await resolveDisputeWorkflow(admin, {
    ticketId: parsed.data.ticketId,
    disputeId: parsed.data.disputeId,
    adminId: adminUser.id,
    resolutionSummary: parsed.data.resolutionSummary,
    disputeStatus: parsed.data.disputeStatus,
    refundAmountDollars: parsed.data.refundAmountDollars,
  })

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/admin/tickets')
  revalidatePath(`/admin/tickets/${parsed.data.ticketId}`)
  revalidatePath('/admin/disputes')

  return { success: true }
}

export async function addCommentAction(
  data: unknown
): Promise<ServerActionResult> {
  const parsed = addCommentSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const adminUser = await requireRole('admin')
  if (!adminUser) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const result = await addComment(admin, {
    ticketId: parsed.data.ticketId,
    authorId: adminUser.id,
    authorRole: 'admin',
    visibility: parsed.data.visibility,
    body: parsed.data.body,
  })

  if (result.error) return { success: false, error: result.error }

  revalidatePath(`/admin/tickets/${parsed.data.ticketId}`)

  return { success: true }
}
