/**
 * Fastify Testing
 * Demonstrates: inject(), test setup, mocking, Vitest integration
 */
import Fastify, { FastifyInstance } from "fastify";

// ── App factory ───────────────────────────────────────────────────────────────
// Always export an app factory — never call listen() in the module

export async function buildTestApp(overrides?: {
  db?: { query: () => Promise<unknown[]> };
}): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: false });

  // Decorate with a mock-able db
  const db = overrides?.db ?? {
    query: async () => [{ id: 1, name: "Alice", email: "alice@example.com" }],
  };

  fastify.decorate("db", db);

  // Routes
  fastify.get("/users", async (_req, reply) => {
    const users = await fastify.db.query();
    return reply.send({ users, total: (users as unknown[]).length });
  });

  fastify.get<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    const { id } = request.params;
    if (id === "404") {
      return reply.code(404).send({ error: "Not found" });
    }
    return reply.send({ id: parseInt(id), name: "Alice" });
  });

  fastify.post<{ Body: { name: string; email: string } }>(
    "/users",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, email } = request.body;
      return reply.code(201).send({ id: 2, name, email });
    }
  );

  await fastify.ready();
  return fastify;
}

// ── Test helpers ──────────────────────────────────────────────────────────────

export async function makeRequest(
  app: FastifyInstance,
  method: string,
  url: string,
  options: {
    body?: unknown;
    headers?: Record<string, string>;
    query?: Record<string, string>;
  } = {}
) {
  const qs = options.query
    ? "?" + new URLSearchParams(options.query).toString()
    : "";

  return app.inject({
    method,
    url: url + qs,
    headers: options.headers,
    payload: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
  });
}

// ── Example tests (Vitest / Jest compatible) ──────────────────────────────────
//
// import { describe, it, expect, beforeAll, afterAll } from "vitest";
//
// describe("GET /users", () => {
//   let app: FastifyInstance;
//   beforeAll(async () => { app = await buildTestApp(); });
//   afterAll(async () => { await app.close(); });
//
//   it("returns user list", async () => {
//     const res = await makeRequest(app, "GET", "/users");
//     expect(res.statusCode).toBe(200);
//     const body = res.json();
//     expect(body.users).toBeInstanceOf(Array);
//     expect(body.total).toBeGreaterThanOrEqual(0);
//   });
// });
//
// describe("POST /users", () => {
//   let app: FastifyInstance;
//   beforeAll(async () => { app = await buildTestApp(); });
//   afterAll(async () => { await app.close(); });
//
//   it("creates a user", async () => {
//     const res = await makeRequest(app, "POST", "/users", {
//       body: { name: "Bob", email: "bob@example.com" },
//     });
//     expect(res.statusCode).toBe(201);
//     const body = res.json();
//     expect(body.name).toBe("Bob");
//   });
//
//   it("validates email format", async () => {
//     const res = await makeRequest(app, "POST", "/users", {
//       body: { name: "Bob", email: "not-an-email" },
//     });
//     expect(res.statusCode).toBe(400);
//   });
// });
//
// describe("with mock DB", () => {
//   it("uses injected db", async () => {
//     const mockDb = { query: async () => [{ id: 99, name: "Mock" }] };
//     const app = await buildTestApp({ db: mockDb });
//     const res = await makeRequest(app, "GET", "/users");
//     expect(res.json().users[0].id).toBe(99);
//     await app.close();
//   });
// });

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = await buildTestApp();
  const res = await makeRequest(app, "GET", "/users");
  console.log(`[Test] GET /users → ${res.statusCode}: ${res.body}`);

  const res2 = await makeRequest(app, "POST", "/users", {
    body: { name: "Carol", email: "carol@example.com" },
  });
  console.log(`[Test] POST /users → ${res2.statusCode}: ${res2.body}`);

  const res3 = await makeRequest(app, "GET", "/users/404");
  console.log(`[Test] GET /users/404 → ${res3.statusCode}: ${res3.body}`);

  await app.close();
}

main().catch(console.error);

export default buildTestApp;
