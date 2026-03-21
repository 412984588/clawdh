/**
 * Hono.js — WebSockets
 * upgradeWebSocket, chat room, presence tracking
 */
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";

// ── 1. Setup ──────────────────────────────────────────────────────────────────

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app: undefined as never });

const app = new Hono();

// ── 2. Connection registry ────────────────────────────────────────────────────

interface Connection {
  id: string;
  userId: string;
  roomId: string;
  ws: WebSocket;
  connectedAt: Date;
}

interface ChatMessage {
  type: "message" | "join" | "leave" | "typing" | "presence";
  roomId: string;
  userId: string;
  userName?: string;
  text?: string;
  timestamp: string;
  users?: string[];
}

const connections = new Map<string, Connection>();
const rooms = new Map<string, Set<string>>(); // roomId → Set of connectionIds

function getRoomConnections(roomId: string): Connection[] {
  const ids = rooms.get(roomId) ?? new Set();
  return Array.from(ids)
    .map((id) => connections.get(id))
    .filter((c): c is Connection => c !== undefined);
}

function broadcast(roomId: string, message: ChatMessage, excludeId?: string): void {
  const payload = JSON.stringify(message);
  getRoomConnections(roomId).forEach((conn) => {
    if (conn.id !== excludeId && conn.ws.readyState === 1 /* OPEN */) {
      conn.ws.send(payload);
    }
  });
}

// ── 3. WebSocket route ────────────────────────────────────────────────────────

app.get(
  "/ws/:roomId",
  upgradeWebSocket((c) => {
    const roomId = c.req.param("roomId");
    const userId = c.req.query("userId") ?? "anonymous";
    const userName = c.req.query("userName") ?? userId;
    const connId = crypto.randomUUID();

    return {
      onOpen: (_event, ws) => {
        // Register connection
        const conn: Connection = {
          id: connId,
          userId,
          roomId,
          ws: ws.raw as WebSocket,
          connectedAt: new Date(),
        };
        connections.set(connId, conn);

        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId)!.add(connId);

        // Notify room members
        const joinMsg: ChatMessage = {
          type: "join",
          roomId,
          userId,
          userName,
          timestamp: new Date().toISOString(),
          users: getRoomConnections(roomId).map((c) => c.userId),
        };
        broadcast(roomId, joinMsg);

        // Send current presence to the new user
        ws.send(JSON.stringify({
          type: "presence",
          roomId,
          userId,
          timestamp: new Date().toISOString(),
          users: getRoomConnections(roomId).map((c) => c.userId),
        } as ChatMessage));

        console.log(`[WS] ${userId} joined room ${roomId}`);
      },

      onMessage: (event, ws) => {
        try {
          const data = JSON.parse(event.data.toString()) as { type: string; text?: string };

          if (data.type === "message" && data.text) {
            broadcast(roomId, {
              type: "message",
              roomId,
              userId,
              userName,
              text: data.text,
              timestamp: new Date().toISOString(),
            });
          } else if (data.type === "typing") {
            // Broadcast typing indicator (except to sender)
            broadcast(
              roomId,
              { type: "typing", roomId, userId, timestamp: new Date().toISOString() },
              connId
            );
          }
        } catch {
          ws.send(JSON.stringify({ error: "Invalid message format" }));
        }
      },

      onClose: () => {
        connections.delete(connId);
        rooms.get(roomId)?.delete(connId);

        broadcast(roomId, {
          type: "leave",
          roomId,
          userId,
          userName,
          timestamp: new Date().toISOString(),
          users: getRoomConnections(roomId).map((c) => c.userId),
        });

        console.log(`[WS] ${userId} left room ${roomId}`);
      },

      onError: (error) => {
        console.error(`[WS] Error for ${userId}:`, error);
        connections.delete(connId);
        rooms.get(roomId)?.delete(connId);
      },
    };
  })
);

// ── 4. REST endpoints for room management ─────────────────────────────────────

app.get("/rooms", (c) => {
  const roomList = Array.from(rooms.entries()).map(([id, connIds]) => ({
    id,
    userCount: connIds.size,
    users: Array.from(connIds)
      .map((cid) => connections.get(cid)?.userId)
      .filter(Boolean),
  }));
  return c.json(roomList);
});

app.get("/rooms/:roomId/users", (c) => {
  const roomConns = getRoomConnections(c.req.param("roomId"));
  return c.json(
    roomConns.map((c) => ({ userId: c.userId, connectedAt: c.connectedAt }))
  );
});

export { injectWebSocket };
export default app;

// ── 5. Server setup ───────────────────────────────────────────────────────────
//
// import { serve } from "@hono/node-server";
// import app, { injectWebSocket } from "./app";
//
// const server = serve({ fetch: app.fetch, port: 3000 });
// injectWebSocket(server);
