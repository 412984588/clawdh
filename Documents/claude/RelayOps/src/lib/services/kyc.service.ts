import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

export type KycStatus = 'pending' | 'verified' | 'rejected'

export interface KycSubmission {
  workerId: string
  documentsUrl: string
}

export interface KycReview {
  workerId: string
  decision: 'approve' | 'reject'
  reviewerId: string
  reason?: string
}

export interface KycStatusResult {
  status: KycStatus
  submittedAt: string | null
  reviewedAt: string | null
  reviewerId: string | null
  documentsUrl: string | null
  rejectionReason: string | null
}

export async function submitKyc(
  supabase: SupabaseClient,
  params: KycSubmission
): Promise<{ success: boolean; error?: string }> {
  const { workerId, documentsUrl } = params

  const { error } = await supabase
    .from('worker_profiles')
    .update({
      kyc_status: 'pending',
      kyc_documents_url: documentsUrl,
      kyc_submitted_at: new Date().toISOString(),
      kyc_reviewed_at: null,
      kyc_reviewer_id: null,
      kyc_rejection_reason: null,
    })
    .eq('id', workerId)

  if (error) {
    logger.error('Failed to submit KYC', {
      context: 'kyc',
      workerId,
      error: error.message,
    })
    return { success: false, error: error.message }
  }

  logger.info('KYC submitted', {
    context: 'kyc',
    workerId,
    documentsUrl,
  })

  return { success: true }
}

export async function reviewKyc(
  supabase: SupabaseClient,
  params: KycReview
): Promise<{ success: boolean; error?: string }> {
  const { workerId, decision, reviewerId, reason } = params

  const newStatus: KycStatus = decision === 'approve' ? 'verified' : 'rejected'

  const updateData: Record<string, unknown> = {
    kyc_status: newStatus,
    kyc_reviewed_at: new Date().toISOString(),
    kyc_reviewer_id: reviewerId,
  }

  if (decision === 'reject') {
    updateData.kyc_rejection_reason = reason || null
  } else {
    updateData.kyc_rejection_reason = null
  }

  const { error } = await supabase
    .from('worker_profiles')
    .update(updateData)
    .eq('id', workerId)

  if (error) {
    logger.error('Failed to review KYC', {
      context: 'kyc',
      workerId,
      decision,
      error: error.message,
    })
    return { success: false, error: error.message }
  }

  logger.info('KYC reviewed', {
    context: 'kyc',
    workerId,
    decision,
    reviewerId,
  })

  return { success: true }
}

export async function getKycStatus(
  supabase: SupabaseClient,
  workerId: string
): Promise<{ data: KycStatusResult | null; error?: string }> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('kyc_status, kyc_submitted_at, kyc_reviewed_at, kyc_reviewer_id, kyc_documents_url, kyc_rejection_reason')
    .eq('id', workerId)
    .single()

  if (error) {
    logger.error('Failed to get KYC status', {
      context: 'kyc',
      workerId,
      error: error.message,
    })
    return { data: null, error: error.message }
  }

  if (!data) {
    return { data: null, error: 'Worker not found' }
  }

  return {
    data: {
      status: data.kyc_status as KycStatus,
      submittedAt: data.kyc_submitted_at,
      reviewedAt: data.kyc_reviewed_at,
      reviewerId: data.kyc_reviewer_id,
      documentsUrl: data.kyc_documents_url,
      rejectionReason: data.kyc_rejection_reason,
    },
  }
}

export async function getPendingKycSubmissions(
  supabase: SupabaseClient
): Promise<{ data: Array<{ id: string; nickname: string; real_name: string; kyc_submitted_at: string; kyc_documents_url: string }>; error?: string }> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('id, nickname, real_name, kyc_submitted_at, kyc_documents_url')
    .eq('kyc_status', 'pending')
    .not('kyc_submitted_at', 'is', null)
    .order('kyc_submitted_at', { ascending: true })

  if (error) {
    logger.error('Failed to get pending KYC submissions', {
      context: 'kyc',
      error: error.message,
    })
    return { data: [], error: error.message }
  }

  return { data: data || [] }
}

export function canSubmitKyc(currentStatus: KycStatus): boolean {
  return currentStatus === 'pending' || currentStatus === 'rejected'
}

export function canBeAssigned(status: KycStatus): boolean {
  return status === 'verified'
}
