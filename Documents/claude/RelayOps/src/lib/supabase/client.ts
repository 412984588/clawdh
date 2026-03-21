import { createBrowserClient } from '@supabase/ssr'

// 直接读 NEXT_PUBLIC_* 变量 — 这两个在浏览器端可用，
// 不能引入 env.ts（含服务端专属变量），否则客户端 Zod 校验会报错
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
