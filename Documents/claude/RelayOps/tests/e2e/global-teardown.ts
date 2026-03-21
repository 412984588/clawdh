import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  (() => {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for E2E teardown')
  })()

export default async function globalTeardown() {
  console.log('[global-teardown] Cleaning up [E2E] test data...')

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })

  // 删除 [E2E] 前缀的 tickets（级联删除相关 events/assignments）
  const { error } = await admin.from('tickets').delete().ilike('title', '[E2E]%')

  if (error) {
    console.warn('[global-teardown] Warning: failed to delete [E2E] tickets:', error.message)
  } else {
    console.log('[global-teardown] Done.')
  }
}
