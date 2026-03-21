/**
 * Redis Caching Strategies
 * Demonstrates: cache-aside, write-through, cache stampede prevention, TTL strategies
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Simulate DB ───────────────────────────────────────────────────────────────

async function fetchFromDB(id: string): Promise<{ id: string; name: string; data: string } | null> {
  // Simulate DB latency
  await new Promise((r) => setTimeout(r, 50));
  if (id === "404") return null;
  return { id, name: `Resource ${id}`, data: `Data for ${id}` };
}

async function saveToDb(resource: { id: string; name: string; data: string }) {
  await new Promise((r) => setTimeout(r, 30));
  console.log(`[DB] Saved: ${resource.id}`);
}

// ── Cache-aside (lazy loading) ────────────────────────────────────────────────
// Read: check cache → miss → load from DB → write to cache
// Write: write to DB → invalidate cache

const CACHE_TTL = 300; // 5 minutes

export async function cacheAside(id: string) {
  const cacheKey = `resource:${id}`;

  // 1. Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${id}`);
    return JSON.parse(cached);
  }

  // 2. Cache miss — load from DB
  console.log(`[Cache MISS] ${id}`);
  const resource = await fetchFromDB(id);
  if (!resource) return null;

  // 3. Write to cache with TTL
  await redis.set(cacheKey, JSON.stringify(resource), "EX", CACHE_TTL);
  return resource;
}

export async function invalidateCache(id: string) {
  await redis.del(`resource:${id}`);
  console.log(`[Cache INVALIDATED] ${id}`);
}

// ── Write-through ─────────────────────────────────────────────────────────────
// Write: write to DB AND cache simultaneously

export async function writeThrough(resource: { id: string; name: string; data: string }) {
  // Write to DB and cache atomically (using pipeline)
  await saveToDb(resource);

  const pipeline = redis.pipeline();
  pipeline.set(`resource:${resource.id}`, JSON.stringify(resource), "EX", CACHE_TTL);
  await pipeline.exec();

  console.log(`[Write-through] ${resource.id} written to DB + cache`);
}

// ── Cache stampede prevention (mutex / probabilistic early expiry) ─────────────

export async function cacheWithMutex(id: string) {
  const cacheKey = `resource:${id}`;
  const lockKey = `lock:${cacheKey}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Try to acquire lock (SET NX EX) to prevent stampede
  const acquired = await redis.set(lockKey, "1", "EX", 10, "NX");
  if (!acquired) {
    // Another worker is rebuilding — wait and retry
    await new Promise((r) => setTimeout(r, 100));
    const retried = await redis.get(cacheKey);
    if (retried) return JSON.parse(retried);
    return null; // timeout
  }

  try {
    const resource = await fetchFromDB(id);
    if (resource) {
      await redis.set(cacheKey, JSON.stringify(resource), "EX", CACHE_TTL);
    }
    return resource;
  } finally {
    await redis.del(lockKey);
  }
}

// ── Cache warming ─────────────────────────────────────────────────────────────

export async function warmCache(ids: string[]) {
  const pipeline = redis.pipeline();

  const resources = await Promise.all(ids.map((id) => fetchFromDB(id)));

  resources.forEach((resource, i) => {
    if (resource) {
      pipeline.set(`resource:${ids[i]}`, JSON.stringify(resource), "EX", CACHE_TTL);
    }
  });

  await pipeline.exec();
  console.log(`[Warm] Cached ${resources.filter(Boolean).length} resources`);
}

// ── TTL strategies ────────────────────────────────────────────────────────────

export async function ttlStrategies(id: string) {
  const base = await fetchFromDB(id);
  if (!base) return;

  // Random jitter — prevents thundering herd on expiry
  const jitter = Math.floor(Math.random() * 60); // 0-60s jitter
  const ttl = CACHE_TTL + jitter;
  await redis.set(`resource:jittered:${id}`, JSON.stringify(base), "EX", ttl);

  // Sliding window — refresh TTL on access
  const sliding = await redis.get(`resource:sliding:${id}`);
  if (sliding) {
    await redis.expire(`resource:sliding:${id}`, CACHE_TTL); // reset timer
  } else {
    await redis.set(`resource:sliding:${id}`, JSON.stringify(base), "EX", CACHE_TTL);
  }
}

// ── Demo ──────────────────────────────────────────────────────────────────────

export async function cleanup() {
  const keys = await redis.keys("resource:*");
  if (keys.length) await redis.del(...keys);
  redis.disconnect();
}

async function main() {
  // Cache-aside: first call misses, second hits
  await cacheAside("item-1");
  await cacheAside("item-1");

  // Write-through
  await writeThrough({ id: "item-2", name: "Widget", data: "details" });
  await cacheAside("item-2"); // should be a cache hit

  // Warm multiple items
  await warmCache(["item-3", "item-4", "item-5"]);

  await cleanup();
}

main().catch(console.error);
