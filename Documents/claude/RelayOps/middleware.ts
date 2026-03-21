import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { updateSession } from '@/lib/supabase/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
import { MemoryStore, checkRateLimit } from '@/lib/middleware/rate-limit'
import { getConfigForPath } from '@/lib/middleware/rate-limit-config'
import { routing } from '@/i18n/routing'

// 模块级实例 — 同一 Edge Runtime 实例内共享
const rateLimitStore = new MemoryStore()

// next-intl 国际化中间件（仅公开路由使用）
const intlMiddleware = createIntlMiddleware(routing)

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/for-partners',
  '/request-access',
  '/pilot-sample',
  '/security',
  '/terms',
  '/privacy',
  '/refund-policy',
  '/case-studies',
  '/demo',
  '/home',
  '/pricing',
]
const AUTH_ROUTES = ['/login']
const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  partner: '/partner',
  worker_internal: '/worker',
}

// 判断路径是否为公开路由（含 /zh 前缀）
function isPublicPath(pathname: string): boolean {
  // 去掉 locale 前缀后判断
  const pathWithoutLocale = pathname.replace(/^\/(zh)/, '') || '/'
  return PUBLIC_ROUTES.some(
    (r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(r + '/')
  )
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── 请求追踪 ID（贯穿整个请求链路）──────────────────────────────────
  const traceId = crypto.randomUUID()
  request.headers.set('x-trace-id', traceId)

  // ── 限流检查（先于认证，fail-fast 减少资源消耗）──────────────────────
  const rateLimitConfig = getConfigForPath(pathname, request.method)
  if (rateLimitConfig) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1'
    const result = checkRateLimit(ip, rateLimitConfig, rateLimitStore)

    if (!result.allowed) {
      const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: retryAfterSeconds },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(1, retryAfterSeconds)),
            'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetAt),
            'x-trace-id': traceId,
          },
        }
      )
    }
  }

  // ── 公开路由：交给 next-intl 处理国际化路由 ──────────────────────────
  if (isPublicPath(pathname)) {
    const response = intlMiddleware(request)
    response.headers.set('x-trace-id', traceId)
    return response
  }

  // ── 非公开路由：原有的 supabase + 认证逻辑 ──────────────────────────
  const { supabaseResponse, user } = await updateSession(request)
  supabaseResponse.headers.set('x-trace-id', traceId)

  // Allow auth routes (but redirect if already logged in)
  if (AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard-redirect', request.url))
    }
    return supabaseResponse
  }

  // Require auth for all other routes
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based routing: fetch user role from DB
  if (pathname === '/dashboard-redirect') {
    const admin = createAdminClient()
    const { data: userData } = await admin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const roleRedirect = ROLE_ROUTES[userData.role as string] || '/login'
    return NextResponse.redirect(new URL(roleRedirect, request.url))
  }

  // Enforce role-based path guards for dashboard routes
  const isDashboardRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/partner') ||
    pathname.startsWith('/worker')

  if (isDashboardRoute) {
    const admin = createAdminClient()
    const { data: userData } = await admin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const allowedPrefix = ROLE_ROUTES[userData.role as string]
    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
