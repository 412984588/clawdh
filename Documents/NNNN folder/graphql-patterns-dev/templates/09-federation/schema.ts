/**
 * GraphQL Federation (Apollo Federation v2)
 * Demonstrates: @key directive, subgraphs, entity resolvers, @external, @requires
 */
import { ApolloServer } from "apollo-server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";

// ── Subgraph 1: Users service ─────────────────────────────────────────────────

export const usersTypeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

  type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    username: String!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
    me: User
  }
`;

const usersData = [
  { id: "1", name: "Alice", email: "alice@example.com", username: "alice" },
  { id: "2", name: "Bob", email: "bob@example.com", username: "bob" },
];

export const usersResolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }) =>
      usersData.find((u) => u.id === id) ?? null,
    users: () => usersData,
    me: () => usersData[0],
  },

  User: {
    // Entity resolver — called when other subgraphs need to resolve a User
    __resolveReference(reference: { id: string }) {
      return usersData.find((u) => u.id === reference.id) ?? null;
    },
  },
};

// ── Subgraph 2: Posts service ─────────────────────────────────────────────────

export const postsTypeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external", "@requires"])

  """Reference to User entity from Users subgraph"""
  type User @key(fields: "id", resolvable: false) {
    id: ID!
  }

  type Post @key(fields: "id") {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    authorId: ID!
    """Resolved across subgraphs via authorId"""
    author: User!
  }

  type Query {
    post(id: ID!): Post
    posts(authorId: ID): [Post!]!
  }

  type Mutation {
    createPost(title: String!, content: String!, authorId: ID!): Post!
  }
`;

const postsData = [
  { id: "1", title: "Hello Federation", content: "Intro to federation", published: true, authorId: "1" },
  { id: "2", title: "Subgraph Patterns", content: "Advanced subgraphs", published: false, authorId: "1" },
  { id: "3", title: "TypeScript Tips", content: "Type safety", published: true, authorId: "2" },
];
let postSeq = 4;

export const postsResolvers = {
  Query: {
    post: (_: unknown, { id }: { id: string }) =>
      postsData.find((p) => p.id === id) ?? null,
    posts: (_: unknown, { authorId }: { authorId?: string }) =>
      authorId ? postsData.filter((p) => p.authorId === authorId) : postsData,
  },

  Mutation: {
    createPost: (_: unknown, { title, content, authorId }: { title: string; content: string; authorId: string }) => {
      const post = { id: String(postSeq++), title, content, published: false, authorId };
      postsData.push(post);
      return post;
    },
  },

  Post: {
    // Return a reference — the gateway fetches the full User from the Users subgraph
    author: (post: { authorId: string }) => ({ __typename: "User", id: post.authorId }),

    __resolveReference(reference: { id: string }) {
      return postsData.find((p) => p.id === reference.id) ?? null;
    },
  },
};

// ── Subgraph 3: Reviews service ───────────────────────────────────────────────

export const reviewsTypeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external", "@requires"])

  type Post @key(fields: "id", resolvable: false) {
    id: ID!
  }

  type Review @key(fields: "id") {
    id: ID!
    postId: ID!
    rating: Int!
    comment: String!
    post: Post!
  }

  extend type Query {
    reviewsForPost(postId: ID!): [Review!]!
  }
`;

const reviewsData = [
  { id: "1", postId: "1", rating: 5, comment: "Excellent!" },
  { id: "2", postId: "1", rating: 4, comment: "Good read" },
  { id: "3", postId: "3", rating: 3, comment: "Useful tips" },
];

export const reviewsResolvers = {
  Query: {
    reviewsForPost: (_: unknown, { postId }: { postId: string }) =>
      reviewsData.filter((r) => r.postId === postId),
  },

  Review: {
    post: (review: { postId: string }) => ({ __typename: "Post", id: review.postId }),
    __resolveReference: (ref: { id: string }) => reviewsData.find((r) => r.id === ref.id) ?? null,
  },
};

// ── Start subgraph servers ────────────────────────────────────────────────────

export async function startUsersSubgraph(port = 4001) {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs: usersTypeDefs, resolvers: usersResolvers }),
  });
  const { url } = await server.listen({ port });
  console.log(`Users subgraph ready at ${url}`);
  return server;
}

export async function startPostsSubgraph(port = 4002) {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs: postsTypeDefs, resolvers: postsResolvers }),
  });
  const { url } = await server.listen({ port });
  console.log(`Posts subgraph ready at ${url}`);
  return server;
}

export async function startReviewsSubgraph(port = 4003) {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs: reviewsTypeDefs, resolvers: reviewsResolvers }),
  });
  const { url } = await server.listen({ port });
  console.log(`Reviews subgraph ready at ${url}`);
  return server;
}

// Note: Gateway (Apollo Router or @apollo/gateway) combines these subgraphs.
// Run: npx rover supergraph compose --config supergraph.yaml
export async function bootstrap() {
  await Promise.all([startUsersSubgraph(), startPostsSubgraph(), startReviewsSubgraph()]);
}
