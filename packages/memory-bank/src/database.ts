/**
 * @voice-hub/memory-bank
 *
 * SQLite 数据库管理
 */

import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { inspect } from "node:util";
import type { MemoryBankConfig } from "./types.js";

/** SQL 初始化脚本 */
const SCHEMA = `
-- 会话表
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  state TEXT NOT NULL CHECK(state IN ('idle', 'listening', 'processing', 'responding')),
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  user_id TEXT,
  channel_id TEXT,
  metadata TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_sessions_state ON sessions(state);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 记忆表
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('user', 'assistant', 'system', 'event', 'error')),
  status TEXT NOT NULL CHECK(status IN ('active', 'archived', 'deleted')) DEFAULT 'active',
  content TEXT NOT NULL,
  metadata TEXT,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  audio_path TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_memories_session_id ON memories(session_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_status ON memories(status);
CREATE INDEX IF NOT EXISTS idx_memories_start_time ON memories(start_time);

CREATE TABLE IF NOT EXISTS pitfalls (
  id TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pitfalls_keyword ON pitfalls(keyword);
CREATE INDEX IF NOT EXISTS idx_pitfalls_created_at ON pitfalls(created_at DESC);

CREATE TABLE IF NOT EXISTS successful_patterns (
  id TEXT PRIMARY KEY,
  keyword TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_successful_patterns_keyword ON successful_patterns(keyword);
CREATE INDEX IF NOT EXISTS idx_successful_patterns_created_at ON successful_patterns(created_at DESC);

CREATE TABLE IF NOT EXISTS task_runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'running', 'cancelled')),
  summary TEXT NOT NULL,
  happened_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_runs_task_id ON task_runs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_runs_keyword ON task_runs(keyword);
CREATE INDEX IF NOT EXISTS idx_task_runs_happened_at ON task_runs(happened_at DESC);

CREATE TABLE IF NOT EXISTS task_keywords (
  keyword TEXT PRIMARY KEY,
  last_seen_at INTEGER NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS processed_webhooks (
  id TEXT PRIMARY KEY,
  delivery_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_hash TEXT,
  processed_at INTEGER NOT NULL,
  UNIQUE(delivery_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_processed_webhooks_processed_at ON processed_webhooks(processed_at DESC);

CREATE TABLE IF NOT EXISTS pending_announcements (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  conversation_id TEXT,
  provider_id TEXT,
  text TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('immediate', 'after-current-turn', 'queued')),
  dedupe_key TEXT,
  ttl_ms INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_pending_announcements_created_at ON pending_announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_announcements_resolved_at ON pending_announcements(resolved_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_announcements_dedupe_key
  ON pending_announcements(dedupe_key)
  WHERE dedupe_key IS NOT NULL;

-- 触发器：自动更新 updated_at
CREATE TRIGGER IF NOT EXISTS update_sessions_timestamp
AFTER UPDATE ON sessions
BEGIN
  UPDATE sessions SET updated_at = (strftime('%s', 'now') * 1000) WHERE session_id = NEW.session_id;
END;

CREATE TRIGGER IF NOT EXISTS update_memories_timestamp
AFTER UPDATE ON memories
BEGIN
  UPDATE memories SET updated_at = (strftime('%s', 'now') * 1000) WHERE id = NEW.id;
END;
`;

/** 数据库连接管理器 */
export class DatabaseManager {
  private db: Database.Database | null = null;
  private config: MemoryBankConfig;
  private isInitialized = false;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(config: MemoryBankConfig) {
    this.config = config;
  }

  /** 获取数据库连接 */
  getConnection(): Database.Database {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return this.db;
  }

  /** 初始化数据库 */
  init(): void {
    if (this.isInitialized) {
      return;
    }

    // 确保目录存在
    const dbDir = dirname(this.config.dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    // 创建数据库连接
    this.db = new Database(this.config.dbPath, {
      verbose:
        this.config.logLevel === "debug"
          ? (...args: unknown[]) => this.logSqliteDebug(args)
          : undefined,
    });

    // 配置连接
    this.configure();

    // 执行初始化脚本
    this.db.exec(SCHEMA);
    this.seedDefaults();

    this.isInitialized = true;
  }

  /** 关闭数据库 */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /** 检查是否打开 */
  isOpen(): boolean {
    return this.db !== null && this.db.open;
  }

  /** 配置数据库 */
  private configure(): void {
    if (!this.db) return;

    // 启用 WAL 模式
    if (this.config.walEnabled) {
      this.db.pragma("journal_mode = WAL");
    }

    // 设置忙碌超时
    this.db.pragma(`busy_timeout = ${this.config.busyTimeout}`);

    // 启用外键约束
    if (this.config.foreignKeys) {
      this.db.pragma("foreign_keys = ON");
    }

    // 优化设置
    this.db.pragma("synchronous = NORMAL");
    this.db.pragma("cache_size = -16000"); // 16MB cache
    this.db.pragma("temp_store = MEMORY");
  }

  /** 开始事务 */
  beginTransaction(): void {
    this.getConnection().exec("BEGIN IMMEDIATE TRANSACTION");
  }

  /** 提交事务 */
  commit(): void {
    this.getConnection().exec("COMMIT");
  }

  /** 回滚事务 */
  rollback(): void {
    this.getConnection().exec("ROLLBACK");
  }

  /** 执行批量操作（在事务中） */
  transaction<T>(fn: () => T): T {
    return this.getConnection().transaction(fn)();
  }

  async enqueueWrite<T>(fn: (db: Database.Database) => T): Promise<T> {
    const run = this.writeQueue.then(() => fn(this.getConnection()));
    this.writeQueue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  checkpoint(
    mode: "PASSIVE" | "FULL" | "RESTART" | "TRUNCATE" = "PASSIVE",
  ): void {
    this.getConnection().pragma(`wal_checkpoint(${mode})`);
  }

  /** 检查表是否存在 */
  tableExists(tableName: string): boolean {
    const stmt = this.getConnection().prepare(
      "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name=?",
    );
    const result = stmt.get(tableName) as { count: number } | undefined;
    return (result?.count ?? 0) > 0;
  }

  /** 获取数据库统计信息 */
  getStats(): {
    walMode: boolean;
    pageSize: number;
    pageCount: number;
    cacheSize: number;
  } {
    const db = this.getConnection();

    return {
      walMode: db.pragma("journal_mode", { simple: true }) === "wal",
      pageSize: db.pragma("page_size", { simple: true }) as number,
      pageCount: db.pragma("page_count", { simple: true }) as number,
      cacheSize: db.pragma("cache_size", { simple: true }) as number,
    };
  }

  private logSqliteDebug(args: unknown[]): void {
    const message = args
      .map((value) => {
        if (typeof value === "string") {
          return value;
        }
        return inspect(value, { depth: 3, breakLength: 120 });
      })
      .join(" ");
    process.stdout.write(`[memory-bank][sqlite] ${message}\n`);
  }

  private seedDefaults(): void {
    const now = Date.now();
    const statement = this.getConnection().prepare(`
      INSERT OR IGNORE INTO successful_patterns (id, keyword, summary, detail, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    statement.run(
      "seed-successful-pattern-webhook-ack",
      "webhook",
      "Fast ACK plus async processing keeps the voice path responsive.",
      "Persist replay-safe delivery ids before executing side effects.",
      now,
    );

    statement.run(
      "seed-successful-pattern-audio-pump",
      "audio",
      "Keep DB and webhook work off the audio pump.",
      "Use queues between realtime ingress/egress and slower subsystems.",
      now,
    );
  }
}
