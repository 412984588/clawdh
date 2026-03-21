/**
 * Prisma Pagination
 * Demonstrates: offset pagination, cursor-based pagination, Relay-style connections
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ── Offset pagination ─────────────────────────────────────────────────────────
// Simple but has performance issues on large datasets (OFFSET scans)

export async function getPostsOffset(page: number, pageSize = 20) {
  const skip = (page - 1) * pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.post.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// ── Cursor-based pagination ───────────────────────────────────────────────────
// Efficient: uses a stable cursor (ID or createdAt) rather than OFFSET

export async function getPostsCursor(params: {
  cursor?: number; // last seen ID
  take?: number;
  orderBy?: "asc" | "desc";
}) {
  const take = params.take ?? 20;
  const orderBy = params.orderBy ?? "desc";

  const posts = await prisma.post.findMany({
    take: take + 1, // fetch one extra to check if there's a next page
    cursor: params.cursor ? { id: params.cursor } : undefined,
    skip: params.cursor ? 1 : 0, // skip the cursor item itself
    orderBy: { id: orderBy },
    include: { author: { select: { name: true } } },
  });

  const hasNextPage = posts.length > take;
  const items = hasNextPage ? posts.slice(0, take) : posts;
  const nextCursor = hasNextPage ? items[items.length - 1].id : null;

  return { items, nextCursor, hasNextPage };
}

// ── Relay-style connection ────────────────────────────────────────────────────
// Standard GraphQL pagination: edges + pageInfo

function encodeCursor(value: number | string): string {
  return Buffer.from(String(value)).toString("base64");
}

function decodeCursor(cursor: string): number {
  return parseInt(Buffer.from(cursor, "base64").toString("utf8"), 10);
}

interface PageInfo {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function getPostsConnection(args: {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}) {
  const take = args.first ?? args.last ?? 20;
  const isForward = args.first !== undefined || args.after !== undefined;

  const cursorId = args.after
    ? decodeCursor(args.after)
    : args.before
    ? decodeCursor(args.before)
    : undefined;

  const posts = await prisma.post.findMany({
    take: (isForward ? 1 : -1) * (take + 1),
    cursor: cursorId ? { id: cursorId } : undefined,
    skip: cursorId ? 1 : 0,
    orderBy: { id: "asc" },
  });

  const hasExtra = posts.length > take;
  const nodes = hasExtra ? posts.slice(0, take) : posts;

  const pageInfo: PageInfo = {
    startCursor: nodes.length > 0 ? encodeCursor(nodes[0].id) : null,
    endCursor: nodes.length > 0 ? encodeCursor(nodes[nodes.length - 1].id) : null,
    hasNextPage: isForward ? hasExtra : false,
    hasPreviousPage: isForward ? false : hasExtra,
  };

  return {
    edges: nodes.map((node) => ({ cursor: encodeCursor(node.id), node })),
    pageInfo,
    totalCount: await prisma.post.count(),
  };
}

// ── Keyset pagination ─────────────────────────────────────────────────────────
// For composite sort keys (e.g. publishedAt + id)

export async function getPostsKeyset(params: {
  lastPublishedAt?: Date;
  lastId?: number;
  take?: number;
}) {
  const take = params.take ?? 20;

  const where: Prisma.PostWhereInput =
    params.lastPublishedAt && params.lastId
      ? {
          OR: [
            { publishedAt: { lt: params.lastPublishedAt } },
            {
              publishedAt: params.lastPublishedAt,
              id: { lt: params.lastId },
            },
          ],
        }
      : {};

  const posts = await prisma.post.findMany({
    where: { ...where, published: true },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: take + 1,
  });

  const hasNext = posts.length > take;
  const items = hasNext ? posts.slice(0, take) : posts;

  return {
    items,
    hasNext,
    nextKey: hasNext
      ? { lastPublishedAt: items[items.length - 1].publishedAt, lastId: items[items.length - 1].id }
      : null,
  };
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  // Offset pagination
  const page1 = await getPostsOffset(1, 5);
  console.log(`[Offset] Page 1: ${page1.items.length} items, total: ${page1.pagination.total}`);

  // Cursor pagination — first page
  const first = await getPostsCursor({ take: 5 });
  console.log(`[Cursor] First page: ${first.items.length} items, hasNext: ${first.hasNextPage}`);

  // Cursor pagination — next page
  if (first.nextCursor) {
    const second = await getPostsCursor({ cursor: first.nextCursor, take: 5 });
    console.log(`[Cursor] Second page: ${second.items.length} items`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
