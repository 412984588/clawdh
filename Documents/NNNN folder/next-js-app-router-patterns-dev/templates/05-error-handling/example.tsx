"use client";

// error.tsx — 路由级错误边界
// Next.js App Router 会自动将此文件包装成 Suspense 错误边界
// 必须是 Client Component（因为需要 useEffect 和事件处理）

import { useEffect } from "next/dist/compiled/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报到错误监控服务（Sentry、Datadog 等）
    console.error("Route segment error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">出了点问题</h2>
        <p className="mt-2 text-gray-600">
          {error.message || "发生了未知错误，请稍后再试"}
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-gray-400">
            错误 ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          重试
        </button>
        <a
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}

// global-error.tsx — 根布局级错误边界
// 捕获根 layout.tsx 中的错误，必须包含 <html> 和 <body>
export function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="zh">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-3xl font-bold">应用发生严重错误</h1>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <button
            onClick={reset}
            className="mt-4 rounded bg-blue-600 px-6 py-2 text-white"
          >
            重新加载
          </button>
        </div>
      </body>
    </html>
  );
}

// not-found.tsx — 404 页面
// 由 notFound() 函数或无匹配路由触发
export function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <p className="text-6xl font-black text-gray-200">404</p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">页面不存在</h2>
        <p className="mt-2 text-gray-600">
          您访问的页面不存在，请检查链接是否正确
        </p>
      </div>
      <a
        href="/"
        className="rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
      >
        返回首页
      </a>
    </div>
  );
}

// 在 Server Component 中主动触发 not-found
// import { notFound } from "next/navigation";
//
// export default async function ProductPage({ params }: { params: { id: string } }) {
//   const product = await getProduct(params.id);
//   if (!product) {
//     notFound(); // 渲染最近的 not-found.tsx
//   }
//   return <div>{product.name}</div>;
// }

// 在 Server Action 中触发 redirect 或 notFound
import { redirect } from "next/navigation";

export async function serverActionExample(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const result = await processData(id);
  if (!result) {
    redirect("/404"); // 或 notFound()
  }
  redirect(`/success/${result.id}`);
}

// 自定义错误类，携带额外上下文
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

// 工具函数：安全执行并返回错误
type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知错误";
    return { data: null, error: message };
  }
}

// 占位辅助函数（实际项目中替换为真实实现）
async function getProduct(_id: string) { return null; }
async function processData(_id: string) { return null; }
