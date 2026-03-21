// Express.js 基础路由模式 — TypeScript
// 涵盖 Router、参数、查询字符串、响应辅助函数

import express, { Request, Response, NextFunction, Router } from "express";

// ===== 1. 响应辅助函数（统一 API 响应格式）=====

export function ok<T>(res: Response, data: T, message = "Success") {
  return res.status(200).json({ success: true, message, data });
}

export function created<T>(res: Response, data: T) {
  return res.status(201).json({ success: true, message: "Created", data });
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ success: false, message, data: null });
}

export function notFound(res: Response, resource = "Resource") {
  return res.status(404).json({ success: false, message: `${resource} not found`, data: null });
}

export function internalError(res: Response, message = "Internal server error") {
  return res.status(500).json({ success: false, message, data: null });
}

// ===== 2. 类型化请求工具 =====

// 扩展 Express Request 类型以支持类型化 params/query/body
type TypedRequest<
  Params = Record<string, string>,
  Query = Record<string, string | string[]>,
  Body = unknown
> = Request<Params, unknown, Body, Query>;

// ===== 3. 用户路由示例 =====

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

// 模拟数据库
const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "user" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "user" },
];

export const userRouter: Router = express.Router();

// GET /users — 列表，支持分页和过滤
userRouter.get(
  "/",
  (
    req: TypedRequest<Record<string, never>, { page?: string; limit?: string; role?: string }>,
    res: Response
  ) => {
    const page = parseInt(req.query.page ?? "1", 10);
    const limit = parseInt(req.query.limit ?? "10", 10);
    const role = req.query.role;

    let result = [...users];
    if (role) result = result.filter((u) => u.role === role);

    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    return ok(res, {
      users: paginated,
      pagination: { page, limit, total: result.length, pages: Math.ceil(result.length / limit) },
    });
  }
);

// GET /users/:id — 单个资源
userRouter.get(
  "/:id",
  (req: TypedRequest<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return badRequest(res, "Invalid user ID");

    const user = users.find((u) => u.id === id);
    if (!user) return notFound(res, "User");

    return ok(res, user);
  }
);

// POST /users — 创建
userRouter.post(
  "/",
  (req: TypedRequest<Record<string, never>, Record<string, never>, Partial<User>>, res: Response) => {
    const { name, email, role = "user" } = req.body;
    if (!name || !email) return badRequest(res, "name and email are required");

    const newUser: User = { id: users.length + 1, name, email, role };
    users.push(newUser);

    return created(res, newUser);
  }
);

// PUT /users/:id — 整体更新
userRouter.put(
  "/:id",
  (req: TypedRequest<{ id: string }, Record<string, never>, Partial<User>>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return notFound(res, "User");

    users[idx] = { ...users[idx], ...req.body, id };
    return ok(res, users[idx]);
  }
);

// PATCH /users/:id — 部分更新
userRouter.patch(
  "/:id",
  (req: TypedRequest<{ id: string }, Record<string, never>, Partial<User>>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return notFound(res, "User");

    users[idx] = { ...users[idx], ...req.body };
    return ok(res, users[idx]);
  }
);

// DELETE /users/:id — 删除
userRouter.delete("/:id", (req: TypedRequest<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return notFound(res, "User");

  users.splice(idx, 1);
  return noContent(res);
});

// ===== 4. 应用组装 =====

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 健康检查
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // 挂载路由
  app.use("/api/users", userRouter);

  // 404 兜底
  app.use((_req: Request, res: Response) => {
    notFound(res, "Route");
  });

  return app;
}

export type { User, TypedRequest };
