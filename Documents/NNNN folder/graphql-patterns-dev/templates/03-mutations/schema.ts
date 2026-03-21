/**
 * GraphQL Mutations
 * Demonstrates: input types, mutation resolvers, optimistic IDs, error union pattern
 */
import { ApolloServer, gql, UserInputError, AuthenticationError } from "apollo-server";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// ── Type definitions ──────────────────────────────────────────────────────────

export const typeDefs = gql`
  # Input types for mutations
  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean = false
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  # Mutation result types (error union pattern)
  type PostSuccess {
    post: Post!
  }

  type ValidationError {
    field: String!
    message: String!
  }

  type PostError {
    errors: [ValidationError!]!
    message: String!
  }

  union CreatePostResult = PostSuccess | PostError
  union UpdatePostResult = PostSuccess | PostError

  type DeleteResult {
    success: Boolean!
    id: ID!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    authorId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    posts: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    createPost(input: CreatePostInput!): CreatePostResult!
    updatePost(id: ID!, input: UpdatePostInput!): UpdatePostResult!
    deletePost(id: ID!): DeleteResult!
    publishPost(id: ID!): Post!
    register(input: CreateUserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;

// ── In-memory store ───────────────────────────────────────────────────────────

const posts: Post[] = [
  {
    id: "1",
    title: "Initial post",
    content: "Content",
    published: true,
    authorId: "1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];
let postSeq = 2;

const users: User[] = [{ id: "1", name: "Alice", email: "alice@example.com" }];
let userSeq = 2;

// ── Validation helpers ────────────────────────────────────────────────────────

function validatePostInput(input: { title?: string; content?: string }) {
  const errors: Array<{ field: string; message: string }> = [];
  if (input.title !== undefined && input.title.trim().length < 3) {
    errors.push({ field: "title", message: "Title must be at least 3 characters" });
  }
  if (input.content !== undefined && input.content.trim().length < 10) {
    errors.push({ field: "content", message: "Content must be at least 10 characters" });
  }
  return errors;
}

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Query: {
    posts: () => posts,
    post: (_: unknown, { id }: { id: string }) => posts.find((p) => p.id === id) ?? null,
  },

  Mutation: {
    createPost: (
      _: unknown,
      { input }: { input: { title: string; content: string; published?: boolean } },
      ctx: { userId?: string }
    ) => {
      if (!ctx.userId) throw new AuthenticationError("Login required to create posts");

      const errors = validatePostInput(input);
      if (errors.length > 0) {
        return { __typename: "PostError", errors, message: "Validation failed" };
      }

      const post: Post = {
        id: String(postSeq++),
        title: input.title.trim(),
        content: input.content.trim(),
        published: input.published ?? false,
        authorId: ctx.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      posts.push(post);
      return { __typename: "PostSuccess", post };
    },

    updatePost: (
      _: unknown,
      { id, input }: { id: string; input: { title?: string; content?: string; published?: boolean } }
    ) => {
      const idx = posts.findIndex((p) => p.id === id);
      if (idx === -1) {
        return {
          __typename: "PostError",
          errors: [{ field: "id", message: `Post ${id} not found` }],
          message: "Post not found",
        };
      }

      const errors = validatePostInput(input);
      if (errors.length > 0) {
        return { __typename: "PostError", errors, message: "Validation failed" };
      }

      posts[idx] = { ...posts[idx], ...input, updatedAt: new Date() };
      return { __typename: "PostSuccess", post: posts[idx] };
    },

    deletePost: (_: unknown, { id }: { id: string }) => {
      const idx = posts.findIndex((p) => p.id === id);
      if (idx === -1) throw new UserInputError(`Post ${id} not found`);
      posts.splice(idx, 1);
      return { success: true, id };
    },

    publishPost: (_: unknown, { id }: { id: string }) => {
      const post = posts.find((p) => p.id === id);
      if (!post) throw new UserInputError(`Post ${id} not found`);
      post.published = true;
      post.updatedAt = new Date();
      return post;
    },

    register: (_: unknown, { input }: { input: { name: string; email: string; password: string } }) => {
      if (users.some((u) => u.email === input.email)) {
        throw new UserInputError("Email already registered", { field: "email" });
      }
      const user: User = { id: String(userSeq++), name: input.name, email: input.email };
      users.push(user);
      const token = Buffer.from(JSON.stringify({ sub: user.id })).toString("base64url");
      return { token, user };
    },

    login: (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = users.find((u) => u.email === email);
      // Production: verify hashed password
      if (!user || !password) throw new AuthenticationError("Invalid credentials");
      const token = Buffer.from(JSON.stringify({ sub: user.id })).toString("base64url");
      return { token, user };
    },
  },

  CreatePostResult: { __resolveType: (obj: { __typename: string }) => obj.__typename },
  UpdatePostResult: { __resolveType: (obj: { __typename: string }) => obj.__typename },
};

// ── Server ────────────────────────────────────────────────────────────────────

export async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: { req: { headers: { authorization?: string } } }) => {
      const token = req.headers.authorization?.replace("Bearer ", "");
      let userId: string | undefined;
      if (token) {
        try {
          const payload = JSON.parse(Buffer.from(token, "base64url").toString()) as { sub: string };
          userId = payload.sub;
        } catch { /* ignore */ }
      }
      return { userId };
    },
  });
  const { url } = await server.listen({ port: 4000 });
  console.log(`GraphQL server ready at ${url}`);
  return server;
}
