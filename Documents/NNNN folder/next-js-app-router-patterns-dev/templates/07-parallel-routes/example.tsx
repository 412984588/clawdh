// Next.js App Router 并行路由（Parallel Routes）& 拦截路由（Intercepting Routes）
//
// 目录结构：
// app/
//   layout.tsx            <- 根布局，渲染 @team 和 @analytics 两个 slot
//   @team/
//     page.tsx            <- 团队列表（并行路由 slot）
//     loading.tsx         <- 团队 slot 加载状态
//     error.tsx           <- 团队 slot 错误状态
//   @analytics/
//     page.tsx            <- 分析面板（并行路由 slot）
//   (.)photos/[id]/
//     page.tsx            <- 拦截路由：在当前页模态框中显示照片

// ===== 1. 并行路由 — app/layout.tsx =====
// 根布局同时接收多个 slot，它们独立渲染、独立流式传输、独立错误隔离

interface LayoutProps {
  children: React.ReactNode;
  team: React.ReactNode;        // @team slot
  analytics: React.ReactNode;  // @analytics slot
}

export function DashboardLayout({ children, team, analytics }: LayoutProps) {
  return (
    <div className="dashboard-grid">
      {/* 主内容区 */}
      <main className="col-span-2">{children}</main>
      {/* 并行 slot — 独立 Suspense 和错误边界 */}
      <aside className="sidebar">
        <div className="panel">{team}</div>
        <div className="panel">{analytics}</div>
      </aside>
    </div>
  );
}

// ===== 2. @team/page.tsx — 团队成员列表 =====
async function fetchTeamMembers() {
  // 模拟慢速 API
  await new Promise((r) => setTimeout(r, 800));
  return [
    { id: "1", name: "Alice", role: "工程师" },
    { id: "2", name: "Bob", role: "设计师" },
    { id: "3", name: "Charlie", role: "产品" },
  ];
}

export async function TeamPage() {
  const members = await fetchTeamMembers();
  return (
    <section>
      <h2 className="text-lg font-semibold">团队成员</h2>
      <ul className="mt-3 space-y-2">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs">
              {m.name[0]}
            </div>
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-xs text-gray-500">{m.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ===== 3. @analytics/page.tsx — 分析数据 =====
async function fetchAnalytics() {
  await new Promise((r) => setTimeout(r, 1200)); // 更慢的请求
  return { pageViews: 12480, uniqueVisitors: 3240, bounceRate: "42%" };
}

export async function AnalyticsPage() {
  const stats = await fetchAnalytics();
  return (
    <section>
      <h2 className="text-lg font-semibold">本周数据</h2>
      <dl className="mt-3 grid grid-cols-1 gap-2">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="rounded bg-gray-50 p-3">
            <dt className="text-xs text-gray-500 capitalize">{key}</dt>
            <dd className="text-xl font-bold">{val.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ===== 4. 拦截路由 — (.)photos/[id]/page.tsx =====
// 路由约定：
//   (.)   — 拦截同级路由
//   (..)  — 拦截上一级路由
//   (..)(..) — 拦截上两级路由
//   (...) — 拦截根路由
//
// 效果：从图库页面点击图片 → 模态框打开（URL 变为 /photos/123）
//       直接访问 /photos/123 → 完整照片页面
//
// 需要配合 <Link> + useRouter 在图库页面触发

interface PhotoPageProps {
  params: { id: string };
}

export async function InterceptedPhotoPage({ params }: PhotoPageProps) {
  const photo = await fetchPhoto(params.id);
  return (
    // 渲染为模态框覆盖层（在图库上下文中）
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden">
        <button
          className="absolute right-4 top-4 text-2xl text-gray-400 hover:text-gray-700"
          aria-label="关闭"
        >
          ×
        </button>
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full object-cover"
        />
        <div className="p-6">
          <h2 className="text-xl font-bold">{photo.title}</h2>
          <p className="mt-1 text-gray-500">{photo.description}</p>
        </div>
      </div>
    </div>
  );
}

// ===== 5. 独立页面访问 — photos/[id]/page.tsx（非拦截）=====
export async function PhotoDetailPage({ params }: PhotoPageProps) {
  const photo = await fetchPhoto(params.id);
  return (
    <div className="max-w-4xl mx-auto">
      <img src={photo.url} alt={photo.title} className="w-full rounded-xl" />
      <div className="mt-6">
        <h1 className="text-3xl font-bold">{photo.title}</h1>
        <p className="mt-3 text-gray-600">{photo.description}</p>
      </div>
    </div>
  );
}

// ===== 6. 条件渲染 slot — 根据认证状态显示不同内容 =====
interface ConditionalLayoutProps {
  children: React.ReactNode;
  authenticated: React.ReactNode;
  unauthenticated: React.ReactNode;
}

export function ConditionalLayout({
  children,
  authenticated,
  unauthenticated,
}: ConditionalLayoutProps) {
  // 根据服务端 session 决定渲染哪个 slot
  // 两个 slot 都可以有各自的 loading.tsx 和 error.tsx
  const isLoggedIn = checkAuth();
  return (
    <div>
      {isLoggedIn ? authenticated : unauthenticated}
      {children}
    </div>
  );
}

// 占位辅助函数
async function fetchPhoto(_id: string) {
  return { url: "/photo.jpg", title: "照片标题", description: "照片描述" };
}
function checkAuth() { return false; }

import React from "react";
