/**
 * Hono.js — JWT Authentication
 * @hono/jwt, protected routes, refresh tokens, role-based access
 */
import { Hono } from "hono";
import { jwt, sign, verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

// ── 1. Config ─────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const ACCESS_TOKEN_TTL = 15 * 60;          // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days

// ── 2. Types ──────────────────────────────────────────────────────────────────

interface JWTPayload {
  sub: string;
  email: string;
  role: "admin" | "user" | "viewer";
  type: "access" | "refresh";
  exp: number;
}

// ── 3. App ────────────────────────────────────────────────────────────────────

const app = new Hono<{ Variables: { jwtPayload: JWTPayload } }>();

// ── 4. Auth helpers ───────────────────────────────────────────────────────────

async function createTokenPair(
  userId: string,
  email: string,
  role: "admin" | "user" | "viewer"
) {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = await sign(
    { sub: userId, email, role, type: "access", exp: now + ACCESS_TOKEN_TTL },
    JWT_SECRET
  );
  const refreshToken = await sign(
    { sub: userId, email, role, type: "refresh", exp: now + REFRESH_TOKEN_TTL },
    JWT_SECRET
  );
  return { accessToken, refreshToken };
}

// ── 5. Mock user database ─────────────────────────────────────────────────────

const users = new Map([
  ["user-1", { id: "user-1", email: "alice@example.com", passwordHash: "hunter2", role: "admin" as const }],
  ["user-2", { id: "user-2", email: "bob@example.com", passwordHash: "password123", role: "user" as const }],
]);

const refreshTokenStore = new Set<string>(); // In production: Redis

// ── 6. Public routes ──────────────────────────────────────────────────────────

app.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  const user = Array.from(users.values()).find((u) => u.email === email);

  if (!user || user.passwordHash !== password) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = await createTokenPair(user.id, user.email, user.role);
  refreshTokenStore.add(refreshToken);

  // Refresh token in HttpOnly cookie (more secure)
  setCookie(c, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: REFRESH_TOKEN_TTL,
    path: "/auth/refresh",
  });

  return c.json({ accessToken, expiresIn: ACCESS_TOKEN_TTL });
});

app.post("/auth/refresh", async (c) => {
  const refreshToken = getCookie(c, "refresh_token");
  if (!refreshToken || !refreshTokenStore.has(refreshToken)) {
    throw new HTTPException(401, { message: "Invalid refresh token" });
  }

  const payload = await verify(refreshToken, JWT_SECRET) as JWTPayload;
  if (payload.type !== "refresh") {
    throw new HTTPException(401, { message: "Invalid token type" });
  }

  refreshTokenStore.delete(refreshToken);
  const { accessToken, refreshToken: newRefreshToken } =
    await createTokenPair(payload.sub, payload.email, payload.role);
  refreshTokenStore.add(newRefreshToken);

  setCookie(c, "refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: REFRESH_TOKEN_TTL,
    path: "/auth/refresh",
  });

  return c.json({ accessToken, expiresIn: ACCESS_TOKEN_TTL });
});

app.post("/auth/logout", (c) => {
  const refreshToken = getCookie(c, "refresh_token");
  if (refreshToken) refreshTokenStore.delete(refreshToken);
  deleteCookie(c, "refresh_token");
  return c.json({ message: "Logged out" });
});

// ── 7. Protected routes ───────────────────────────────────────────────────────

// JWT middleware — validates Bearer token in Authorization header
const jwtMiddleware = jwt({ secret: JWT_SECRET });

// Role guard factory
const requireRole = (...roles: Array<"admin" | "user" | "viewer">) =>
  async (c: Parameters<typeof jwtMiddleware>[0], next: () => Promise<void>) => {
    const payload = c.get("jwtPayload") as JWTPayload;
    if (!roles.includes(payload.role)) {
      throw new HTTPException(403, { message: `Required role: ${roles.join(" or ")}` });
    }
    await next();
  };

app.get("/me", jwtMiddleware, (c) => {
  const payload = c.get("jwtPayload") as JWTPayload;
  return c.json({ id: payload.sub, email: payload.email, role: payload.role });
});

app.get("/admin/users", jwtMiddleware, requireRole("admin"), (c) => {
  return c.json(Array.from(users.values()).map(({ id, email, role }) => ({ id, email, role })));
});

app.get("/dashboard", jwtMiddleware, requireRole("admin", "user"), (c) => {
  return c.json({ message: "Welcome to the dashboard" });
});

export default app;
