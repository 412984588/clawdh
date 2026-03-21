/**
 * Hono.js — Zod Validation
 * @hono/zod-validator middleware, typed request bodies, custom error responses
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

// ── 1. Schemas ────────────────────────────────────────────────────────────────

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase(),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(["admin", "user", "viewer"]).default("user"),
});

const UpdateUserSchema = CreateUserSchema.partial();

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["name", "email", "createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ── 2. In-memory store ────────────────────────────────────────────────────────

type User = z.infer<typeof CreateUserSchema> & { id: string; createdAt: string };
const users: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "admin", createdAt: "2024-01-01" },
];

// ── 3. Custom validation error format ─────────────────────────────────────────

function validationError(c: Parameters<Parameters<typeof app.get>[1]>[0], result: { error: z.ZodError }) {
  return c.json(
    {
      error: "Validation failed",
      issues: result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    },
    400
  );
}

// ── 4. Routes ─────────────────────────────────────────────────────────────────

// Query params validation
app.get(
  "/users",
  zValidator("query", PaginationSchema, (result, c) => {
    if (!result.success) return validationError(c, result);
  }),
  (c) => {
    const { page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;
    return c.json({
      data: users.slice(offset, offset + limit),
      pagination: { page, limit, total: users.length },
    });
  }
);

// JSON body validation
app.post(
  "/users",
  zValidator("json", CreateUserSchema, (result, c) => {
    if (!result.success) return validationError(c, result);
  }),
  (c) => {
    const body = c.req.valid("json");
    const user: User = {
      id: String(users.length + 1),
      createdAt: new Date().toISOString(),
      ...body,
    };
    users.push(user);
    return c.json(user, 201);
  }
);

// Path param + body validation
app.put(
  "/users/:id",
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", UpdateUserSchema, (result, c) => {
    if (!result.success) return validationError(c, result);
  }),
  (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return c.json({ error: "User not found" }, 404);
    users[idx] = { ...users[idx], ...body };
    return c.json(users[idx]);
  }
);

// Login with body + header validation
app.post(
  "/auth/login",
  zValidator("json", LoginSchema),
  zValidator(
    "header",
    z.object({ "x-request-id": z.string().uuid().optional() })
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");
    // Demo only — in production: verify password hash
    if (password === "hunter2") {
      return c.json({ token: "demo-jwt", email });
    }
    return c.json({ error: "Invalid credentials" }, 401);
  }
);

export default app;
