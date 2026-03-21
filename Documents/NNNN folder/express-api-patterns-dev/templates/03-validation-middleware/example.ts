// Express.js Zod 验证中间件 — TypeScript
// 类型安全的请求体/查询/参数验证，自动格式化错误

import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";

// ===== 1. 通用验证中间件工厂 =====

type ValidationTarget = "body" | "query" | "params";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    for (const [target, schema] of Object.entries(schemas) as [ValidationTarget, ZodSchema][]) {
      const result = schema.safeParse(req[target]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const key = issue.path.join(".");
          if (!errors[key]) errors[key] = [];
          errors[key].push(issue.message);
        }
      } else {
        // 用解析后的值替换（Zod 会做类型强制转换）
        (req as Record<string, unknown>)[target] = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed", fields: errors },
      });
      return;
    }

    next();
  };
}

// ===== 2. 常用请求 Schema =====

// 分页查询参数
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform(Number)
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ID 参数
export const idParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive integer").transform(Number),
});

// ===== 3. 用户相关 Schema =====

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["admin", "user"]).optional().default("user"),
  age: z.number().int().min(0).max(150).optional(),
  website: z.string().url("Invalid URL").optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

// ===== 4. 复杂 Schema 示例 =====

export const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50),
  tags: z.array(z.string().min(1).max(50)).max(10).optional().default([]),
  published: z.boolean().optional().default(false),
  publishAt: z.string().datetime().optional(), // ISO 8601
  metadata: z
    .object({
      seoTitle: z.string().max(60).optional(),
      seoDescription: z.string().max(160).optional(),
    })
    .optional(),
});

// 搜索查询 Schema（支持复杂过滤）
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  minAge: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxAge: z.string().transform(Number).pipe(z.number().max(150)).optional(),
  tags: z
    .string()
    .transform((s) => s.split(",").filter(Boolean))
    .optional(),
}).refine(
  (data) => {
    if (data.from && data.to) return new Date(data.from) <= new Date(data.to);
    return true;
  },
  { message: "'from' must be before 'to'", path: ["from"] }
);

// ===== 5. Zod 错误格式化工具 =====

export function formatZodError(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_root";
    if (!fields[key]) fields[key] = [];
    fields[key].push(issue.message);
  }
  return fields;
}

// ===== 6. 类型推断辅助 =====

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type CreatePost = z.infer<typeof createPostSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type Pagination = z.infer<typeof paginationSchema>;

// ===== 7. 使用示例 =====
// router.post("/users",
//   validate({ body: createUserSchema }),
//   asyncHandler(async (req, res) => {
//     const data = req.body as CreateUser; // 类型安全，已验证
//     const user = await db.createUser(data);
//     res.status(201).json({ success: true, data: user });
//   })
// );
