/**
 * Redis Distributed Locks
 * Demonstrates: simple SET NX lock, Redlock algorithm, lock extension, fencing tokens
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Simple distributed lock (SET NX EX) ───────────────────────────────────────

export interface LockHandle {
  key: string;
  token: string;
  ttl: number;
}

export async function acquireLock(
  resource: string,
  ttlMs: number
): Promise<LockHandle | null> {
  const key = `lock:${resource}`;
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // SET key token NX PX ttlMs — atomic acquisition
  const result = await redis.set(key, token, "PX", ttlMs, "NX");
  if (!result) return null;

  console.log(`[Lock] Acquired ${resource} (token: ${token.slice(0, 8)}...)`);
  return { key, token, ttl: ttlMs };
}

export async function releaseLock(handle: LockHandle): Promise<boolean> {
  // Lua script ensures we only release OUR lock (compare-and-delete)
  const luaScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  const result = await redis.eval(luaScript, 1, handle.key, handle.token) as number;
  const released = result === 1;
  console.log(`[Lock] ${released ? "Released" : "Could not release (expired?)"} ${handle.key}`);
  return released;
}

// ── Lock with auto-release helper ─────────────────────────────────────────────

export async function withLock<T>(
  resource: string,
  ttlMs: number,
  fn: () => Promise<T>,
  retries = 3,
  retryDelayMs = 100
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const lock = await acquireLock(resource, ttlMs);

    if (lock) {
      try {
        return await fn();
      } finally {
        await releaseLock(lock);
      }
    }

    if (attempt < retries) {
      // Jitter to avoid thundering herd
      const delay = retryDelayMs + Math.floor(Math.random() * retryDelayMs);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error(`Failed to acquire lock for ${resource} after ${retries} retries`);
}

// ── Lock extension (heartbeat) ────────────────────────────────────────────────
// Extend lock TTL while work is still in progress

export async function extendLock(handle: LockHandle, additionalMs: number): Promise<boolean> {
  const luaScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("PEXPIRE", KEYS[1], ARGV[2])
    else
      return 0
    end
  `;

  const result = await redis.eval(
    luaScript,
    1,
    handle.key,
    handle.token,
    additionalMs.toString()
  ) as number;

  return result === 1;
}

// ── Redlock algorithm (multi-node) ────────────────────────────────────────────
// Acquire lock on majority of N Redis instances for fault tolerance

export class Redlock {
  private readonly driftFactor = 0.01;
  private readonly retryCount: number;
  private readonly retryDelayMs: number;

  constructor(
    private readonly clients: Redis[],
    options: { retryCount?: number; retryDelayMs?: number } = {}
  ) {
    this.retryCount = options.retryCount ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 200;
  }

  async acquire(resource: string, ttlMs: number): Promise<LockHandle | null> {
    const key = `redlock:${resource}`;
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const quorum = Math.floor(this.clients.length / 2) + 1;

    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      const start = Date.now();
      let acquired = 0;

      // Try to acquire on all instances
      await Promise.all(
        this.clients.map(async (client) => {
          try {
            const result = await client.set(key, token, "PX", ttlMs, "NX");
            if (result) acquired++;
          } catch {
            // Instance down — skip
          }
        })
      );

      const elapsed = Date.now() - start;
      const drift = Math.floor(ttlMs * this.driftFactor) + 2;
      const validityTime = ttlMs - elapsed - drift;

      if (acquired >= quorum && validityTime > 0) {
        console.log(`[Redlock] Acquired on ${acquired}/${this.clients.length} instances`);
        return { key, token, ttl: validityTime };
      }

      // Failed — release from all instances
      await this.releaseAll(key, token);

      const delay = this.retryDelayMs + Math.floor(Math.random() * this.retryDelayMs);
      await new Promise((r) => setTimeout(r, delay));
    }

    return null;
  }

  async release(handle: LockHandle): Promise<void> {
    await this.releaseAll(handle.key, handle.token);
  }

  private async releaseAll(key: string, token: string): Promise<void> {
    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    await Promise.all(
      this.clients.map((client) =>
        client.eval(luaScript, 1, key, token).catch(() => {
          /* ignore errors on downed nodes */
        })
      )
    );
  }
}

// ── Fencing token (monotonic counter) ─────────────────────────────────────────
// Ensures stale lock holders cannot corrupt storage by attaching a counter

export async function acquireLockWithFence(
  resource: string,
  ttlMs: number
): Promise<{ handle: LockHandle; fenceToken: number } | null> {
  const lock = await acquireLock(resource, ttlMs);
  if (!lock) return null;

  // Increment a global counter — must pass to external resources with each write
  const fenceToken = await redis.incr(`fence:${resource}`);
  console.log(`[Fence] Token ${fenceToken} for ${resource}`);
  return { handle: lock, fenceToken };
}

// ── Leader election ───────────────────────────────────────────────────────────

export class LeaderElection {
  private lock: LockHandle | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly nodeId: string,
    private readonly resource: string,
    private readonly ttlMs: number
  ) {}

  async campaign(): Promise<boolean> {
    const handle = await acquireLock(this.resource, this.ttlMs);
    if (!handle) return false;

    this.lock = handle;
    // Start heartbeat to keep the lock alive
    this.heartbeatInterval = setInterval(async () => {
      if (this.lock) {
        const extended = await extendLock(this.lock, this.ttlMs);
        if (!extended) {
          console.log(`[Leader] ${this.nodeId} lost leadership`);
          this.lock = null;
          clearInterval(this.heartbeatInterval!);
        }
      }
    }, this.ttlMs / 3);

    console.log(`[Leader] ${this.nodeId} is now leader`);
    return true;
  }

  isLeader(): boolean {
    return !!this.lock;
  }

  async resign(): Promise<void> {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.lock) await releaseLock(this.lock);
    this.lock = null;
  }
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  const keys = await redis.keys("lock:*");
  const fences = await redis.keys("fence:*");
  const redlocks = await redis.keys("redlock:*");
  const all = [...keys, ...fences, ...redlocks];
  if (all.length) await redis.del(...all);
  redis.disconnect();
}

async function main() {
  // Basic lock
  const lock = await acquireLock("critical-section", 5000);
  if (lock) {
    console.log("Working in critical section...");
    await new Promise((r) => setTimeout(r, 100));
    await releaseLock(lock);
  }

  // withLock helper
  const result = await withLock("inventory:item-1", 3000, async () => {
    console.log("Updating inventory atomically...");
    return { updated: true };
  });
  console.log("withLock result:", result);

  // Lock with fence
  const fenced = await acquireLockWithFence("data-store", 5000);
  if (fenced) {
    console.log(`Fence token: ${fenced.fenceToken} — pass to storage with each write`);
    await releaseLock(fenced.handle);
  }

  // Leader election
  const leader = new LeaderElection("node-1", "election", 5000);
  const won = await leader.campaign();
  console.log(`Leader election: ${won ? "won" : "lost"}`);
  if (won) await leader.resign();

  await cleanup();
}

main().catch(console.error);
