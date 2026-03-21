/**
 * Redis Sets & Sorted Sets
 * Demonstrates: SADD/SMEMBERS, set operations, ZADD/ZRANGE, leaderboards, tag indexing
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Basic set operations ───────────────────────────────────────────────────────

export async function basicSetOps() {
  // SADD — add members
  await redis.sadd("tags:post:1", "typescript", "graphql", "nodejs");
  await redis.sadd("tags:post:2", "typescript", "react", "nextjs");
  await redis.sadd("tags:post:3", "graphql", "react", "apollo");

  // SMEMBERS — get all members
  const tags = await redis.smembers("tags:post:1");
  console.log("Post 1 tags:", tags);

  // SISMEMBER — check membership
  const hasTag = await redis.sismember("tags:post:1", "typescript");
  console.log(`Has typescript: ${hasTag === 1}`);

  // SCARD — count members
  const count = await redis.scard("tags:post:1");
  console.log(`Tag count: ${count}`);

  // SMISMEMBER — batch membership check
  const results = await redis.smismember("tags:post:1", "typescript", "vue", "graphql");
  console.log("Batch check:", results); // [1, 0, 1]
}

// ── Set intersection / union / difference ─────────────────────────────────────

export async function setOperations() {
  await redis.sadd("followers:alice", "bob", "carol", "dave");
  await redis.sadd("followers:bob", "alice", "carol", "eve");

  // SINTER — common followers
  const mutual = await redis.sinter("followers:alice", "followers:bob");
  console.log("Mutual followers:", mutual); // carol

  // SUNION — all unique followers
  const all = await redis.sunion("followers:alice", "followers:bob");
  console.log("All followers:", all);

  // SDIFF — alice's followers who don't follow bob
  const diff = await redis.sdiff("followers:alice", "followers:bob");
  console.log("Alice-only followers:", diff); // dave

  // Store results in a new key
  await redis.sinterstore("mutual:alice:bob", "followers:alice", "followers:bob");
  await redis.expire("mutual:alice:bob", 3600);

  await redis.del("followers:alice", "followers:bob", "mutual:alice:bob");
}

// ── Online users set ──────────────────────────────────────────────────────────

export async function onlineUsersSet() {
  const ONLINE_KEY = "users:online";

  // Mark users as online
  await redis.sadd(ONLINE_KEY, "user:1", "user:2", "user:3");
  await redis.expire(ONLINE_KEY, 300); // 5 minute window

  // Random sample (for "who's online" widget)
  const sample = await redis.srandmember(ONLINE_KEY, 2);
  console.log("Random online users:", sample);

  // Remove user (disconnect)
  await redis.srem(ONLINE_KEY, "user:2");

  const online = await redis.smembers(ONLINE_KEY);
  console.log("Online users:", online);
  await redis.del(ONLINE_KEY);
}

// ── Sorted set — leaderboard ─────────────────────────────────────────────────

export async function leaderboard() {
  const BOARD_KEY = "leaderboard:weekly";

  // ZADD — add with score
  await redis.zadd(BOARD_KEY,
    1500, "alice",
    2300, "bob",
    1800, "carol",
    3100, "dave",
    900, "eve"
  );

  // ZRANGE with scores (ascending) — Redis 6.2+ syntax
  const bottom = await redis.zrange(BOARD_KEY, 0, -1, "WITHSCORES");
  console.log("All players (asc):", bottom);

  // Top 3 (descending)
  const top3 = await redis.zrevrange(BOARD_KEY, 0, 2, "WITHSCORES");
  console.log("Top 3:", top3);

  // Player rank (0-indexed, use ZREVRANK for descending)
  const aliceRank = await redis.zrevrank(BOARD_KEY, "alice");
  console.log(`Alice's rank: ${(aliceRank ?? -1) + 1}`); // 1-indexed display

  // Player score
  const aliceScore = await redis.zscore(BOARD_KEY, "alice");
  console.log(`Alice's score: ${aliceScore}`);

  // Increment score
  const newScore = await redis.zincrby(BOARD_KEY, 500, "alice");
  console.log(`Alice's new score: ${newScore}`);

  // Players in score range
  const midRange = await redis.zrangebyscore(BOARD_KEY, 1000, 2000, "WITHSCORES");
  console.log("Players with 1000-2000 points:", midRange);

  await redis.del(BOARD_KEY);
}

// ── Sorted set — time series / event log ─────────────────────────────────────

export async function timeSeriesLog() {
  const LOG_KEY = "events:recent";

  // Use timestamp as score
  const now = Date.now();
  await redis.zadd(LOG_KEY,
    now - 5000, JSON.stringify({ type: "login", user: "alice" }),
    now - 3000, JSON.stringify({ type: "page_view", page: "/home" }),
    now - 1000, JSON.stringify({ type: "click", element: "buy_button" }),
    now,        JSON.stringify({ type: "purchase", amount: 29.99 })
  );

  // Get events from last 4 seconds
  const recent = await redis.zrangebyscore(LOG_KEY, now - 4000, "+inf");
  console.log("Recent events:", recent.map((e) => JSON.parse(e)));

  // Remove events older than 10s
  await redis.zremrangebyscore(LOG_KEY, "-inf", now - 10000);

  await redis.del(LOG_KEY);
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  await redis.del("tags:post:1", "tags:post:2", "tags:post:3");
  redis.disconnect();
}

async function main() {
  await basicSetOps();
  await setOperations();
  await onlineUsersSet();
  await leaderboard();
  await timeSeriesLog();
  await cleanup();
}

main().catch(console.error);
