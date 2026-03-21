/**
 * GraphQL Schema Basics
 * Demonstrates: typeDefs, resolvers, ApolloServer, scalar types, interfaces, unions
 */
import { ApolloServer, gql } from "apollo-server";
import { GraphQLScalarType, Kind } from "graphql";

// ── Custom scalars ────────────────────────────────────────────────────────────

export const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "ISO 8601 date string",
  serialize: (value: unknown) => {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value;
    throw new Error("DateScalar can only serialize Date instances or strings");
  },
  parseValue: (value: unknown) => {
    if (typeof value === "string") return new Date(value);
    throw new Error("DateScalar requires a string input");
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

// ── Type definitions ──────────────────────────────────────────────────────────

export const typeDefs = gql`
  scalar Date

  """
  Interface for any entity with an ID
  """
  interface Node {
    id: ID!
    createdAt: Date!
  }

  """
  Shared media type
  """
  union SearchResult = Post | User | Tag

  type User implements Node {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    posts: [Post!]!
    createdAt: Date!
  }

  type Post implements Node {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    author: User!
    tags: [Tag!]!
    viewCount: Int!
    createdAt: Date!
  }

  type Tag implements Node {
    id: ID!
    name: String!
    slug: String!
    posts: [Post!]!
    createdAt: Date!
  }

  enum UserRole {
    ADMIN
    EDITOR
    READER
  }

  type Query {
    """Get a single user by ID"""
    user(id: ID!): User
    """Get all users, optionally filtered by role"""
    users(role: UserRole): [User!]!
    """Get a single post by ID"""
    post(id: ID!): Post
    """Search across posts, users, and tags"""
    search(query: String!): [SearchResult!]!
    """Server health check"""
    health: String!
  }
`;

// ── Data store ────────────────────────────────────────────────────────────────

const users = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "ADMIN", createdAt: new Date("2024-01-01") },
  { id: "2", name: "Bob", email: "bob@example.com", role: "EDITOR", createdAt: new Date("2024-02-01") },
];

const tags = [
  { id: "1", name: "TypeScript", slug: "typescript", createdAt: new Date("2024-01-01") },
  { id: "2", name: "GraphQL", slug: "graphql", createdAt: new Date("2024-01-01") },
];

const posts = [
  {
    id: "1",
    title: "GraphQL Schema Design",
    content: "How to design a GraphQL schema...",
    published: true,
    authorId: "1",
    tagIds: ["1", "2"],
    viewCount: 142,
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "2",
    title: "TypeScript Generics",
    content: "Deep dive into generics...",
    published: false,
    authorId: "2",
    tagIds: ["1"],
    viewCount: 0,
    createdAt: new Date("2024-03-15"),
  },
];

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Date: DateScalar,

  Query: {
    user: (_: unknown, { id }: { id: string }) =>
      users.find((u) => u.id === id) ?? null,

    users: (_: unknown, { role }: { role?: string }) =>
      role ? users.filter((u) => u.role === role) : users,

    post: (_: unknown, { id }: { id: string }) =>
      posts.find((p) => p.id === id) ?? null,

    search: (_: unknown, { query }: { query: string }) => {
      const q = query.toLowerCase();
      const results: Array<{ __typename: string } & Record<string, unknown>> = [];
      users.filter((u) => u.name.toLowerCase().includes(q)).forEach((u) =>
        results.push({ __typename: "User", ...u })
      );
      posts.filter((p) => p.title.toLowerCase().includes(q)).forEach((p) =>
        results.push({ __typename: "Post", ...p })
      );
      tags.filter((t) => t.name.toLowerCase().includes(q)).forEach((t) =>
        results.push({ __typename: "Tag", ...t })
      );
      return results;
    },

    health: () => "ok",
  },

  User: {
    posts: (user: { id: string }) =>
      posts.filter((p) => p.authorId === user.id),
  },

  Post: {
    author: (post: { authorId: string }) =>
      users.find((u) => u.id === post.authorId),
    tags: (post: { tagIds: string[] }) =>
      tags.filter((t) => post.tagIds.includes(t.id)),
  },

  Tag: {
    posts: (tag: { id: string }) =>
      posts.filter((p) => p.tagIds.includes(tag.id)),
  },

  // Resolve union __resolveType
  SearchResult: {
    __resolveType(obj: { __typename: string }) {
      return obj.__typename;
    },
  },

  // Resolve interface __resolveType
  Node: {
    __resolveType(obj: { title?: string; slug?: string }) {
      if ("title" in obj) return "Post";
      if ("slug" in obj) return "Tag";
      return "User";
    },
  },
};

// ── Server ────────────────────────────────────────────────────────────────────

export async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  const { url } = await server.listen({ port: 4000 });
  console.log(`GraphQL server ready at ${url}`);
  return server;
}
