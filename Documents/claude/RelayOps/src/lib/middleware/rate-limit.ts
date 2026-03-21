// 滑动窗口限流器 — Edge Runtime 兼容（无 Node.js 原生模块依赖）
// 当前实现基于内存 Map，per-instance 不跨进程共享
// 生产环境可通过 RateLimitStore 接口替换为 Redis adapter

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number // Unix ms
}

// 存储接口 — 预留 Redis adapter 扩展点
export interface RateLimitStore {
  /** 记录一次请求，返回当前窗口内的计数 */
  increment(key: string, windowMs: number): { count: number; oldestTimestamp: number }
  /** 清理过期条目（Edge Runtime 无 setInterval，需惰性调用） */
  cleanup(): void
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  whitelist?: string[]
}

// 内存滑动窗口实现
export class MemoryStore implements RateLimitStore {
  private store = new Map<string, number[]>()
  private lastCleanup = Date.now()
  private cleanupIntervalMs = 60_000

  increment(key: string, windowMs: number): { count: number; oldestTimestamp: number } {
    const now = Date.now()

    // 惰性清理：每 60 秒扫描一次过期条目
    if (now - this.lastCleanup > this.cleanupIntervalMs) {
      this.cleanup()
      this.lastCleanup = now
    }

    const windowStart = now - windowMs
    let timestamps = this.store.get(key)

    if (timestamps) {
      // 滑动窗口：丢弃窗口外的时间戳
      timestamps = timestamps.filter((t) => t > windowStart)
    } else {
      timestamps = []
    }

    timestamps.push(now)
    this.store.set(key, timestamps)

    return {
      count: timestamps.length,
      oldestTimestamp: timestamps[0],
    }
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, timestamps] of this.store.entries()) {
      // 保守清理：最新时间戳超过 5 分钟则删除整个条目
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < now - 5 * 60_000) {
        this.store.delete(key)
      }
    }
  }

  /** 仅测试用：获取当前存储大小 */
  get size(): number {
    return this.store.size
  }
}

// 限流检查入口
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig,
  store: RateLimitStore
): RateLimitResult {
  // 白名单 IP 直接放行
  if (config.whitelist?.includes(ip)) {
    return { allowed: true, remaining: config.maxRequests, resetAt: 0 }
  }

  const { count, oldestTimestamp } = store.increment(ip, config.windowMs)
  const remaining = Math.max(0, config.maxRequests - count)
  const resetAt = oldestTimestamp + config.windowMs

  return {
    allowed: count <= config.maxRequests,
    remaining,
    resetAt,
  }
}
