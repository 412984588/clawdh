#!/usr/bin/env node
// forge-shared.js - v1.1.0
// 所有 Forge hooks 的共享存储层
//
// 修复：
// - P1#5  safeReadJson：区分"不存在"和"JSON损坏"，损坏不覆写
// - P1#7  getTmpDir + sanitizeSessionId：消除 /tmp 路径预测和穿越风险
// - P2#14 logHookError：统一 JSONL 错误日志，不再静默 catch
// - 并发安全：advisory lock（mkdir-based）+ 原子写（PID+ts tmp+rename）
// - F17:  resolveProjectRoot：统一 worktree/子目录 → git repo root，消除身份分裂
// - F18:  resolveSlug：新项目用 hashed slug，保证首次创建无竞态碰撞
// - F20:  logHookEvent：events.jsonl 加 5MB 轮转

'use strict';

const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

// ─── 路径 / slug ───────────────────────────────────────────────────────────────

function slugify(p) {
  return p.replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

// F17: 统一 CWD → Git repo root（解决 worktree/子目录产生不同身份的问题）
// 优先 git rev-parse，其次走 .planning/ 向上查找，最后 fallback 原 cwd
function resolveProjectRoot(cwd) {
  const resolved = path.resolve(cwd);
  // 1. git rev-parse --show-toplevel（最可靠：worktrees 也返回主 repo root）
  try {
    const root = execFileSync(
      'git', ['rev-parse', '--show-toplevel'],
      { cwd: resolved, encoding: 'utf8', timeout: 2000 }
    ).trim();
    if (root && fs.existsSync(root)) return root;
  } catch (_) {}
  // 2. 走 .planning/ 向上查找（最多 12 层，F19 同步修复）
  let dir = resolved;
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, '.planning'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // 3. fallback
  return resolved;
}

// F18: resolveSlug 保证全局唯一
// - 已有 state.json → 向后兼容（simple or hashed，哪个存在用哪个）
// - 全新项目 → 用 hashed slug 避免首次创建时的竞态碰撞
function resolveSlug(cwd) {
  const root     = resolveProjectRoot(cwd);  // F17: 统一到 repo root
  const baseName = slugify(path.basename(root));
  const hash     = crypto.createHash('md5').update(root).digest('hex').slice(0, 8);
  const hashedSlug = `${baseName}-${hash}`;

  // 1. hashed slug 已有记录 → 该项目已明确使用 hashed slug
  if (fs.existsSync(path.join(os.homedir(), '.forge', 'projects', hashedSlug, 'state.json'))) {
    return hashedSlug;
  }

  // 2. simple slug 的 state.json 存在
  const simpleStatePath = path.join(os.homedir(), '.forge', 'projects', baseName, 'state.json');
  if (fs.existsSync(simpleStatePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(simpleStatePath, 'utf8'));
      // 属于本项目 → 保留 simple slug（向后兼容）
      if (!existing.project_path || path.resolve(existing.project_path) === root) {
        return baseName;
      }
      // 属于不同项目 → 使用 hashed slug
      return hashedSlug;
    } catch (_) {
      return hashedSlug;  // 读取出错 → 保守使用 hashed slug
    }
  }

  // 3. 新项目：F18 fix — 使用 hashed slug 保证全局唯一，消除初始化竞态碰撞
  return hashedSlug;
}

// bridge 路径：从 /tmp 迁移到 ~/.forge/runtime/bridges/（P1#7：消除 /tmp 预测风险）
// F17: 使用 resolveProjectRoot 确保 worktree 和主 repo 共享同一 bridge
function getBridgePath(cwd) {
  const root = resolveProjectRoot(cwd);  // F17
  const h    = crypto.createHash('md5').update(root).digest('hex').slice(0, 12);
  const dir  = path.join(os.homedir(), '.forge', 'runtime', 'bridges', h);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'bridge.json');
}

// 安全临时目录：~/.forge/runtime/tmp/（仅所有者可读写，P1#7）
function getTmpDir() {
  const d = path.join(os.homedir(), '.forge', 'runtime', 'tmp');
  fs.mkdirSync(d, { recursive: true });
  try { fs.chmodSync(d, 0o700); } catch (_) {}
  return d;
}

// session ID 白名单校验（防止路径穿越，P1#7）
// 只允许 /^[\w.-]{1,64}$/ ，其他一律返回 null
function sanitizeSessionId(id) {
  if (!id || typeof id !== 'string') return null;
  if (/^[\w.-]{1,64}$/.test(id)) return id;
  return null;
}

