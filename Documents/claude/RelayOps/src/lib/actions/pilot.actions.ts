'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import type { ServerActionResult } from '@/lib/types/api'

const pilotInterestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function submitPilotInterest(
  data: unknown
): Promise<ServerActionResult> {
  const parsed = pilotInterestSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { email } = parsed.data
  const admin = createAdminClient()

  // 幂等插入：相同邮箱已存在时直接返回成功
  const { error } = await admin
    .from('pilot_interests')
    .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })

  if (error) {
    // pilot_interests 表不存在时静默降级（feature flag 场景）
    if (error.code === '42P01') return { success: true }
    return { success: false, error: 'Failed to save. Please try again.' }
  }

  return { success: true }
}
