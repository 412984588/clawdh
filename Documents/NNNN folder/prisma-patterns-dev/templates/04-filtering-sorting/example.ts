/**
 * Prisma Filtering & Sorting
 * Demonstrates: where operators, full-text search, sorting, field selection, cursor pagination
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ── Basic where operators ─────────────────────────────────────────────────────

export async function filterExamples() {
  // Equality
  await prisma.user.findMany({ where: { role: "ADMIN" } });

  // Comparison
  await prisma.post.findMany({
    where: {
      viewCount: { gt: 100 },
      publishedAt: { gte: new Date("2024-01-01") },
    },
  });

  // String matching
  await prisma.user.findMany({
    where: {
      email: { endsWith: "@company.com" },
      name: { contains: "Smith", mode: "insensitive" },
    },
  });

  // NOT
  await prisma.user.findMany({
    where: { NOT: { role: "BANNED" } },
  });

  // IN / NOT IN
  await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MODERATOR"] } },
  });

  // Null checks
  await prisma.user.findMany({
    where: { deletedAt: null },
  });
}

// ── Logical combinators ────────────────────────────────────────────────────────

export async function logicalFilters() {
  // AND (default when multiple where conditions)
  await prisma.post.findMany({
    where: {
      AND: [
        { published: true },
        { viewCount: { gte: 50 } },
        { author: { role: "ADMIN" } },
      ],
    },
  });

  // OR
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: "typescript" } },
        { tags: { some: { name: "typescript" } } },
      ],
    },
  });
  console.log(`[OR] Posts: ${posts.length}`);

  return posts;
}

// ── Relation filters ──────────────────────────────────────────────────────────

export async function relationFilters() {
  // Posts where author has more than 5 posts (nested where)
  const prolificAuthorPosts = await prisma.post.findMany({
    where: {
      author: {
        posts: { some: { published: true } },
        role: "ADMIN",
      },
    },
    include: { author: { select: { name: true, email: true } } },
  });

  // Users with no posts
  const usersNoPosts = await prisma.user.findMany({
    where: {
      posts: { none: {} },
    },
  });

  // Users with ALL posts published
  const allPublished = await prisma.user.findMany({
    where: {
      posts: { every: { published: true } },
    },
  });

  console.log(`[Relations] Prolific: ${prolificAuthorPosts.length}, No posts: ${usersNoPosts.length}, All published: ${allPublished.length}`);
}

// ── Sorting ───────────────────────────────────────────────────────────────────

export async function sortingExamples() {
  // Single field
  await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  // Multiple fields
  await prisma.post.findMany({
    orderBy: [
      { published: "desc" },
      { viewCount: "desc" },
      { createdAt: "asc" },
    ],
  });

  // Order by relation count
  const users = await prisma.user.findMany({
    orderBy: {
      posts: { _count: "desc" },
    },
    select: {
      id: true,
      name: true,
      _count: { select: { posts: true } },
    },
    take: 10,
  });
  console.log(`[Sort] Top users by post count: ${users.map((u) => `${u.name}(${u._count.posts})`).join(", ")}`);
  return users;
}

// ── Full-text search (PostgreSQL) ─────────────────────────────────────────────
// Requires: @@fulltext index in schema and PostgreSQL provider

export async function fullTextSearch(query: string) {
  // mode: "search" requires @@fulltext([title, body]) in schema
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { search: query } },
        { body: { search: query } },
      ],
    },
    orderBy: {
      _relevance: {
        fields: ["title", "body"],
        search: query,
        sort: "desc",
      },
    },
  });
  console.log(`[FTS] "${query}" → ${posts.length} results`);
  return posts;
}

// ── Dynamic where builder ─────────────────────────────────────────────────────

export async function dynamicFilter(params: {
  search?: string;
  role?: string;
  active?: boolean;
  createdAfter?: Date;
}) {
  const where: Prisma.UserWhereInput = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.role) where.role = params.role;
  if (params.active !== undefined) where.active = params.active;
  if (params.createdAfter) where.createdAt = { gte: params.createdAfter };

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Filter and sort examples — run against a seeded Prisma database.");
  console.log("All functions are exported for use in your application.");
  await prisma.$disconnect();
}

main().catch(console.error);
