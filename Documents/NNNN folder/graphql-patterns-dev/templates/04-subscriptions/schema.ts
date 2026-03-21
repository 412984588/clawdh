/**
 * GraphQL Subscriptions
 * Demonstrates: PubSub, subscription resolvers, filtering, withFilter
 */
import { ApolloServer, gql, PubSub, withFilter } from "apollo-server";

// ── Event names ───────────────────────────────────────────────────────────────

export const EVENTS = {
  POST_CREATED: "POST_CREATED",
  POST_UPDATED: "POST_UPDATED",
  MESSAGE_SENT: "MESSAGE_SENT",
  USER_ONLINE: "USER_ONLINE",
} as const;

// ── PubSub instance ───────────────────────────────────────────────────────────

export const pubsub = new PubSub();

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  sentAt: string;
}

// ── Type definitions ──────────────────────────────────────────────────────────

export const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    authorId: ID!
    published: Boolean!
  }

  type ChatMessage {
    id: ID!
    roomId: ID!
    senderId: ID!
    text: String!
    sentAt: String!
  }

  type OnlineStatus {
    userId: ID!
    online: Boolean!
  }

  type Query {
    posts: [Post!]!
    messages(roomId: ID!): [ChatMessage!]!
  }

  type Mutation {
    createPost(title: String!, content: String!): Post!
    sendMessage(roomId: ID!, text: String!): ChatMessage!
    setOnlineStatus(online: Boolean!): OnlineStatus!
  }

  type Subscription {
    """Subscribe to all new posts"""
    postCreated: Post!

    """Subscribe to posts by a specific author"""
    postCreatedByAuthor(authorId: ID!): Post!

    """Subscribe to messages in a specific room"""
    messageSent(roomId: ID!): ChatMessage!

    """Subscribe to online status changes"""
    userOnlineStatusChanged: OnlineStatus!
  }
`;

// ── In-memory store ───────────────────────────────────────────────────────────

const posts: Post[] = [];
const messages: ChatMessage[] = [];
let postSeq = 1;
let msgSeq = 1;

// ── Resolvers ─────────────────────────────────────────────────────────────────

export const resolvers = {
  Query: {
    posts: () => posts,
    messages: (_: unknown, { roomId }: { roomId: string }) =>
      messages.filter((m) => m.roomId === roomId),
  },

  Mutation: {
    createPost: (
      _: unknown,
      { title, content }: { title: string; content: string },
      ctx: { userId?: string }
    ) => {
      const post: Post = {
        id: String(postSeq++),
        title,
        content,
        authorId: ctx.userId ?? "anonymous",
        published: false,
      };
      posts.push(post);

      // Publish to subscribers
      pubsub.publish(EVENTS.POST_CREATED, { postCreated: post });
      pubsub.publish(EVENTS.POST_UPDATED, { postUpdated: post });

      return post;
    },

    sendMessage: (
      _: unknown,
      { roomId, text }: { roomId: string; text: string },
      ctx: { userId?: string }
    ) => {
      const message: ChatMessage = {
        id: String(msgSeq++),
        roomId,
        senderId: ctx.userId ?? "anonymous",
        text,
        sentAt: new Date().toISOString(),
      };
      messages.push(message);

      // Publish to room-specific subscribers
      pubsub.publish(EVENTS.MESSAGE_SENT, { messageSent: message });

      return message;
    },

    setOnlineStatus: (
      _: unknown,
      { online }: { online: boolean },
      ctx: { userId?: string }
    ) => {
      const status = { userId: ctx.userId ?? "unknown", online };
      pubsub.publish(EVENTS.USER_ONLINE, { userOnlineStatusChanged: status });
      return status;
    },
  },

  Subscription: {
    // Simple subscription — all new posts
    postCreated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.POST_CREATED]),
    },

    // Filtered subscription — posts by specific author
    postCreatedByAuthor: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([EVENTS.POST_CREATED]),
        (payload: { postCreated: Post }, variables: { authorId: string }) =>
          payload.postCreated.authorId === variables.authorId
      ),
    },

    // Filtered by roomId
    messageSent: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([EVENTS.MESSAGE_SENT]),
        (payload: { messageSent: ChatMessage }, variables: { roomId: string }) =>
          payload.messageSent.roomId === variables.roomId
      ),
    },

    // Broadcast to all
    userOnlineStatusChanged: {
      subscribe: () => pubsub.asyncIterator([EVENTS.USER_ONLINE]),
    },
  },
};

// ── Server ────────────────────────────────────────────────────────────────────

export async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
      path: "/subscriptions",
      onConnect: (connectionParams) => {
        console.log("Client connected:", connectionParams);
        // Extract auth from connectionParams in production
        return { userId: "ws-user" };
      },
    },
    context: ({ req }) => {
      return { userId: (req?.headers["x-user-id"] as string) ?? null };
    },
  });

  const { url, subscriptionsUrl } = await server.listen({ port: 4000 });
  console.log(`GraphQL server ready at ${url}`);
  console.log(`Subscriptions ready at ${subscriptionsUrl}`);
  return server;
}
