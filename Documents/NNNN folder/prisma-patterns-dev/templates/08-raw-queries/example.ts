/**
 * Prisma Raw Queries
 * Demonstrates: $queryRaw, $executeRaw, tagged template literals, $queryRawUnsafe
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ── $queryRaw — typed results ──────────────────────────────────────────────────
// Use tagged template literal for automatic parameter escaping (SQL injection safe)

export async function getTopPosters(limit = 10) {
  type Row = { userId: number; name: string; postCount: bigint };

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      u.id        AS "userId",
      u.name,
      COUNT(p.id) AS "postCount"
    FROM "User" u
    LEFT JOIN "Post" p ON p."authorId" = u.id
    WHERE u."deletedAt" IS NULL
    GROUP BY u.id, u.name
    ORDER BY "postCount" DESC
    LIMIT ${limit}
  `;

  // BigInt from COUNT — convert for JSON serialization
  return rows.map((r) => ({ ...r, postCount: Number(r.postCount) }));
}

export async function getPostsWithCommentCount() {
  type Row = { id: number; title: string; commentCount: bigint };

  const posts = await prisma.$queryRaw<Row[]>`
    SELECT
      p.id,
      p.title,
      COUNT(c.id) AS "commentCount"
    FROM "Post" p
    LEFT JOIN "Comment" c ON c."postId" = p.id
    WHERE p."deletedAt" IS NULL
    GROUP BY p.id, p.title
    ORDER BY p."createdAt" DESC
  `;

  return posts.map((p) => ({ ...p, commentCount: Number(p.commentCount) }));
}

// ── Parameterized queries ─────────────────────────────────────────────────────
// Template literal syntax automatically escapes values — never interpolate directly

export async function searchUsersByEmail(domain: string) {
  type Row = { id: number; email: string; name: string };

  // ✅ Safe: Prisma escapes the domain value
  return prisma.$queryRaw<Row[]>`
    SELECT id, email, name FROM "User"
    WHERE email LIKE ${"%" + domain}
    AND "deletedAt" IS NULL
    ORDER BY "createdAt" DESC
  `;
}

// ── $executeRaw — mutations without return ────────────────────────────────────

export async function bulkUpdateViewCounts(increment = 1) {
  const affected = await prisma.$executeRaw`
    UPDATE "Post"
    SET "viewCount" = "viewCount" + ${increment}
    WHERE "publishedAt" < NOW()
    AND "deletedAt" IS NULL
  `;
  console.log(`[Raw] Updated view counts for ${affected} posts`);
  return affected;
}

export async function archiveOldPosts(olderThanDays = 365) {
  const affected = await prisma.$executeRaw`
    UPDATE "Post"
    SET "archived" = true, "archivedAt" = NOW()
    WHERE "createdAt" < NOW() - INTERVAL '${Prisma.raw(olderThanDays.toString())} days'
    AND "archived" = false
  `;
  console.log(`[Raw] Archived ${affected} old posts`);
  return affected;
}

// ── PostgreSQL-specific features ──────────────────────────────────────────────

export async function getJsonbField(userId: number) {
  type Row = { preferences: Record<string, unknown> };

  const rows = await prisma.$queryRaw<Row[]>`
    SELECT preferences::json AS preferences
    FROM "User"
    WHERE id = ${userId}
  `;

  return rows[0]?.preferences ?? null;
}

export async function updateJsonbField(userId: number, key: string, value: string) {
  return prisma.$executeRaw`
    UPDATE "User"
    SET preferences = jsonb_set(
      COALESCE(preferences, '{}')::jsonb,
      ${Prisma.raw(`'{${key}}'`)},
      ${JSON.stringify(value)}::jsonb
    )
    WHERE id = ${userId}
  `;
}

// ── $queryRawUnsafe — dynamic queries (use carefully) ────────────────────────
// Only use for dynamic column/table names that can't be parameterized
// NEVER use with user-supplied input without sanitization

export async function dynamicSort(tableName: string, column: string, direction: "ASC" | "DESC") {
  // Allowlist validation — MUST validate before using Prisma.raw
  const allowedTables = ["User", "Post"];
  const allowedColumns = ["id", "name", "createdAt", "email"];
  const allowedDirections = ["ASC", "DESC"] as const;

  if (!allowedTables.includes(tableName)) throw new Error(`Invalid table: ${tableName}`);
  if (!allowedColumns.includes(column)) throw new Error(`Invalid column: ${column}`);
  if (!allowedDirections.includes(direction)) throw new Error(`Invalid direction: ${direction}`);

  return prisma.$queryRaw`
    SELECT * FROM ${Prisma.raw(`"${tableName}"`)}
    ORDER BY ${Prisma.raw(`"${column}"`)} ${Prisma.raw(direction)}
    LIMIT 100
  `;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const topPosters = await getTopPosters(5);
  console.log("[Top posters]", topPosters);

  await prisma.$disconnect();
}

main().catch(console.error);
