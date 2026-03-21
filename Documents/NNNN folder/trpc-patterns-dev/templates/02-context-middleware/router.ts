/**
 * tRPC v11 — Context & Middleware
 * createContext, JWT auth middleware, role-based procedures
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

// ── 1. Context types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: "admin" | "user" | "viewer";
}

export interface Context {
  user: User | null;
  requestId: string;
  db: { query: (sql: string) => Promise<unknown[]> }; // mock DB
}

// ── 2. createContext (adapt for your server: Express/Next/Hono/etc.) ─────────

export async function createContext(opts: {
  req: { headers: { authorization?: string } };
}): Promise<Context> {
  const token = opts.req.headers.authorization?.replace("Bearer ", "");
  const user = token ? await verifyToken(token) : null;
  return {
    user,
    requestId: Math.random().toString(36).slice(2),
    db: { query: async (sql) => { console.log("[DB]", sql); return []; } },
  };
}

async function verifyToken(token: string): Promise<User | null> {
  // In production: verify JWT signature + expiry
  if (token === "valid-token") {
    return { id: "user-1", email: "alice@example.com", role: "admin" };
  }
  return null;
}

// ── 3. initTRPC with context ──────────────────────────────────────────────────

const t = initTRPC.context<Context>().create({
  // Optional: transform errors before sending to client
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        requestId: undefined as string | undefined, // injected by middleware below
        isAuthError: error.code === "UNAUTHORIZED",
      },
    };
  },
});

// ── 4. Reusable middleware ────────────────────────────────────────────────────

// Logging middleware — logs procedure name + duration
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  console.log(`[tRPC] ${type} ${path} — ${Date.now() - start}ms`);
  return result;
});

// Auth middleware — requires valid session
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } }); // narrows user to non-null
});

// Role middleware — requires specific role
const requireRole = (...roles: Array<User["role"]>) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user || !roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Required role: ${roles.join(" or ")}`,
      });
    }
    return next({ ctx });
  });

// Rate-limit middleware (per-user, in-memory, demo only)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const rateLimit = (maxPerMinute: number) =>
  t.middleware(({ ctx, next }) => {
    if (ctx.user) {
      const now = Date.now();
      const key = ctx.user.id;
      const entry = requestCounts.get(key) ?? { count: 0, resetAt: now + 60_000 };
      if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 60_000; }
      entry.count++;
      requestCounts.set(key, entry);
      if (entry.count > maxPerMinute) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" });
      }
    }
    return next();
  });

// ── 5. Procedure factories ────────────────────────────────────────────────────

export const publicProcedure = t.procedure.use(loggingMiddleware);
export const protectedProcedure = t.procedure.use(loggingMiddleware).use(isAuthed);
export const adminProcedure = t.procedure.use(loggingMiddleware).use(isAuthed).use(requireRole("admin"));
export const rateLimitedProcedure = protectedProcedure.use(rateLimit(30));

// ── 6. Router using typed procedures ─────────────────────────────────────────

export const appRouter = t.router({
  // Public: no auth required
  ping: publicProcedure.query(() => "pong"),

  // Protected: any authenticated user
  me: protectedProcedure
    .output(z.object({ id: z.string(), email: z.string(), role: z.string() }))
    .query(({ ctx }) => ctx.user),

  // Protected: update own profile
  updateProfile: rateLimitedProcedure
    .input(z.object({ email: z.string().email().optional() }))
    .mutation(({ ctx, input }) => ({ ...ctx.user, ...input })),

  // Admin-only: list all users
  admin: t.router({
    listUsers: adminProcedure
      .output(z.array(z.object({ id: z.string(), email: z.string() })))
      .query(() => [{ id: "1", email: "alice@example.com" }]),

    deleteUser: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => ({ deleted: input.id })),
  }),
});

export type AppRouter = typeof appRouter;
