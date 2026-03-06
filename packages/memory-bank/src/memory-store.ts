/**
 * @voice-hub/memory-bank
 *
 * 记忆存储实现
 */

import { randomUUID } from "node:crypto";
import type { SessionState, TurnMetadata } from "@voice-hub/shared-types";
import type {
  AppendTaskRunInput,
  CreatePitfallInput,
  CreateSuccessfulPatternInput,
  MemoryEntry,
  SessionRecord,
  QueryOptions,
  MemoryStats,
  PendingAnnouncementRecord,
  PitfallRecord,
  ProcessedWebhookInput,
  ProcessedWebhookRecord,
  QueuePendingAnnouncementInput,
  SuccessfulPatternRecord,
  TaskRunRecord,
} from "./types.js";
import { MemoryType, MemoryStatus } from "./types.js";
import { DatabaseManager } from "./database.js";

/** 记忆存储类 */
export class MemoryStore {
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  // ========== 会话操作 ==========

  /** 创建会话 */
  createSession(
    sessionId: string,
    userId?: string,
    channelId?: string,
  ): SessionRecord {
    const stmt = this.db.getConnection().prepare(`
      INSERT INTO sessions (session_id, state, started_at, user_id, channel_id)
      VALUES (?, 'idle', ?, ?, ?)
    `);

    const now = Date.now();
    stmt.run(sessionId, now, userId || null, channelId || null);

    return this.getSession(sessionId)!;
  }

  /** 获取会话 */
  getSession(sessionId: string): SessionRecord | null {
    const stmt = this.db.getConnection().prepare(`
      SELECT * FROM sessions WHERE session_id = ?
    `);

    const row = stmt.get(sessionId) as SessionRecordRow | undefined;

    if (!row) return null;

    return this.rowToSessionRecord(row);
  }

  /** 更新会话状态 */
  updateSessionState(sessionId: string, state: SessionState): void {
    const stmt = this.db.getConnection().prepare(`
      UPDATE sessions SET state = ? WHERE session_id = ?
    `);
    stmt.run(state, sessionId);
  }

  /** 结束会话 */
  endSession(sessionId: string): void {
    const stmt = this.db.getConnection().prepare(`
      UPDATE sessions SET state = 'idle', ended_at = ? WHERE session_id = ?
    `);
    stmt.run(Date.now(), sessionId);
  }

  /** 获取所有活跃会话 */
  getActiveSessions(): SessionRecord[] {
    const stmt = this.db.getConnection().prepare(`
      SELECT * FROM sessions WHERE state != 'idle' ORDER BY started_at DESC
    `);

    const rows = stmt.all() as SessionRecordRow[];
    return rows.map((row) => this.rowToSessionRecord(row));
  }

  // ========== 记忆操作 ==========

