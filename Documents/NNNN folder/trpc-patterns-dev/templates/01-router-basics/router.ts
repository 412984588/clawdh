/**
 * tRPC v11 — Router Basics
 * initTRPC, procedures, input/output, router nesting
 */
import { initTRPC } from "@trpc/server";
import { z } from "zod";

// ── 1. Init tRPC ─────────────────────────────────────────────────────────────

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// ── 2. Input / Output schemas ────────────────────────────────────────────────

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user", "viewer"]).default("user"),
  createdAt: z.date(),
});

const CreateUserInput = UserSchema.pick({ name: true, email: true, role: true });
const UpdateUserInput = UserSchema.partial().required({ id: true });

type User = z.infer<typeof UserSchema>;

// ── 3. Simple in-memory "database" for demo ───────────────────────────────────

const users: Map<string, User> = new Map([
  [
    "1",
    {
      id: "1",
      name: "Alice",
      email: "alice@example.com",
      role: "admin",
      createdAt: new Date("2024-01-01"),
    },
  ],
]);

// ── 4. User router ────────────────────────────────────────────────────────────

export const userRouter = router({
  // Query: list all users
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .output(z.array(UserSchema))
    .query(({ input }) => {
      const all = Array.from(users.values());
      const { limit = 20, offset = 0 } = input ?? {};
      return all.slice(offset, offset + limit);
    }),

  // Query: get by ID
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(UserSchema.nullable())
    .query(({ input }) => users.get(input.id) ?? null),

  // Mutation: create
  create: publicProcedure
    .input(CreateUserInput)
    .output(UserSchema)
    .mutation(({ input }) => {
      const user: User = {
        id: Math.random().toString(36).slice(2),
        createdAt: new Date(),
        role: input.role ?? "user",
        ...input,
      };
      users.set(user.id, user);
      return user;
    }),

  // Mutation: update
  update: publicProcedure
    .input(UpdateUserInput)
    .output(UserSchema)
    .mutation(({ input }) => {
      const existing = users.get(input.id);
      if (!existing) throw new Error(`User ${input.id} not found`);
      const updated = { ...existing, ...input };
      users.set(updated.id, updated);
      return updated;
    }),

  // Mutation: delete
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ deleted: z.boolean() }))
    .mutation(({ input }) => ({
      deleted: users.delete(input.id),
    })),
});

// ── 5. App router (root) ─────────────────────────────────────────────────────

export const appRouter = router({
  user: userRouter,

  // Health check procedure
  health: publicProcedure
    .output(z.object({ status: z.string(), timestamp: z.string() }))
    .query(() => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    })),
});

export type AppRouter = typeof appRouter;

// ── 6. Standalone caller (for server-side / testing) ─────────────────────────

export const createCaller = t.createCallerFactory(appRouter);
export const caller = createCaller({});

// ── Usage example ─────────────────────────────────────────────────────────────
//
// Server (Express/Fastify/Hono):
//   import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
//   app.all("/trpc/*", (req, res) => fetchRequestHandler({ router: appRouter, req, createContext: () => ({}) }));
//
// Client:
//   import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
//   const trpc = createTRPCProxyClient<AppRouter>({ links: [httpBatchLink({ url: "/trpc" })] });
//   const users = await trpc.user.list.query({ limit: 10 });
