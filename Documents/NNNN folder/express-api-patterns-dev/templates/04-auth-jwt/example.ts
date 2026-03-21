// Express.js JWT 认证模式 — TypeScript
// 登录/注册、JWT 中间件、刷新 token、角色权限

import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

// ===== 1. JWT 工具（无外部依赖的轻量实现）=====
// 生产环境推荐使用 `jose` 或 `jsonwebtoken` 库

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

export interface JwtPayload {
  sub: string;       // subject（用户 ID）
  email: string;
  role: "admin" | "user";
  iat?: number;      // issued at
  exp?: number;      // expiration
  jti?: string;      // JWT ID（刷新 token 用）
}

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production-use-long-random-string";
const ACCESS_TOKEN_TTL = 15 * 60;         // 15 分钟（秒）
const REFRESH_TOKEN_TTL = 7 * 24 * 3600; // 7 天

export function signJwt(payload: Omit<JwtPayload, "iat" | "exp">, ttl = ACCESS_TOKEN_TTL): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = base64UrlEncode(JSON.stringify({ ...payload, iat: now, exp: now + ttl }));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${fullPayload}`)
    .digest("base64url");
  return `${header}.${fullPayload}.${signature}`;
}

export function verifyJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const [header, payload, signature] = parts;
  const expected = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  if (signature !== expected) throw new Error("Invalid JWT signature");
  const decoded = JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("JWT expired");
  }
  return decoded;
}

// ===== 2. 扩展 Request 类型，注入用户信息 =====

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ===== 3. 认证中间件 =====

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: { code: "NO_TOKEN", message: "Authentication required" } });
    return;
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyJwt(token);
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid token";
    res.status(401).json({ success: false, error: { code: "INVALID_TOKEN", message } });
  }
}

// ===== 4. 角色授权中间件 =====

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "NO_TOKEN", message: "Not authenticated" } });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } });
      return;
    }
    next();
  };
}

// ===== 5. 刷新 Token 存储（生产中使用 Redis）=====

const refreshTokenStore = new Map<string, { userId: string; expiresAt: number }>();

export function createTokenPair(userId: string, email: string, role: "admin" | "user") {
  const accessToken = signJwt({ sub: userId, email, role });
  const jti = crypto.randomUUID();
  const refreshToken = signJwt({ sub: userId, email, role, jti }, REFRESH_TOKEN_TTL);

  refreshTokenStore.set(jti, {
    userId,
    expiresAt: Date.now() + REFRESH_TOKEN_TTL * 1000,
  });

  return { accessToken, refreshToken };
}

export function rotateRefreshToken(refreshToken: string) {
  const payload = verifyJwt(refreshToken);
  if (!payload.jti) throw new Error("Invalid refresh token");

  const stored = refreshTokenStore.get(payload.jti);
  if (!stored || stored.expiresAt < Date.now()) {
    throw new Error("Refresh token expired or revoked");
  }

  // 单次使用：删除旧的，创建新的
  refreshTokenStore.delete(payload.jti);
  return createTokenPair(payload.sub, payload.email, payload.role);
}

export function revokeRefreshToken(jti: string): void {
  refreshTokenStore.delete(jti);
}

// ===== 6. Auth 路由处理器示例 =====

interface LoginBody { email: string; password: string; }
interface RegisterBody extends LoginBody { name: string; }

// 模拟用户数据库
const mockUsers = [
  { id: "1", name: "Alice", email: "alice@example.com", password: "hashed_password", role: "admin" as const },
];

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginBody;
  const user = mockUsers.find((u) => u.email === email);

  if (!user || user.password !== `hashed_${password}`) {
    res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    return;
  }

  const tokens = createTokenPair(user.id, user.email, user.role);
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_TTL * 1000,
  });

  res.json({ success: true, data: { accessToken: tokens.accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    res.status(401).json({ success: false, error: { code: "NO_REFRESH_TOKEN", message: "No refresh token" } });
    return;
  }

  try {
    const tokens = rotateRefreshToken(refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });
    res.json({ success: true, data: { accessToken: tokens.accessToken } });
  } catch {
    res.clearCookie("refreshToken");
    res.status(401).json({ success: false, error: { code: "INVALID_REFRESH_TOKEN", message: "Session expired" } });
  }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (refreshToken) {
    try {
      const payload = verifyJwt(refreshToken);
      if (payload.jti) revokeRefreshToken(payload.jti);
    } catch { /* ignore */ }
  }
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
}

export { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL };
