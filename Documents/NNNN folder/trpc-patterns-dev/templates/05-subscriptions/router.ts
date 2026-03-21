/**
 * tRPC v11 — Subscriptions (WebSocket / SSE)
 * observable, event emitter, real-time data streaming
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { EventEmitter } from "events";

// ── 1. Shared event emitter (replace with Redis pub/sub in production) ────────

const ee = new EventEmitter();
ee.setMaxListeners(100);

// Typed event helpers
function emitToRoom(roomId: string, event: ChatMessage): void {
  ee.emit(`chat:${roomId}`, event);
}

function emitNotification(userId: string, notification: Notification): void {
  ee.emit(`notification:${userId}`, notification);
}

// ── 2. Shared types ───────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

interface Notification {
  id: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  body: string;
  createdAt: Date;
}

// ── 3. Setup ──────────────────────────────────────────────────────────────────

interface Context {
  user: { id: string; name: string } | null;
}

const t = initTRPC.context<Context>().create();

const authed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(authed);

// ── 4. Subscriptions ─────────────────────────────────────────────────────────

export const appRouter = t.router({
  // ── 4a. Chat room subscription ──────────────────────────────────────────────
  chat: t.router({
    send: protectedProcedure
      .input(z.object({ roomId: z.string(), text: z.string().min(1).max(2000) }))
      .mutation(({ ctx, input }) => {
        const message: ChatMessage = {
          id: Math.random().toString(36).slice(2),
          roomId: input.roomId,
          userId: ctx.user.id,
          text: input.text,
          createdAt: new Date(),
        };
        emitToRoom(input.roomId, message);
        return message;
      }),

    onMessage: protectedProcedure
      .input(z.object({ roomId: z.string() }))
      .subscription(({ input }) =>
        observable<ChatMessage>((emit) => {
          const onMessage = (message: ChatMessage) => emit.next(message);
          ee.on(`chat:${input.roomId}`, onMessage);
          // Cleanup when subscriber disconnects
          return () => { ee.off(`chat:${input.roomId}`, onMessage); };
        })
      ),
  }),

  // ── 4b. Notification subscription ──────────────────────────────────────────
  notifications: t.router({
    onNotification: protectedProcedure
      .subscription(({ ctx }) =>
        observable<Notification>((emit) => {
          const onNotif = (n: Notification) => emit.next(n);
          ee.on(`notification:${ctx.user.id}`, onNotif);
          return () => { ee.off(`notification:${ctx.user.id}`, onNotif); };
        })
      ),

    push: protectedProcedure
      .input(z.object({
        targetUserId: z.string(),
        type: z.enum(["info", "warning", "success", "error"]),
        title: z.string().min(1).max(100),
        body: z.string().max(500),
      }))
      .mutation(({ input }) => {
        const notification: Notification = {
          id: Math.random().toString(36).slice(2),
          userId: input.targetUserId,
          createdAt: new Date(),
          type: input.type,
          title: input.title,
          body: input.body,
        };
        emitNotification(input.targetUserId, notification);
        return notification;
      }),
  }),

  // ── 4c. Live metrics / counter subscription ─────────────────────────────────
  metrics: t.router({
    onCount: publicProcedure
      .input(z.object({ interval: z.number().int().min(500).max(10_000).default(1000) }))
      .subscription(({ input }) =>
        observable<{ count: number; timestamp: string }>((emit) => {
          let count = 0;
          const timer = setInterval(() => {
            emit.next({ count: ++count, timestamp: new Date().toISOString() });
          }, input.interval);
          return () => { clearInterval(timer); };
        })
      ),

    onActiveUsers: publicProcedure.subscription(() =>
      observable<{ activeUsers: number }>((emit) => {
        const handler = () => emit.next({ activeUsers: ee.listenerCount("chat:*") });
        const timer = setInterval(handler, 5000);
        handler(); // emit immediately
        return () => { clearInterval(timer); };
      })
    ),
  }),
});

export type AppRouter = typeof appRouter;

// ── 5. Server setup (WebSocket) ───────────────────────────────────────────────
//
// import { applyWSSHandler } from "@trpc/server/adapters/ws";
// import { WebSocketServer } from "ws";
//
// const wss = new WebSocketServer({ port: 3001 });
// const handler = applyWSSHandler({ wss, router: appRouter, createContext });
//
// ── 6. Client usage ───────────────────────────────────────────────────────────
//
// import { createWSClient, wsLink } from "@trpc/client";
// const wsClient = createWSClient({ url: "ws://localhost:3001" });
// const trpc = createTRPCProxyClient<AppRouter>({ links: [wsLink({ client: wsClient })] });
//
// const unsub = trpc.chat.onMessage.subscribe({ roomId: "general" }, {
//   onData: (message) => console.log(message),
//   onError: (err) => console.error(err),
// });
// // Later: unsub();
