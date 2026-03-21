/**
 * Prisma Testing Patterns
 * Demonstrates: test PrismaClient, transaction rollback, mocking, seed helpers
 */
import { PrismaClient } from "@prisma/client";

// ── Test client setup ─────────────────────────────────────────────────────────
// Use a separate test database (DATABASE_URL=... in .env.test)

export function createTestPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL ?? "postgresql://localhost/test_db",
      },
    },
    log: [], // silence queries in tests
  });
}

// ── Transaction rollback pattern ──────────────────────────────────────────────
// Each test runs inside a transaction that rolls back → zero cleanup overhead

export async function withTestTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
): Promise<T> {
  // Note: interactive transactions give you the tx client
  return prisma.$transaction(async (tx) => {
    const result = await fn(tx);
    // Throwing here rolls back the transaction
    throw Object.assign(new Error("ROLLBACK_SENTINEL"), { result });
  }).catch((err) => {
    if (err.message === "ROLLBACK_SENTINEL") {
      return (err as { result: T }).result;
    }
    throw err;
  });
}

// ── Seed helpers ───────────────────────────────────────────────────────────────

export type UserFixture = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export async function createUserFixture(
  prisma: PrismaClient,
  overrides: Partial<{ email: string; name: string; role: string }> = {}
): Promise<UserFixture> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return prisma.user.create({
    data: {
      email: overrides.email ?? `test-${unique}@example.com`,
      name: overrides.name ?? `Test User ${unique}`,
      role: overrides.role ?? "USER",
    },
  });
}

export async function createPostFixture(
  prisma: PrismaClient,
  authorId: number,
  overrides: Partial<{ title: string; body: string; published: boolean }> = {}
) {
  return prisma.post.create({
    data: {
      title: overrides.title ?? `Test Post ${Date.now()}`,
      body: overrides.body ?? "Test post body.",
      published: overrides.published ?? false,
      authorId,
    },
  });
}

// ── Cleanup helper ────────────────────────────────────────────────────────────

export async function cleanupTestData(prisma: PrismaClient) {
  // Delete in dependency order to avoid FK violations
  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { post: { title: { startsWith: "Test Post" } } } }),
    prisma.post.deleteMany({ where: { title: { startsWith: "Test Post" } } }),
    prisma.user.deleteMany({ where: { email: { contains: "@example.com" } } }),
  ]);
}

// ── Mock PrismaClient for unit tests ─────────────────────────────────────────
// Use when you don't need a real database (e.g. service layer unit tests)

export type DeepMockProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? jest.MockedFunction<(...args: A) => R>
    : DeepMockProxy<T[K]>;
};

// In tests with Jest:
//
// import { mockDeep, mockReset } from "jest-mock-extended";
//
// jest.mock("../prisma", () => ({
//   __esModule: true,
//   prisma: mockDeep<PrismaClient>(),
// }));
//
// const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
//
// beforeEach(() => mockReset(prismaMock));
//
// it("creates a user", async () => {
//   const user = { id: 1, email: "a@b.com", name: "A" };
//   prismaMock.user.create.mockResolvedValue(user);
//   const result = await createUser({ email: "a@b.com", name: "A" });
//   expect(result.id).toBe(1);
// });

// ── Test utilities example (Vitest) ──────────────────────────────────────────

export function createTestContext() {
  const prisma = createTestPrismaClient();

  return {
    prisma,
    async setup() {
      await prisma.$connect();
    },
    async teardown() {
      await cleanupTestData(prisma);
      await prisma.$disconnect();
    },
  };
}

// ── Example test (Vitest / Jest compatible) ───────────────────────────────────
//
// import { describe, it, expect, beforeAll, afterAll } from "vitest";
//
// const ctx = createTestContext();
// beforeAll(() => ctx.setup());
// afterAll(() => ctx.teardown());
//
// describe("User CRUD", () => {
//   it("creates a user", async () => {
//     const user = await createUserFixture(ctx.prisma);
//     expect(user.id).toBeTypeOf("number");
//     expect(user.email).toContain("@example.com");
//   });
//
//   it("creates a post for a user", async () => {
//     const user = await createUserFixture(ctx.prisma);
//     const post = await createPostFixture(ctx.prisma, user.id, { published: true });
//     expect(post.authorId).toBe(user.id);
//     expect(post.published).toBe(true);
//   });
// });

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const prisma = createTestPrismaClient();
  console.log("[Test] PrismaClient created for test database");

  const ctx = createTestContext();
  console.log("[Test] Test context ready — call ctx.setup() in beforeAll");

  await prisma.$disconnect();
}

main().catch(console.error);
