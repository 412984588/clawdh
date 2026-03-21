import type { SupabaseClient } from '@supabase/supabase-js'
import { reviewKyc } from '@/lib/services/kyc.service'
import { logger } from '@/lib/utils/logger'

interface KycReviewWorkflowParams {
  workerId: string
  reviewerId: string
  reason?: string
}

interface KycReviewWorkflowResult {
  success: boolean
  error?: string
}

type UserEmailRelation = { email: string } | Array<{ email: string }> | null | undefined

function extractUserEmail(users: UserEmailRelation): string | null {
  if (Array.isArray(users)) {
    return users[0]?.email ?? null
  }

  return users?.email ?? null
}

export async function approveKycWorkflow(
  supabase: SupabaseClient,
  params: KycReviewWorkflowParams
): Promise<KycReviewWorkflowResult> {
  const { workerId, reviewerId } = params

  // 1. Update KYC status
  const reviewResult = await reviewKyc(supabase, {
    workerId,
    decision: 'approve',
    reviewerId,
  })

  if (!reviewResult.success) {
    return { success: false, error: reviewResult.error }
  }

  // 2. Get worker details for notification
  const { data: worker } = await supabase
    .from('worker_profiles')
    .select('nickname, user_id, users(email)')
    .eq('id', workerId)
    .single()

  if (worker?.user_id) {
    // 3. Send approval notification
    try {
      const email = await import('@/lib/integrations/email/provider').then(m => m.createEmailProvider())
      const templates = await import('@/lib/integrations/email/templates')

      const workerEmail = extractUserEmail(worker.users as UserEmailRelation)
      if (workerEmail) {
        const tpl = templates.kycApprovedEmail({
          workerNickname: worker.nickname,
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/worker`,
        })
        await email.send({ to: workerEmail, ...tpl })
      }
    } catch (err) {
      logger.error('Failed to send KYC approval email', {
        context: 'kyc-workflow',
        workerId,
        err,
      })
    }
  }

  logger.info('KYC approval workflow completed', {
    context: 'kyc-workflow',
    workerId,
    reviewerId,
  })

  return { success: true }
}

export async function rejectKycWorkflow(
  supabase: SupabaseClient,
  params: KycReviewWorkflowParams
): Promise<KycReviewWorkflowResult> {
  const { workerId, reviewerId, reason } = params

  if (!reason) {
    return { success: false, error: 'Rejection reason is required' }
  }

  // 1. Update KYC status
  const reviewResult = await reviewKyc(supabase, {
    workerId,
    decision: 'reject',
    reviewerId,
    reason,
  })

  if (!reviewResult.success) {
    return { success: false, error: reviewResult.error }
  }

  // 2. Get worker details for notification
  const { data: worker } = await supabase
    .from('worker_profiles')
    .select('nickname, user_id, users(email)')
    .eq('id', workerId)
    .single()

  if (worker?.user_id) {
    // 3. Send rejection notification
    try {
      const email = await import('@/lib/integrations/email/provider').then(m => m.createEmailProvider())
      const templates = await import('@/lib/integrations/email/templates')

      const workerEmail = extractUserEmail(worker.users as UserEmailRelation)
      if (workerEmail) {
        const tpl = templates.kycRejectedEmail({
          workerNickname: worker.nickname,
          rejectionReason: reason,
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/worker`,
        })
        await email.send({ to: workerEmail, ...tpl })
      }
    } catch (err) {
      logger.error('Failed to send KYC rejection email', {
        context: 'kyc-workflow',
        workerId,
        err,
      })
    }
  }

  logger.info('KYC rejection workflow completed', {
    context: 'kyc-workflow',
    workerId,
    reviewerId,
    reason,
  })

  return { success: true }
}