  /** 添加记忆条目 */
  addMemory(
    sessionId: string,
    type: MemoryType,
    content: string,
    metadata?: TurnMetadata | Record<string, unknown>,
    startTime?: number,
    audioPath?: string,
  ): MemoryEntry {
    const id = randomUUID();
    const now = Date.now();

    const stmt = this.db.getConnection().prepare(`
      INSERT INTO memories (
        id, session_id, type, content, metadata,
        start_time, audio_path
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      sessionId,
      type,
      content,
      metadata ? JSON.stringify(metadata) : null,
      startTime || now,
      audioPath || null,
    );

    return this.getMemory(id)!;
  }

  /** 获取记忆条目 */
  getMemory(id: string): MemoryEntry | null {
    const stmt = this.db.getConnection().prepare(`
      SELECT * FROM memories WHERE id = ?
    `);

    const row = stmt.get(id) as MemoryEntryRow | undefined;
    if (!row) return null;

    return this.rowToMemoryEntry(row);
  }

  /** 更新记忆条目 */
  updateMemory(
    id: string,
    updates: Partial<{
      content: string;
      metadata: TurnMetadata | Record<string, unknown>;
      endTime: number;
      audioPath: string;
      status: MemoryStatus;
    }>,
  ): void {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.content !== undefined) {
      fields.push("content = ?");
      values.push(updates.content);
    }
    if (updates.metadata !== undefined) {
      fields.push("metadata = ?");
      values.push(JSON.stringify(updates.metadata));
    }
    if (updates.endTime !== undefined) {
      fields.push("end_time = ?");
      values.push(updates.endTime);
    }
    if (updates.audioPath !== undefined) {
      fields.push("audio_path = ?");
      values.push(updates.audioPath);
    }
    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }

    if (fields.length === 0) return;

    values.push(id);
    const stmt = this.db.getConnection().prepare(`
      UPDATE memories SET ${fields.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  /** 查询记忆条目 */
  queryMemories(sessionId: string, options: QueryOptions = {}): MemoryEntry[] {
    const {
      limit = 100,
      offset = 0,
      orderBy = "startTime",
      order = "ASC",
      types,
      status,
      since,
      until,
    } = options;

    const conditions: string[] = ["session_id = ?"];
    const values: unknown[] = [sessionId];

    if (types && types.length > 0) {
      conditions.push(`type IN (${types.map(() => "?").join(", ")})`);
      values.push(...types);
    }

    if (status) {
      conditions.push("status = ?");
      values.push(status);
    }

    if (since) {
      conditions.push("start_time >= ?");
      values.push(since);
    }

    if (until) {
      conditions.push("start_time <= ?");
      values.push(until);
    }

    const orderByCol = orderBy === "createdAt" ? "created_at" : "start_time";

    const stmt = this.db.getConnection().prepare(`
      SELECT * FROM memories
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderByCol} ${order}
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(...values, limit, offset) as MemoryEntryRow[];
    return rows.map((row) => this.rowToMemoryEntry(row));
  }

  /** 获取会话的最近记忆 */
  getRecentMemories(sessionId: string, count = 10): MemoryEntry[] {
    return this.queryMemories(sessionId, {
      limit: count,
      orderBy: "startTime",
      order: "DESC",
    });
  }

  /** 获取会话的对话历史（用户 + 助手） */
  getConversationHistory(
    sessionId: string,
    options: QueryOptions = {},
  ): MemoryEntry[] {
    return this.queryMemories(sessionId, {
      ...options,
      types: [MemoryType.USER, MemoryType.ASSISTANT],
    });
  }

  /** 删除记忆条目（软删除） */
  deleteMemory(id: string): void {
    this.updateMemory(id, { status: MemoryStatus.DELETED });
  }

  /** 归档记忆条目 */
  archiveMemory(id: string): void {
    this.updateMemory(id, { status: MemoryStatus.ARCHIVED });
  }

  // ========== 统计操作 ==========

  /** 获取统计信息 */
  getStats(): MemoryStats {
    const db = this.db.getConnection();

    // 总会话数
    const totalSessions = db
      .prepare("SELECT count(*) as count FROM sessions")
      .get() as { count: number };

    // 活跃会话数
    const activeSessions = db
      .prepare("SELECT count(*) as count FROM sessions WHERE state != 'idle'")
      .get() as { count: number };

    // 总记忆条目数
    const totalEntries = db
      .prepare("SELECT count(*) as count FROM memories WHERE status = 'active'")
      .get() as { count: number };

    // 按类型分组
    const typeStats = db
      .prepare(
        `
        SELECT type, count(*) as count
        FROM memories
        WHERE status = 'active'
        GROUP BY type
      `,
      )
      .all() as { type: MemoryType; count: number }[];

    const entriesByType: Record<MemoryType, number> = {
      [MemoryType.USER]: 0,
      [MemoryType.ASSISTANT]: 0,
      [MemoryType.SYSTEM]: 0,
      [MemoryType.EVENT]: 0,
      [MemoryType.ERROR]: 0,
    };

    for (const stat of typeStats) {
      entriesByType[stat.type] = stat.count;
    }

    // 数据库大小
    const sizeStmt = db.prepare(
      "SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()",
    );
    const dbSize = (sizeStmt.get() as { size: number }).size;

    return {
      totalSessions: totalSessions.count,
      activeSessions: activeSessions.count,
      totalEntries: totalEntries.count,
      entriesByType,
      dbSize,
    };
  }

  // ========== 清理操作 ==========

  /** 清理旧记忆 */
  cleanupOldMemories(beforeDate: number): number {
    const stmt = this.db.getConnection().prepare(`
      UPDATE memories
      SET status = 'archived'
      WHERE start_time < ? AND status = 'active'
    `);

    const result = stmt.run(beforeDate);
    return result.changes;
  }

  /** 清空会话记忆 */
  clearSessionMemories(sessionId: string): number {
    const stmt = this.db.getConnection().prepare(`
      DELETE FROM memories WHERE session_id = ?
    `);

    const result = stmt.run(sessionId);
    return result.changes;
  }

  recordPitfall(input: CreatePitfallInput): PitfallRecord {
    const record: PitfallRecord = {
      id: randomUUID(),
      keyword: input.keyword.trim().toLowerCase(),
      summary: input.summary.trim(),
      detail: input.detail?.trim() || undefined,
      createdAt: input.createdAt ?? Date.now(),
    };

    this.db
      .getConnection()
      .prepare(
        `
      INSERT INTO pitfalls (id, keyword, summary, detail, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .run(
        record.id,
        record.keyword,
        record.summary,
        record.detail ?? null,
        record.createdAt,
      );

    return record;
  }

  recordSuccessfulPattern(
    input: CreateSuccessfulPatternInput,
  ): SuccessfulPatternRecord {
    const record: SuccessfulPatternRecord = {
      id: randomUUID(),
      keyword: input.keyword.trim().toLowerCase(),
      summary: input.summary.trim(),
      detail: input.detail?.trim() || undefined,
      createdAt: input.createdAt ?? Date.now(),
    };

    this.db
      .getConnection()
      .prepare(
        `
      INSERT INTO successful_patterns (id, keyword, summary, detail, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .run(
        record.id,
        record.keyword,
        record.summary,
        record.detail ?? null,
        record.createdAt,
      );

    return record;
  }

  appendTaskRun(input: AppendTaskRunInput): TaskRunRecord {
    const record: TaskRunRecord = {
      id: randomUUID(),
      taskId: input.taskId,
      keyword: input.keyword.trim().toLowerCase(),
      status: input.status,
      summary: input.summary.trim(),
      happenedAt: input.happenedAt ?? Date.now(),
    };

    this.db.transaction(() => {
      this.db
        .getConnection()
        .prepare(
          `
        INSERT INTO task_runs (id, task_id, keyword, status, summary, happened_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          record.id,
          record.taskId,
          record.keyword,
          record.status,
          record.summary,
          record.happenedAt,
        );

      this.db
        .getConnection()
        .prepare(
          `
        INSERT INTO task_keywords (keyword, last_seen_at, success_count, failure_count)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(keyword) DO UPDATE SET
          last_seen_at = excluded.last_seen_at,
          success_count = task_keywords.success_count + excluded.success_count,
          failure_count = task_keywords.failure_count + excluded.failure_count
      `,
        )
        .run(
          record.keyword,
          record.happenedAt,
          record.status === "success" ? 1 : 0,
          record.status === "failed" ? 1 : 0,
        );
    });

    return record;
  }

  markWebhookProcessed(input: ProcessedWebhookInput): boolean {
    const record: ProcessedWebhookRecord = {
      id: randomUUID(),
      deliveryId: input.deliveryId,
      eventId: input.eventId,
      eventType: input.eventType,
      payloadHash: input.payloadHash,
      processedAt: input.processedAt ?? Date.now(),
    };

    const result = this.db
      .getConnection()
      .prepare(
        `
      INSERT OR IGNORE INTO processed_webhooks (
        id, delivery_id, event_id, event_type, payload_hash, processed_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        record.id,
        record.deliveryId,
        record.eventId,
        record.eventType,
        record.payloadHash ?? null,
        record.processedAt,
      );

    return result.changes > 0;
  }

  isWebhookProcessed(deliveryId: string, eventId: string): boolean {
    const result = this.db
      .getConnection()
      .prepare(
        `
      SELECT count(*) as count
      FROM processed_webhooks
      WHERE delivery_id = ? AND event_id = ?
    `,
      )
      .get(deliveryId, eventId) as { count: number } | undefined;

    return (result?.count ?? 0) > 0;
  }

  queuePendingAnnouncement(
    input: QueuePendingAnnouncementInput,
  ): PendingAnnouncementRecord {
    const dedupeKey = input.dedupeKey?.trim() || undefined;
    if (dedupeKey) {
      const existing = this.db
        .getConnection()
        .prepare(
          `
        SELECT *
        FROM pending_announcements
        WHERE dedupe_key = ? AND resolved_at IS NULL
        LIMIT 1
      `,
        )
        .get(dedupeKey) as PendingAnnouncementRow | undefined;

      if (existing) {
        return this.rowToPendingAnnouncement(existing);
      }
    }

    const record: PendingAnnouncementRecord = {
      id: randomUUID(),
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      providerId: input.providerId,
      text: input.text.trim(),
      priority: input.priority ?? "queued",
      dedupeKey,
      ttlMs: input.ttlMs ?? 5 * 60 * 1000,
      createdAt: input.createdAt ?? Date.now(),
    };

    this.db
      .getConnection()
      .prepare(
        `
      INSERT INTO pending_announcements (
        id, session_id, conversation_id, provider_id, text, priority, dedupe_key, ttl_ms, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        record.id,
        record.sessionId ?? null,
        record.conversationId ?? null,
        record.providerId ?? null,
        record.text,
        record.priority,
        record.dedupeKey ?? null,
        record.ttlMs,
        record.createdAt,
      );

    return record;
  }

  listPendingAnnouncements(now = Date.now()): PendingAnnouncementRecord[] {
    const rows = this.db
      .getConnection()
      .prepare(
        `
      SELECT *
      FROM pending_announcements
      WHERE resolved_at IS NULL
        AND (created_at + ttl_ms) > ?
      ORDER BY created_at ASC
    `,
      )
      .all(now) as PendingAnnouncementRow[];

    return rows.map((row) => this.rowToPendingAnnouncement(row));
  }

  resolvePendingAnnouncement(id: string, resolvedAt = Date.now()): void {
    this.db
      .getConnection()
      .prepare(
        `
      UPDATE pending_announcements
      SET resolved_at = ?
      WHERE id = ?
    `,
      )
      .run(resolvedAt, id);
  }

  cleanupRetention(
    now = Date.now(),
    retentionMs = 30 * 24 * 60 * 60 * 1000,
  ): {
    archivedMemories: number;
    deletedWebhooks: number;
    deletedAnnouncements: number;
  } {
    const archivedMemories = this.cleanupOldMemories(now - retentionMs);
    const deletedWebhooks = this.db
      .getConnection()
      .prepare(
        `
      DELETE FROM processed_webhooks
      WHERE processed_at < ?
    `,
      )
      .run(now - retentionMs).changes;
    const deletedAnnouncements = this.db
      .getConnection()
      .prepare(
        `
      DELETE FROM pending_announcements
      WHERE resolved_at IS NOT NULL OR (created_at + ttl_ms) <= ?
    `,
      )
      .run(now).changes;

    this.db.checkpoint("PASSIVE");

    return {
      archivedMemories,
      deletedWebhooks,
      deletedAnnouncements,
    };
  }

  buildAugmentedPrompt(query: string, limit = 8): string {
    const tokens = this.extractQueryTokens(query);
    const likePattern = `%${query.trim().toLowerCase()}%`;
    const db = this.db.getConnection();

    const patterns = db
      .prepare(
        `
      SELECT keyword, summary, detail, created_at, 'success' as source
      FROM successful_patterns
      WHERE keyword IN (${tokens.map(() => "?").join(", ") || "''"})
         OR lower(summary) LIKE ?
         OR lower(coalesce(detail, '')) LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
      )
      .all(...tokens, likePattern, likePattern, limit) as PromptRow[];

    const pitfalls = db
      .prepare(
        `
      SELECT keyword, summary, detail, created_at, 'pitfall' as source
      FROM pitfalls
      WHERE keyword IN (${tokens.map(() => "?").join(", ") || "''"})
         OR lower(summary) LIKE ?
         OR lower(coalesce(detail, '')) LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
      )
      .all(...tokens, likePattern, likePattern, limit) as PromptRow[];

    const taskRuns = db
      .prepare(
        `
      SELECT keyword, summary, NULL as detail, happened_at as created_at,
             CASE status WHEN 'success' THEN 'task-success' ELSE 'task-failure' END as source
      FROM task_runs
      WHERE keyword IN (${tokens.map(() => "?").join(", ") || "''"})
         OR lower(summary) LIKE ?
      ORDER BY
        CASE status WHEN 'success' THEN 0 WHEN 'failed' THEN 1 ELSE 2 END,
        happened_at DESC
      LIMIT ?
    `,
      )
      .all(...tokens, likePattern, limit) as PromptRow[];

    const lines = [
      "Memory bank guidance:",
      ...patterns.map(
        (row) => `- Successful pattern [${row.keyword}]: ${row.summary}`,
      ),
      ...pitfalls.map((row) => `- Pitfall [${row.keyword}]: ${row.summary}`),
      ...taskRuns.map((row) => `- Recent ${row.source}: ${row.summary}`),
    ];

    return lines.join("\n");
  }

  // ========== 私有方法 ==========

  private rowToSessionRecord(row: SessionRecordRow): SessionRecord {
    return {
      sessionId: row.session_id,
      state: row.state as SessionState,
      startedAt: row.started_at,
      endedAt: row.ended_at || undefined,
      userId: row.user_id || undefined,
      channelId: row.channel_id || undefined,
      metadata: row.metadata || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private rowToMemoryEntry(row: MemoryEntryRow): MemoryEntry {
    return {
      id: row.id,
      sessionId: row.session_id,
      type: row.type as MemoryType,
      status: row.status as MemoryStatus,
      content: row.content,
      metadata: row.metadata || undefined,
      startTime: row.start_time,
      endTime: row.end_time || undefined,
      audioPath: row.audio_path || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private rowToPendingAnnouncement(
    row: PendingAnnouncementRow,
  ): PendingAnnouncementRecord {
    return {
      id: row.id,
      sessionId: row.session_id || undefined,
      conversationId: row.conversation_id || undefined,
      providerId: row.provider_id || undefined,
      text: row.text,
      priority: row.priority as PendingAnnouncementRecord["priority"],
      dedupeKey: row.dedupe_key || undefined,
      ttlMs: row.ttl_ms,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at || undefined,
    };
  }

  private extractQueryTokens(query: string): string[] {
    const tokens = query
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);

    return tokens.length > 0 ? Array.from(new Set(tokens)) : [""];
  }
}

// ========== 数据库行类型 ==========

interface SessionRecordRow {
  session_id: string;
  state: string;
  started_at: number;
  ended_at: number | null;
  user_id: string | null;
  channel_id: string | null;
  metadata: string | null;
  created_at: number;
  updated_at: number;
}

interface MemoryEntryRow {
  id: string;
  session_id: string;
  type: string;
  status: string;
  content: string;
  metadata: string | null;
  start_time: number;
  end_time: number | null;
  audio_path: string | null;
  created_at: number;
  updated_at: number;
}

interface PendingAnnouncementRow {
  id: string;
  session_id: string | null;
  conversation_id: string | null;
  provider_id: string | null;
  text: string;
  priority: string;
  dedupe_key: string | null;
  ttl_ms: number;
  created_at: number;
  resolved_at: number | null;
}

interface PromptRow {
  keyword: string;
  summary: string;
  detail: string | null;
  created_at: number;
  source: string;
}
