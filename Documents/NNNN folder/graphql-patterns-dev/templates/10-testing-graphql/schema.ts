/**
 * GraphQL Testing Patterns
 * Demonstrates: executeOperation, mocking resolvers, test client, snapshot testing
 */
import { ApolloServer, gql } from "apollo-server";

// ── Schema under test ─────────────────────────────────────────────────────────

export const typeDefs = gql`
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
    author: User!
  }

  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    post(id: ID!): Post
    posts: [Post!]!
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
    deletePost(id: ID!): Boolean!
  }
`;

// ── In-memory data ────────────────────────────────────────────────────────────

export const testUsers = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
];

export let testPosts = [
  { id: "1", title: "Test Post", content: "Content", published: true, authorId: "1" },
];

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }) =>
      testUsers.find((u) => u.id === id) ?? null,
    users: () => testUsers,
    post: (_: unknown, { id }: { id: string }) =>
      testPosts.find((p) => p.id === id) ?? null,
    posts: () => testPosts,
  },

  Mutation: {
    createPost: (_: unknown, { input }: { input: { title: string; content: string; authorId: string } }) => {
      const post = {
        id: String(testPosts.length + 1),
        title: input.title,
        content: input.content,
        published: false,
        authorId: input.authorId,
      };
      testPosts.push(post);
      return post;
    },
    deletePost: (_: unknown, { id }: { id: string }) => {
      const idx = testPosts.findIndex((p) => p.id === id);
      if (idx === -1) return false;
      testPosts.splice(idx, 1);
      return true;
    },
  },

  Post: {
    author: (post: { authorId: string }) =>
      testUsers.find((u) => u.id === post.authorId),
  },
};

// ── Test helpers ──────────────────────────────────────────────────────────────

/** Create a test server instance */
export function createTestServer(contextValue: Record<string, unknown> = {}) {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: () => contextValue,
  });
}

// ── Example test patterns (use with jest/vitest) ──────────────────────────────
//
// import { createTestServer } from "./schema";
//
// describe("Users queries", () => {
//   let server: ApolloServer;
//   beforeAll(() => { server = createTestServer(); });
//   afterAll(async () => { await server.stop(); });
//
//   it("returns all users", async () => {
//     const { data } = await server.executeOperation({
//       query: gql`query { users { id name email } }`,
//     });
//     expect(data?.users).toHaveLength(2);
//     expect(data?.users[0]).toMatchObject({ name: "Alice", email: "alice@example.com" });
//   });
//
//   it("returns null for unknown user", async () => {
//     const { data } = await server.executeOperation({
//       query: gql`query GetUser($id: ID!) { user(id: $id) { id name } }`,
//       variables: { id: "999" },
//     });
//     expect(data?.user).toBeNull();
//   });
// });
//
// describe("Post mutations", () => {
//   let server: ApolloServer;
//   beforeEach(() => {
//     testPosts = []; // reset state
//     server = createTestServer({ userId: "1" });
//   });
//
//   it("creates a post", async () => {
//     const { data, errors } = await server.executeOperation({
//       query: gql`
//         mutation CreatePost($input: CreatePostInput!) {
//           createPost(input: $input) { id title published author { name } }
//         }
//       `,
//       variables: { input: { title: "New Post", content: "Body text", authorId: "1" } },
//     });
//     expect(errors).toBeUndefined();
//     expect(data?.createPost.title).toBe("New Post");
//     expect(data?.createPost.published).toBe(false);
//     expect(data?.createPost.author.name).toBe("Alice");
//   });
//
//   it("errors on missing field", async () => {
//     const { errors } = await server.executeOperation({
//       query: gql`mutation { createPost(input: { title: "T" }) { id } }`,
//     });
//     expect(errors).toBeDefined();
//     expect(errors?.[0].message).toContain("content");
//   });
// });
//
// describe("Mocked resolvers", () => {
//   it("uses addMocksToSchema for rapid prototyping", () => {
//     // import { addMocksToSchema } from "@graphql-tools/mock";
//     // import { makeExecutableSchema } from "@graphql-tools/schema";
//     // const schema = makeExecutableSchema({ typeDefs });
//     // const mockedSchema = addMocksToSchema({
//     //   schema,
//     //   mocks: {
//     //     User: () => ({ name: "Mock User", email: "mock@test.com" }),
//     //     Post: () => ({ title: "Mock Post", published: true }),
//     //   },
//     // });
//   });
// });

export async function startServer() {
  const server = createTestServer();
  const { url } = await server.listen({ port: 4000 });
  console.log(`GraphQL test server ready at ${url}`);
  return server;
}
