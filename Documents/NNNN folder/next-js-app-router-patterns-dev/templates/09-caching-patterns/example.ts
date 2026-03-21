// Next.js App Router 缓存模式完整指南
// 涵盖 unstable_cache、revalidateTag、fetch 缓存选项、full-route 缓存

import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";

// ===== 1. unstable_cache — 缓存任意异步函数 =====
// 适用场景：数据库查询、第三方 API、计算密集型操作

// 基础用法：缓存数据库查询结果
export const getCachedPosts = unstable_cache(
  async () => {
    // 这里可以是任何异步操作（数据库、外部 API 等）
    const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });
    return posts;
  },
  ["all-posts"],           // 缓存键（全局唯一）
  {
    revalidate: 3600,       // 秒：每小时重新验证一次
    tags: ["posts"],        // 标签：用于按需失效
  }
);

// 带参数的缓存：按 ID 缓存单篇文章
export const getCachedPost = unstable_cache(
  async (slug: string) => {
    return db.post.findUnique({ where: { slug } });
  },
  ["post"],                // 基础缓存键
  {
    revalidate: 1800,       // 30 分钟
    tags: ["posts"],        // 与 all-posts 使用相同 tag，一起失效
  }
);

// 带动态标签：每个用户独立缓存
export const getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    return db.user.findUnique({ where: { id: userId } });
  },
  ["user-profile"],
  {
    revalidate: false,       // 不自动过期，仅通过 tag 失效
    tags: ["user-profiles"], // 所有用户 profile 的通用 tag
  }
);

// ===== 2. fetch 缓存选项 =====
// Next.js 扩展了原生 fetch，支持更细粒度的缓存控制

export async function fetchWithCache() {
  // 默认缓存（等同于 cache: 'force-cache'）
  const data1 = await fetch("https://api.example.com/config");

  // 强制缓存 + 自定义 tag（可按需失效）
  const data2 = await fetch("https://api.example.com/products", {
    next: {
      revalidate: 3600,        // 1 小时 ISR
      tags: ["products"],
    },
  });

  // 不缓存 — 每次请求都实时获取
  const data3 = await fetch("https://api.example.com/realtime", {
    cache: "no-store",
  });

  // 静态缓存 — 构建时获取，部署期间不变
  const data4 = await fetch("https://api.example.com/static-data", {
    cache: "force-cache",
  });

  return { data1, data2, data3, data4 };
}

// ===== 3. revalidateTag — 按需缓存失效 =====
// 在 Server Action 或 Route Handler 中调用

// 发布新文章后失效所有帖子缓存
export async function createPost(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await db.post.create({ data: { title, content } });

  // 失效所有带 "posts" tag 的缓存
  revalidateTag("posts");
  // 同时刷新页面路径的 full-route 缓存
  revalidatePath("/blog");
  revalidatePath("/");
}

// 更新用户资料后失效该用户缓存
export async function updateUserProfile(
  userId: string,
  data: { name?: string; bio?: string }
) {
  "use server";
  await db.user.update({ where: { id: userId }, data });

  // 按动态标签失效单个用户的缓存
  revalidateTag(`user-${userId}`);
  revalidatePath(`/profile/${userId}`);
}

// ===== 4. revalidatePath — 路径缓存失效 =====
export async function updatePost(id: string, formData: FormData) {
  "use server";
  const post = await db.post.update({
    where: { id },
    data: { title: formData.get("title") as string },
  });

  // 失效特定路径
  revalidatePath(`/blog/${post.slug}`);          // 特定页面
  revalidatePath("/blog");                        // 列表页
  revalidatePath("/", "layout");                  // 根布局（会失效所有子路由）
}

// ===== 5. 动态渲染 vs 静态渲染控制 =====
// 导出这些常量控制路由的渲染行为

// 强制静态渲染（构建时生成，忽略动态函数）
export const dynamic = "force-static";

// 强制动态渲染（每次请求都重新渲染）
// export const dynamic = "force-dynamic";

// 自动模式（默认）：有动态函数时动态渲染，否则静态
// export const dynamic = "auto";

// ISR：指定重新验证间隔（秒）
export const revalidate = 3600; // 1 小时

// 运行时选择
export const runtime = "nodejs"; // 或 "edge"

// ===== 6. 路由段缓存配置 =====
// export const fetchCache = "force-cache"; // 覆盖所有 fetch 请求的默认缓存行为

// ===== 7. 细粒度缓存工具函数 =====

// 带自定义 per-user tag 的缓存工厂
export function createUserCache<T>(
  fn: (userId: string) => Promise<T>,
  baseKey: string,
  ttl = 300
) {
  return (userId: string) =>
    unstable_cache(fn, [baseKey, userId], {
      revalidate: ttl,
      tags: [`${baseKey}-${userId}`, baseKey],
    })(userId);
}

// 使用示例
const getUserOrders = createUserCache(
  async (userId: string) => db.order.findMany({ where: { userId } }),
  "user-orders",
  600 // 10 分钟
);

// 并行获取多个缓存数据（充分利用 Next.js 请求去重）
export async function getDashboardData(userId: string) {
  const [profile, orders, posts] = await Promise.all([
    getCachedUserProfile(userId),
    getUserOrders(userId),
    getCachedPosts(),
  ]);
  return { profile, orders, posts };
}

// 占位 db 对象（实际项目使用 Prisma/Drizzle 等）
const db = {
  post: {
    findMany: async (_opts?: unknown) => [] as Array<{ slug: string }>,
    findUnique: async (_opts?: unknown) => null,
    create: async (_opts?: unknown) => ({ slug: "new-post" }),
    update: async (_opts?: unknown) => ({ slug: "updated-post" }),
  },
  user: {
    findUnique: async (_opts?: unknown) => null,
    update: async (_opts?: unknown) => null,
  },
  order: {
    findMany: async (_opts?: unknown) => [],
  },
};
