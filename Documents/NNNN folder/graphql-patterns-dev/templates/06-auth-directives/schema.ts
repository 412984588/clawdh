/**
 * GraphQL Auth Directives
 * Demonstrates: @auth directive, @hasRole, schema directives, context-based auth
 */
import { ApolloServer, gql, AuthenticationError, ForbiddenError } from "apollo-server";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver, GraphQLSchema } from "graphql";

// ── Auth directive transformer ────────────────────────────────────────────────

export function authDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, "auth")?.[0];
      const hasRoleDirective = getDirective(schema, fieldConfig, "hasRole")?.[0];

      if (authDirective || hasRoleDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = async function (source, args, context: { user?: { id: string; role: string } }, info) {
          // @auth: require any authenticated user
          if (authDirective && !context.user) {
            throw new AuthenticationError("You must be logged in");
          }

          // @hasRole: require specific role
          if (hasRoleDirective) {
            const requiredRole = (hasRoleDirective as { role: string }).role;
            if (!context.user) throw new AuthenticationError("You must be logged in");
            if (context.user.role !== requiredRole && context.user.role !== "ADMIN") {
              throw new ForbiddenError(`Requires role: ${requiredRole}`);
            }
          }

          return resolve(source, args, context, info);
        };
      }
      return fieldConfig;
    },
  });
}

// ── Type definitions ──────────────────────────────────────────────────────────

export const typeDefs = gql`
  """Requires authenticated user"""
  directive @auth on FIELD_DEFINITION

  """Requires specific role"""
  directive @hasRole(role: String!) on FIELD_DEFINITION

  enum Role {
    ADMIN
    EDITOR
    USER
  }

  type User {
    id: ID!
    name: String!
    email: String! @auth
    role: Role!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    authorId: ID!
    published: Boolean!
  }

  type AdminStats {
    totalUsers: Int!
    totalPosts: Int!
    dailyActiveUsers: Int!
  }

  type Query {
    """Public — no auth required"""
    publicPosts: [Post!]!

    """Requires login"""
    myPosts: [Post!]! @auth

    """Requires admin role"""
    adminStats: AdminStats! @hasRole(role: "ADMIN")

    """Requires editor or admin"""
    draftPosts: [Post!]! @hasRole(role: "EDITOR")

    me: User @auth
  }

  type Mutation {
    """Requires login"""
    createPost(title: String!, content: String!): Post! @auth

    """Requires admin role"""
    deleteUser(id: ID!): Boolean! @hasRole(role: "ADMIN")
  }
`;

// ── Data ──────────────────────────────────────────────────────────────────────

const users = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "ADMIN" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "EDITOR" },
  { id: "3", name: "Carol", email: "carol@example.com", role: "USER" },
];

const posts = [
  { id: "1", title: "Public post", content: "For everyone", authorId: "1", published: true },
  { id: "2", title: "My draft", content: "Work in progress", authorId: "2", published: false },
];
let postSeq = 3;

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Query: {
    publicPosts: () => posts.filter((p) => p.published),
    myPosts: (_: unknown, __: unknown, ctx: { user?: { id: string } }) =>
      posts.filter((p) => p.authorId === ctx.user?.id),
    adminStats: () => ({ totalUsers: users.length, totalPosts: posts.length, dailyActiveUsers: 2 }),
    draftPosts: () => posts.filter((p) => !p.published),
    me: (_: unknown, __: unknown, ctx: { user?: { id: string } }) =>
      ctx.user ? users.find((u) => u.id === ctx.user!.id) ?? null : null,
  },

  Mutation: {
    createPost: (
      _: unknown,
      { title, content }: { title: string; content: string },
      ctx: { user?: { id: string } }
    ) => {
      const post = { id: String(postSeq++), title, content, authorId: ctx.user!.id, published: false };
      posts.push(post);
      return post;
    },

    deleteUser: (_: unknown, { id }: { id: string }) => {
      const idx = users.findIndex((u) => u.id === id);
      if (idx !== -1) users.splice(idx, 1);
      return true;
    },
  },
};

// ── Server ────────────────────────────────────────────────────────────────────

export async function startServer() {
  const baseServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: { req: { headers: { authorization?: string } } }) => {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return { user: null };
      try {
        const payload = JSON.parse(Buffer.from(token, "base64url").toString()) as { sub: string };
        const user = users.find((u) => u.id === payload.sub) ?? null;
        return { user };
      } catch { return { user: null }; }
    },
  });

  const { url } = await baseServer.listen({ port: 4000 });
  console.log(`GraphQL server with auth directives ready at ${url}`);
  return baseServer;
}
