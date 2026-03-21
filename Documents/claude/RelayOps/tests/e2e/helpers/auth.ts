import { BrowserContext } from '@playwright/test'
import path from 'path'
import fs from 'fs'

// ─── Auth storage state paths ─────────────────────────────────────────────────
export const AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth')

export const AUTH_PATHS = {
  admin: path.join(AUTH_DIR, 'admin.json'),
  partner: path.join(AUTH_DIR, 'partner.json'),
  worker: path.join(AUTH_DIR, 'worker.json'),
} as const

export type AuthRole = keyof typeof AUTH_PATHS

/**
 * Injects a Supabase auth session into a Playwright browser context by setting
 * the auth cookie in the format expected by @supabase/ssr's createBrowserClient.
 *
 * The cookie value format is: `base64-{base64url(JSON.stringify(session))}`
 * The cookie name is: `sb-{hostname_first_segment}-auth-token`
 * For http://127.0.0.1:54321 → sb-127-auth-token
 */
export async function injectSupabaseSession(
  context: BrowserContext,
  session: {
    access_token: string
    refresh_token: string
    expires_in?: number
    token_type?: string
    user: Record<string, unknown>
  }
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
  const hostname = new URL(supabaseUrl).hostname
  // Derive storage key used by @supabase/supabase-js
  const storageKey = `sb-${hostname.split('.')[0]}-auth-token`

  const sessionJson = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type ?? 'bearer',
    expires_in: session.expires_in ?? 3600,
    expires_at: Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600),
    user: session.user,
  })

  // base64url encode (no padding) to match @supabase/ssr stringToBase64URL
  const base64url = Buffer.from(sessionJson, 'utf8').toString('base64url')
  const cookieValue = `base64-${base64url}`

  // Split into chunks ≤ 3180 URL-encoded chars (same as @supabase/ssr MAX_CHUNK_SIZE)
  const MAX_CHUNK_SIZE = 3180
  const urlEncoded = encodeURIComponent(cookieValue)

  const cookieBase = {
    domain: 'localhost',
    path: '/',
    sameSite: 'Lax' as const,
    secure: false,
    httpOnly: false,
    expires: Math.floor(Date.now() / 1000) + 3600,
  }

  if (urlEncoded.length <= MAX_CHUNK_SIZE) {
    await context.addCookies([{ name: storageKey, value: cookieValue, ...cookieBase }])
  } else {
    // Large session: split into chunks (cookie names: key.0, key.1, …)
    const chunks: string[] = []
    let remaining = urlEncoded
    while (remaining.length > 0) {
      chunks.push(decodeURIComponent(remaining.slice(0, MAX_CHUNK_SIZE)))
      remaining = remaining.slice(MAX_CHUNK_SIZE)
    }
    await context.addCookies(
      chunks.map((chunk, i) => ({ name: `${storageKey}.${i}`, value: chunk, ...cookieBase }))
    )
  }
}

/**
 * Ensure the playwright/.auth directory exists.
 */
export function ensureAuthDir(): void {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true })
  }
}
