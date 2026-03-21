import { cache } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/lib/types/enums'

interface SessionUserRecord {
  id: string
  role: UserRole
  email: string
  organization_id: string | null
}

export interface SessionUser extends SessionUserRecord {
  authUser: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createServerClient>>['auth']['getUser']>>['data']['user']>
}

/**
 * 同一请求只查一次 auth + role，React.cache 保证同请求内幂等
 */
export const getSessionUser = cache(async () => {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const admin = createAdminClient()
  const { data: userRecord } = await admin
    .from('users')
    .select('id, role, email, organization_id')
    .eq('id', user.id)
    .single()

  if (!userRecord) return null

  return { authUser: user, ...(userRecord as SessionUserRecord) } satisfies SessionUser
})

export async function requireRole<T extends UserRole>(
  role: T
): Promise<(SessionUser & { role: T }) | null> {
  const user = await getSessionUser()
  if (!user || user.role !== role) {
    return null
  }

  return user as SessionUser & { role: T }
}
