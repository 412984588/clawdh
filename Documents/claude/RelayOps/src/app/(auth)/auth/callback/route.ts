import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard-redirect'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    // 将具体错误原因带到错误页
    const msg = encodeURIComponent(error.message ?? 'Authentication failed')
    return NextResponse.redirect(`${origin}/auth/error?message=${msg}`)
  }

  return NextResponse.redirect(
    `${origin}/auth/error?message=${encodeURIComponent('No authorization code provided')}`
  )
}
