/**
 * Fastify WebSockets
 * Demonstrates: @fastify/websocket, rooms, broadcast, ping/pong, typed messages
 */
import Fastify, { FastifyInstance } from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import type { WebSocket } from "ws";

// ── Connection tracking ───────────────────────────────────────────────────────

interface Client {
  id: string;
  socket: WebSocket;
  userId?: string;
  rooms: Set<string>;
  lastPingAt: number;
}

const clients = new Map<string, Client>();

// ── Message types ─────────────────────────────────────────────────────────────

type IncomingMessage =
  | { type: "join"; room: string }
  | { type: "leave"; room: string }
  | { type: "message"; room: string; text: string }
  | { type: "ping" };

type OutgoingMessage =
  | { type: "connected"; clientId: string }
  | { type: "joined"; room: string; clientCount: number }
  | { type: "message"; room: string; from: string; text: string; timestamp: number }
  | { type: "pong"; timestamp: number }
  | { type: "error"; message: string };

function send(socket: WebSocket, message: OutgoingMessage) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function broadcast(roomId: string, message: OutgoingMessage, excludeId?: string) {
  for (const client of clients.values()) {
    if (client.rooms.has(roomId) && client.id !== excludeId) {
      send(client.socket, message);
    }
  }
}

// ── Build app ─────────────────────────────────────────────────────────────────

export function buildApp(): FastifyInstance {
  const fastify = Fastify({ logger: false });

  fastify.register(fastifyWebSocket);

  // ── Chat WebSocket endpoint ───────────────────────────────────────────────

  fastify.get("/ws/chat", { websocket: true }, (socket, request) => {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const client: Client = {
      id: clientId,
      socket,
      rooms: new Set(),
      lastPingAt: Date.now(),
    };
    clients.set(clientId, client);

    console.log(`[WS] Client ${clientId} connected (total: ${clients.size})`);

    // Welcome message
    send(socket, { type: "connected", clientId });

    // ── Message handler ─────────────────────────────────────────────────────

    socket.on("message", (raw) => {
      let msg: IncomingMessage;
      try {
        msg = JSON.parse(raw.toString()) as IncomingMessage;
      } catch {
        return send(socket, { type: "error", message: "Invalid JSON" });
      }

      switch (msg.type) {
        case "join": {
          client.rooms.add(msg.room);
          const roomClients = [...clients.values()].filter((c) => c.rooms.has(msg.room)).length;
          send(socket, { type: "joined", room: msg.room, clientCount: roomClients });
          broadcast(msg.room, {
            type: "message",
            room: msg.room,
            from: "system",
            text: `${clientId.slice(0, 8)} joined`,
            timestamp: Date.now(),
          }, clientId);
          break;
        }

        case "leave": {
          client.rooms.delete(msg.room);
          break;
        }

        case "message": {
          if (!client.rooms.has(msg.room)) {
            return send(socket, { type: "error", message: `Not in room ${msg.room}` });
          }
          const outgoing: OutgoingMessage = {
            type: "message",
            room: msg.room,
            from: clientId,
            text: msg.text,
            timestamp: Date.now(),
          };
          broadcast(msg.room, outgoing);
          break;
        }

        case "ping": {
          client.lastPingAt = Date.now();
          send(socket, { type: "pong", timestamp: Date.now() });
          break;
        }
      }
    });

    // ── Disconnect ──────────────────────────────────────────────────────────

    socket.on("close", () => {
      // Notify all rooms this client was in
      for (const room of client.rooms) {
        broadcast(room, {
          type: "message",
          room,
          from: "system",
          text: `${clientId.slice(0, 8)} left`,
          timestamp: Date.now(),
        });
      }
      clients.delete(clientId);
      console.log(`[WS] Client ${clientId} disconnected (total: ${clients.size})`);
    });

    socket.on("error", (err) => {
      console.error(`[WS] Client ${clientId} error:`, err.message);
    });
  });

  // ── Server stats endpoint ─────────────────────────────────────────────────

  fastify.get("/ws/stats", async (_req, reply) => {
    const roomCounts: Record<string, number> = {};
    for (const client of clients.values()) {
      for (const room of client.rooms) {
        roomCounts[room] = (roomCounts[room] ?? 0) + 1;
      }
    }
    return reply.send({
      connectedClients: clients.size,
      rooms: roomCounts,
    });
  });

  // ── Heartbeat — remove stale connections ─────────────────────────────────

  setInterval(() => {
    const staleThreshold = Date.now() - 30000; // 30s
    for (const [id, client] of clients) {
      if (client.lastPingAt < staleThreshold) {
        client.socket.terminate();
        clients.delete(id);
        console.log(`[WS] Removed stale client ${id}`);
      }
    }
  }, 10000);

  return fastify;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = buildApp();
  await app.listen({ port: 3000 });
  console.log("Fastify WebSocket demo on ws://localhost:3000/ws/chat");
}

if (require.main === module) {
  main().catch(console.error);
}

export default buildApp;
