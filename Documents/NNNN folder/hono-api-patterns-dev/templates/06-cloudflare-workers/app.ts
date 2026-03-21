/**
 * Hono.js — Cloudflare Workers Bindings
 * KV, D1 (SQLite), R2 (S3-compatible), Queue, Durable Objects
 */
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cache } from "hono/cache";

// ── 1. Cloudflare bindings type ───────────────────────────────────────────────

interface Bindings {
  // KV namespace
  CACHE: KVNamespace;
  SESSION_STORE: KVNamespace;
  // D1 database
  DB: D1Database;
  // R2 bucket
  ASSETS: R2Bucket;
  // Queue producer
  EMAIL_QUEUE: Queue<{ to: string; subject: string; body: string }>;
  // Environment variables (secrets)
  JWT_SECRET: string;
  ENVIRONMENT: "production" | "staging" | "development";
}

const app = new Hono<{ Bindings: Bindings }>();

// ── 2. KV — key-value store (caching, sessions) ───────────────────────────────

// User session via KV
app.get("/api/session", async (c) => {
  const sessionId = c.req.header("X-Session-Id");
  if (!sessionId) throw new HTTPException(401, { message: "No session" });

  const session = await c.env.SESSION_STORE.get(sessionId, "json") as { userId: string } | null;
  if (!session) throw new HTTPException(401, { message: "Session expired" });

  return c.json({ userId: session.userId });
});

app.post("/api/session", async (c) => {
  const { userId } = await c.req.json<{ userId: string }>();
  const sessionId = crypto.randomUUID();
  await c.env.SESSION_STORE.put(
    sessionId,
    JSON.stringify({ userId }),
    { expirationTtl: 86400 } // 24h
  );
  return c.json({ sessionId });
});

// Cached API response with KV
app.get("/api/config", async (c) => {
  const cached = await c.env.CACHE.get("app-config", "json");
  if (cached) return c.json({ data: cached, cached: true });

  const config = { theme: "dark", featureFlags: { newDashboard: true } };
  await c.env.CACHE.put("app-config", JSON.stringify(config), { expirationTtl: 300 });
  return c.json({ data: config, cached: false });
});

// ── 3. D1 — SQLite database ───────────────────────────────────────────────────

// Schema: CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, email TEXT, created_at TEXT);

app.get("/api/users", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, email, created_at FROM users LIMIT 50"
  ).all();
  return c.json(results);
});

app.get("/api/users/:id", async (c) => {
  const user = await c.env.DB.prepare(
    "SELECT id, name, email, created_at FROM users WHERE id = ?"
  )
    .bind(c.req.param("id"))
    .first();
  if (!user) throw new HTTPException(404, { message: "User not found" });
  return c.json(user);
});

app.post("/api/users", async (c) => {
  const { name, email } = await c.req.json<{ name: string; email: string }>();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await c.env.DB.prepare(
    "INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, name, email, createdAt)
    .run();

  return c.json({ id, name, email, created_at: createdAt }, 201);
});

// D1 batch operations
app.delete("/api/users/:id", async (c) => {
  const { meta } = await c.env.DB.prepare("DELETE FROM users WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  if (meta.changes === 0) throw new HTTPException(404, { message: "User not found" });
  return c.json({ deleted: true });
});

// ── 4. R2 — object storage ────────────────────────────────────────────────────

app.get("/api/files/:key", async (c) => {
  const object = await c.env.ASSETS.get(c.req.param("key"));
  if (!object) throw new HTTPException(404, { message: "File not found" });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  return new Response(object.body, { headers });
});

app.put("/api/files/:key", async (c) => {
  const body = await c.req.arrayBuffer();
  const contentType = c.req.header("Content-Type") ?? "application/octet-stream";

  await c.env.ASSETS.put(c.req.param("key"), body, {
    httpMetadata: { contentType },
  });
  return c.json({ uploaded: true, key: c.req.param("key") });
});

app.delete("/api/files/:key", async (c) => {
  await c.env.ASSETS.delete(c.req.param("key"));
  return c.json({ deleted: true });
});

// ── 5. Queue — background jobs ────────────────────────────────────────────────

app.post("/api/send-email", async (c) => {
  const payload = await c.req.json<{ to: string; subject: string; body: string }>();
  await c.env.EMAIL_QUEUE.send(payload);
  return c.json({ queued: true });
});

// ── 6. Hono cache middleware (CF cache API) ───────────────────────────────────

app.get(
  "/api/public/*",
  cache({ cacheName: "api-cache", cacheControl: "max-age=300" }),
  (c) => c.json({ data: "This response is cached by Cloudflare for 5 minutes" })
);

export default app;

// ── wrangler.toml bindings reference ─────────────────────────────────────────
//
// [[kv_namespaces]]
// binding = "CACHE"
// id = "..."
//
// [[d1_databases]]
// binding = "DB"
// database_name = "my-db"
// database_id = "..."
//
// [[r2_buckets]]
// binding = "ASSETS"
// bucket_name = "my-assets"
//
// [[queues.producers]]
// binding = "EMAIL_QUEUE"
// queue = "email-queue"
