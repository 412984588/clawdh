/**
 * Fastify Hooks & Lifecycle
 * Demonstrates: onRequest, preHandler, onSend, onClose, request lifecycle, context
 */
import Fastify, { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export function buildApp(): FastifyInstance {
  const fastify = Fastify({ logger: false });

  // ── Request ID (onRequest) ────────────────────────────────────────────────────
  // Runs first — before routing and parsing

  fastify.addHook("onRequest", async (request: FastifyRequest, _reply: FastifyReply) => {
    // Fastify auto-generates request.id — add to log context
    request.log.info({ requestId: request.id }, "Incoming request");
  });

  // ── Authentication (preHandler) ───────────────────────────────────────────────
  // Runs after parsing, before the route handler

  fastify.addHook("preHandler", async (request: FastifyRequest, reply: FastifyReply) => {
    const publicPaths = ["/health", "/docs"];
    if (publicPaths.some((p) => request.routerPath?.startsWith(p))) return;

    const token = request.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    // Attach user to request (see declare module below)
    (request as FastifyRequest & { user: { id: number } }).user = { id: 1 };
  });

  // ── Response timing (onSend) ──────────────────────────────────────────────────
  // Runs before sending the response — can modify body

  fastify.addHook("onSend", async (request, _reply, payload) => {
    const duration = Date.now() - (request as FastifyRequest & { startTime: number }).startTime;
    request.log.info({ duration }, "Response sent");
    return payload; // must return payload (possibly modified)
  });

  // ── Request timing (onRequest vs onSend pair) ─────────────────────────────────

  fastify.addHook("onRequest", async (request) => {
    (request as FastifyRequest & { startTime: number }).startTime = Date.now();
  });

  // ── After response (onResponse) ───────────────────────────────────────────────
  // Runs after response sent — good for metrics/cleanup

  fastify.addHook("onResponse", async (request, reply) => {
    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
    }, "Request completed");
  });

  // ── Error hook ────────────────────────────────────────────────────────────────

  fastify.addHook("onError", async (request, _reply, error) => {
    request.log.error({ error: error.message }, "Request error");
  });

  // ── Route-level hooks ─────────────────────────────────────────────────────────
  // Hooks can be scoped to specific routes

  fastify.get(
    "/admin/stats",
    {
      preHandler: async (request, reply) => {
        // Route-specific auth check
        const token = request.headers.authorization;
        if (!token?.includes("admin")) {
          return reply.code(403).send({ error: "Forbidden" });
        }
      },
    },
    async (_request, reply) => {
      return reply.send({ totalUsers: 1000, activeToday: 42 });
    }
  );

  // ── Content type parser ───────────────────────────────────────────────────────
  // Handle custom content types

  fastify.addContentTypeParser(
    "application/x-www-form-urlencoded",
    { parseAs: "string" },
    (req, body: string, done) => {
      try {
        const parsed = Object.fromEntries(new URLSearchParams(body));
        done(null, parsed);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  // ── Server close cleanup ──────────────────────────────────────────────────────

  fastify.addHook("onClose", async (_instance) => {
    console.log("[Lifecycle] Server closing — cleanup running");
  });

  // ── Routes ────────────────────────────────────────────────────────────────────

  fastify.get("/health", async (_req, reply) => {
    return reply.send({ healthy: true });
  });

  fastify.get("/users", async (_req, reply) => {
    return reply.send({ users: [] });
  });

  return fastify;
}

// ── Lifecycle hook order ──────────────────────────────────────────────────────
//
// Request lifecycle:
// onRequest → preParsing → preValidation → preHandler → [route handler]
//           → preSerialization → onSend → onResponse
//
// Error path: onError → onSend → onResponse

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = buildApp();
  await app.listen({ port: 3000 });
  console.log("Fastify lifecycle hooks demo on http://localhost:3000");
}

if (require.main === module) {
  main().catch(console.error);
}

export default buildApp;
