'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { submitWorkWorkflow } from '@/lib/workflows/submit-work'
import { transitionTicket } from '@/lib/state-machine/engine'
import { addComment } from '@/lib/services/comment.service'
import type { ServerActionResult } from '@/lib/types/api'
import { getWorkerContext } from '@/lib/worker-context'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const acknowledgeSchema = z.object({
  assignmentId: z.string().uuid(),
})

const startWorkSchema = z.object({
  ticketId: z.string().uuid(),
  assignmentId: z.string().uuid(),
})

const submitWorkSchema = z.object({
  ticketId: z.string().uuid(),
  deliverySummary: z.string().min(1).max(5000),
  attachmentIds: z.array(z.string().uuid()).default([]),
})

const workerCommentSchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().min(1).max(5000),
})

export async function acknowledgeAssignmentAction(
  data: unknown
): Promise<ServerActionResult> {
  const parsed = acknowledgeSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const worker = await getWorkerContext()
  if (!worker) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const { data: assignment } = await admin
    .from('ticket_assignments')
    .select('id')
    .eq('id', parsed.data.assignmentId)
    .eq('worker_id', worker.workerProfileId)
    .single()

  if (!assignment) {
    return { success: false, error: 'Worker is not assigned to this assignment' }
  }

  const { error } = await admin
    .from('ticket_assignments')
    .update({ status: 'acknowledged' })
    .eq('id', parsed.data.assignmentId)
    .eq('worker_id', worker.workerProfileId)

  if (error) return { success: false, error: 'Failed to acknowledge assignment' }

  revalidatePath('/worker/assignments')

  return { success: true }
}

export async function startWorkAction(
  data: unknown
): Promise<ServerActionResult> {
  const parsed = startWorkSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const worker = await getWorkerContext()
  if (!worker) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const { data: assignment } = await admin
    .from('ticket_assignments')
    .select('id')
    .eq('id', parsed.data.assignmentId)
    .eq('ticket_id', parsed.data.ticketId)
    .eq('worker_id', worker.workerProfileId)
    .single()

  if (!assignment) {
    return { success: false, error: 'Worker is not assigned to this assignment' }
  }

  // Update assignment status to 'in_progress'
  const { error: assignError } = await admin
    .from('ticket_assignments')
    .update({ status: 'in_progress' })
    .eq('id', parsed.data.assignmentId)
    .eq('worker_id', worker.workerProfileId)

  if (assignError) return { success: false, error: 'Failed to start assignment' }

  // Transition ticket: assigned → in_progress
  const transitionResult = await transitionTicket(
    admin,
    parsed.data.ticketId,
    'in_progress',
    { id: worker.workerProfileId, role: 'worker_internal' },
    { assignment_id: parsed.data.assignmentId }
  )

  if (!transitionResult.success) return { success: false, error: transitionResult.error }

  revalidatePath('/worker/assignments')
  revalidatePath(`/worker/assignments/${parsed.data.assignmentId}`)

  return { success: true }
}

export async function submitWorkAction(
  data: unknown
): Promise<ServerActionResult<{ submissionId: string }>> {
  const parsed = submitWorkSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const worker = await getWorkerContext()
  if (!worker) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const result = await submitWorkWorkflow(admin, {
    ticketId: parsed.data.ticketId,
    workerId: worker.workerProfileId,
    deliverySummary: parsed.data.deliverySummary,
    attachmentIds: parsed.data.attachmentIds,
  })

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/worker/assignments')
  revalidatePath(`/admin/tickets/${parsed.data.ticketId}`)

  return { success: true, data: { submissionId: result.submissionId ?? '' } }
}

export async function addWorkerCommentAction(
  data: unknown
): Promise<ServerActionResult> {
  const parsed = workerCommentSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const worker = await getWorkerContext()
  if (!worker) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const { data: assignment } = await admin
    .from('ticket_assignments')
    .select('id')
    .eq('ticket_id', parsed.data.ticketId)
    .eq('worker_id', worker.workerProfileId)
    .single()

  if (!assignment) {
    return { success: false, error: 'Worker is not assigned to this ticket' }
  }

  const result = await addComment(admin, {
    ticketId: parsed.data.ticketId,
    authorId: worker.userId,
    authorRole: 'worker_internal',
    visibility: 'worker_admin',
    body: parsed.data.body,
  })

  if (result.error) return { success: false, error: result.error }

  revalidatePath(`/worker/assignments`)

  return { success: true }
}
