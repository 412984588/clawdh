import { chromium, Browser } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import {
  ADMIN_EMAIL,
  PARTNER_EMAIL,
  WORKER_EMAIL,
  PASSWORD,
} from './helpers/constants'
import { AUTH_PATHS, injectSupabaseSession, ensureAuthDir } from './helpers/auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqd7Iu8tDUSyh0CdnJS-YScie9ob7VJSY'

async function loginAs(
  browser: Browser,
  email: string,
  password: string,
  statePath: string
): Promise<void> {
  // 1. Node.js 侧调用 signInWithPassword 获取 JWT
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    throw new Error(`Login failed for ${email}: ${error?.message ?? 'no session'}`)
  }

  const { access_token, refresh_token, expires_in, token_type, user } = data.session

  // 2. 打开浏览器页面并注入 session cookie
  const context = await browser.newContext()
  const page = await context.newPage()

  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
  await page.goto(baseURL)

  await injectSupabaseSession(context, {
    access_token,
    refresh_token,
    expires_in: expires_in ?? 3600,
    token_type: token_type ?? 'bearer',
    user: user as unknown as Record<string, unknown>,
  })

  // 3. 保存 browser state（含 cookie）
  await context.storageState({ path: statePath })
  await context.close()

  console.log(`  ✓ Saved auth state for ${email} → ${statePath}`)
}

export default async function globalSetup() {
  ensureAuthDir()

  console.log('[global-setup] Logging in 3 roles...')

  const browser = await chromium.launch()

  try {
    await loginAs(browser, ADMIN_EMAIL, PASSWORD, AUTH_PATHS.admin)
    await loginAs(browser, PARTNER_EMAIL, PASSWORD, AUTH_PATHS.partner)
    await loginAs(browser, WORKER_EMAIL, PASSWORD, AUTH_PATHS.worker)
  } finally {
    await browser.close()
  }

  console.log('[global-setup] Done.')
}
