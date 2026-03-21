/**
 * Fastify Schema Validation
 * Demonstrates: JSON Schema, TypeBox, request/response schemas, serialization speed
 */
import Fastify from "fastify";
import { Type, Static } from "@sinclair/typebox";

const fastify = Fastify({ logger: false });

// ── TypeBox schemas ───────────────────────────────────────────────────────────
// TypeBox generates JSON Schema from TypeScript types at build time

const UserSchema = Type.Object({
  id: Type.Integer(),
  email: Type.String({ format: "email" }),
  name: Type.String({ minLength: 1, maxLength: 100 }),
  role: Type.Union([
    Type.Literal("USER"),
    Type.Literal("ADMIN"),
    Type.Literal("MODERATOR"),
  ]),
  createdAt: Type.String({ format: "date-time" }),
});

const CreateUserBody = Type.Object({
  email: Type.String({ format: "email" }),
  name: Type.String({ minLength: 1, maxLength: 100 }),
  role: Type.Optional(Type.Union([
    Type.Literal("USER"),
    Type.Literal("ADMIN"),
    Type.Literal("MODERATOR"),
  ])),
});

const UpdateUserBody = Type.Partial(
  Type.Pick(CreateUserBody, ["name", "role"])
);

const UserParams = Type.Object({ id: Type.String() });

const PaginationQuery = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
});

// TypeScript inference from TypeBox
type User = Static<typeof UserSchema>;
type CreateUserInput = Static<typeof CreateUserBody>;

// ── Routes with inline schema validation ─────────────────────────────────────

export async function registerRoutes() {
  // GET /users — query string validation + response serialization
  fastify.get(
    "/users",
    {
      schema: {
        querystring: PaginationQuery,
        response: {
          200: Type.Object({
            data: Type.Array(UserSchema),
            total: Type.Integer(),
          }),
        },
      },
    },
    async (request) => {
      const { page = 1, limit = 20 } = request.query as Static<typeof PaginationQuery>;
      return { data: [] as User[], total: 0 };
    }
  );

  // POST /users — body validation
  fastify.post(
    "/users",
    {
      schema: {
        body: CreateUserBody,
        response: {
          201: UserSchema,
          422: Type.Object({
            error: Type.String(),
            field: Type.Optional(Type.String()),
          }),
        },
      },
    },
    async (request, reply) => {
      const body = request.body as CreateUserInput;
      const user: User = {
        id: Date.now(),
        email: body.email,
        name: body.name,
        role: body.role ?? "USER",
        createdAt: new Date().toISOString(),
      };
      return reply.code(201).send(user);
    }
  );

  // PUT /users/:id — params + body validation
  fastify.put(
    "/users/:id",
    {
      schema: {
        params: UserParams,
        body: UpdateUserBody,
        response: { 200: UserSchema },
      },
    },
    async (request, reply) => {
      const { id } = request.params as Static<typeof UserParams>;
      const body = request.body as Static<typeof UpdateUserBody>;
      // Would fetch and update user in DB
      return reply.send({ id: parseInt(id), email: "user@example.com", ...body, createdAt: new Date().toISOString(), role: "USER" });
    }
  );
}

// ── Raw JSON Schema (without TypeBox) ─────────────────────────────────────────

export async function registerWithJsonSchema() {
  fastify.post(
    "/products",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: { type: "string", minLength: 1 },
            price: { type: "number", minimum: 0 },
            description: { type: "string" },
            category: { type: "string", enum: ["hardware", "software", "service"] },
          },
          additionalProperties: false,
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              price: { type: "number" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as { name: string; price: number };
      return reply.code(201).send({ id: 1, ...body });
    }
  );
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  await registerRoutes();
  await registerWithJsonSchema();

  await fastify.listen({ port: 3000 });
  console.log("Fastify schema validation server running on http://localhost:3000");
}

if (require.main === module) {
  main().catch(console.error);
}

export { fastify };
