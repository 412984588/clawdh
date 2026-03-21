/**
 * Redis Rate Limiting
 * Demonstrates: fixed window, sliding window log, sliding window counter, token bucket
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Fixed window counter ───────────────────────────────────────────────────────
// Simple: count requests in the current time window

export async function fixedWindowRateLimit(
  userId: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `ratelimit:fixed:${userId}:${window}`;

  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.expire(key, windowSeconds * 2); // slightly longer to handle edge
  const results = await pipeline.exec();

  const count = results?.[0]?.[1] as number;
  const allowed = count <= limit;
  const resetAt = (window + 1) * windowSeconds * 1000;

  return {
    allowed,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

// ── Sliding window log ─────────────────────────────────────────────────────────
// Precise: store each request timestamp in a sorted set

export async function slidingWindowLog(
  userId: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:log:${userId}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Atomic pipeline
  const pipeline = redis.pipeline();
  // Remove expired entries
  pipeline.zremrangebyscore(key, "-inf", windowStart);
  // Count remaining
  pipeline.zcard(key);
  // Add current request
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  // Set key expiry
  pipeline.pexpire(key, windowMs);

  const results = await pipeline.exec();
  const currentCount = results?.[1]?.[1] as number;

  return {
    allowed: currentCount < limit,
    remaining: Math.max(0, limit - currentCount - 1),
  };
}

// ── Sliding window counter (approximation) ────────────────────────────────────
// Efficient: two counters (prev window + current) weighted by overlap

export async function slidingWindowCounter(
  userId: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now() / 1000;
  const currentWindow = Math.floor(now / windowSeconds);
  const prevWindow = currentWindow - 1;

  const currentKey = `ratelimit:counter:${userId}:${currentWindow}`;
  const prevKey = `ratelimit:counter:${userId}:${prevWindow}`;

  const [currentRaw, prevRaw] = await redis.mget(currentKey, prevKey);
  const current = parseInt(currentRaw ?? "0", 10);
  const prev = parseInt(prevRaw ?? "0", 10);

  // Weight based on how far we are into the current window
  const elapsed = now - currentWindow * windowSeconds;
  const weight = 1 - elapsed / windowSeconds;
  const estimated = Math.floor(prev * weight) + current;

  if (estimated >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // Increment current window
  const pipeline = redis.pipeline();
  pipeline.incr(currentKey);
  pipeline.expire(currentKey, windowSeconds * 2);
  await pipeline.exec();

  return {
    allowed: true,
    remaining: limit - estimated - 1,
  };
}

// ── Token bucket ───────────────────────────────────────────────────────────────
// Smooth: refill tokens at a constant rate, allow bursts up to capacity

export async function tokenBucket(
  userId: string,
  capacity: number,
  refillRate: number, // tokens per second
  tokensRequested = 1
): Promise<{ allowed: boolean; tokens: number }> {
  const key = `ratelimit:bucket:${userId}`;
  const now = Date.now() / 1000;

  // Lua script ensures atomicity
  const luaScript = `
    local key = KEYS[1]
    local capacity = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local requested = tonumber(ARGV[4])

    local data = redis.call("HMGET", key, "tokens", "last_refill")
    local tokens = tonumber(data[1]) or capacity
    local last_refill = tonumber(data[2]) or now

    -- Refill tokens based on elapsed time
    local elapsed = now - last_refill
    tokens = math.min(capacity, tokens + elapsed * refill_rate)

    if tokens >= requested then
      tokens = tokens - requested
      redis.call("HMSET", key, "tokens", tokens, "last_refill", now)
      redis.call("EXPIRE", key, math.ceil(capacity / refill_rate) + 10)
      return {1, math.floor(tokens)}
    else
      redis.call("HMSET", key, "tokens", tokens, "last_refill", now)
      redis.call("EXPIRE", key, math.ceil(capacity / refill_rate) + 10)
      return {0, math.floor(tokens)}
    end
  `;

  const result = await redis.eval(
    luaScript,
    1,
    key,
    capacity.toString(),
    refillRate.toString(),
    now.toString(),
    tokensRequested.toString()
  ) as [number, number];

  return {
    allowed: result[0] === 1,
    tokens: result[1],
  };
}

// ── Per-IP + per-user combined limiter ────────────────────────────────────────

export async function combinedRateLimit(
  ip: string,
  userId: string | null,
  windowSeconds = 60
): Promise<{ allowed: boolean; limitedBy: string | null }> {
  // IP limit: 100 req/min
  const ipResult = await fixedWindowRateLimit(`ip:${ip}`, 100, windowSeconds);
  if (!ipResult.allowed) return { allowed: false, limitedBy: "ip" };

  if (userId) {
    // Authenticated user limit: 1000 req/min
    const userResult = await fixedWindowRateLimit(`user:${userId}`, 1000, windowSeconds);
    if (!userResult.allowed) return { allowed: false, limitedBy: "user" };
  }

  return { allowed: true, limitedBy: null };
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  const keys = await redis.keys("ratelimit:*");
  if (keys.length) await redis.del(...keys);
  redis.disconnect();
}

async function main() {
  // Fixed window
  for (let i = 0; i < 5; i++) {
    const r = await fixedWindowRateLimit("user:1", 3, 60);
    console.log(`Fixed window [${i + 1}]: allowed=${r.allowed}, remaining=${r.remaining}`);
  }

  // Sliding window log
  for (let i = 0; i < 4; i++) {
    const r = await slidingWindowLog("user:2", 3, 60000);
    console.log(`Sliding log [${i + 1}]: allowed=${r.allowed}, remaining=${r.remaining}`);
  }

  // Token bucket
  for (let i = 0; i < 5; i++) {
    const r = await tokenBucket("user:3", 10, 2);
    console.log(`Token bucket [${i + 1}]: allowed=${r.allowed}, tokens=${r.tokens}`);
  }

  await cleanup();
}

main().catch(console.error);
