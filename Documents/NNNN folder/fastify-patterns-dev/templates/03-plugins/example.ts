/**
 * Fastify Plugins
 * Demonstrates: fp (fastify-plugin), plugin registration, decorators, encapsulation
 */
import Fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

// ── Simple plugin ─────────────────────────────────────────────────────────────
// fp() breaks encapsulation — decorator available to parent scope

interface DatabaseClient {
  query: (sql: string) => Promise<unknown[]>;
  close: () => Promise<void>;
}

const databasePlugin: FastifyPluginAsync = fp(async (fastify) => {
  // Simulate DB connection
  const db: DatabaseClient = {
    query: async (sql) => {
      console.log(`[DB] ${sql}`);
      return [];
    },
    close: async () => console.log("[DB] Connection closed"),
  };

  // Decorate the fastify instance
  fastify.decorate("db", db);

  // Lifecycle hook — clean up on close
  fastify.addHook("onClose", async (instance) => {
    await instance.db.close();
  });
});

// ── Config plugin ─────────────────────────────────────────────────────────────

interface AppConfig {
  jwtSecret: string;
  dbUrl: string;
  port: number;
}

const configPlugin: FastifyPluginAsync<{ config: AppConfig }> = fp(
  async (fastify, options) => {
    fastify.decorate("config", options.config);
  }
);

// ── Rate limit plugin (encapsulated) ──────────────────────────────────────────
// Without fp() — only available within this scope

const rateLimitPlugin: FastifyPluginAsync<{ max: number; windowMs: number }> = async (
  fastify,
  options
) => {
  const counts = new Map<string, { count: number; resetAt: number }>();

  fastify.addHook("onRequest", async (request, reply) => {
    const ip = request.ip;
    const now = Date.now();

    const entry = counts.get(ip);
    if (!entry || entry.resetAt < now) {
      counts.set(ip, { count: 1, resetAt: now + options.windowMs });
    } else {
      entry.count++;
      if (entry.count > options.max) {
        return reply.code(429).send({
          error: "Too Many Requests",
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        });
      }
    }
  });
};

// ── Declare module augmentation (for TypeScript) ──────────────────────────────

declare module "fastify" {
  interface FastifyInstance {
    db: DatabaseClient;
    config: AppConfig;
  }
}

// ── Build app with plugins ────────────────────────────────────────────────────

export async function buildApp(): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: false });

  // Register config (with options)
  await fastify.register(configPlugin, {
    config: {
      jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
      dbUrl: process.env.DATABASE_URL ?? "postgresql://localhost/mydb",
      port: 3000,
    },
  });

  // Register database
  await fastify.register(databasePlugin);

  // Encapsulated rate limit (only affects routes registered here)
  await fastify.register(async (app) => {
    await app.register(rateLimitPlugin, { max: 100, windowMs: 60000 });

    app.get("/api/data", async (request, reply) => {
      const rows = await request.server.db.query("SELECT * FROM data LIMIT 10");
      return reply.send({ data: rows });
    });
  });

  // Route outside rate limit scope
  fastify.get("/health", async (_req, reply) => {
    return reply.send({ healthy: true });
  });

  return fastify;
}

// ── Plugin with shared state ───────────────────────────────────────────────────

export const cachePlugin: FastifyPluginAsync = fp(async (fastify) => {
  const cache = new Map<string, { value: unknown; expiresAt: number }>();

  fastify.decorate("cache", {
    get(key: string): unknown | null {
      const entry = cache.get(key);
      if (!entry || entry.expiresAt < Date.now()) {
        cache.delete(key);
        return null;
      }
      return entry.value;
    },
    set(key: string, value: unknown, ttlMs = 60000): void {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    del(key: string): void {
      cache.delete(key);
    },
  });
});

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = await buildApp();
  await app.listen({ port: 3000 });
  console.log("Fastify plugin demo running on http://localhost:3000");
}

if (require.main === module) {
  main().catch(console.error);
}

export default buildApp;
