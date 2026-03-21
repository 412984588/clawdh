/**
 * Fastify Basic Routes
 * Demonstrates: GET/POST/PUT/DELETE, route params, query strings, request/reply types
 */
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export function buildApp(): FastifyInstance {
  const fastify = Fastify({ logger: true });

  // ── GET — simple ────────────────────────────────────────────────────────────

  fastify.get("/", async (_request, reply) => {
    return reply.send({ status: "ok", service: "api", version: "1.0.0" });
  });

  fastify.get("/health", async (_request, reply) => {
    return reply.code(200).send({ healthy: true, timestamp: new Date().toISOString() });
  });

  // ── Route params ─────────────────────────────────────────────────────────────

  fastify.get<{ Params: { id: string } }>(
    "/users/:id",
    async (request, reply) => {
      const { id } = request.params;
      // Simulate user lookup
      if (id === "404") {
        return reply.code(404).send({ error: "User not found" });
      }
      return reply.send({ id, name: `User ${id}`, email: `user${id}@example.com` });
    }
  );

  // ── Query strings ─────────────────────────────────────────────────────────────

  fastify.get<{
    Querystring: { page?: string; limit?: string; search?: string };
  }>(
    "/users",
    async (request, reply) => {
      const page = parseInt(request.query.page ?? "1");
      const limit = Math.min(parseInt(request.query.limit ?? "20"), 100);
      const search = request.query.search ?? "";

      return reply.send({
        data: [], // would be DB results
        pagination: { page, limit, search, total: 0 },
      });
    }
  );

  // ── POST — with body ──────────────────────────────────────────────────────────

  fastify.post<{
    Body: { name: string; email: string };
  }>(
    "/users",
    async (request, reply) => {
      const { name, email } = request.body;
      const user = { id: Date.now(), name, email, createdAt: new Date().toISOString() };
      return reply.code(201).send(user);
    }
  );

  // ── PUT — update ──────────────────────────────────────────────────────────────

  fastify.put<{
    Params: { id: string };
    Body: { name?: string; email?: string };
  }>(
    "/users/:id",
    async (request, reply) => {
      const { id } = request.params;
      const updates = request.body;
      return reply.send({ id: parseInt(id), ...updates, updatedAt: new Date().toISOString() });
    }
  );

  // ── DELETE ────────────────────────────────────────────────────────────────────

  fastify.delete<{ Params: { id: string } }>(
    "/users/:id",
    async (request, reply) => {
      const { id } = request.params;
      return reply.code(204).send();
    }
  );

  // ── Route prefixing (inline) ──────────────────────────────────────────────────

  fastify.register(async (app) => {
    app.get("/", async (_req, reply) => reply.send({ resource: "posts" }));
    app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
      return reply.send({ id: req.params.id, title: `Post ${req.params.id}` });
    });
  }, { prefix: "/posts" });

  // ── Reply helpers ─────────────────────────────────────────────────────────────

  fastify.get("/demo/redirect", async (_req, reply) => {
    return reply.redirect("/");
  });

  fastify.get("/demo/headers", async (_req, reply) => {
    return reply
      .header("X-Custom-Header", "value")
      .header("Cache-Control", "no-cache")
      .send({ message: "custom headers set" });
  });

  return fastify;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = buildApp();

  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default buildApp;
