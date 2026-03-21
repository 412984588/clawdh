// Express.js 请求日志模式 — TypeScript
// 结构化日志、请求 ID、关联头、性能计时

import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

// ===== 1. 日志级别 =====

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;       // ms
  contentLength?: number;
  userAgent?: string;
  userId?: string;
  ip: string;
  message?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  meta?: Record<string, unknown>;
}

// ===== 2. 日志记录器 =====

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly minLevel: LogLevel = "info") {}

  private levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  private format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const entry = { timestamp: new Date().toISOString(), level, message, ...meta };
    return process.env.NODE_ENV === "production"
      ? JSON.stringify(entry)
      : `[${entry.timestamp}] ${level.toUpperCase().padEnd(5)} ${message}${meta ? " " + JSON.stringify(meta) : ""}`;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("debug")) console.debug(this.format("debug", message, meta));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("info")) console.info(this.format("info", message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("warn")) console.warn(this.format("warn", message, meta));
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    if (this.shouldLog("error")) {
      console.error(this.format("error", message, {
        ...meta,
        ...(error && { error: { name: error.name, message: error.message, stack: error.stack } }),
      }));
    }
  }
}

export const logger = new ConsoleLogger(
  (process.env.LOG_LEVEL as LogLevel) ?? "info"
);

// ===== 3. 请求 ID 中间件 =====

// 扩展 Request 类型
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 优先使用上游传入的 trace ID（用于微服务链路追踪）
  const incomingId =
    req.headers["x-request-id"] as string |
    req.headers["x-trace-id"] as string;

  req.requestId = incomingId ?? crypto.randomUUID();
  req.startTime = Date.now();

  // 将请求 ID 传递给响应头，便于客户端调试
  res.set("X-Request-Id", req.requestId);

  next();
}

// ===== 4. HTTP 访问日志中间件 =====

export function accessLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  const entry: Partial<LogEntry> = {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown",
    userAgent: req.headers["user-agent"],
    userId: (req as Request & { user?: { sub: string } }).user?.sub,
  };

  // 响应结束后记录（才能获取到状态码和耗时）
  res.on("finish", () => {
    const duration = Date.now() - req.startTime;
    const logEntry = {
      ...entry,
      statusCode: res.statusCode,
      duration,
      contentLength: parseInt(res.get("content-length") ?? "0", 10) || undefined,
    };

    const level: LogLevel =
      res.statusCode >= 500 ? "error" :
      res.statusCode >= 400 ? "warn" :
      "info";

    logger[level](`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, logEntry as Record<string, unknown>);
  });

  next();
}

// ===== 5. 慢请求警报 =====

const SLOW_REQUEST_THRESHOLD_MS = 1000;

export function slowRequestMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    const duration = Date.now() - req.startTime;
    if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn("Slow request detected", {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        duration,
        threshold: SLOW_REQUEST_THRESHOLD_MS,
      });
    }
  });
  next();
}

// ===== 6. 请求体/响应体日志（仅开发环境）=====

export function debugBodyMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== "development") { next(); return; }

  if (req.body && Object.keys(req.body).length > 0) {
    // 遮蔽敏感字段
    const sanitized = sanitizeForLog(req.body as Record<string, unknown>);
    logger.debug("Request body", { requestId: req.requestId, body: sanitized });
  }

  next();
}

const SENSITIVE_FIELDS = new Set(["password", "token", "secret", "creditCard", "ssn", "cvv"]);

export function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeForLog(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ===== 7. 关联日志上下文（用于微服务）=====

export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.headers["x-correlation-id"] as string ?? req.requestId;
  res.set("X-Correlation-Id", correlationId);
  next();
}

// ===== 导出 =====
export { LogLevel, LogEntry, Logger };
