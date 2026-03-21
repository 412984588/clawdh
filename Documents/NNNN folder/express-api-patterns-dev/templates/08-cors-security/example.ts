// Express.js CORS 与安全头模式 — TypeScript
// CORS 配置、Helmet 安全头、CSP、CSRF 防护

import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

// ===== 1. CORS 中间件 =====

export interface CorsConfig {
  origins: string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;  // 预检请求缓存时间（秒）
}

export function corsMiddleware(config: CorsConfig) {
  const {
    origins,
    methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders = ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders = ["X-Request-Id", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    credentials = true,
    maxAge = 86400,
  } = config;

  return function cors(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin ?? "";

    const isAllowed =
      typeof origins === "function"
        ? origins(origin)
        : origins.includes("*") || origins.includes(origin);

    if (isAllowed && origin) {
      res.set("Access-Control-Allow-Origin", origin);
      if (credentials) res.set("Access-Control-Allow-Credentials", "true");
      res.set("Vary", "Origin");
    }

    // 预检请求（OPTIONS）
    if (req.method === "OPTIONS") {
      res.set({
        "Access-Control-Allow-Methods": methods.join(", "),
        "Access-Control-Allow-Headers": allowedHeaders.join(", "),
        "Access-Control-Expose-Headers": exposedHeaders.join(", "),
        "Access-Control-Max-Age": String(maxAge),
      });
      res.status(204).end();
      return;
    }

    next();
  };
}

// 生产环境 CORS 配置
export const productionCors = corsMiddleware({
  origins: [
    "https://app.example.com",
    "https://www.example.com",
    process.env.FRONTEND_URL ?? "",
  ].filter(Boolean),
  credentials: true,
});

// 开发环境 CORS 配置（宽松）
export const developmentCors = corsMiddleware({
  origins: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
  credentials: true,
});

// ===== 2. 安全头中间件（Helmet 等效）=====

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.set({
    // 防止 XSS（现代浏览器）
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0", // 现代浏览器禁用旧版 XSS 过滤器

    // HTTPS 强制
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // 防止信息泄露
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Permitted-Cross-Domain-Policies": "none",

    // 权限策略
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "accelerometer=()",
    ].join(", "),

    // 移除指纹信息
    "X-Powered-By": "",
    "Server": "",
  });

  next();
}

// ===== 3. Content Security Policy =====

export interface CSPConfig {
  mode: "report" | "enforce";
  reportUri?: string;
  nonce?: boolean;  // 为 inline scripts 生成 nonce
}

export function cspMiddleware(config: CSPConfig = { mode: "enforce" }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const nonce = config.nonce ? crypto.randomBytes(16).toString("base64") : undefined;

    if (nonce) {
      (res as Response & { locals: Record<string, unknown> }).locals.cspNonce = nonce;
    }

    const scriptSrc = nonce
      ? `'nonce-${nonce}' 'strict-dynamic'`
      : "'self'";

    const directives = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",   // 实际生产中用 nonce
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
      ...(config.reportUri ? [`report-uri ${config.reportUri}`] : []),
    ].join("; ");

    const header = config.mode === "enforce"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only";

    res.set(header, directives);
    next();
  };
}

// ===== 4. CSRF 保护（Double Submit Cookie 模式）=====

const CSRF_COOKIE = "csrf-token";
const CSRF_HEADER = "x-csrf-token";
const CSRF_SECRET = process.env.CSRF_SECRET ?? "change-me-csrf-secret";

function generateCsrfToken(): string {
  const random = crypto.randomBytes(32).toString("hex");
  const hmac = crypto.createHmac("sha256", CSRF_SECRET).update(random).digest("hex");
  return `${random}.${hmac}`;
}

function verifyCsrfToken(token: string): boolean {
  const [random, hmac] = token.split(".");
  if (!random || !hmac) return false;
  const expected = crypto.createHmac("sha256", CSRF_SECRET).update(random).digest("hex");
  // 使用 timingSafeEqual 防止时序攻击
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
  if (SAFE_METHODS.includes(req.method)) {
    // 安全方法：设置/刷新 CSRF token
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = generateCsrfToken();
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,   // 客户端 JS 需要读取
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 小时
      });
    }
    next();
    return;
  }

  // 非安全方法：验证 CSRF token
  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken || !verifyCsrfToken(cookieToken)) {
    res.status(403).json({ success: false, error: { code: "CSRF_TOKEN_INVALID", message: "Invalid or missing CSRF token" } });
    return;
  }

  next();
}

// ===== 5. SQL 注入防护检查（防御性日志）=====

const SQL_INJECTION_PATTERNS = [/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i, /('|--|;|\/\*)/];

export function sqlInjectionLogger(req: Request, _res: Response, next: NextFunction): void {
  const checkValue = (value: unknown, location: string): void => {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    if (SQL_INJECTION_PATTERNS.some((p) => p.test(str))) {
      console.warn(`[SECURITY] Potential SQL injection in ${location}`, {
        ip: req.headers["x-forwarded-for"] ?? req.socket.remoteAddress,
        path: req.path,
        value: str.slice(0, 100),
      });
    }
  };

  checkValue(req.query, "query");
  checkValue(req.params, "params");
  if (req.body) checkValue(req.body, "body");

  next();
}

export { CSRF_COOKIE, CSRF_HEADER };
