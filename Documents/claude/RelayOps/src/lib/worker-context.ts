import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'

export interface WorkerContext {
  userId: string
  workerProfileId: string
  role: 'worker_internal'
}

// React.cache 使同一请求内多次调用共享结果，避免重复 DB 查询
export const getWorkerContext = cache(async (): Promise<WorkerContext | null> => {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const admin = createAdminClient()
  const { data: userRecord } = await admin
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!userRecord || userRecord.role !== 'worker_internal') return null

  const { data: workerProfile } = await admin
    .from('worker_profiles')
    .select('id, user_id')
    .eq('user_id', user.id)
    .single()

  if (!workerProfile) return null

  return {
    userId: userRecord.id,
    workerProfileId: workerProfile.id,
    role: 'worker_internal',
  }
})
