/**
 * GraphQL Resolvers — Advanced patterns
 * Demonstrates: resolver chain, context, field-level resolvers, resolver composition
 */
import { ApolloServer, gql } from "apollo-server";

// ── Context type ──────────────────────────────────────────────────────────────

export interface GraphQLContext {
  userId: string | null;
  role: "admin" | "user" | "guest";
  dataSources: {
    users: UsersDataSource;
    posts: PostsDataSource;
  };
}

// ── Minimal data source classes ───────────────────────────────────────────────

class UsersDataSource {
  private users = [
    { id: "1", name: "Alice", email: "alice@example.com", followingIds: ["2"] },
    { id: "2", name: "Bob", email: "bob@example.com", followingIds: [] },
  ];

  findById(id: string) { return this.users.find((u) => u.id === id) ?? null; }
  findAll() { return this.users; }
  findByIds(ids: string[]) { return this.users.filter((u) => ids.includes(u.id)); }
}

class PostsDataSource {
  private posts = [
    { id: "1", title: "Hello World", authorId: "1", published: true, likedByIds: ["2"] },
    { id: "2", title: "GraphQL Deep Dive", authorId: "1", published: false, likedByIds: [] },
    { id: "3", title: "TypeScript Tips", authorId: "2", published: true, likedByIds: ["1"] },
  ];

  findById(id: string) { return this.posts.find((p) => p.id === id) ?? null; }
  findAll(published?: boolean) {
    if (published !== undefined) return this.posts.filter((p) => p.published === published);
    return this.posts;
  }
  findByAuthor(authorId: string) { return this.posts.filter((p) => p.authorId === authorId); }
}

// ── Type definitions ──────────────────────────────────────────────────────────

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
    following: [User!]!
    followerCount: Int!
    isFollowedByMe: Boolean!
  }

  type Post {
    id: ID!
    title: String!
    author: User!
    published: Boolean!
    likeCount: Int!
    isLikedByMe: Boolean!
  }

  type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
    post(id: ID!): Post
    posts(published: Boolean): [Post!]!
  }
`;

// ── Resolver helpers (composition pattern) ────────────────────────────────────

function requireAuth(ctx: GraphQLContext) {
  if (!ctx.userId) throw new Error("Unauthenticated");
}

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return ctx.dataSources.users.findById(ctx.userId!);
    },

    user: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) =>
      ctx.dataSources.users.findById(id),

    users: (_: unknown, __: unknown, ctx: GraphQLContext) =>
      ctx.dataSources.users.findAll(),

    post: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) =>
      ctx.dataSources.posts.findById(id),

    posts: (_: unknown, { published }: { published?: boolean }, ctx: GraphQLContext) =>
      ctx.dataSources.posts.findAll(published),
  },

  User: {
    // Field resolver — computed from parent + data source
    posts: (user: { id: string }, _: unknown, ctx: GraphQLContext) =>
      ctx.dataSources.posts.findByAuthor(user.id),

    following: (user: { followingIds: string[] }, _: unknown, ctx: GraphQLContext) =>
      ctx.dataSources.users.findByIds(user.followingIds),

    followerCount: (user: { id: string }, _: unknown, ctx: GraphQLContext) =>
      ctx.dataSources.users.findAll().filter((u) => u.followingIds.includes(user.id)).length,

    // Field resolver using context (viewer-dependent)
    isFollowedByMe: (user: { id: string }, _: unknown, ctx: GraphQLContext) => {
      if (!ctx.userId) return false;
      const me = ctx.dataSources.users.findById(ctx.userId);
      return me?.followingIds.includes(user.id) ?? false;
    },
  },

  Post: {
    author: (post: { authorId: string }, _: unknown, ctx: GraphQLContext) =>
      ctx.dataSources.users.findById(post.authorId),

    likeCount: (post: { likedByIds: string[] }) => post.likedByIds.length,

    isLikedByMe: (post: { likedByIds: string[] }, _: unknown, ctx: GraphQLContext) => {
      if (!ctx.userId) return false;
      return post.likedByIds.includes(ctx.userId);
    },
  },
};

// ── Server ────────────────────────────────────────────────────────────────────

export async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: (): GraphQLContext => ({
      userId: "1", // production: extract from Authorization header
      role: "user",
      dataSources: {
        users: new UsersDataSource(),
        posts: new PostsDataSource(),
      },
    }),
  });

  const { url } = await server.listen({ port: 4000 });
  console.log(`GraphQL server ready at ${url}`);
  return server;
}
