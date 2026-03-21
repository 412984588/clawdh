'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { partnerApplicationSchema } from '@/lib/validations/partner'
import { createEmailProvider } from '@/lib/integrations/email/provider'
import * as templates from '@/lib/integrations/email/templates'
import { env } from '@/lib/config/env'
import type { ServerActionResult } from '@/lib/types/api'
import { requireRole } from '@/lib/utils/get-session-user'
import { logger } from '@/lib/utils/logger'

export async function submitPartnerApplication(
  data: unknown
): Promise<ServerActionResult<{ id: string }>> {
  const parsed = partnerApplicationSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const {
    email,
    company_name,
    website,
    country,
    service_focus,
    monthly_ticket_estimate,
  } = parsed.data

  const admin = createAdminClient()

  // Check if an org with this website already applied (skip check if no website provided)
  if (website) {
    const { data: existingOrg } = await admin
      .from('organizations')
      .select('id')
      .eq('website', website)
      .maybeSingle()

    if (existingOrg) {
      return {
        success: false,
        error: 'An application from this company already exists.',
      }
    }
  }

  // Create organization record
  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({
      name: company_name,
      website: website || null,
      country,
      status: 'active',
      risk_level: 'low',
    })
    .select('id')
    .single()

  if (orgError || !org) {
    return { success: false, error: 'Failed to create organization. Please try again.' }
  }

  // Create partner profile
  const { error: profileError } = await admin.from('partner_profiles').insert({
    organization_id: org.id,
    service_focus,
    monthly_ticket_estimate,
    approval_status: 'pending',
    dpa_requested: false,
  })

  if (profileError) {
    // Clean up org if profile creation fails
    await admin.from('organizations').delete().eq('id', org.id)
    return { success: false, error: 'Failed to save application. Please try again.' }
  }

  // Store the contact email for reference (no user account yet)
  // We store it as a note on the partner profile so admin can follow up
  await admin
    .from('partner_profiles')
    .update({ notes: `Contact email: ${email}` })
    .eq('organization_id', org.id)

  return { success: true, data: { id: org.id } }
}

export async function approvePartner(
  organizationId: string
): Promise<ServerActionResult> {
  const adminUser = await requireRole('admin')
  if (!adminUser) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('partner_profiles')
    .update({ approval_status: 'approved' })
    .eq('organization_id', organizationId)

  if (error) return { success: false, error: 'Failed to approve partner.' }

  // 从 notes 字段提取联系邮箱
  const { data: profile } = await admin
    .from('partner_profiles')
    .select('notes')
    .eq('organization_id', organizationId)
    .single()

  const emailMatch = profile?.notes?.match(/Contact email:\s*(\S+)/)
  if (!emailMatch) return { success: false, error: 'No contact email found for this partner' }
  const partnerEmail = emailMatch[1]

  // 幂等性检查：账户已存在则跳过创建
  const { data: existingUser } = await admin
    .from('users')
    .select('id')
    .eq('email', partnerEmail)
    .maybeSingle()

  if (!existingUser) {
    // 创建 auth.users 记录（partner 通过 magic link 登录）
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: partnerEmail,
      email_confirm: true,
      user_metadata: {},
    })
    if (authError) return { success: false, error: `Failed to create account: ${authError.message}` }

    // 创建 public.users 记录；失败则回滚 auth.users 避免孤立记录
    const { error: userInsertError } = await admin.from('users').insert({
      id: authData.user.id,
      email: partnerEmail,
      role: 'partner',
      organization_id: organizationId,
      status: 'active',
    })
    if (userInsertError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: `Failed to create user profile: ${userInsertError.message}` }
    }
  }

  // 发送审批通过邮件
  try {
    const emailProvider = await createEmailProvider()
    const tpl = templates.partnerApprovedEmail({
      partnerName: partnerEmail.split('@')[0],
      portalUrl: `${env.NEXT_PUBLIC_APP_URL}/partner`,
    })
    await emailProvider.send({ to: partnerEmail, ...tpl })
  } catch (error) {
    logger.error('Partner approval email send failed', {
      context: 'partner-actions',
      organizationId,
      error,
    })
  }

  revalidatePath('/admin/partners')
  return { success: true }
}

export async function rejectPartner(
  organizationId: string
): Promise<ServerActionResult> {
  const adminUser = await requireRole('admin')
  if (!adminUser) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()

  const { error } = await admin
    .from('partner_profiles')
    .update({ approval_status: 'rejected' })
    .eq('organization_id', organizationId)

  if (error) return { success: false, error: 'Failed to reject partner.' }

  // 从 notes 字段提取联系邮箱并发送拒绝通知
  try {
    const { data: profile } = await admin
      .from('partner_profiles')
      .select('notes')
      .eq('organization_id', organizationId)
      .single()

    const emailMatch = profile?.notes?.match(/Contact email:\s*(\S+)/)
    if (emailMatch) {
      const partnerEmail = emailMatch[1]
      const emailProvider = await createEmailProvider()
      const tpl = templates.partnerRejectedEmail({
        partnerName: partnerEmail.split('@')[0],
        portalUrl: env.NEXT_PUBLIC_APP_URL,
      })
      await emailProvider.send({ to: partnerEmail, ...tpl })
    }
  } catch (error) {
    logger.error('Partner rejection email send failed', {
      context: 'partner-actions',
      organizationId,
      error,
    })
  }

  revalidatePath('/admin/partners')
  return { success: true }
}
