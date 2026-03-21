/**
 * Redis Lists & Queues
 * Demonstrates: LPUSH/RPUSH, LPOP/RPOP, LRANGE, BLPOP, task queues, recent activity
 */
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });

// ── Basic list operations ──────────────────────────────────────────────────────

export async function basicListOps() {
  // RPUSH — append to right (end of list)
  await redis.rpush("notifications:user:1", "You have a new message", "Friend request received");

  // LPUSH — prepend to left (front of list)
  await redis.lpush("notifications:user:1", "Urgent: Account login detected");

  // LRANGE — get range (0, -1 = entire list)
  const notifications = await redis.lrange("notifications:user:1", 0, -1);
  console.log("Notifications:", notifications);

  // LLEN — length
  const count = await redis.llen("notifications:user:1");
  console.log(`Notification count: ${count}`);

  // LINDEX — get element at index
  const first = await redis.lindex("notifications:user:1", 0);
  console.log(`First notification: ${first}`);

  // LSET — update element at index
  await redis.lset("notifications:user:1", 0, "Urgent: Updated notification");

  // LINSERT — insert before/after pivot
  await redis.linsert("notifications:user:1", "BEFORE", "Friend request received", "New comment on your post");
}

// ── Queue pattern (FIFO) ──────────────────────────────────────────────────────

export interface Job {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

const QUEUE_KEY = "queue:jobs";

export async function enqueueJob(job: Omit<Job, "createdAt">) {
  const item: Job = { ...job, createdAt: new Date().toISOString() };
  await redis.rpush(QUEUE_KEY, JSON.stringify(item));
  console.log(`Enqueued job: ${job.type} (${job.id})`);
}

export async function dequeueJob(): Promise<Job | null> {
  const raw = await redis.lpop(QUEUE_KEY);
  if (!raw) return null;
  const job = JSON.parse(raw) as Job;
  console.log(`Processing job: ${job.type}`);
  return job;
}

export async function queueDemo() {
  // Enqueue 3 jobs
  await enqueueJob({ id: "j1", type: "send-email", payload: { to: "alice@example.com" } });
  await enqueueJob({ id: "j2", type: "resize-image", payload: { imageId: "img-99" } });
  await enqueueJob({ id: "j3", type: "generate-report", payload: { reportType: "monthly" } });

  // Dequeue and process
  let job: Job | null;
  while ((job = await dequeueJob()) !== null) {
    console.log(`✓ Processed: ${job.type}`);
  }
}

// ── Blocking pop (BLPOP) ──────────────────────────────────────────────────────

export async function blockingConsumer() {
  // BLPOP blocks until an item is available or timeout is reached
  // Useful for worker processes — no polling needed
  const result = await redis.blpop("queue:priority", 2); // 2s timeout
  if (result) {
    const [key, value] = result;
    console.log(`Got from ${key}: ${value}`);
  } else {
    console.log("No item available within timeout");
  }
}

// ── Stack pattern (LIFO with LPUSH + LPOP) ────────────────────────────────────

export async function stackPattern() {
  const STACK_KEY = "undo:stack:user:1";

  // Push operations to undo stack
  await redis.lpush(STACK_KEY, JSON.stringify({ action: "create", resourceId: "post:1" }));
  await redis.lpush(STACK_KEY, JSON.stringify({ action: "update", resourceId: "post:1" }));
  await redis.lpush(STACK_KEY, JSON.stringify({ action: "delete", resourceId: "post:2" }));

  // Limit stack size to last 10 actions
  await redis.ltrim(STACK_KEY, 0, 9);

  // Undo — pop from front
  const last = await redis.lpop(STACK_KEY);
  if (last) {
    const op = JSON.parse(last) as { action: string; resourceId: string };
    console.log(`Undoing: ${op.action} on ${op.resourceId}`);
  }

  await redis.del(STACK_KEY);
}

// ── Recent activity feed ───────────────────────────────────────────────────────

export async function recentActivityFeed() {
  const FEED_KEY = "activity:global";
  const MAX_ITEMS = 20;

  // Add recent activities (newest first)
  await redis.lpush(FEED_KEY,
    JSON.stringify({ user: "Alice", action: "published a post", ts: Date.now() }),
    JSON.stringify({ user: "Bob", action: "commented on post #5", ts: Date.now() })
  );

  // Trim to keep only last N items
  await redis.ltrim(FEED_KEY, 0, MAX_ITEMS - 1);

  // Get latest 5 activities
  const recent = await redis.lrange(FEED_KEY, 0, 4);
  const activities = recent.map((r) => JSON.parse(r) as { user: string; action: string });
  activities.forEach((a) => console.log(`${a.user}: ${a.action}`));

  await redis.del(FEED_KEY);
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

export async function cleanup() {
  await redis.del("notifications:user:1", QUEUE_KEY);
  redis.disconnect();
}

async function main() {
  await basicListOps();
  await queueDemo();
  await blockingConsumer();
  await stackPattern();
  await recentActivityFeed();
  await cleanup();
}

main().catch(console.error);
