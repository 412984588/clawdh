// Express.js 错误处理模式 — TypeScript
// 自定义错误类、全局错误处理中间件、async 包装器

import { Request, Response, NextFunction } from "express";

// ===== 1. 自定义错误类 =====

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_ERROR",
    public readonly isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "AUTHENTICATION_REQUIRED");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super("Too many requests", 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
    if (retryAfter) this.retryAfter = retryAfter;
  }
  retryAfter?: number;
}

// ===== 2. async 包装器（避免 try/catch 地狱）=====

// 包装 async route handler，自动将 rejected Promise 传给 next()
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 带类型参数的版本
export function typedAsyncHandler<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  Q = Record<string, string | string[]>
>(
  fn: (
    req: Request<P, ResBody, ReqBody, Q>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<void>
) {
  return (
    req: Request<P, ResBody, ReqBody, Q>,
    res: Response<ResBody>,
    next: NextFunction
  ) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ===== 3. 全局错误处理中间件 =====
// 必须是 4 参数函数，放在所有路由之后

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 请求日志
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // AppError — 已知的操作性错误
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && err.fields && { fields: err.fields }),
        ...(err instanceof RateLimitError && err.retryAfter && { retryAfter: err.retryAfter }),
      },
    });
    return;
  }

  // JSON 解析错误
  if (err.name === "SyntaxError" && "body" in err) {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Invalid JSON in request body" },
    });
    return;
  }

  // 未知错误（不暴露内部细节）
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    },
  });
}

// ===== 4. 404 Not Found 中间件 =====

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

// ===== 5. 使用示例 =====

// 在路由中使用 asyncHandler 和自定义错误
// import express from "express";
// const router = express.Router();
//
// router.get("/:id", asyncHandler(async (req, res) => {
//   const user = await db.findUser(req.params.id);
//   if (!user) throw new NotFoundError("User");
//   if (user.banned) throw new AuthorizationError("Account suspended");
//   res.json({ success: true, data: user });
// }));
//
// // 在 app.ts 中挂载
// app.use(notFoundHandler);
// app.use(globalErrorHandler); // 必须在最后

export type { AppError as AppErrorType };
