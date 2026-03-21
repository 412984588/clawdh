/**
 * Redis Hash Maps
 * Demonstrates: HSET/HGET/HGETALL, HMSET, HINCRBY, field operations
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Basic hash operations ─────────────────────────────────────────────────────

export async function basicHashOps() {
  // HSET — set one or multiple fields
  await redis.hset("user:1", {
    name: "Alice",
    email: "alice@example.com",
    age: "30",
    role: "admin",
  });

  // HGET — get a single field
  const name = await redis.hget("user:1", "name");
  console.log(`Name: ${name}`);

  // HGETALL — get all fields as object
  const user = await redis.hgetall("user:1");
  console.log("User:", user);

  // HMGET — get multiple specific fields
  const [email, role] = await redis.hmget("user:1", "email", "role");
  console.log(`Email: ${email}, Role: ${role}`);

  // HEXISTS — check if field exists
  const hasPhone = await redis.hexists("user:1", "phone");
  console.log(`Has phone: ${hasPhone === 1}`);

  // HDEL — delete a field
  await redis.hdel("user:1", "age");
  const after = await redis.hgetall("user:1");
  console.log("After hdel:", after);
}

// ── Hash as user profile ───────────────────────────────────────────────────────

export interface UserHash {
  id: string;
  name: string;
  email: string;
  loginCount: string;
  lastSeen: string;
}

export async function userProfileHash() {
  const userId = "user:42";

  await redis.hset(userId, {
    id: "42",
    name: "Bob",
    email: "bob@example.com",
    loginCount: "0",
    lastSeen: new Date().toISOString(),
  });
  await redis.expire(userId, 86400); // 24h TTL

  // Increment login count atomically
  const newCount = await redis.hincrby(userId, "loginCount", 1);
  console.log(`Login count: ${newCount}`);

  // Update single field
  await redis.hset(userId, "lastSeen", new Date().toISOString());

  const profile = await redis.hgetall(userId) as UserHash;
  console.log("Profile:", profile);
}

// ── Hash as product catalog ────────────────────────────────────────────────────

export async function productHash() {
  const productId = "product:99";

  await redis.hset(productId, {
    name: "Widget Pro",
    price: "29.99",
    stock: "100",
    category: "hardware",
    views: "0",
  });

  // Atomic stock decrement (purchase)
  const stock = await redis.hincrby(productId, "stock", -1);
  if (stock < 0) {
    // Rollback
    await redis.hincrby(productId, "stock", 1);
    throw new Error("Out of stock");
  }
  console.log(`Remaining stock: ${stock}`);

  // Increment view count
  await redis.hincrby(productId, "views", 1);

  // Float increment for price update
  await redis.hincrbyfloat(productId, "price", 5.0);
  const newPrice = await redis.hget(productId, "price");
  console.log(`New price: ${newPrice}`);
}

// ── Hash field enumeration ────────────────────────────────────────────────────

export async function hashFieldEnum() {
  await redis.hset("config:app", {
    debug: "false",
    maxConnections: "100",
    timeout: "30",
    version: "1.0.0",
    environment: "production",
  });

  // HKEYS — list all field names
  const fields = await redis.hkeys("config:app");
  console.log("Config fields:", fields);

  // HVALS — list all values
  const values = await redis.hvals("config:app");
  console.log("Config values:", values);

  // HLEN — count fields
  const count = await redis.hlen("config:app");
  console.log(`Field count: ${count}`);
}

// ── HSCAN — iterate large hashes ─────────────────────────────────────────────

export async function hscanLargeHash() {
  // Build a large hash (1000 fields)
  const pipeline = redis.pipeline();
  for (let i = 0; i < 1000; i++) {
    pipeline.hset("large:hash", `field:${i}`, `value:${i}`);
  }
  await pipeline.exec();

  // HSCAN with cursor to iterate without blocking
  let cursor = "0";
  let total = 0;
  do {
    const [nextCursor, entries] = await redis.hscan("large:hash", cursor, "COUNT", 100);
    cursor = nextCursor;
    total += entries.length / 2; // entries = [field, value, field, value, ...]
  } while (cursor !== "0");

  console.log(`Scanned ${total} hash entries`);
  await redis.del("large:hash");
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  await redis.del("user:1", "user:42", "product:99", "config:app");
  redis.disconnect();
}

async function main() {
  await basicHashOps();
  await userProfileHash();
  await productHash();
  await hashFieldEnum();
  await hscanLargeHash();
  await cleanup();
}

main().catch(console.error);
