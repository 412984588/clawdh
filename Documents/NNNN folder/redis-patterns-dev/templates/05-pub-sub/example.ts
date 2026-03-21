/**
 * Redis Pub/Sub
 * Demonstrates: publish/subscribe, pattern subscriptions, message routing, chat channels
 */
import Redis from "ioredis";

// ── Separate connections for pub and sub ──────────────────────────────────────
// ioredis requires separate instances for pub and sub

const publisher = new Redis({ host: "localhost", port: 6379 });
const subscriber = new Redis({ host: "localhost", port: 6379 });

// ── Message types ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  type: "message";
  room: string;
  userId: string;
  text: string;
  timestamp: number;
}

export interface SystemEvent {
  type: "user:join" | "user:leave" | "system:restart";
  userId?: string;
  timestamp: number;
}

// ── Basic pub/sub ─────────────────────────────────────────────────────────────

export async function basicPubSub() {
  const CHANNEL = "notifications";

  // Subscribe
  await subscriber.subscribe(CHANNEL);
  subscriber.on("message", (channel, message) => {
    console.log(`[${channel}] ${message}`);
  });

  // Publish (can be in a different process / service)
  const recipientCount = await publisher.publish(CHANNEL, JSON.stringify({
    type: "alert",
    text: "System maintenance in 5 minutes",
    timestamp: Date.now(),
  }));
  console.log(`Message delivered to ${recipientCount} subscriber(s)`);

  // Cleanup
  await subscriber.unsubscribe(CHANNEL);
}

// ── Pattern subscriptions (PSUBSCRIBE) ───────────────────────────────────────

export async function patternSubscriptions() {
  // Subscribe to all channels matching a pattern
  await subscriber.psubscribe("chat:room:*");

  subscriber.on("pmessage", (pattern, channel, message) => {
    const room = channel.replace("chat:room:", "");
    const parsed = JSON.parse(message) as ChatMessage;
    console.log(`[Pattern: ${pattern}] Room ${room}: ${parsed.userId} says: ${parsed.text}`);
  });

  // Publish to different rooms
  await publisher.publish("chat:room:general", JSON.stringify({
    type: "message",
    room: "general",
    userId: "alice",
    text: "Hello everyone!",
    timestamp: Date.now(),
  } as ChatMessage));

  await publisher.publish("chat:room:dev", JSON.stringify({
    type: "message",
    room: "dev",
    userId: "bob",
    text: "Found a bug in production",
    timestamp: Date.now(),
  } as ChatMessage));

  // Cleanup
  await subscriber.punsubscribe("chat:room:*");
}

// ── Event bus pattern ─────────────────────────────────────────────────────────

export class RedisEventBus {
  private handlers = new Map<string, Array<(data: unknown) => void>>();

  constructor(
    private readonly pub: Redis,
    private readonly sub: Redis
  ) {
    this.sub.on("message", (channel, message) => {
      try {
        const data = JSON.parse(message) as unknown;
        const channelHandlers = this.handlers.get(channel);
        channelHandlers?.forEach((h) => h(data));
      } catch (err) {
        console.error(`EventBus parse error on ${channel}:`, err);
      }
    });
  }

  async on<T>(channel: string, handler: (data: T) => void) {
    if (!this.handlers.has(channel)) {
      await this.sub.subscribe(channel);
      this.handlers.set(channel, []);
    }
    this.handlers.get(channel)!.push(handler as (data: unknown) => void);
  }

  async emit<T>(channel: string, data: T) {
    const count = await this.pub.publish(channel, JSON.stringify(data));
    return count;
  }

  async off(channel: string) {
    await this.sub.unsubscribe(channel);
    this.handlers.delete(channel);
  }
}

export async function eventBusDemo() {
  const bus = new RedisEventBus(publisher, subscriber);

  // Listen for order events
  await bus.on<{ orderId: string; total: number }>("order:created", (order) => {
    console.log(`New order: ${order.orderId}, total: $${order.total}`);
  });

  await bus.on<{ userId: string; email: string }>("user:registered", (user) => {
    console.log(`New user: ${user.email}`);
  });

  // Emit events from any service
  await bus.emit("order:created", { orderId: "ORD-001", total: 59.99 });
  await bus.emit("user:registered", { userId: "u-123", email: "carol@example.com" });

  // Wait for messages to be delivered
  await new Promise((r) => setTimeout(r, 100));

  await bus.off("order:created");
  await bus.off("user:registered");
}

// ── Presence detection ────────────────────────────────────────────────────────

export async function presenceDetection() {
  const PRESENCE_CHANNEL = "presence";

  await subscriber.subscribe(PRESENCE_CHANNEL);
  subscriber.on("message", (_channel, message) => {
    const event = JSON.parse(message) as SystemEvent;
    if (event.type === "user:join") {
      console.log(`User ${event.userId} came online`);
    } else if (event.type === "user:leave") {
      console.log(`User ${event.userId} went offline`);
    }
  });

  // Emit join
  await publisher.publish(PRESENCE_CHANNEL, JSON.stringify({
    type: "user:join",
    userId: "alice",
    timestamp: Date.now(),
  } as SystemEvent));

  await new Promise((r) => setTimeout(r, 50));

  // Emit leave
  await publisher.publish(PRESENCE_CHANNEL, JSON.stringify({
    type: "user:leave",
    userId: "alice",
    timestamp: Date.now(),
  } as SystemEvent));

  await new Promise((r) => setTimeout(r, 50));
  await subscriber.unsubscribe(PRESENCE_CHANNEL);
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  subscriber.disconnect();
  publisher.disconnect();
}

async function main() {
  await basicPubSub();
  await patternSubscriptions();
  await eventBusDemo();
  await presenceDetection();
  await cleanup();
}

main().catch(console.error);
