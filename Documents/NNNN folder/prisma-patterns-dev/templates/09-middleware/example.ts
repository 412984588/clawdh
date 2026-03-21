/**
 * Prisma Middleware & Extensions
 * Demonstrates: $use middleware (deprecated), Client Extensions, query logging, metrics
 */
import { PrismaClient } from "@prisma/client";

// ── Client Extensions (Prisma 4.7+ recommended approach) ─────────────────────

// ── Result extension — computed fields ────────────────────────────────────────

const clientWithComputedFields = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user.firstName} ${user.lastName}`.trim();
        },
      },
      isVerified: {
        needs: { emailVerifiedAt: true },
        compute(user) {
          return user.emailVerifiedAt !== null;
        },
      },
    },
    post: {
      excerpt: {
        needs: { body: true },
        compute(post) {
          return post.body.slice(0, 150) + (post.body.length > 150 ? "..." : "");
        },
      },
    },
  },
});

// ── Model extension — custom methods ──────────────────────────────────────────

const clientWithMethods = new PrismaClient().$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return clientWithMethods.user.findUnique({ where: { email } });
      },
      async findActive() {
        return clientWithMethods.user.findMany({
          where: { active: true, deletedAt: null },
        });
      },
    },
    post: {
      async findPublished(take = 20) {
        return clientWithMethods.post.findMany({
          where: { published: true, deletedAt: null },
          orderBy: { publishedAt: "desc" },
          take,
        });
      },
    },
  },
});

// ── Query extension — logging + soft-delete ────────────────────────────────────

export function createProductionClient() {
  return new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = performance.now();
          const result = await query(args);
          const duration = performance.now() - start;

          if (duration > 500) {
            console.warn(`[SlowQuery] ${model}.${operation} took ${duration.toFixed(0)}ms`);
          }

          return result;
        },
        // Auto-filter soft-deleted records for reads
        async findMany({ args, query }) {
          if (!("where" in args)) {
            (args as { where?: unknown }).where = {};
          }
          const where = (args as { where: Record<string, unknown> }).where;
          if (!("deletedAt" in where)) {
            where.deletedAt = null;
          }
          return query(args);
        },
      },
    },
  });
}

// ── $use middleware (Prisma < 4.7, still supported) ───────────────────────────

export function createMiddlewareClient() {
  const prisma = new PrismaClient();

  // Logging middleware
  prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    console.log(`[Query] ${params.model}.${params.action} — ${duration}ms`);
    return result;
  });

  // Soft-delete middleware
  prisma.$use(async (params, next) => {
    const modelsWithSoftDelete = ["User", "Post"];

    if (modelsWithSoftDelete.includes(params.model ?? "")) {
      if (params.action === "delete") {
        // Intercept delete → update
        params.action = "update";
        params.args.data = { deletedAt: new Date() };
      }
      if (params.action === "deleteMany") {
        params.action = "updateMany";
        params.args.data = { deletedAt: new Date() };
      }
      // Add deletedAt: null filter to reads
      if (["findMany", "findFirst", "count"].includes(params.action)) {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        params.args.where.deletedAt = null;
      }
    }

    return next(params);
  });

  return prisma;
}

// ── Query event listener ──────────────────────────────────────────────────────

export function createLoggingClient() {
  const prisma = new PrismaClient({
    log: [{ level: "query", emit: "event" }],
  });

  // Type-safe query event
  prisma.$on("query", (e) => {
    console.log(`[SQL] ${e.query}`);
    console.log(`[Params] ${e.params}`);
    console.log(`[Duration] ${e.duration}ms`);
  });

  return prisma;
}

// ── Metrics (Prisma 4.9+) ─────────────────────────────────────────────────────

export async function getClientMetrics() {
  const prisma = new PrismaClient({ metrics: { globalLabels: { service: "api" } } });

  const metrics = await prisma.$metrics.json();
  console.log("[Metrics]", JSON.stringify(metrics, null, 2));

  await prisma.$disconnect();
  return metrics;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  // Computed fields
  const user = await clientWithComputedFields.user.findFirst({});
  if (user) {
    console.log(`[Computed] Full name: ${user.fullName}, Verified: ${user.isVerified}`);
  }

  // Custom methods
  const published = await clientWithMethods.post.findPublished(5);
  console.log(`[Methods] Published posts: ${published.length}`);

  await clientWithComputedFields.$disconnect();
  await clientWithMethods.$disconnect();
}

main().catch(console.error);
