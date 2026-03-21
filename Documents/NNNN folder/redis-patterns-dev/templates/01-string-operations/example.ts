/**
 * Redis String Operations
 * Demonstrates: GET/SET, INCR/DECR, EXPIRE/TTL, atomic operations, counters
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Basic GET/SET ─────────────────────────────────────────────────────────────

export async function basicGetSet() {
  // SET with optional expiry (EX = seconds, PX = milliseconds)
  await redis.set("user:1:name", "Alice");
  await redis.set("user:1:email", "alice@example.com", "EX", 3600); // expires in 1h

  const name = await redis.get("user:1:name");
  const email = await redis.get("user:1:email");
  console.log(`Name: ${name}, Email: ${email}`);

  // SETNX — set only if key does not exist
  const created = await redis.setnx("config:feature-flag", "enabled");
  console.log(`Config created: ${created === 1}`);

  // GETSET — set new value and return old
  const oldName = await redis.getset("user:1:name", "Alice Updated");
  console.log(`Old name: ${oldName}`);

  // MSET/MGET — multiple keys atomically
  await redis.mset("key1", "val1", "key2", "val2", "key3", "val3");
  const values = await redis.mget("key1", "key2", "key3");
  console.log("Batch get:", values);
}

// ── Counters (INCR/DECR) ──────────────────────────────────────────────────────

export async function counters() {
  // Atomic increment — safe for concurrent access
  await redis.set("page:views", "0");

  // Multiple concurrent increments are safe
  const views = await redis.incr("page:views");
  await redis.incrby("page:views", 5); // add 5
  const finalViews = await redis.get("page:views");
  console.log(`Views after increment: ${views}, Final: ${finalViews}`);

  // Floating point
  await redis.set("product:price", "9.99");
  await redis.incrbyfloat("product:price", 1.5);
  const price = await redis.get("product:price");
  console.log(`New price: ${price}`);

  // Decrement
  await redis.set("inventory:widget", "100");
  await redis.decrby("inventory:widget", 5);
  const stock = await redis.get("inventory:widget");
  console.log(`Remaining stock: ${stock}`);
}

// ── Expiry & TTL ──────────────────────────────────────────────────────────────

export async function expiryAndTTL() {
  await redis.set("session:abc123", JSON.stringify({ userId: 1, role: "user" }));
  await redis.expire("session:abc123", 1800); // 30 minutes

  const ttl = await redis.ttl("session:abc123");
  console.log(`Session TTL: ${ttl}s`);

  // EXPIREAT — absolute unix timestamp
  const oneHourFromNow = Math.floor(Date.now() / 1000) + 3600;
  await redis.expireat("session:abc123", oneHourFromNow);

  // Persist — remove expiry
  await redis.persist("session:abc123");
  const persistedTTL = await redis.ttl("session:abc123"); // returns -1 (no expiry)
  console.log(`After persist, TTL: ${persistedTTL}`);
}

// ── String as JSON store ───────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  preferences: { theme: string; notifications: boolean };
}

export async function jsonInString() {
  const user: UserProfile = {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    preferences: { theme: "dark", notifications: true },
  };

  // Store serialized JSON
  await redis.set(`user:${user.id}:profile`, JSON.stringify(user), "EX", 3600);

  // Retrieve and parse
  const raw = await redis.get(`user:${user.id}:profile`);
  if (raw) {
    const parsed = JSON.parse(raw) as UserProfile;
    console.log(`User: ${parsed.name}, Theme: ${parsed.preferences.theme}`);
  }
}

// ── Append & string length ─────────────────────────────────────────────────────

export async function appendOperations() {
  await redis.set("log:today", "");
  await redis.append("log:today", "10:00 - User login\n");
  await redis.append("log:today", "10:05 - Page view\n");
  await redis.append("log:today", "10:10 - User logout\n");

  const len = await redis.strlen("log:today");
  const log = await redis.get("log:today");
  console.log(`Log length: ${len} chars`);
  console.log(log);
}

// ── Bit operations ────────────────────────────────────────────────────────────

export async function bitOperations() {
  // Use bit fields to track user activity per day of year (compact!)
  const key = `user:1:active:2024`;

  // Mark days as active
  await redis.setbit(key, 1, 1); // day 1
  await redis.setbit(key, 15, 1); // day 15
  await redis.setbit(key, 30, 1); // day 30

  // Check if user was active on day 15
  const wasActive = await redis.getbit(key, 15);
  console.log(`Active on day 15: ${wasActive === 1}`);

  // Count total active days
  const activeDays = await redis.bitcount(key);
  console.log(`Total active days: ${activeDays}`);
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  await redis.del(
    "user:1:name", "user:1:email", "config:feature-flag",
    "page:views", "product:price", "inventory:widget",
    "session:abc123", "user:1:profile", "log:today", "user:1:active:2024",
    "key1", "key2", "key3"
  );
  redis.disconnect();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await basicGetSet();
  await counters();
  await expiryAndTTL();
  await jsonInString();
  await appendOperations();
  await bitOperations();
  await cleanup();
}

main().catch(console.error);
