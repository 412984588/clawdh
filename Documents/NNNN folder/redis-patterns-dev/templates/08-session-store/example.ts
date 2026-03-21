/**
 * Redis Session Store
 * Demonstrates: session creation, storage, retrieval, expiry, invalidation, rotation
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Session types ──────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastAccessedAt: number;
  ipAddress: string;
  userAgent: string;
  data: Record<string, unknown>;
}

const SESSION_TTL = 3600; // 1 hour
const SESSION_PREFIX = "session:";

// ── Session creation ───────────────────────────────────────────────────────────

function generateSessionId(): string {
  // In production use crypto.randomBytes(32).toString('hex')
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function createSession(
  userId: string,
  ipAddress: string,
  userAgent: string,
  data: Record<string, unknown> = {}
): Promise<Session> {
  const session: Session = {
    id: generateSessionId(),
    userId,
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    ipAddress,
    userAgent,
    data,
  };

  const key = `${SESSION_PREFIX}${session.id}`;

  const pipeline = redis.pipeline();
  pipeline.hset(key, {
    id: session.id,
    userId: session.userId,
    createdAt: session.createdAt.toString(),
    lastAccessedAt: session.lastAccessedAt.toString(),
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    data: JSON.stringify(session.data),
  });
  pipeline.expire(key, SESSION_TTL);

  // Track user's active sessions
  pipeline.sadd(`user:sessions:${userId}`, session.id);
  pipeline.expire(`user:sessions:${userId}`, SESSION_TTL * 2);

  await pipeline.exec();

  console.log(`[Session] Created ${session.id} for user ${userId}`);
  return session;
}

// ── Session retrieval with sliding expiry ─────────────────────────────────────

export async function getSession(sessionId: string): Promise<Session | null> {
  const key = `${SESSION_PREFIX}${sessionId}`;
  const raw = await redis.hgetall(key);

  if (!raw || !raw.id) return null;

  const session: Session = {
    id: raw.id,
    userId: raw.userId,
    createdAt: parseInt(raw.createdAt),
    lastAccessedAt: parseInt(raw.lastAccessedAt),
    ipAddress: raw.ipAddress,
    userAgent: raw.userAgent,
    data: JSON.parse(raw.data ?? "{}"),
  };

  // Sliding expiry — reset TTL on access
  const pipeline = redis.pipeline();
  pipeline.hset(key, "lastAccessedAt", Date.now().toString());
  pipeline.expire(key, SESSION_TTL);
  await pipeline.exec();

  return session;
}

// ── Session data update ────────────────────────────────────────────────────────

export async function updateSessionData(
  sessionId: string,
  updates: Record<string, unknown>
): Promise<boolean> {
  const key = `${SESSION_PREFIX}${sessionId}`;

  const exists = await redis.exists(key);
  if (!exists) return false;

  const current = await redis.hget(key, "data");
  const merged = { ...(JSON.parse(current ?? "{}")), ...updates };

  await redis.hset(key, {
    data: JSON.stringify(merged),
    lastAccessedAt: Date.now().toString(),
  });
  await redis.expire(key, SESSION_TTL);

  return true;
}

// ── Session rotation (security) ───────────────────────────────────────────────
// After privilege escalation (e.g. login), rotate session ID to prevent fixation

export async function rotateSession(oldSessionId: string): Promise<Session | null> {
  const old = await getSession(oldSessionId);
  if (!old) return null;

  // Create new session with same data
  const newSession = await createSession(
    old.userId,
    old.ipAddress,
    old.userAgent,
    old.data
  );

  // Immediately invalidate the old one
  await invalidateSession(oldSessionId);

  console.log(`[Session] Rotated ${oldSessionId} → ${newSession.id}`);
  return newSession;
}

// ── Session invalidation ───────────────────────────────────────────────────────

export async function invalidateSession(sessionId: string): Promise<void> {
  const key = `${SESSION_PREFIX}${sessionId}`;
  const userId = await redis.hget(key, "userId");

  const pipeline = redis.pipeline();
  pipeline.del(key);
  if (userId) {
    pipeline.srem(`user:sessions:${userId}`, sessionId);
  }
  await pipeline.exec();

  console.log(`[Session] Invalidated ${sessionId}`);
}

// ── Invalidate all sessions for a user (force logout) ─────────────────────────

export async function invalidateAllUserSessions(userId: string): Promise<number> {
  const userKey = `user:sessions:${userId}`;
  const sessionIds = await redis.smembers(userKey);

  if (!sessionIds.length) return 0;

  const pipeline = redis.pipeline();
  sessionIds.forEach((id) => pipeline.del(`${SESSION_PREFIX}${id}`));
  pipeline.del(userKey);
  await pipeline.exec();

  console.log(`[Session] Invalidated ${sessionIds.length} sessions for user ${userId}`);
  return sessionIds.length;
}

// ── List active sessions for a user ───────────────────────────────────────────

export async function getUserActiveSessions(userId: string): Promise<Session[]> {
  const sessionIds = await redis.smembers(`user:sessions:${userId}`);
  const sessions: Session[] = [];

  for (const id of sessionIds) {
    const session = await getSession(id);
    if (session) {
      sessions.push(session);
    } else {
      // Clean up stale reference
      await redis.srem(`user:sessions:${userId}`, id);
    }
  }

  return sessions;
}

// ── Session-based cart example ────────────────────────────────────────────────

export async function addToCart(
  sessionId: string,
  productId: string,
  quantity: number
): Promise<boolean> {
  const session = await getSession(sessionId);
  if (!session) return false;

  const cart = (session.data.cart as Record<string, number>) ?? {};
  cart[productId] = (cart[productId] ?? 0) + quantity;

  return updateSessionData(sessionId, { cart });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  const keys = await redis.keys(`${SESSION_PREFIX}*`);
  const userKeys = await redis.keys("user:sessions:*");
  const all = [...keys, ...userKeys];
  if (all.length) await redis.del(...all);
  redis.disconnect();
}

async function main() {
  // Create session
  const session = await createSession("user:42", "192.168.1.1", "Mozilla/5.0", {
    preferences: { theme: "dark" },
  });

  // Retrieve
  const fetched = await getSession(session.id);
  console.log(`[Get] Session valid: ${!!fetched}, userId: ${fetched?.userId}`);

  // Update cart
  await addToCart(session.id, "product:99", 2);
  await addToCart(session.id, "product:42", 1);

  const updated = await getSession(session.id);
  console.log(`[Cart] Items: ${JSON.stringify(updated?.data.cart)}`);

  // List sessions
  const sessions = await getUserActiveSessions("user:42");
  console.log(`[List] Active sessions: ${sessions.length}`);

  // Rotate
  const rotated = await rotateSession(session.id);
  console.log(`[Rotate] New session: ${rotated?.id}`);

  // Invalidate all
  const count = await invalidateAllUserSessions("user:42");
  console.log(`[Logout] Invalidated ${count} sessions`);

  await cleanup();
}

main().catch(console.error);
