import type { SupabaseClient } from '@supabase/supabase-js'

interface PilotEligibility {
  eligible: boolean
  reason?: string
}

// 检查组织是否有资格使用 pilot 优惠（每个组织/邮件域只能用一次）
export async function checkPilotEligibility(
  supabase: SupabaseClient,
  organizationId: string,
  partnerEmail: string
): Promise<PilotEligibility> {
  // 检查当前组织是否已用过 pilot
  const { data: existingPilot } = await supabase
    .from('tickets')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('pricing_tier', 'pilot')
    .neq('status', 'cancelled')
    .limit(1)
    .maybeSingle()

  if (existingPilot) {
    return { eligible: false, reason: 'Your organization has already used the pilot offer.' }
  }

  // 同一邮件域只能有一个 pilot
  const emailDomain = partnerEmail.split('@')[1]
  const { data: domainUsers } = await supabase
    .from('users')
    .select('organization_id')
    .ilike('email', `%@${emailDomain}`)

  if (domainUsers && domainUsers.length > 0) {
    const orgIds = [...new Set(domainUsers.map((u) => u.organization_id).filter(Boolean))]
    if (orgIds.length > 0) {
      const { data: domainPilot } = await supabase
        .from('tickets')
        .select('id')
        .in('organization_id', orgIds as string[])
        .eq('pricing_tier', 'pilot')
        .neq('status', 'cancelled')
        .limit(1)
        .maybeSingle()

      if (domainPilot) {
        return {
          eligible: false,
          reason: 'A pilot has already been used for your email domain.',
        }
      }
    }
  }

  return { eligible: true }
}
