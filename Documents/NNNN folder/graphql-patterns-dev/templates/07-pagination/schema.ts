/**
 * GraphQL Pagination — Cursor-based and offset-based
 * Demonstrates: Relay-style cursor pagination, offset/limit, connection types
 */
import { ApolloServer, gql } from "apollo-server";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  viewCount: number;
}

// ── Cursor helpers ────────────────────────────────────────────────────────────

function encodeCursor(id: string): string {
  return Buffer.from(`post:${id}`).toString("base64");
}

function decodeCursor(cursor: string): string {
  const decoded = Buffer.from(cursor, "base64").toString("utf8");
  return decoded.replace("post:", "");
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const allPosts: Post[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  title: `Post ${i + 1}`,
  content: `Content for post ${i + 1}`,
  authorId: String((i % 3) + 1),
  createdAt: new Date(Date.now() - i * 86400_000),
  viewCount: Math.floor(Math.random() * 1000),
}));

// ── Type definitions ──────────────────────────────────────────────────────────

export const typeDefs = gql`
  # Relay-style connection types
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type PostEdge {
    node: Post!
    cursor: String!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    authorId: ID!
    createdAt: String!
    viewCount: Int!
  }

  # Offset-based page info
  type OffsetPageInfo {
    page: Int!
    pageSize: Int!
    totalPages: Int!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type PostPage {
    items: [Post!]!
    pageInfo: OffsetPageInfo!
  }

  type Query {
    """Relay cursor-based pagination"""
    postsConnection(
      first: Int
      after: String
      last: Int
      before: String
    ): PostConnection!

    """Offset-based pagination"""
    postsPaged(page: Int = 1, pageSize: Int = 10): PostPage!

    """Keyset pagination (efficient for large datasets)"""
    postsAfter(afterId: ID, limit: Int = 10): [Post!]!
  }
`;

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Query: {
    // ── Cursor-based (Relay spec) ────────────────────────────────────────────
    postsConnection: (
      _: unknown,
      { first = 10, after, last, before }: { first?: number; after?: string; last?: number; before?: string }
    ) => {
      let posts = [...allPosts];

      // Forward pagination
      if (after) {
        const afterId = decodeCursor(after);
        const idx = posts.findIndex((p) => p.id === afterId);
        if (idx !== -1) posts = posts.slice(idx + 1);
      }

      // Backward pagination
      if (before) {
        const beforeId = decodeCursor(before);
        const idx = posts.findIndex((p) => p.id === beforeId);
        if (idx !== -1) posts = posts.slice(0, idx);
      }

      const limit = first ?? last ?? 10;
      const hasPreviousPage = after ? true : false;
      const totalCount = allPosts.length;

      if (last) posts = posts.slice(-limit);
      else posts = posts.slice(0, limit);

      const hasNextPage = after
        ? allPosts.findIndex((p) => p.id === posts[posts.length - 1]?.id) < allPosts.length - 1
        : posts.length === limit && totalCount > limit;

      const edges = posts.map((post) => ({
        node: post,
        cursor: encodeCursor(post.id),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: edges[0]?.cursor ?? null,
          endCursor: edges[edges.length - 1]?.cursor ?? null,
        },
        totalCount,
      };
    },

    // ── Offset-based ──────────────────────────────────────────────────────────
    postsPaged: (_: unknown, { page = 1, pageSize = 10 }: { page?: number; pageSize?: number }) => {
      const totalCount = allPosts.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const offset = (page - 1) * pageSize;
      const items = allPosts.slice(offset, offset + pageSize);

      return {
        items,
        pageInfo: {
          page,
          pageSize,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    },

    // ── Keyset pagination (cursor by ID — most efficient) ─────────────────────
    postsAfter: (_: unknown, { afterId, limit = 10 }: { afterId?: string; limit?: number }) => {
      if (!afterId) return allPosts.slice(0, limit);
      const idx = allPosts.findIndex((p) => p.id === afterId);
      if (idx === -1) return [];
      return allPosts.slice(idx + 1, idx + 1 + limit);
    },
  },
};

// ── Server ────────────────────────────────────────────────────────────────────

export async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await server.listen({ port: 4000 });
  console.log(`GraphQL server ready at ${url}`);
  return server;
}
