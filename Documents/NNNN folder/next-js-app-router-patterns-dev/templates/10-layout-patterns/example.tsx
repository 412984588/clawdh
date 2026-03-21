// Next.js App Router 布局模式完整指南
// 涵盖嵌套布局、路由分组、template.tsx、共享 UI 模式

// ===== 目录结构示例 =====
//
// app/
// ├── layout.tsx                  ← 根布局（必须包含 <html><body>）
// ├── template.tsx                ← 根模板（每次导航都重新挂载）
// ├── page.tsx                    ← 首页
// │
// ├── (marketing)/                ← 路由分组：不影响 URL，共享布局
// │   ├── layout.tsx              ← marketing 专属布局（含导航/footer）
// │   ├── page.tsx                ← /（首页可以在组内）
// │   ├── about/page.tsx          ← /about
// │   └── pricing/page.tsx        ← /pricing
// │
// ├── (app)/                      ← 需要认证的应用区域
// │   ├── layout.tsx              ← 认证检查 + Dashboard 布局
// │   ├── dashboard/page.tsx      ← /dashboard
// │   └── settings/page.tsx       ← /settings
// │
// └── (auth)/                     ← 认证相关页面（无 sidebar）
//     ├── login/page.tsx          ← /login
//     └── register/page.tsx       ← /register

// ===== 1. 根布局 app/layout.tsx =====
import type { ReactNode } from "react";

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="min-h-screen bg-white antialiased">
        {/* 全局 Provider（主题、状态管理）放在根布局 */}
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// ===== 2. Marketing 布局 app/(marketing)/layout.tsx =====
export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <a href="/" className="text-xl font-bold">Logo</a>
          <div className="flex gap-6 text-sm">
            <a href="/about">关于</a>
            <a href="/pricing">定价</a>
            <a href="/blog">博客</a>
          </div>
          <div className="flex gap-3">
            <a href="/login" className="text-sm">登录</a>
            <a href="/register" className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white">
              注册
            </a>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-12 text-center text-sm text-gray-500">
        © 2024 我的应用 · <a href="/privacy">隐私政策</a> · <a href="/terms">服务条款</a>
      </footer>
    </div>
  );
}

// ===== 3. App 布局 app/(app)/layout.tsx — Dashboard 结构 =====
// 服务端组件，可以直接 await session
export async function AppLayout({ children }: { children: ReactNode }) {
  // const session = await getSession(); // 获取 server session
  // if (!session) redirect("/login");   // 未认证重定向

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 固定侧边栏 */}
      <Sidebar />
      {/* 主内容区：独立滚动 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ===== 4. template.tsx vs layout.tsx 区别 =====
// layout.tsx：在导航间保留状态（不重新挂载）
// template.tsx：每次导航都创建新实例（适合页面动画、视图切换特效）
//
// 示例：带淡入淡出的 template.tsx
export function PageTemplate({ children }: { children: ReactNode }) {
  return (
    // 每次路由变化都会重新挂载，触发 CSS 动画
    <div className="animate-fadeIn">
      {children}
    </div>
  );
}

// ===== 5. 嵌套布局示例 — 设置页面的分组 =====
// app/(app)/settings/layout.tsx — 设置区域的二级布局
export function SettingsLayout({ children }: { children: ReactNode }) {
  const settingsNav = [
    { href: "/settings/profile", label: "个人资料" },
    { href: "/settings/security", label: "安全设置" },
    { href: "/settings/billing", label: "账单与订阅" },
    { href: "/settings/notifications", label: "通知偏好" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold">设置</h1>
      <div className="flex gap-8">
        {/* 设置侧边导航 */}
        <nav className="w-56 shrink-0">
          <ul className="space-y-1">
            {settingsNav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {/* 设置内容区 */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

// ===== 6. 路由分组进阶：多根布局 =====
// 不同 URL 段可以共享完全不同的根布局
// app/(checkout)/layout.tsx — 结账流程专属极简布局
export function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh">
      <body className="bg-gray-50">
        <div className="mx-auto max-w-2xl py-12 px-4">
          <div className="mb-8 text-center">
            <a href="/" className="text-2xl font-bold">Logo</a>
          </div>
          <div className="rounded-xl bg-white p-8 shadow-sm">
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">
            安全支付 · SSL 加密
          </p>
        </div>
      </body>
    </html>
  );
}

// ===== 7. 通用布局组件 =====
// 可复用的页面容器，统一最大宽度和间距
export function PageContainer({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {(title || description) && (
        <div className="mb-8">
          {title && <h1 className="text-3xl font-bold">{title}</h1>}
          {description && (
            <p className="mt-2 text-gray-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ===== 占位组件（实际项目中替换为真实实现）=====
function ThemeProvider({ children }: { children: ReactNode }) { return <>{children}</>; }
function AuthProvider({ children }: { children: ReactNode }) { return <>{children}</>; }
function Sidebar() { return <aside className="w-64 border-r" />; }
function Topbar() { return <header className="h-16 border-b" />; }

export default RootLayout;
