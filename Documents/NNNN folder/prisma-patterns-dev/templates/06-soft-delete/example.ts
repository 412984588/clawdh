/**
 * Prisma Soft Delete
 * Demonstrates: deletedAt pattern, custom PrismaClient extension, automatic filtering
 */
import { PrismaClient, Prisma } from "@prisma/client";

// ── Custom extension: auto-filter deleted records ─────────────────────────────
// Using Prisma Client Extensions (Prisma 4.7+)

const baseClient = new PrismaClient();

export const prisma = baseClient.$extends({
  name: "softDelete",
  query: {
    // Apply to all models that have deletedAt
    user: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findUnique({ args, query }) {
        // findUnique requires unique field — can't add deletedAt
        // Use findFirst instead for soft-delete support
        return query(args);
      },
      async count({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
    post: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async count({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});

// ── Soft delete functions ─────────────────────────────────────────────────────

export async function softDeleteUser(id: number) {
  const user = await baseClient.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  console.log(`[SoftDelete] User ${id} marked deleted at ${user.deletedAt}`);
  return user;
}

export async function softDeletePost(id: number) {
  return baseClient.post.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function softDeleteManyPosts(where: Prisma.PostWhereInput) {
  const result = await baseClient.post.updateMany({
    where: { ...where, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  console.log(`[SoftDeleteMany] Deleted ${result.count} posts`);
  return result.count;
}

// ── Restore ───────────────────────────────────────────────────────────────────

export async function restoreUser(id: number) {
  const user = await baseClient.user.update({
    where: { id },
    data: { deletedAt: null },
  });
  console.log(`[Restore] User ${id} restored`);
  return user;
}

// ── Query including deleted ────────────────────────────────────────────────────
// Use baseClient (not extended prisma) to bypass the soft-delete filter

export async function findUserIncludingDeleted(id: number) {
  return baseClient.user.findUnique({ where: { id } });
}

export async function getAllDeletedUsers() {
  return baseClient.user.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
  });
}

// ── Hard delete (permanent cleanup) ──────────────────────────────────────────

export async function purgeOldDeletedRecords(olderThanDays = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const [users, posts] = await Promise.all([
    baseClient.user.deleteMany({
      where: { deletedAt: { lt: cutoff } },
    }),
    baseClient.post.deleteMany({
      where: { deletedAt: { lt: cutoff } },
    }),
  ]);

  console.log(`[Purge] Removed ${users.count} users, ${posts.count} posts older than ${olderThanDays}d`);
  return { users: users.count, posts: posts.count };
}

// ── Cascade soft-delete ───────────────────────────────────────────────────────

export async function softDeleteUserAndPosts(userId: number) {
  const now = new Date();

  await baseClient.$transaction([
    baseClient.post.updateMany({
      where: { authorId: userId, deletedAt: null },
      data: { deletedAt: now },
    }),
    baseClient.user.update({
      where: { id: userId },
      data: { deletedAt: now },
    }),
  ]);

  console.log(`[CascadeSoftDelete] User ${userId} and their posts soft-deleted`);
}

// ── Schema reference ──────────────────────────────────────────────────────────
//
// model User {
//   id        Int       @id @default(autoincrement())
//   email     String    @unique
//   name      String
//   deletedAt DateTime?
//   posts     Post[]
// }
// model Post {
//   id        Int       @id @default(autoincrement())
//   title     String
//   body      String
//   authorId  Int
//   author    User      @relation(fields: [authorId], references: [id])
//   deletedAt DateTime?
// }

async function main() {
  // Using the extended prisma automatically filters deleted records:
  const users = await prisma.user.findMany();
  console.log(`[Active users] ${users.length}`);

  // Using baseClient includes deleted records:
  const allUsers = await baseClient.user.findMany();
  console.log(`[All users including deleted] ${allUsers.length}`);

  await baseClient.$disconnect();
}

main().catch(console.error);
