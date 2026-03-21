// Next.js App Router Middleware 完整模式
// 文件位置：项目根目录 middleware.ts（与 app/ 同级）
// 运行在 Edge Runtime，在请求到达路由前拦截

import { NextRequest, NextResponse } from "next/server";

// ===== 1. Auth 重定向 — 保护路由 =====
async function handleAuth(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ["/", "/login", "/register", "/api/auth"];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isPublic) return null; // 不需要鉴权，继续

  if (!token) {
    // 未登录 → 重定向到登录页，保留 callbackUrl
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 验证 token（Edge 兼容方式，使用 jose 库）
  try {
    // const { payload } = await jwtVerify(token, secret);
    // 验证成功，在请求头注入用户信息供下游使用
    const response = NextResponse.next();
    response.headers.set("x-user-id", "user-123"); // 实际从 payload 取
    return response;
  } catch {
    // Token 无效 → 清除 cookie 并重定向
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("auth-token");
    return response;
  }
}

// ===== 2. 国际化 / 语言路由 =====
const LOCALES = ["zh", "en", "ja"] as const;
type Locale = (typeof LOCALES)[number];

function detectLocale(request: NextRequest): Locale {
  // 优先级：cookie > Accept-Language header > 默认值
  const cookieLocale = request.cookies.get("locale")?.value as Locale;
  if (LOCALES.includes(cookieLocale)) return cookieLocale;

  const acceptLang = request.headers.get("accept-language") ?? "";
  for (const locale of LOCALES) {
    if (acceptLang.toLowerCase().includes(locale)) return locale;
  }
  return "zh"; // 默认
}

function handleI18n(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!hasLocale && !pathname.startsWith("/api")) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }
  return null;
}

// ===== 3. A/B 测试 =====
function handleABTest(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // 只对首页运行 A/B 测试
  if (pathname !== "/") return null;

  const abCookie = request.cookies.get("ab-variant")?.value;
  const variant = abCookie ?? (Math.random() > 0.5 ? "a" : "b");

  // 将请求重写到对应变体，URL 不变
  const url = request.nextUrl.clone();
  url.pathname = `/ab-variants/${variant}`;
  const response = NextResponse.rewrite(url);

  // 持久化 cookie，确保同一用户始终看到同一变体
  if (!abCookie) {
    response.cookies.set("ab-variant", variant, {
      maxAge: 60 * 60 * 24 * 30, // 30 天
      httpOnly: false, // 允许客户端分析读取
    });
  }
  return response;
}

// ===== 4. Rate Limiting（简单计数，生产推荐用 Upstash Redis）=====
// Edge 内存不跨实例，实际生产需外部存储
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const WINDOW_MS = 60_000; // 1 分钟

function handleRateLimit(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith("/api")) return null;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (entry.count >= RATE_LIMIT) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        "X-RateLimit-Limit": String(RATE_LIMIT),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(entry.resetAt),
      },
    });
  }

  entry.count++;
  return null;
}

// ===== 5. CSP 安全头 =====
function addSecurityHeaders(response: NextResponse): NextResponse {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://analytics.example.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.example.com",
    "font-src 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

// ===== 主 middleware 函数 =====
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // 静态文件和内部路径跳过
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(ico|png|jpg|svg|webp|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 按优先级链式处理
  const rateLimitResponse = handleRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // 注释掉 i18n 和 A/B 以避免冲突，根据项目需要开启
  // const i18nResponse = handleI18n(request);
  // if (i18nResponse) return i18nResponse;

  // const abResponse = handleABTest(request);
  // if (abResponse) return addSecurityHeaders(abResponse);

  const authResponse = await handleAuth(request);
  if (authResponse) return authResponse;

  // 添加安全头到所有响应
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

// ===== matcher — 指定哪些路径运行 middleware =====
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static（静态文件）
     * - _next/image（图片优化 API）
     * - favicon.ico
     * - 以 . 开头的文件（如 .well-known）
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
