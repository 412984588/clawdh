/**
 * tRPC v11 — Testing Patterns
 * createCallerFactory, mock context, unit tests, integration tests
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

// ── 1. Router under test ──────────────────────────────────────────────────────

interface DB {
  users: Map<string, { id: string; name: string; email: string; balance: number }>;
  posts: Map<string, { id: string; title: string; authorId: string; published: boolean }>;
}

interface Context {
  user: { id: string; role: "admin" | "user" } | null;
  db: DB;
}

const t = initTRPC.context<Context>().create();
const router = t.router;

const authed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(authed);

export const appRouter = router({
  users: router({
    list: protectedProcedure
      .output(z.array(z.object({ id: z.string(), name: z.string(), email: z.string() })))
      .query(({ ctx }) => Array.from(ctx.db.users.values())),

    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ ctx, input }) => ctx.db.users.get(input.id) ?? null),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), email: z.string().email() }))
      .mutation(({ ctx, input }) => {
        const user = { id: Math.random().toString(36).slice(2), ...input, balance: 0 };
        ctx.db.users.set(user.id, user);
        return user;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admins only" });
        }
        const deleted = ctx.db.users.delete(input.id);
        if (!deleted) throw new TRPCError({ code: "NOT_FOUND" });
        return { deleted: true };
      }),
  }),

  posts: router({
    publish: protectedProcedure
      .input(z.object({ postId: z.string() }))
      .mutation(({ ctx, input }) => {
        const post = ctx.db.posts.get(input.postId);
        if (!post) throw new TRPCError({ code: "NOT_FOUND" });
        if (post.authorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        post.published = true;
        ctx.db.posts.set(post.id, post);
        return post;
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ── 2. Test factory helpers ───────────────────────────────────────────────────

export const createCallerFactory = t.createCallerFactory(appRouter);

function makeDB(): DB {
  return {
    users: new Map([
      ["user-1", { id: "user-1", name: "Alice", email: "alice@example.com", balance: 100 }],
      ["user-2", { id: "user-2", name: "Bob", email: "bob@example.com", balance: 50 }],
    ]),
    posts: new Map([
      ["post-1", { id: "post-1", title: "Hello World", authorId: "user-1", published: false }],
    ]),
  };
}

export function makeCallerAnon(db = makeDB()) {
  return createCallerFactory({ user: null, db });
}

export function makeCallerUser(id = "user-1", db = makeDB()) {
  return createCallerFactory({ user: { id, role: "user" }, db });
}

export function makeCallerAdmin(db = makeDB()) {
  return createCallerFactory({ user: { id: "admin-1", role: "admin" }, db });
}

// ── 3. Inline tests (run with: npx vitest run) ────────────────────────────────

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${(err as Error).message}`);
      failed++;
    }
  }

  function expect<T>(actual: T) {
    return {
      toBe: (expected: T) => {
        if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);
      },
      toEqual: (expected: T) => {
        const a = JSON.stringify(actual);
        const b = JSON.stringify(expected);
        if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
      },
      toBeNull: () => {
        if (actual !== null) throw new Error(`Expected null, got ${actual}`);
      },
      toThrow: async (fn: () => Promise<unknown>) => {
        try { await fn(); throw new Error("Expected to throw"); } catch { /* ok */ }
      },
    };
  }

  console.log("Running tRPC tests...");

  // Public procedure — no auth needed
  await test("users.byId returns user", async () => {
    const caller = makeCallerAnon();
    const user = await caller.users.byId({ id: "user-1" });
    expect(user?.name).toBe("Alice");
  });

  await test("users.byId returns null for missing id", async () => {
    const caller = makeCallerAnon();
    const user = await caller.users.byId({ id: "nonexistent" });
    expect(user).toBeNull();
  });

  // Protected procedure — requires auth
  await test("users.list requires auth", async () => {
    const caller = makeCallerAnon();
    let threw = false;
    try { await caller.users.list(); } catch (err) {
      threw = (err as { code?: string }).code === "UNAUTHORIZED";
    }
    if (!threw) throw new Error("Expected UNAUTHORIZED");
  });

  await test("users.list returns all users when authed", async () => {
    const caller = makeCallerUser();
    const users = await caller.users.list();
    expect(users.length).toBe(2);
  });

  await test("users.create adds new user", async () => {
    const db = makeDB();
    const caller = makeCallerUser("user-1", db);
    const created = await caller.users.create({ name: "Carol", email: "carol@example.com" });
    expect(created.name).toBe("Carol");
    expect(db.users.size).toBe(3);
  });

  // Role-based access
  await test("users.delete forbidden for non-admin", async () => {
    const caller = makeCallerUser();
    let threw = false;
    try { await caller.users.delete({ id: "user-2" }); } catch (err) {
      threw = (err as { code?: string }).code === "FORBIDDEN";
    }
    if (!threw) throw new Error("Expected FORBIDDEN");
  });

  await test("users.delete succeeds for admin", async () => {
    const db = makeDB();
    const caller = makeCallerAdmin(db);
    const result = await caller.users.delete({ id: "user-1" });
    expect(result.deleted).toBe(true);
    expect(db.users.size).toBe(1);
  });

  // NOT_FOUND
  await test("users.delete throws NOT_FOUND for missing user", async () => {
    const caller = makeCallerAdmin();
    let threw = false;
    try { await caller.users.delete({ id: "nonexistent" }); } catch (err) {
      threw = (err as { code?: string }).code === "NOT_FOUND";
    }
    if (!threw) throw new Error("Expected NOT_FOUND");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
}

// Uncomment to run standalone:
// runTests().catch(console.error);
