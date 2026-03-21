/**
 * Fastify Deployment Patterns
 * Demonstrates: graceful shutdown, health checks, logging, compression, CORS, rate limiting
 */
import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import compress from "@fastify/compress";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

// ── Production Fastify configuration ─────────────────────────────────────────

export async function buildProductionApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      // JSON logging in production (structured logs for aggregators)
      transport: process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    },
    trustProxy: true, // behind load balancer/nginx
    requestTimeout: 30000, // 30s global timeout
    connectionTimeout: 0,
  });

  // ── Security headers (helmet) ─────────────────────────────────────────────

  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
      },
    },
  });

  // ── CORS ──────────────────────────────────────────────────────────────────

  await fastify.register(cors, {
    origin: (process.env.CORS_ORIGINS ?? "").split(",").filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // ── Response compression ──────────────────────────────────────────────────

  await fastify.register(compress, {
    global: true,
    encodings: ["gzip", "br"],
  });

  // ── Rate limiting ─────────────────────────────────────────────────────────

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: (_req, context) => ({
      code: "TOO_MANY_REQUESTS",
      error: "Too Many Requests",
      message: `Rate limit exceeded. Retry in ${context.after}`,
      date: new Date().toISOString(),
    }),
  });

  // ── Health checks ─────────────────────────────────────────────────────────

  fastify.get("/health", { config: { rateLimit: false } }, async (_req, reply) => {
    return reply.send({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "unknown",
    });
  });

  fastify.get("/health/ready", async (_req, reply) => {
    // Check all dependencies (DB, cache, etc.)
    const checks = {
      database: "ok" as "ok" | "fail",
      cache: "ok" as "ok" | "fail",
    };

    const allHealthy = Object.values(checks).every((v) => v === "ok");
    return reply
      .code(allHealthy ? 200 : 503)
      .send({ status: allHealthy ? "ready" : "not_ready", checks });
  });

  // ── App routes ────────────────────────────────────────────────────────────

  fastify.get("/", async (_req, reply) => {
    return reply.send({ service: "api", version: "1.0.0" });
  });

  return fastify;
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

export function setupGracefulShutdown(app: FastifyInstance) {
  const shutdown = async (signal: string) => {
    app.log.info(`[Shutdown] ${signal} received — graceful shutdown started`);

    try {
      await app.close();
      app.log.info("[Shutdown] Server closed successfully");
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, "[Shutdown] Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle uncaught errors
  process.on("uncaughtException", (err) => {
    app.log.fatal({ err }, "Uncaught exception");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    app.log.fatal({ reason }, "Unhandled promise rejection");
    process.exit(1);
  });
}

// ── Cluster mode ─────────────────────────────────────────────────────────────
//
// For multi-core utilization — use in production with PM2 or manually:
//
// import cluster from "cluster";
// import os from "os";
//
// if (cluster.isPrimary) {
//   const numCPUs = os.cpus().length;
//   for (let i = 0; i < numCPUs; i++) cluster.fork();
//   cluster.on("exit", (worker) => {
//     console.log(`Worker ${worker.process.pid} died — restarting`);
//     cluster.fork();
//   });
// } else {
//   startServer();
// }

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = await buildProductionApp();
  setupGracefulShutdown(app);

  const port = parseInt(process.env.PORT ?? "3000");
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
  console.log(`Fastify production server on http://${host}:${port}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default buildProductionApp;
