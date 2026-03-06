import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { DatabaseManager, MemoryStore, MemoryType } from "../src/index.js";

describe("memory-bank database", () => {
  let fixtureDir: string;
  let db: DatabaseManager;
  let store: MemoryStore;

  beforeEach(() => {
    fixtureDir = mkdtempSync(join(tmpdir(), "voice-hub-memory-"));
    db = new DatabaseManager({
      dbPath: join(fixtureDir, "memory-bank.db"),
      walEnabled: true,
      busyTimeout: 2500,
      foreignKeys: true,
      logLevel: "error",
    });
    db.init();
    store = new MemoryStore(db);
  });

  afterEach(() => {
    db.close();
    rmSync(fixtureDir, { recursive: true, force: true });
  });

  it("initializes sqlite with wal enabled", () => {
    const stats = db.getStats();

    expect(db.tableExists("sessions")).toBe(true);
    expect(db.tableExists("memories")).toBe(true);
    expect(db.tableExists("pitfalls")).toBe(true);
    expect(db.tableExists("successful_patterns")).toBe(true);
    expect(db.tableExists("task_runs")).toBe(true);
    expect(db.tableExists("task_keywords")).toBe(true);
    expect(db.tableExists("processed_webhooks")).toBe(true);
    expect(db.tableExists("pending_announcements")).toBe(true);
    expect(stats.walMode).toBe(true);
    expect(stats.pageSize).toBeGreaterThan(0);
  });

  it("creates sessions and stores conversation history", () => {
    const session = store.createSession("session-1", "user-1", "channel-1");
    const memory = store.addMemory(
      session.sessionId,
      MemoryType.USER,
      "hello world",
      { provider: "local-mock" },
    );

    const history = store.getConversationHistory(session.sessionId);
    const stats = store.getStats();

    expect(session.userId).toBe("user-1");
    expect(memory.content).toBe("hello world");
    expect(history).toHaveLength(1);
    expect(history[0]?.id).toBe(memory.id);
    expect(stats.totalSessions).toBe(1);
    expect(stats.totalEntries).toBe(1);
  });

  it("tracks processed webhooks idempotently", () => {
    const first = store.markWebhookProcessed({
      deliveryId: "delivery-1",
      eventId: "event-1",
      eventType: "backend_task.completed",
      processedAt: 100,
      payloadHash: "hash-1",
    });
    const duplicate = store.markWebhookProcessed({
      deliveryId: "delivery-1",
      eventId: "event-1",
      eventType: "backend_task.completed",
      processedAt: 200,
      payloadHash: "hash-1",
    });

    expect(first).toBe(true);
    expect(duplicate).toBe(false);
    expect(store.isWebhookProcessed("delivery-1", "event-1")).toBe(true);
  });

  it("queues and resolves pending announcements", () => {
    const announcement = store.queuePendingAnnouncement({
      sessionId: "session-1",
      conversationId: "conversation-1",
      providerId: "local-mock",
      text: "build completed",
      priority: "queued",
      dedupeKey: "build-1",
      ttlMs: 60_000,
      createdAt: 123,
    });

    const duplicate = store.queuePendingAnnouncement({
      sessionId: "session-1",
      conversationId: "conversation-1",
      providerId: "local-mock",
      text: "build completed",
      priority: "queued",
      dedupeKey: "build-1",
      ttlMs: 60_000,
      createdAt: 124,
    });

    expect(announcement.id).toBeTruthy();
    expect(duplicate.id).toBe(announcement.id);
    expect(store.listPendingAnnouncements(124)).toHaveLength(1);

    store.resolvePendingAnnouncement(announcement.id, 200);
    expect(store.listPendingAnnouncements(201)).toHaveLength(0);
  });

  it("builds augmented prompts from keyword matches and recent outcomes", () => {
    store.recordPitfall({
      keyword: "timeout",
      summary: "Avoid blocking the audio pump with synchronous webhook work.",
      detail: "Move webhook execution onto an async queue.",
      createdAt: 100,
    });
    store.recordSuccessfulPattern({
      keyword: "webhook",
      summary: "Use fast ACK plus replay-safe dedupe.",
      detail: "Persist processed delivery ids before side effects.",
      createdAt: 200,
    });
    store.appendTaskRun({
      taskId: "task-1",
      keyword: "webhook",
      status: "success",
      summary: "Async ACK path shipped cleanly.",
      happenedAt: 300,
    });
    store.appendTaskRun({
      taskId: "task-2",
      keyword: "timeout",
      status: "failed",
      summary: "Blocking webhook path caused timeouts.",
      happenedAt: 400,
    });

    const prompt = store.buildAugmentedPrompt("Need webhook timeout guidance");

    expect(prompt).toContain("fast ACK plus replay-safe dedupe");
    expect(prompt).toContain("Avoid blocking the audio pump");
    expect(prompt).toContain("Blocking webhook path caused timeouts");
  });
});
