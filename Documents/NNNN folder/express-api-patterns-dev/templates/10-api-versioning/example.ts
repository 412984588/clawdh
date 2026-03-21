// Express.js API 版本控制模式 — TypeScript
// URL 版本、请求头版本、废弃通知、版本路由

import express, { Request, Response, NextFunction, Router, Application } from "express";

// ===== 1. 版本类型定义 =====

export type ApiVersion = "v1" | "v2" | "v3";
export const CURRENT_VERSION: ApiVersion = "v2";
export const SUPPORTED_VERSIONS: ApiVersion[] = ["v1", "v2"];
export const DEPRECATED_VERSIONS: ApiVersion[] = ["v1"];

// ===== 2. URL 路径版本（最常见）=====
// /api/v1/users, /api/v2/users

export function createVersionedRouter(version: ApiVersion): Router {
  const router = express.Router();

  // 版本前缀附加到每个路由
  router.use((req: Request, res: Response, next: NextFunction) => {
    res.set("X-API-Version", version);

    // 已废弃版本添加警告头
    if (DEPRECATED_VERSIONS.includes(version)) {
      const sunsetDate = "2025-01-01";
      res.set({
        "Deprecation": `true`,
        "Sunset": sunsetDate,
        "Link": `</api/${CURRENT_VERSION}${req.path}>; rel="successor-version"`,
      });
    }

    next();
  });

  return router;
}

// ===== 3. 请求头版本（Accept-Version 或 X-API-Version）=====

export function headerVersionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const version =
    (req.headers["accept-version"] as string) ??
    (req.headers["x-api-version"] as string) ??
    CURRENT_VERSION;

  if (!SUPPORTED_VERSIONS.includes(version as ApiVersion)) {
    res.status(400).json({
      success: false,
      error: {
        code: "UNSUPPORTED_VERSION",
        message: `API version '${version}' is not supported. Supported: ${SUPPORTED_VERSIONS.join(", ")}`,
        current: CURRENT_VERSION,
      },
    });
    return;
  }

  (req as Request & { apiVersion: ApiVersion }).apiVersion = version as ApiVersion;
  res.set("X-API-Version", version);
  next();
}

// ===== 4. 废弃中间件 =====

interface DeprecationConfig {
  version: ApiVersion;
  sunsetDate: string;          // ISO 日期
  successor?: string;           // 推荐的新 endpoint
  message?: string;
}

export function deprecationMiddleware(config: DeprecationConfig) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.set({
      "Deprecation": `date="${config.sunsetDate}"`,
      "Sunset": config.sunsetDate,
      ...(config.successor && {
        "Link": `<${config.successor}>; rel="successor-version"`,
      }),
    });

    // 将废弃警告附加到响应体（适合开发模式）
    if (process.env.NODE_ENV === "development") {
      res.on("finish", () => {
        console.warn(`[DEPRECATION] ${config.version} endpoint called. Sunset: ${config.sunsetDate}. ${config.message ?? ""}`);
      });
    }

    next();
  };
}

// ===== 5. 版本路由装配 =====

interface UserV1 { id: number; name: string; email: string; }
interface UserV2 extends UserV1 { role: string; createdAt: string; }

// V1 用户路由
export function buildV1UserRoutes(): Router {
  const router = express.Router();

  router.get("/", (_req: Request, res: Response) => {
    const users: UserV1[] = [
      { id: 1, name: "Alice", email: "alice@example.com" },
    ];
    res.json({ users });
  });

  router.get("/:id", (req: Request, res: Response) => {
    const user: UserV1 = { id: parseInt(req.params.id), name: "Alice", email: "alice@example.com" };
    res.json({ user });
  });

  return router;
}

// V2 用户路由（扩展字段）
export function buildV2UserRoutes(): Router {
  const router = express.Router();

  router.get("/", (_req: Request, res: Response) => {
    const users: UserV2[] = [
      { id: 1, name: "Alice", email: "alice@example.com", role: "admin", createdAt: new Date().toISOString() },
    ];
    res.json({ data: users, meta: { version: "v2" } });
  });

  router.get("/:id", (req: Request, res: Response) => {
    const user: UserV2 = {
      id: parseInt(req.params.id),
      name: "Alice",
      email: "alice@example.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    res.json({ data: user });
  });

  return router;
}

// ===== 6. 版本中间件分发（单入口，按版本路由）=====

export function versionDispatcher(handlers: Partial<Record<ApiVersion, Router>>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const version = (req as Request & { apiVersion?: ApiVersion }).apiVersion ?? CURRENT_VERSION;
    const handler = handlers[version];

    if (!handler) {
      next();
      return;
    }

    handler(req, res, next);
  };
}

// ===== 7. 应用组装示例 =====

export function createVersionedApp(): Application {
  const app = express();
  app.use(express.json());

  // V1 路由（已废弃）
  const v1Router = createVersionedRouter("v1");
  v1Router.use("/users", deprecationMiddleware({
    version: "v1",
    sunsetDate: "2025-01-01",
    successor: "/api/v2/users",
    message: "Use v2 users API with role and timestamps",
  }));
  v1Router.use("/users", buildV1UserRoutes());

  // V2 路由（当前）
  const v2Router = createVersionedRouter("v2");
  v2Router.use("/users", buildV2UserRoutes());

  // 挂载版本前缀路由
  app.use("/api/v1", v1Router);
  app.use("/api/v2", v2Router);

  // 无版本前缀路由（使用请求头版本）
  app.use("/api", headerVersionMiddleware);
  app.use("/api/users", versionDispatcher({
    v1: buildV1UserRoutes(),
    v2: buildV2UserRoutes(),
  }));

  // 版本信息端点
  app.get("/api/versions", (_req: Request, res: Response) => {
    res.json({
      current: CURRENT_VERSION,
      supported: SUPPORTED_VERSIONS,
      deprecated: DEPRECATED_VERSIONS,
    });
  });

  return app;
}

export type { UserV1, UserV2 };
