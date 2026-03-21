/**
 * GraphQL DataLoaders (N+1 problem solution)
 * Demonstrates: DataLoader, batching, caching, per-request loader instances
 */
import { ApolloServer, gql } from "apollo-server";
import DataLoader from "dataloader";

// ── Data types ────────────────────────────────────────────────────────────────

interface User { id: string; name: string; email: string; }
interface Post { id: string; title: string; authorId: string; tagIds: string[]; }
interface Tag { id: string; name: string; }
interface Comment { id: string; text: string; postId: string; authorId: string; }

// ── Simulated DB (replace with real DB queries) ───────────────────────────────

const usersDB: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
  { id: "3", name: "Carol", email: "carol@example.com" },
];

const postsDB: Post[] = [
  { id: "1", title: "Post A", authorId: "1", tagIds: ["1", "2"] },
  { id: "2", title: "Post B", authorId: "1", tagIds: ["2"] },
  { id: "3", title: "Post C", authorId: "2", tagIds: ["1"] },
  { id: "4", title: "Post D", authorId: "3", tagIds: [] },
];

const tagsDB: Tag[] = [
  { id: "1", name: "TypeScript" },
  { id: "2", name: "GraphQL" },
];

const commentsDB: Comment[] = [
  { id: "1", text: "Great post!", postId: "1", authorId: "2" },
  { id: "2", text: "Thanks!", postId: "1", authorId: "1" },
  { id: "3", text: "Interesting.", postId: "2", authorId: "3" },
];

// ── DataLoader factory (created per request) ──────────────────────────────────

export interface DataLoaders {
  userLoader: DataLoader<string, User | null>;
  postsByAuthorLoader: DataLoader<string, Post[]>;
  tagsByIdsLoader: DataLoader<string, Tag | null>;
  commentsByPostLoader: DataLoader<string, Comment[]>;
}

/** Call this once per request to create fresh loaders with per-request cache */
export function createLoaders(): DataLoaders {
  return {
    // Batch: load many users by ID in one "DB query"
    userLoader: new DataLoader<string, User | null>(async (ids) => {
      console.log(`[DataLoader] Batching ${ids.length} user IDs: ${ids.join(", ")}`);
      const users = usersDB.filter((u) => ids.includes(u.id));
      // Must return results in same order as keys
      return ids.map((id) => users.find((u) => u.id === id) ?? null);
    }),

    // Batch: load posts by author — one query for multiple authors
    postsByAuthorLoader: new DataLoader<string, Post[]>(async (authorIds) => {
      console.log(`[DataLoader] Batching posts for ${authorIds.length} authors`);
      const posts = postsDB.filter((p) => authorIds.includes(p.authorId));
      return authorIds.map((id) => posts.filter((p) => p.authorId === id));
    }),

    // Batch: load tags by ID
    tagsByIdsLoader: new DataLoader<string, Tag | null>(async (ids) => {
      console.log(`[DataLoader] Batching ${ids.length} tag IDs`);
      const tags = tagsDB.filter((t) => ids.includes(t.id));
      return ids.map((id) => tags.find((t) => t.id === id) ?? null);
    }),

    // Batch: load comments by post ID
    commentsByPostLoader: new DataLoader<string, Comment[]>(async (postIds) => {
      console.log(`[DataLoader] Batching comments for ${postIds.length} posts`);
      const comments = commentsDB.filter((c) => postIds.includes(c.postId));
      return postIds.map((id) => comments.filter((c) => c.postId === id));
    }),
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

export interface Context {
  loaders: DataLoaders;
}

// ── Type definitions ──────────────────────────────────────────────────────────

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Tag {
    id: ID!
    name: String!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
  }

  type Post {
    id: ID!
    title: String!
    author: User!
    tags: [Tag!]!
    comments: [Comment!]!
  }

  type Query {
    posts: [Post!]!
    users: [User!]!
  }
`;

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Query: {
    posts: () => postsDB,
    users: () => usersDB,
  },

  Post: {
    // Instead of N separate DB calls, DataLoader batches all authorId lookups
    author: (post: Post, _: unknown, ctx: Context) =>
      ctx.loaders.userLoader.load(post.authorId),

    // Batch load tags — handles array of IDs
    tags: async (post: Post, _: unknown, ctx: Context) => {
      const tags = await Promise.all(post.tagIds.map((id) => ctx.loaders.tagsByIdsLoader.load(id)));
      return tags.filter(Boolean);
    },

    // Batch load comments by post
    comments: (post: Post, _: unknown, ctx: Context) =>
      ctx.loaders.commentsByPostLoader.load(post.id),
  },

  User: {
    // Batch load posts by author
    posts: (user: User, _: unknown, ctx: Context) =>
      ctx.loaders.postsByAuthorLoader.load(user.id),
  },

  Comment: {
    // DataLoader caches: if same user is loaded multiple times, only one DB call
    author: (comment: Comment, _: unknown, ctx: Context) =>
      ctx.loaders.userLoader.load(comment.authorId),
  },
};

// ── Server ────────────────────────────────────────────────────────────────────

export async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Create new loaders per request — ensures cache isolation between requests
    context: (): Context => ({ loaders: createLoaders() }),
  });

  const { url } = await server.listen({ port: 4000 });
  console.log(`GraphQL server ready at ${url}`);
  return server;
}
