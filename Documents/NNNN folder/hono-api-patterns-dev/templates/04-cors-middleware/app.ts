/**
 * Hono.js — CORS, Security Headers, Body Limit, Rate Limiting
 * Built-in Hono middleware for production-ready APIs
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { compress } from "hono/compress";
import { requestId } from "hono/request-id";
import { timing } from "hono/timing";

const app = new Hono();

// ── 1. Request ID — every request gets a unique ID ────────────────────────────
app.use("*", requestId());

// ── 2. Timing — Server-Timing header for performance debugging ───────────────
app.use("*", timing());

// ── 3. Compression — gzip/deflate/brotli ─────────────────────────────────────
app.use("*", compress());

// ── 4. Security headers ────────────────────────────────────────────────────────
app.use(
  "*",
  secureHeaders({
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
  })
);

// ── 5. CORS — different configs for public vs private APIs ───────────────────

// Public API — allow specific origins
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      const allowed = [
        "https://myapp.com",
        "https://staging.myapp.com",
        ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
      ];
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposeHeaders: ["X-Request-Id", "Server-Timing"],
    credentials: true,
    maxAge: 600, // 10 minutes preflight cache
  })
);

// Webhook endpoint — allow all origins (public webhook receiver)
app.use(
  "/webhooks/*",
  cors({ origin: "*", allowMethods: ["POST"], allowHeaders: ["Content-Type"] })
);

// ── 6. Body size limits ───────────────────────────────────────────────────────

// Default: 100KB for regular JSON APIs
app.use(
  "/api/*",
  bodyLimit({
    maxSize: 100 * 1024,
    onError: (c) => c.json({ error: "Request body too large (max 100KB)" }, 413),
  })
);

// File upload endpoint: 10MB
app.use(
  "/api/upload/*",
  bodyLimit({
    maxSize: 10 * 1024 * 1024,
    onError: (c) => c.json({ error: "File too large (max 10MB)" }, 413),
  })
);

// ── 7. Simple in-memory rate limiter ─────────────────────────────────────────

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(max: number, windowMs: number) {
  return async (c: { req: { header: (s: string) => string | undefined }; json: (d: unknown, s?: number) => Response }, next: () => Promise<void>) => {
    const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown";
    const now = Date.now();
    const entry = rateLimits.get(ip) ?? { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
    entry.count++;
    rateLimits.set(ip, entry);

    if (entry.count > max) {
      return c.json(
        { error: "Too many requests", retryAfter: Math.ceil((entry.resetAt - now) / 1000) },
        429
      );
    }
    await next();
  };
}

app.use("/api/auth/*", rateLimit(10, 60_000));    // 10/min for auth
app.use("/api/*", rateLimit(200, 60_000));         // 200/min for general API

// ── 8. Demo routes ────────────────────────────────────────────────────────────

app.get("/api/data", (c) => {
  const reqId = c.get("requestId");
  return c.json({ data: "Hello from Hono", requestId: reqId });
});

app.post("/api/echo", async (c) => {
  const body = await c.req.json();
  return c.json({ echo: body });
});

app.post("/api/upload/avatar", (c) =>
  c.json({ message: "Upload received (up to 10MB)" })
);

app.post("/api/auth/login", (c) =>
  c.json({ token: "demo-token" })
);

app.post("/webhooks/github", async (c) => {
  const event = c.req.header("X-GitHub-Event");
  const payload = await c.req.json();
  console.log(`GitHub webhook: ${event}`, payload);
  return c.json({ received: true });
});

export default app;
