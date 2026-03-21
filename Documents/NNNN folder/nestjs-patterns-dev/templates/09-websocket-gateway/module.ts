/**
 * NestJS WebSocket Gateway
 * Demonstrates: @WebSocketGateway, @SubscribeMessage, @WebSocketServer, WsException, rooms
 */
import {
  Module,
  Injectable,
  Logger,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
  WsResponse,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  roomId: string;
  userId: string;
  content: string;
  timestamp: number;
}

export interface JoinRoomPayload {
  roomId: string;
  userId: string;
}

// ── Chat Service ──────────────────────────────────────────────────────────────

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private roomMessages = new Map<string, ChatMessage[]>();
  private userRooms = new Map<string, Set<string>>(); // userId → roomIds

  joinRoom(userId: string, roomId: string) {
    if (!this.userRooms.has(userId)) this.userRooms.set(userId, new Set());
    this.userRooms.get(userId)!.add(roomId);
    if (!this.roomMessages.has(roomId)) this.roomMessages.set(roomId, []);
    this.logger.log(`User ${userId} joined room ${roomId}`);
  }

  leaveRoom(userId: string, roomId: string) {
    this.userRooms.get(userId)?.delete(roomId);
    this.logger.log(`User ${userId} left room ${roomId}`);
  }

  addMessage(msg: ChatMessage) {
    const msgs = this.roomMessages.get(msg.roomId) ?? [];
    msgs.push(msg);
    this.roomMessages.set(msg.roomId, msgs.slice(-100)); // keep last 100
    return msg;
  }

  getHistory(roomId: string, limit = 20): ChatMessage[] {
    return (this.roomMessages.get(roomId) ?? []).slice(-limit);
  }

  getUserRooms(userId: string): string[] {
    return Array.from(this.userRooms.get(userId) ?? []);
  }

  disconnectUser(userId: string) {
    this.userRooms.delete(userId);
  }
}

// ── WebSocket Gateway ─────────────────────────────────────────────────────────

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/chat",
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  // socketId → userId
  private readonly socketUserMap = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log(`WebSocket gateway initialised on ${server.path?.() ?? "/chat"}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.chatService.disconnectUser(userId);
      this.socketUserMap.delete(client.id);
      this.logger.log(`User ${userId} disconnected (${client.id})`);
    }
  }

  @SubscribeMessage("join")
  handleJoin(
    @MessageBody() payload: JoinRoomPayload,
    @ConnectedSocket() client: Socket
  ): WsResponse<{ history: ChatMessage[] }> {
    if (!payload.roomId || !payload.userId) {
      throw new WsException("roomId and userId are required");
    }
    this.socketUserMap.set(client.id, payload.userId);
    this.chatService.joinRoom(payload.userId, payload.roomId);
    client.join(payload.roomId);

    const history = this.chatService.getHistory(payload.roomId);
    // Notify others in room
    client.to(payload.roomId).emit("user:joined", { userId: payload.userId });
    return { event: "joined", data: { history } };
  }

  @SubscribeMessage("leave")
  handleLeave(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket
  ): WsResponse<{ success: boolean }> {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) throw new WsException("Not authenticated");
    this.chatService.leaveRoom(userId, payload.roomId);
    client.leave(payload.roomId);
    client.to(payload.roomId).emit("user:left", { userId });
    return { event: "left", data: { success: true } };
  }

  @SubscribeMessage("message")
  handleMessage(
    @MessageBody() payload: { roomId: string; content: string },
    @ConnectedSocket() client: Socket
  ): WsResponse<ChatMessage> {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) throw new WsException("Not authenticated");
    if (!payload.content?.trim()) throw new WsException("Message cannot be empty");

    const msg: ChatMessage = {
      roomId: payload.roomId,
      userId,
      content: payload.content.trim(),
      timestamp: Date.now(),
    };

    this.chatService.addMessage(msg);
    // Broadcast to everyone in room including sender
    this.server.to(payload.roomId).emit("message", msg);
    return { event: "message:ack", data: msg };
  }

  @SubscribeMessage("ping")
  handlePing(): WsResponse<{ pong: boolean; ts: number }> {
    return { event: "pong", data: { pong: true, ts: Date.now() } };
  }
}

// ── Presence Gateway ──────────────────────────────────────────────────────────

@WebSocketGateway({ cors: { origin: "*" }, namespace: "/presence" })
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly online = new Set<string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query["userId"] as string;
    if (userId) {
      this.online.add(userId);
      this.server.emit("presence:online", { userId, onlineCount: this.online.size });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query["userId"] as string;
    if (userId) {
      this.online.delete(userId);
      this.server.emit("presence:offline", { userId, onlineCount: this.online.size });
    }
  }

  @SubscribeMessage("who-is-online")
  whoIsOnline(): WsResponse<{ users: string[] }> {
    return { event: "online-list", data: { users: Array.from(this.online) } };
  }
}

// ── Module ────────────────────────────────────────────────────────────────────

@Module({
  providers: [ChatService, ChatGateway, PresenceGateway],
})
export class ChatModule {}

@Module({ imports: [ChatModule] })
export class AppModule {}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  return app;
}