// ─── 安全 JSON 读写（P1#5）────────────────────────────────────────────────────

// 返回 { exists, data, corrupt }
// - exists:false  → 文件不存在，data = fallback
// - exists:true, corrupt:false → 正常读取，data = parsed
// - exists:true, corrupt:true  → 解析失败，data = null，不覆写文件
function safeReadJson(p, fallback) {
  if (!fs.existsSync(p)) return { exists: false, data: fallback, corrupt: false };
  try {
    return { exists: true, data: JSON.parse(fs.readFileSync(p, 'utf8')), corrupt: false };
  } catch (e) {
    logHookError('safeReadJson', e, { path: p });
    return { exists: true, data: null, corrupt: true };
  }
}

// 原子写：PID+ts 唯一 tmp 名，rename 替换（P1#1 并发安全）
function writeJsonAtomic(p, value) {
  const dir = path.dirname(p);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${p}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  try {
    fs.renameSync(tmp, p);
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch (_) {}
    throw e;
  }
}

// ─── Advisory Lock（mkdir-based，无外部依赖）──────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function isProcessAlive(pid) {
  try { process.kill(pid, 0); return true; } catch (_) { return false; }
}

// lockDir：专用锁目录路径（调用者指定，通常 bridgePath + '.lock'）
// fn：async 函数，持锁期间执行
// opts：{ waitMs=5000, retryMs=50, staleMs=20000 }
async function withAdvisoryLock(lockDir, fn, opts = {}) {
  const { waitMs = 5000, retryMs = 50, staleMs = 20000 } = opts;
  const deadline = Date.now() + waitMs;

  while (true) {
    try {
      fs.mkdirSync(lockDir);  // 原子操作：成功 = 拿到锁
      // 写 PID 文件用于 stale 检测
      fs.writeFileSync(path.join(lockDir, 'pid'), String(process.pid));
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      // 检查锁是否 stale
      try {
        const lockPid  = parseInt(fs.readFileSync(path.join(lockDir, 'pid'), 'utf8'));
        const lockStat = fs.statSync(lockDir);
        const isStale  = Date.now() - lockStat.mtimeMs > staleMs;
        const isDead   = !isProcessAlive(lockPid);
        if (isStale || isDead) {
          fs.rmSync(lockDir, { recursive: true });
          continue;  // 清除后立即重试
        }
      } catch (_) {
        // F04 fix：无法读 pid → 锁可能刚创建还未写完，先检查锁龄再决定是否清除
        let lockAge;
        try { lockAge = Date.now() - fs.statSync(lockDir).mtimeMs; } catch (_2) { lockAge = 99999; }
        if (lockAge > 2000) {
          // 超过 2s 仍无 pid → 确为孤儿锁，安全清除
          try { fs.rmSync(lockDir, { recursive: true }); } catch (_2) {}
        }
        if (Date.now() >= deadline) throw new Error(`Advisory lock timeout: ${lockDir}`);
        await sleep(retryMs);
        continue;
      }
      if (Date.now() >= deadline) throw new Error(`Advisory lock timeout: ${lockDir}`);
      await sleep(retryMs);
    }
  }

  // F12：持锁心跳，定期 touch mtime 防止长操作被误判 stale 导致锁被偷
  const heartbeat = setInterval(() => {
    try { fs.utimesSync(lockDir, new Date(), new Date()); } catch (_) {}
  }, Math.floor(staleMs / 4));

  try {
    return await fn();
  } finally {
    clearInterval(heartbeat);
    try { fs.rmSync(lockDir, { recursive: true }); } catch (_) {}
  }
}

// ─── Bridge 读写（带锁）────────────────────────────────────────────────────────

// 只读快照（不加锁，用于非修改性读取）
function readBridgeSnapshot(cwd) {
  const bp = getBridgePath(cwd);
  return safeReadJson(bp, null);
}

// 带锁的读改写：lock → read → mutate(draft) → write
// mutator 可以是同步或 async 函数，接收 draft bridge 对象
// 返回 { bridge }（写入后的值）
async function mutateBridge(cwd, mutator) {
  const bp       = getBridgePath(cwd);
  const lockDir  = bp + '.lock';

  return withAdvisoryLock(lockDir, async () => {
    const { data, corrupt } = safeReadJson(bp, null);
    if (corrupt) {
      logHookError('mutateBridge', new Error('Bridge file corrupt, skipping mutation'), { path: bp });
      return { bridge: null };
    }
    const draft = data || {};
    await Promise.resolve(mutator(draft));
    writeJsonAtomic(bp, draft);
    return { bridge: draft };
  });
}

