/**
 * Hono.js — OpenAPI Documentation
 * @hono/zod-openapi for auto-generated OpenAPI 3.1 spec
 */
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

// ── 1. App with OpenAPI support ───────────────────────────────────────────────

const app = new OpenAPIHono();

// ── 2. Shared schema components ───────────────────────────────────────────────

const UserSchema = z
  .object({
    id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    name: z.string().min(1).max(100).openapi({ example: "Alice Johnson" }),
    email: z.string().email().openapi({ example: "alice@example.com" }),
    role: z.enum(["admin", "user", "viewer"]).openapi({ example: "user" }),
    createdAt: z.string().datetime().openapi({ example: "2024-01-15T10:30:00Z" }),
  })
  .openapi("User");

const CreateUserSchema = z
  .object({
    name: z.string().min(1).max(100).openapi({ example: "Alice Johnson" }),
    email: z.string().email().openapi({ example: "alice@example.com" }),
    role: z.enum(["admin", "user", "viewer"]).default("user"),
  })
  .openapi("CreateUser");

const ErrorSchema = z
  .object({
    error: z.string().openapi({ example: "Not found" }),
    code: z.string().optional().openapi({ example: "NOT_FOUND" }),
  })
  .openapi("Error");

const PaginatedUsersSchema = z
  .object({
    data: z.array(UserSchema),
    pagination: z.object({
      page: z.number().int().openapi({ example: 1 }),
      pageSize: z.number().int().openapi({ example: 20 }),
      total: z.number().int().openapi({ example: 100 }),
      pages: z.number().int().openapi({ example: 5 }),
    }),
  })
  .openapi("PaginatedUsers");

// ── 3. Route definitions ──────────────────────────────────────────────────────

const listUsersRoute = createRoute({
  method: "get",
  path: "/users",
  tags: ["Users"],
  summary: "List all users",
  description: "Returns a paginated list of users. Requires authentication.",
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).openapi({ example: 1 }),
      pageSize: z.coerce.number().int().min(1).max(100).default(20).openapi({ example: 20 }),
      role: z.enum(["admin", "user", "viewer"]).optional(),
      q: z.string().optional().openapi({ description: "Search by name or email" }),
    }),
  },
  responses: {
    200: { content: { "application/json": { schema: PaginatedUsersSchema } }, description: "Paginated user list" },
    401: { content: { "application/json": { schema: ErrorSchema } }, description: "Unauthorized" },
  },
});

const getUserRoute = createRoute({
  method: "get",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Get user by ID",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }) }),
  },
  responses: {
    200: { content: { "application/json": { schema: UserSchema } }, description: "User object" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "User not found" },
  },
});

const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags: ["Users"],
  summary: "Create a new user",
  security: [{ BearerAuth: [] }],
  request: { body: { content: { "application/json": { schema: CreateUserSchema } } } },
  responses: {
    201: { content: { "application/json": { schema: UserSchema } }, description: "Created user" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Validation error" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Email already exists" },
  },
});

const deleteUserRoute = createRoute({
  method: "delete",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Delete a user",
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ deleted: z.boolean() }) } }, description: "Deleted" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

// ── 4. Route handlers ─────────────────────────────────────────────────────────

const users: Array<z.infer<typeof UserSchema>> = [
  { id: "123e4567-e89b-12d3-a456-426614174000", name: "Alice", email: "alice@example.com", role: "admin", createdAt: "2024-01-01T00:00:00Z" },
];

app.openapi(listUsersRoute, (c) => {
  const { page, pageSize } = c.req.valid("query");
  const paginated = users.slice((page - 1) * pageSize, page * pageSize);
  return c.json({
    data: paginated,
    pagination: { page, pageSize, total: users.length, pages: Math.ceil(users.length / pageSize) },
  });
});

app.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid("param");
  const user = users.find((u) => u.id === id);
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json(user);
});

app.openapi(createUserRoute, async (c) => {
  const body = c.req.valid("json");
  const exists = users.find((u) => u.email === body.email);
  if (exists) return c.json({ error: "Email already exists" }, 409);
  const user: z.infer<typeof UserSchema> = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    role: body.role ?? "user",
    ...body,
  };
  users.push(user);
  return c.json(user, 201);
});

app.openapi(deleteUserRoute, (c) => {
  const { id } = c.req.valid("param");
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return c.json({ error: "User not found" }, 404);
  users.splice(idx, 1);
  return c.json({ deleted: true });
});

// ── 5. OpenAPI spec + Swagger UI ──────────────────────────────────────────────

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Hono API",
    version: "1.0.0",
    description: "Generated with @hono/zod-openapi",
    contact: { name: "API Support", email: "support@example.com" },
    license: { name: "MIT" },
  },
  servers: [
    { url: "https://api.example.com", description: "Production" },
    { url: "http://localhost:3000", description: "Local development" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

export default app;
