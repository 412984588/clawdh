import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/config/env'

const BUCKET = 'ticket-files'

// 单例：避免每次调用都创建新的 Supabase 客户端
let storageClient: SupabaseClient | null = null

function getStorageClient(): SupabaseClient {
  if (!storageClient) {
    // Uses service role to bypass RLS on storage
    storageClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  }
  return storageClient
}

export function getStorageBucket() {
  return getStorageClient().storage.from(BUCKET)
}

export { BUCKET }
