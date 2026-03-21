// Express.js 限流中间件模式 — TypeScript
// 内存限流、Redis 限流、按路由配置、自定义 key 生成器

import { Request, Response, NextFunction } from "express";

// ===== 1. 内存限流器（适合单实例，不跨进程）=====

interface RateLimitConfig {
  windowMs: number;       // 时间窗口（毫秒）
  max: number;            // 时间窗口内最大请求数
  message?: string;       // 超限时的错误消息
  keyGenerator?: (req: Request) => string;  // 如何识别客户端
  skipFailedRequests?: boolean;             // 4xx/5xx 响应是否不计数
  skip?: (req: Request) => boolean;         // 跳过限流的条件
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const store = new Map<string, RateLimitEntry>();

  // 定期清理过期条目
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, config.windowMs);

  cleanup.unref?.(); // 不阻止进程退出

  const defaultKeyGenerator = (req: Request): string => {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.socket.remoteAddress ??
      "unknown"
    );
  };

  const getKey = config.keyGenerator ?? defaultKeyGenerator;

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    // 可选跳过条件
    if (config.skip?.(req)) { next(); return; }

    const key = getKey(req);
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + config.windowMs });
      setRateLimitHeaders(res, config.max, config.max - 1, now + config.windowMs);
      next();
      return;
    }

    if (entry.count >= config.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      setRateLimitHeaders(res, config.max, 0, entry.resetAt);
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: config.message ?? "Too many requests",
          retryAfter,
        },
      });
      return;
    }

    entry.count++;
    setRateLimitHeaders(res, config.max, config.max - entry.count, entry.resetAt);
    next();
  };
}

function setRateLimitHeaders(res: Response, limit: number, remaining: number, resetAt: number) {
  res.set({
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    "X-RateLimit-Policy": `${limit};w=${60}`,
  });
}

// ===== 2. 预配置的限流器 =====

// 通用 API 限流：每分钟 100 次
export const apiLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 100,
  message: "Too many API requests, please try again in a minute",
});

// 认证限流：每 15 分钟 5 次（防暴力破解）
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60_000,
  max: 5,
  message: "Too many login attempts, please try again in 15 minutes",
  keyGenerator: (req: Request) => {
    // 按 IP + 邮箱组合限流
    const email = (req.body as Record<string, string>)?.email ?? "";
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
    return `${ip}:${email}`;
  },
});

// 创建资源限流：每小时 10 次
export const createLimiter = createRateLimiter({
  windowMs: 60 * 60_000,
  max: 10,
  message: "Resource creation limit reached, please try again later",
});

// 搜索限流：每分钟 30 次
export const searchLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  skip: (req: Request) => {
    // Admin 用户跳过限流（需要先经过认证中间件）
    const user = (req as Request & { user?: { role: string } }).user;
    return user?.role === "admin";
  },
});

// ===== 3. 按用户 ID 限流（认证后使用）=====

export const perUserLimiter = createRateLimiter({
  windowMs: 60_000,
  max: 60,
  keyGenerator: (req: Request) => {
    const user = (req as Request & { user?: { sub: string } }).user;
    return user?.sub ?? (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "anon";
  },
});

// ===== 4. 滑动窗口限流器（更平滑）=====

interface SlidingWindowEntry {
  timestamps: number[];
}

export function createSlidingWindowLimiter(windowMs: number, max: number) {
  const store = new Map<string, SlidingWindowEntry>();

  return function slidingRateLimit(req: Request, res: Response, next: NextFunction): void {
    const key = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const entry = store.get(key) ?? { timestamps: [] };

    // 清除时间窗口外的旧记录
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= max) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      res.status(429).json({
        success: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: "Rate limit exceeded", retryAfter },
      });
      return;
    }

    entry.timestamps.push(now);
    store.set(key, entry);

    res.set({
      "X-RateLimit-Limit": String(max),
      "X-RateLimit-Remaining": String(max - entry.timestamps.length),
    });
    next();
  };
}

export { RateLimitConfig, RateLimitEntry };