// ─── Forge State 读写（带锁）──────────────────────────────────────────────────

// 带锁的 forge state 读改写
async function mutateForgeState(slug, mutator) {
  const sp      = path.join(os.homedir(), '.forge', 'projects', slug, 'state.json');
  const lockDir = sp + '.lock';

  return withAdvisoryLock(lockDir, async () => {
    const { data, corrupt } = safeReadJson(sp, {});
    if (corrupt) {
      logHookError('mutateForgeState', new Error('State file corrupt, skipping mutation'), { path: sp });
      return { state: null };
    }
    const draft = data || {};
    await Promise.resolve(mutator(draft));
    writeJsonAtomic(sp, draft);
    return { state: draft };
  });
}

// ─── 错误日志（P2#14：替代静默 catch exit(0)）────────────────────────────────

const LOG_DIR     = path.join(os.homedir(), '.forge', 'logs', 'hooks');
const LOG_FILE    = path.join(LOG_DIR, 'errors.jsonl');
const MAX_LOG_BYTES = 2 * 1024 * 1024;  // 2MB 后轮转

function logHookError(hook, error, context) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    // 轮转：超过 2MB 改名为 errors.jsonl.1
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_BYTES) {
      try { fs.renameSync(LOG_FILE, LOG_FILE + '.1'); } catch (_) {}
    }
    const entry = JSON.stringify({
      ts:      new Date().toISOString(),
      hook,
      error:   error?.message || String(error),
      stack:   error?.stack?.slice(0, 500),
      context: context || {},
    });
    fs.appendFileSync(LOG_FILE, entry + '\n');
  } catch (_) {
    // 日志写入失败时静默降级：不能因日志挂起 hook
  }
}

const EVENTS_FILE      = path.join(LOG_DIR, 'events.jsonl');
const MAX_EVENTS_BYTES = 5 * 1024 * 1024;  // 5MB 后轮转（F20）

function logHookEvent(hook, event, data) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    // F20: events.jsonl 轮转（超过 5MB 改名为 .1）
    if (fs.existsSync(EVENTS_FILE) && fs.statSync(EVENTS_FILE).size > MAX_EVENTS_BYTES) {
      try { fs.renameSync(EVENTS_FILE, EVENTS_FILE + '.1'); } catch (_) {}
    }
    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      hook, event, data: data || {},
    });
    fs.appendFileSync(EVENTS_FILE, entry + '\n');
  } catch (_) {}
}

// ─── Git 队列（P2#15 异步 git 的基础）────────────────────────────────────────

function getGitQueuePath() {
  const dir = path.join(os.homedir(), '.forge', 'runtime', 'git');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'queue.jsonl');
}

// 原子追加一个 job 到 JSONL 队列
// 使用 advisory lock 保证并发安全
async function appendJsonlQueue(queuePath, job) {
  const lockDir = queuePath + '.lock';
  await withAdvisoryLock(lockDir, () => {
    const line = JSON.stringify({ ...job, queued_at: new Date().toISOString() });
    fs.appendFileSync(queuePath, line + '\n');
  }, { waitMs: 3000 });
}

// ─── 导出 ──────────────────────────────────────────────────────────────────────

exports.slugify             = slugify;
exports.resolveProjectRoot  = resolveProjectRoot;  // F17: 新增导出
exports.resolveSlug         = resolveSlug;
exports.getBridgePath       = getBridgePath;
exports.getTmpDir         = getTmpDir;
exports.sanitizeSessionId = sanitizeSessionId;

exports.safeReadJson    = safeReadJson;
exports.writeJsonAtomic = writeJsonAtomic;

exports.withAdvisoryLock  = withAdvisoryLock;
exports.mutateBridge      = mutateBridge;
exports.readBridgeSnapshot = readBridgeSnapshot;
exports.mutateForgeState  = mutateForgeState;

exports.logHookError = logHookError;
exports.logHookEvent = logHookEvent;

exports.getGitQueuePath   = getGitQueuePath;
exports.appendJsonlQueue  = appendJsonlQueue;
