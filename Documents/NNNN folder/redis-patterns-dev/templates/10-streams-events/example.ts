/**
 * Redis Streams & Events
 * Demonstrates: XADD, XREAD, XGROUP, consumer groups, dead letter, event sourcing
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Basic stream operations ───────────────────────────────────────────────────

const STREAM_KEY = "events:stream";

export async function appendEvent(
  type: string,
  payload: Record<string, string>
): Promise<string> {
  // XADD — append to stream, auto-generate ID (timestamp-sequence)
  const id = await redis.xadd(STREAM_KEY, "*", "type", type, ...Object.entries(payload).flat());
  console.log(`[Stream] Appended event ${type} with id ${id}`);
  return id as string;
}

export async function readEvents(count = 10, fromId = "0"): Promise<Array<{ id: string; fields: Record<string, string> }>> {
  // XREAD — read entries from one or more streams
  const results = await redis.xread("COUNT", count, "STREAMS", STREAM_KEY, fromId);
  if (!results) return [];

  const [, entries] = results[0] as [string, Array<[string, string[]]>];
  return entries.map(([id, fields]) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }
    return { id, fields: obj };
  });
}

// ── Consumer groups ───────────────────────────────────────────────────────────
// Multiple consumers in a group each process different messages

const GROUP_NAME = "processors";

export async function createConsumerGroup(groupName = GROUP_NAME): Promise<void> {
  try {
    // $ means start from the latest message, 0 means from the beginning
    await redis.xgroup("CREATE", STREAM_KEY, groupName, "$", "MKSTREAM");
    console.log(`[Group] Created consumer group ${groupName}`);
  } catch (err) {
    if ((err as Error).message.includes("BUSYGROUP")) {
      console.log(`[Group] Group ${groupName} already exists`);
    } else {
      throw err;
    }
  }
}

export async function consumeFromGroup(
  consumerName: string,
  count = 5,
  groupName = GROUP_NAME
): Promise<Array<{ id: string; fields: Record<string, string> }>> {
  // XREADGROUP — read messages pending delivery to this consumer
  const results = await redis.xreadgroup(
    "GROUP",
    groupName,
    consumerName,
    "COUNT",
    count,
    "STREAMS",
    STREAM_KEY,
    ">" // ">" means undelivered messages
  );

  if (!results) return [];

  const [, entries] = results[0] as [string, Array<[string, string[]]>];
  return entries.map(([id, fields]) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }
    return { id, fields: obj };
  });
}

export async function acknowledgeMessage(
  messageId: string,
  groupName = GROUP_NAME
): Promise<void> {
  // XACK — mark message as processed; removes from PEL (Pending Entries List)
  await redis.xack(STREAM_KEY, groupName, messageId);
  console.log(`[ACK] Message ${messageId} acknowledged`);
}

// ── Dead letter handling ───────────────────────────────────────────────────────
// Re-claim messages that have been pending too long (consumer crashed)

const DEAD_LETTER_STREAM = "events:dead-letter";

export async function reclaimStalePendingMessages(
  consumerName: string,
  maxIdleMs = 30000,
  groupName = GROUP_NAME
): Promise<number> {
  // XAUTOCLAIM — atomically transfer idle PEL entries to a new consumer
  const result = await redis.xautoclaim(
    STREAM_KEY,
    groupName,
    consumerName,
    maxIdleMs,
    "0-0"
  ) as [string, Array<[string, string[]]>, string[]];

  const claimed = result[1];
  const deleted = result[2]; // Deleted entries (trimmed from stream)

  if (claimed.length > 0) {
    console.log(`[Reclaim] Reclaimed ${claimed.length} stale messages`);
  }

  // Move permanently failed to dead letter (if retried N times)
  for (const [id, fields] of claimed) {
    const obj: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }
    const retryCount = parseInt(obj.__retries ?? "0") + 1;
    if (retryCount >= 3) {
      await redis.xadd(DEAD_LETTER_STREAM, "*",
        "originalId", id,
        "retries", retryCount.toString(),
        ...Object.entries(obj).flat()
      );
      await redis.xack(STREAM_KEY, groupName, id);
      console.log(`[DLQ] Moved ${id} to dead letter after ${retryCount} retries`);
    }
  }

  return claimed.length;
}

// ── Stream info ────────────────────────────────────────────────────────────────

export async function streamInfo(): Promise<void> {
  const info = await redis.xinfo("STREAM", STREAM_KEY) as unknown[];
  // xinfo returns alternating key/value pairs
  const pairs: Record<string, unknown> = {};
  for (let i = 0; i < info.length - 1; i += 2) {
    pairs[info[i] as string] = info[i + 1];
  }
  console.log(`[Stream] Length: ${pairs["length"]}, groups: ${pairs["groups"]}`);

  // Stream trimming — keep last N entries
  await redis.xtrim(STREAM_KEY, "MAXLEN", "~", 10000);
}

// ── Event sourcing pattern ────────────────────────────────────────────────────
// Reconstruct state by replaying events from a stream

interface OrderEvent {
  type: "OrderCreated" | "ItemAdded" | "OrderShipped" | "OrderCancelled";
  orderId: string;
  [key: string]: string;
}

interface OrderState {
  id: string;
  status: string;
  items: string[];
}

export async function appendOrderEvent(event: OrderEvent): Promise<string> {
  const fields = Object.entries(event).flat();
  return await redis.xadd(`order:events:${event.orderId}`, "*", ...fields) as string;
}

export async function replayOrder(orderId: string): Promise<OrderState | null> {
  const streamKey = `order:events:${orderId}`;
  const results = await redis.xrange(streamKey, "-", "+");
  if (!results || results.length === 0) return null;

  const state: OrderState = { id: orderId, status: "pending", items: [] };

  for (const [, fields] of results) {
    const obj: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      obj[fields[i]] = fields[i + 1];
    }

    switch (obj.type) {
      case "OrderCreated":
        state.status = "created";
        break;
      case "ItemAdded":
        state.items.push(obj.itemId);
        break;
      case "OrderShipped":
        state.status = "shipped";
        break;
      case "OrderCancelled":
        state.status = "cancelled";
        break;
    }
  }

  return state;
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  const keys = await redis.keys("events:*");
  const orderKeys = await redis.keys("order:events:*");
  const all = [...keys, ...orderKeys];
  if (all.length) await redis.del(...all);
  redis.disconnect();
}

async function main() {
  // Append events
  await appendEvent("user.signup", { userId: "u-1", email: "alice@example.com" });
  await appendEvent("user.signup", { userId: "u-2", email: "bob@example.com" });
  await appendEvent("order.created", { orderId: "o-1", userId: "u-1", total: "59.99" });

  // Read all
  const events = await readEvents(10);
  console.log(`[Read] Got ${events.length} events`);
  events.forEach((e) => console.log(`  ${e.id}: ${e.fields.type}`));

  // Consumer group
  await createConsumerGroup();

  // Append more after group creation
  await appendEvent("payment.processed", { orderId: "o-1", amount: "59.99" });

  // Consume
  const messages = await consumeFromGroup("worker-1");
  console.log(`[Group] Worker-1 received ${messages.length} messages`);
  for (const msg of messages) {
    console.log(`  Processing: ${msg.fields.type}`);
    await acknowledgeMessage(msg.id);
  }

  // Event sourcing
  const orderId = "ord-999";
  await appendOrderEvent({ type: "OrderCreated", orderId });
  await appendOrderEvent({ type: "ItemAdded", orderId, itemId: "sku-1" });
  await appendOrderEvent({ type: "ItemAdded", orderId, itemId: "sku-2" });
  await appendOrderEvent({ type: "OrderShipped", orderId });

  const state = await replayOrder(orderId);
  console.log(`[EventSource] Order ${orderId}: status=${state?.status}, items=${state?.items}`);

  await cleanup();
}

main().catch(console.error);
