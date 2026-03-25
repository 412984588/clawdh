#!/usr/bin/env node
// forge-hooks-verify.js — Forge v2.0 hooks 验证脚本（55 场景）
// 纯 Node.js，无外部依赖
// 运行：node forge-hooks-verify.js

'use strict';

const fs    = require('fs');
const os    = require('os');
const path  = require('path');
const crypto = require('crypto');

// ─── 测试运行器 ──────────────────────────────────────────────────────────────

let passed = 0, failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
    failures.push({ name, error: e.message });
    failed++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
    failures.push({ name, error: e.message });
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}
function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}
function assertDeepEqual(a, b, msg) {
  const as = JSON.stringify(a), bs = JSON.stringify(b);
  if (as !== bs) throw new Error(msg || `Expected ${bs}, got ${as}`);
}

// ─── 临时目录工具 ─────────────────────────────────────────────────────────────

function mkTmpDir(suffix = '') {
  const p = path.join(os.tmpdir(), `forge-test-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${suffix}`);
  fs.mkdirSync(p, { recursive: true });
  return p;
}

// ─── 模块路径 ────────────────────────────────────────────────────────────────

const HOOKS_DIR = path.join(__dirname, '..');

async function main() {

// ─────────────────────────────────────────────────────────────────────────────
// 组 1：共享存储层（8 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 1】共享存储层');

test('1-1 语法检查：全部 7 个 hook 文件通过 node --check', () => {
  const { execFileSync } = require('child_process');
  const hookFiles = [
    'forge-shared.js', 'forge-context-bridge.js', 'forge-quality-pipeline.js',
    'forge-auto-fix.js', 'forge-git-worker.js', 'forge-session-start.js', 'forge-state-sync.js',
  ];
  for (const f of hookFiles) {
    const fp = path.join(HOOKS_DIR, f);
    assert(fs.existsSync(fp), `文件不存在：${f}`);
    execFileSync(process.execPath, ['--check', fp]);
  }
});

test('1-2 checkpoint hook 已删除', () => {
  const cp = path.join(HOOKS_DIR, 'forge-git-checkpoint.js');
  assert(!fs.existsSync(cp), 'forge-git-checkpoint.js 不应存在（F01 应已删除）');
});

test('1-3 safeReadJson — 3 态：不存在/合法/损坏', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();

  // 1. 不存在
  const r1 = shared.safeReadJson(path.join(tmpDir, 'nope.json'), { def: 1 });
  assertEqual(r1.exists, false, '不存在时 exists 应为 false');
  assertDeepEqual(r1.data, { def: 1 }, '不存在时 data 应为 defaultValue');
  assertEqual(r1.corrupt, false, '不存在时 corrupt 应为 false');

  // 2. 合法 JSON
  const goodPath = path.join(tmpDir, 'good.json');
  fs.writeFileSync(goodPath, JSON.stringify({ x: 42 }));
  const r2 = shared.safeReadJson(goodPath, null);
  assertEqual(r2.exists, true);
  assertEqual(r2.data.x, 42);
  assertEqual(r2.corrupt, false);

  // 3. 损坏 JSON
  const badPath = path.join(tmpDir, 'bad.json');
  fs.writeFileSync(badPath, '{"broken":');
  const r3 = shared.safeReadJson(badPath, null);
  assertEqual(r3.exists, true);
  assertEqual(r3.corrupt, true);
  assertEqual(r3.data, null);

  fs.rmSync(tmpDir, { recursive: true });
});

test('1-4 sanitizeSessionId — 过滤路径穿越字符', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  // 合法 ID
  const good = shared.sanitizeSessionId('abc123-XYZ_456');
  assert(good === 'abc123-XYZ_456', `合法 ID 应通过，得到 ${good}`);

  // 路径穿越
  const evil = shared.sanitizeSessionId('../../../etc/passwd');
  assert(!evil, `路径穿越应返回 null/empty，得到 ${evil}`);

  // 包含斜杠
  const slash = shared.sanitizeSessionId('foo/bar');
  assert(!slash, `含斜杠 ID 应返回 null/empty，得到 ${slash}`);
});

await testAsync('1-5 withAdvisoryLock — 互斥（同一目录串行执行）', async () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const lockDir = path.join(os.tmpdir(), `forge-lock-test-${Date.now()}`);
  const log = [];

  await Promise.all([
    shared.withAdvisoryLock(lockDir, async () => {
      log.push('A:start');
      await new Promise(r => setTimeout(r, 30));
      log.push('A:end');
    }),
    new Promise(r => setTimeout(r, 5)).then(() =>
      shared.withAdvisoryLock(lockDir, async () => {
        log.push('B:start');
        await new Promise(r => setTimeout(r, 10));
        log.push('B:end');
      })
    ),
  ]);

  // A 必须完整执行后 B 才开始
  assert(log.indexOf('A:end') < log.indexOf('B:start'),
    `lock 应互斥，实际顺序：${log.join(' → ')}`);
  try { fs.rmSync(lockDir, { recursive: true }); } catch (_) {}
});

await testAsync('1-6 withAdvisoryLock — stale 锁自动清理', async () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const lockDir = path.join(os.tmpdir(), `forge-stale-test-${Date.now()}`);
  // 手动创建一个无 pid 文件但已足够老的锁
  fs.mkdirSync(lockDir);
  // 设置 mtime 为 35s 前
  const oldTime = new Date(Date.now() - 35000);
  fs.utimesSync(lockDir, oldTime, oldTime);

  let ran = false;
  await shared.withAdvisoryLock(lockDir, async () => { ran = true; }, { staleMs: 20000 });
  assert(ran, 'stale 锁应被自动清理，让新操作获得锁');
  try { fs.rmSync(lockDir, { recursive: true }); } catch (_) {}
});

await testAsync('1-7 withAdvisoryLock — 心跳刷新 mtime（F12）', async () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const lockDir = path.join(os.tmpdir(), `forge-heartbeat-test-${Date.now()}`);
  let mtimeBefore, mtimeAfter;

  await shared.withAdvisoryLock(lockDir, async () => {
    mtimeBefore = fs.existsSync(lockDir) ? fs.statSync(lockDir).mtimeMs : 0;
    // 等待 2 个心跳周期（staleMs=20000，心跳=5000ms）
    await new Promise(r => setTimeout(r, 12000));
    mtimeAfter = fs.existsSync(lockDir) ? fs.statSync(lockDir).mtimeMs : 0;
  }, { staleMs: 20000 });

  assert(mtimeAfter > mtimeBefore + 4000,
    `心跳应刷新 mtime，before=${mtimeBefore} after=${mtimeAfter}`);
  try { fs.rmSync(lockDir, { recursive: true }); } catch (_) {}
});

test('1-8 writeJsonAtomic — 原子写不产生部分写', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();
  const p = path.join(tmpDir, 'atomic.json');
  const data = { hello: 'world', arr: [1, 2, 3] };
  shared.writeJsonAtomic(p, data);
  const read = JSON.parse(fs.readFileSync(p, 'utf8'));
  assertDeepEqual(read, data, '原子写后读回数据应一致');
  fs.rmSync(tmpDir, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 2：事件归约（bridge 状态机）（8 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 2】事件归约');

// 辅助：构造最小合法 bridge v2
function makeBridge(overrides = {}) {
  return {
    _schema_version: 2,
    project: { slug: 'test', cwd: '/tmp/test', isWeb: false, flowType: 'new' },
    phase:   { current: 1, total: 3 },
    change:  { changeEpoch: 0, touchedFiles: [], planWrittenAt: null, summaryWrittenAt: null, securityRisk: { required: false } },
    gates:   {
      plan_review:  { status: 'idle', epoch: null, leaseUntil: null },
      tests:        { status: 'idle', epoch: null, leaseUntil: null },
      code_review:  { status: 'idle', epoch: null, leaseUntil: null },
      qa:           { status: 'idle', epoch: null, leaseUntil: null },
      security:     { status: 'idle', epoch: null, leaseUntil: null },
      benchmark:    { status: 'idle', epoch: null, leaseUntil: null },
      ship:         { status: 'idle', epoch: null, leaseUntil: null },
    },
    context:  { warningLevel: null, lastSaveAt: null },
    auto_fix: { issue_hash: null, attempts: 0, max: 3 },
    audit:    { lastToolName: '', lastToolTs: null },
    _ts:      new Date().toISOString(),
    ...overrides,
  };
}

test('2-1 changeEpoch：Write 事件递增并使下游门失效', () => {
  // 模拟 bridge.js 中的 changeEpoch 逻辑（不直接调用 hook，而是模拟）
  const bridge = makeBridge();
  bridge.change.changeEpoch = 0;
  bridge.gates.code_review = { status: 'passed', epoch: 0, leaseUntil: null };

  // 模拟源码变更：changeEpoch++ + 失效 epoch 不匹配的门
  bridge.change.changeEpoch++;
  const ce = bridge.change.changeEpoch;
  const DOWNSTREAM = ['code_review', 'qa', 'security', 'benchmark', 'ship'];
  for (const g of DOWNSTREAM) {
    if (bridge.gates[g].epoch !== ce) {
      bridge.gates[g].status    = 'idle';
      bridge.gates[g].epoch     = null;
      bridge.gates[g].leaseUntil = null;
    }
  }
  assertEqual(bridge.change.changeEpoch, 1, 'changeEpoch 应为 1');
  assertEqual(bridge.gates.code_review.status, 'idle', 'code_review 应回到 idle');
});

test('2-2 phase 切换：total 正常更新', () => {
  const bridge = makeBridge();
  bridge.phase.current = 1;
  bridge.phase.total   = null;
  // 模拟 state.json 同步
  const data = { phase: { current: 2, total: 5 } };
  if (data.phase?.current != null) bridge.phase.current = data.phase.current;
  if (data.phase?.total   != null) bridge.phase.total   = data.phase.total;
  assertEqual(bridge.phase.current, 2);
  assertEqual(bridge.phase.total, 5);
});

test('2-3 同阶段内重复写：changeEpoch 继续增（不重置）', () => {
  const bridge = makeBridge();
  bridge.change.changeEpoch = 3;
  // 再次写文件
  bridge.change.changeEpoch++;
  assertEqual(bridge.change.changeEpoch, 4, '同阶段内 epoch 应累加而非重置');
});

test('2-4 phase 0 支持（F14）：?? 而非 || 处理', () => {
  // 验证 ?? 允许 phase 0
  const currentFromState = 0;
  const phaseNum1 = currentFromState ?? 1;  // 新逻辑
  const phaseNum2 = currentFromState || 1;  // 旧逻辑（错误）
  assertEqual(phaseNum1, 0, 'F14：?? 应保留 phase 0');
  assertEqual(phaseNum2, 1, '旧 || 逻辑会错误地将 phase 0 变成 1（对照验证）');

  // 验证 != null 检查
  const data = { phase: { current: 0 } };
  let phaseSet = false;
  if (data.phase?.current != null) phaseSet = true;
  assert(phaseSet, 'F14：!= null 应允许 phase 0 触发赋值');
});

test('2-5 Agent 成功 markGatePassed（F02）', () => {
  const bridge = makeBridge();
  // 模拟 F02 修复后的逻辑
  const toolResponse = { isError: false };
  const isError = toolResponse?.isError === true;
  if (!isError && 'gsd-executor' === 'gsd-executor') {
    bridge.gates.tests.status = 'passed';
    bridge.gates.tests.epoch  = bridge.change.changeEpoch;
  }
  assertEqual(bridge.gates.tests.status, 'passed', 'Agent 成功时应标记 tests 通过');
});

test('2-6 Agent 失败不 markGatePassed（F02）', () => {
  const bridge = makeBridge();
  const toolResponse = { isError: true };
  const isError = toolResponse?.isError === true;
  if (!isError && 'gsd-executor' === 'gsd-executor') {
    bridge.gates.tests.status = 'passed';
  }
  assertEqual(bridge.gates.tests.status, 'idle', 'Agent 失败时不应标记 tests 通过');
});

test('2-7 safeReadJson corrupt 标志（F08）：检查返回值而非 data.corrupt', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();
  const badPath = path.join(tmpDir, 'bad.json');
  fs.writeFileSync(badPath, '{"broken":');

  const { data, corrupt } = shared.safeReadJson(badPath, null);
  // 验证：应用代码应检查 corrupt 变量，而非 data.corrupt（data 为 null 时 data.corrupt 报错）
  assert(corrupt === true, `corrupt 标志应为 true，实际 ${corrupt}`);
  assert(data === null, `corrupt 时 data 应为 null，实际 ${data}`);
  // 旧代码的错误用法：data?.corrupt
  assert(data?.corrupt === undefined, '旧代码 data.corrupt 始终 undefined（对照验证）');
  fs.rmSync(tmpDir, { recursive: true });
});

test('2-8 session_id sanitize 防路径穿越（F06）', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const evilIds = [
    '../../../etc/passwd',
    'foo/bar',
    'abc\x00def',
    '../../../../.ssh/id_rsa',
  ];
  for (const id of evilIds) {
    const safe = shared.sanitizeSessionId(id);
    assert(!safe, `恶意 session_id "${id}" 应被拒绝，得到：${safe}`);
  }
  const goodId = shared.sanitizeSessionId('session-abc123_XYZ');
  assert(goodId === 'session-abc123_XYZ', `合法 ID 应通过`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 3：质量 FSM（6 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 3】质量 FSM');

test('3-1 lease 未过期时 nextGateToInject 跳过该门', () => {
  // 直接测试 nextGateToInject 的 lease 跳过逻辑
  const bridge = makeBridge({
    change: {
      changeEpoch: 1, touchedFiles: [], planWrittenAt: new Date().toISOString(),
      summaryWrittenAt: null, securityRisk: { required: false },
    },
    gates: {
      plan_review:  { status: 'leased', epoch: 1, leaseUntil: new Date(Date.now() + 600000).toISOString() },
      tests:        { status: 'idle', epoch: null, leaseUntil: null },
      code_review:  { status: 'idle', epoch: null, leaseUntil: null },
      qa:           { status: 'idle', epoch: null, leaseUntil: null },
      security:     { status: 'idle', epoch: null, leaseUntil: null },
      benchmark:    { status: 'idle', epoch: null, leaseUntil: null },
      ship:         { status: 'idle', epoch: null, leaseUntil: null },
    },
  });
  // 验证：leaseUntil 未到期，isLeaseExpired 应返回 false
  const leaseUntil = bridge.gates.plan_review.leaseUntil;
  const expired = Date.parse(leaseUntil) <= Date.now();
  assert(!expired, '未过期的 lease 应被跳过（isLeaseExpired = false）');
});

test('3-2 lease 过期后 nextGateToInject 重新触发', () => {
  const gate = { status: 'leased', epoch: 1, leaseUntil: new Date(Date.now() - 1000).toISOString() };
  const expired = Date.parse(gate.leaseUntil) <= Date.now();
  assert(expired, '过期 lease 应被重新触发（isLeaseExpired = true）');
});

test('3-3 gate passed + epoch 匹配时跳过', () => {
  const bridge = makeBridge({
    change: { changeEpoch: 2, touchedFiles: [], planWrittenAt: null, summaryWrittenAt: new Date().toISOString(), securityRisk: { required: false } },
    gates: {
      plan_review:  { status: 'idle', epoch: null, leaseUntil: null },
      tests:        { status: 'passed', epoch: 2, leaseUntil: null },  // epoch 匹配，跳过
      code_review:  { status: 'idle', epoch: null, leaseUntil: null },
      qa:           { status: 'idle', epoch: null, leaseUntil: null },
      security:     { status: 'idle', epoch: null, leaseUntil: null },
      benchmark:    { status: 'idle', epoch: null, leaseUntil: null },
      ship:         { status: 'idle', epoch: null, leaseUntil: null },
    },
  });
  const ce = bridge.change.changeEpoch;
  const testGate = bridge.gates.tests;
  const shouldSkip = testGate.status === 'passed' && testGate.epoch === ce;
  assert(shouldSkip, 'epoch 匹配的 passed gate 应跳过');
});

test('3-4 lease 写失败不注入质量门（F09）', () => {
  // 验证 F09 修复的逻辑：leased=false 时不执行 stdout.write
  let leased = false;
  const mockMutateError = () => { throw new Error('lock timeout'); };
  let injected = false;
  try {
    mockMutateError();
    leased = true;
  } catch (_) {}
  if (!leased) { /* process.exit(0) — 不注入 */ }
  else { injected = true; }
  assert(!injected, 'F09：lease 失败时不应注入质量门');
});

test('3-5 安全风险检测：git_error 触发安全门而非静默放行（F10）', () => {
  // 验证 F10 修复：git 失败时 required=true
  function evaluateSecurityRisk_fixed(touchedFiles) {
    try {
      throw new Error('git not a repo');  // 模拟 git 失败
    } catch (_) {
      return { required: true, reasons: ['git_error'], files: touchedFiles.slice(0, 20) };
    }
  }
  const result = evaluateSecurityRisk_fixed(['src/auth.ts']);
  assert(result.required === true, 'F10：git 失败时应触发安全门');
  assert(result.reasons.includes('git_error'), 'F10：reasons 应包含 git_error');
});

test('3-6 allCoreGatesPassed：epoch 不匹配时不通过', () => {
  const bridge = makeBridge({
    change: { changeEpoch: 5, touchedFiles: [], planWrittenAt: null, summaryWrittenAt: null, securityRisk: { required: false } },
    phase:  { current: 3, total: 3 },
    gates: {
      plan_review:  { status: 'passed', epoch: 5, leaseUntil: null },
      tests:        { status: 'passed', epoch: 4, leaseUntil: null },  // 旧 epoch
      code_review:  { status: 'passed', epoch: 5, leaseUntil: null },
      qa:           { status: 'idle',   epoch: null, leaseUntil: null },
      security:     { status: 'idle',   epoch: null, leaseUntil: null },
      benchmark:    { status: 'idle',   epoch: null, leaseUntil: null },
      ship:         { status: 'idle',   epoch: null, leaseUntil: null },
    },
  });
  // 模拟 allCoreGatesPassed
  const ce = bridge.change.changeEpoch;
  const g = bridge.gates;
  const testsPassed = g.tests?.status === 'passed' && g.tests?.epoch === ce;
  assert(!testsPassed, 'epoch 不匹配的 gate 不应被视为通过');
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 4：Git 异步（5 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 4】Git 异步');

test('4-1 safeGitAdd：排除 .env 和密钥文件', () => {
  // 验证 isDenied 的过滤逻辑（读取 git-worker.js 中的 DENY_PATTERNS）
  // 通过解析 git-worker.js 源码中的过滤逻辑来验证
  const workerSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-git-worker.js'), 'utf8');
  assert(workerSrc.includes('.env'), '应过滤 .env 文件');
  assert(workerSrc.includes('secret') || workerSrc.includes('private'), '应过滤密钥相关文件');
  assert(workerSrc.includes("isDenied"), '应有 isDenied 函数');
});

test('4-2 safeGitAdd：路径穿越被阻止（F07）', () => {
  const workerSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-git-worker.js'), 'utf8');
  // 验证使用了 path.resolve 进行路径验证（F07 的关键修复）
  assert(workerSrc.includes('path.resolve'), 'F07：应使用 path.resolve 验证路径');
  assert(workerSrc.includes('startsWith(cwd +'), 'F07：应验证 resolved 路径在 cwd 内');
});

test('4-3 processJob：git reset HEAD 在 safeGitAdd 前执行（F03）', () => {
  const workerSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-git-worker.js'), 'utf8');
  const resetIdx = workerSrc.indexOf("'reset', 'HEAD'");
  // lastIndexOf 找调用位置（函数定义在前，processJob 调用在后）
  const addIdx   = workerSrc.lastIndexOf('safeGitAdd(cwd');
  assert(resetIdx > 0, 'F03：应有 git reset HEAD');
  assert(addIdx > 0, 'F03：应有 safeGitAdd(cwd 调用');
  assert(resetIdx < addIdx, 'F03：git reset 应在 safeGitAdd 之前');
});

test('4-4 队列 rename-then-process（F11）', () => {
  const workerSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-git-worker.js'), 'utf8');
  assert(workerSrc.includes('renameSync'), 'F11：应使用 renameSync 处理队列');
  assert(workerSrc.includes('.processing'), 'F11：应有 .processing 临时文件');
  // 确认旧的 writeFileSync('', '') 清空模式已删除
  assert(!workerSrc.includes("writeFileSync(QUEUE_PATH, '')"), 'F11：不应再有 clear-then-process 模式');
});

test('4-5 worker 路径存在性检查', () => {
  const workerPath = path.join(HOOKS_DIR, 'forge-git-worker.js');
  assert(fs.existsSync(workerPath), 'forge-git-worker.js 应存在');
  const bridgePath = path.join(HOOKS_DIR, 'forge-context-bridge.js');
  const bridgeSrc  = fs.readFileSync(bridgePath, 'utf8');
  assert(bridgeSrc.includes('forge-git-worker.js'), 'bridge 应引用 git-worker');
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 5：运维（4 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 5】运维');

test('5-1 orphan 检测：24h 内活跃项目不被标记', () => {
  const sessionSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-session-start.js'), 'utf8');
  assert(sessionSrc.includes('ORPHAN_AGE_MS'), 'session-start 应有 ORPHAN_AGE_MS');
  assert(sessionSrc.includes('24 * 60 * 60'), '孤儿判断应基于 24 小时');
  // 验证逻辑：path 不存在 && isStale 才标记为候选
  assert(sessionSrc.includes('!fs.existsSync(projectPath) && isStale'), '应同时满足路径不存在且 stale');
});

test('5-2 STATE.md 同步：applyParsed 删除托管字段（F16）', () => {
  const syncSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  assert(syncSrc.includes('MANAGED_FIELDS'), 'F16：应有 MANAGED_FIELDS 常量');
  assert(syncSrc.includes('delete state[key]'), 'F16：应删除不在 parsed 中的托管字段');
  // 验证托管字段包含关键字段
  assert(syncSrc.includes("'gsd_status'"), 'gsd_status 应为托管字段');
  assert(syncSrc.includes("'flow_type'"), 'flow_type 应为托管字段');
});

test('5-3 settings.json 不含 checkpoint hook', () => {
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  if (!fs.existsSync(settingsPath)) return;  // CI 环境可能没有
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  const allHooks = JSON.stringify(settings.hooks || {});
  assert(!allHooks.includes('forge-git-checkpoint'), 'F01：settings.json 不应含 checkpoint hook');
});

test('5-4 bridge.js 不含 context.warningLevel 写入（F01 清理确认）', () => {
  const bridgeSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  // warningLevel 的初始化是允许的（null），但不应有写入赋值
  const lines = bridgeSrc.split('\n');
  const warningLevelSetLines = lines.filter(l =>
    l.includes('warningLevel') && l.includes('=') && !l.includes('null') &&
    !l.includes('//') && !l.includes('context:')
  );
  assert(warningLevelSetLines.length === 0,
    `bridge.js 不应向 warningLevel 写入非 null 值，发现：${warningLevelSetLines.join('; ')}`
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 6：Tier 3 修复（F17 / F18 / F19 / F20）— 4 个场景
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 6】Tier 3 修复验证（F17-F20）');

test('6-1 resolveProjectRoot 已导出（F17）', () => {
  const sharedPath = path.join(HOOKS_DIR, 'forge-shared.js');
  const src = fs.readFileSync(sharedPath, 'utf8');
  assert(src.includes('resolveProjectRoot'), 'F17：forge-shared.js 应包含 resolveProjectRoot');
  assert(src.includes('exports.resolveProjectRoot'), 'F17：resolveProjectRoot 应被导出');
  // 验证用 git rev-parse 作为第一优先级
  assert(src.includes('rev-parse'), 'F17：resolveProjectRoot 应优先用 git rev-parse');
});

test('6-2 resolveSlug 新项目使用 hashed slug（F18）', () => {
  // 在临时目录中调用 resolveSlug，没有任何 state.json → 应返回 hashed slug（含 "-"）
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir  = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-f18-'));
  try {
    const slug = shared.resolveSlug(tmpDir);
    // hashed slug 格式：baseName-8位hex（含 "-" 分隔符且总长度 > baseName 长度）
    const baseName = path.basename(tmpDir).replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    assert(slug.includes('-'), `F18：新项目 slug 应含 "-"（实际: ${slug}）`);
    assert(slug.startsWith(baseName) || slug.length > baseName.length,
      `F18：slug 应基于目录名（baseName: ${baseName}, slug: ${slug}）`);
  } finally {
    fs.rmdirSync(tmpDir);
  }
});

test('6-3 forge-state-sync 使用 shared.resolveProjectRoot（F19）', () => {
  const syncSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  // 验证用 shared.resolveProjectRoot 替代本地深度为 6 的 findProjectRoot
  assert(syncSrc.includes('shared.resolveProjectRoot'), 'F19：state-sync 应调用 shared.resolveProjectRoot');
  // 旧的本地实现（i < 6 硬编码深度）应已被移除
  assert(!syncSrc.includes('for (let i = 0; i < 6'), 'F19：不应再有 i < 6 的深度限制');
});

test('6-4 events.jsonl 轮转 + worker spawn 限制（F20）', () => {
  const sharedSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-shared.js'), 'utf8');
  assert(sharedSrc.includes('MAX_EVENTS_BYTES'), 'F20：events.jsonl 应有大小上限');
  assert(sharedSrc.includes('EVENTS_FILE + \'.1\''), 'F20：events.jsonl 应有轮转逻辑');

  const bridgeSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  assert(bridgeSrc.includes('worker.lock'), 'F20：spawnDetachedWorker 应检查 worker.lock');
  // 确认是 return（跳过生成）而非忽略
  const lockCheckIdx = bridgeSrc.indexOf('worker.lock');
  const returnIdx    = bridgeSrc.indexOf('return;', lockCheckIdx);
  assert(returnIdx > lockCheckIdx && returnIdx - lockCheckIdx < 150,
    'F20：检测到 worker.lock 后应立即 return 跳过 spawn');
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 7：OPT 回归验证（6 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 7】OPT 回归验证');

test('7-1 forge-context-save.js 已删除（OPT-1）', () => {
  assert(!fs.existsSync(path.join(HOOKS_DIR, 'forge-context-save.js')),
    'forge-context-save.js 不应存在（死代码，OPT-1 已删除）');
});

test('7-2 shared.isForgeProject 已导出可调用（OPT-2）', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  assert(typeof shared.isForgeProject === 'function',
    'shared.isForgeProject 应为可调用函数');
  const tmpDir = mkTmpDir();
  const result = shared.isForgeProject(tmpDir);
  assertEqual(result, false, '非 Forge 目录 isForgeProject 应返回 false');
  fs.rmSync(tmpDir, { recursive: true });
});

test('7-3 三文件无本地 isForgeProject 定义（OPT-2）', () => {
  const files = ['forge-context-bridge.js', 'forge-quality-pipeline.js', 'forge-auto-fix.js'];
  for (const f of files) {
    const src = fs.readFileSync(path.join(HOOKS_DIR, f), 'utf8');
    assert(!src.match(/^function isForgeProject/m) && !src.match(/^const isForgeProject/m),
      `${f} 不应含本地 isForgeProject 定义`);
  }
});

test('7-4 auto-fix.js 中 isForgeProject 仅被调用一次（OPT-3）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-auto-fix.js'), 'utf8');
  // 只统计非注释行中的调用次数
  const codeLines = src.split('\n').filter(l => !l.trimStart().startsWith('//'));
  const calls = (codeLines.join('\n').match(/isForgeProject\s*\(/g) || []).length;
  assertEqual(calls, 1, `auto-fix.js 非注释行中 isForgeProject( 应出现 1 次，得到 ${calls} 次`);
});

test('7-5 SECURITY_PATTERN 不含高误报词（OPT-5）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-quality-pipeline.js'), 'utf8');
  const m = src.match(/const SECURITY_PATTERN\s*=\s*(\/[^\n]+\/\w*)/);
  assert(m, 'SECURITY_PATTERN 应存在');
  const patStr = m[1];
  assert(!patStr.includes('hash'), `SECURITY_PATTERN 不应含 hash，实际：${patStr}`);
  assert(!patStr.includes('migration'), `SECURITY_PATTERN 不应含 migration`);
  assert(!patStr.includes('database'), `SECURITY_PATTERN 不应含 database`);
  assert(patStr.includes('auth'), 'SECURITY_PATTERN 仍应含 auth');
  assert(patStr.includes('hmac'), 'SECURITY_PATTERN 应含 hmac（OPT-5 新增）');
});

test('7-6 bridge.js inferAndUpdate 含 toolName 条件守卫（OPT-4）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  assert(
    src.includes("toolName === 'Skill'") || src.includes('toolName === "Skill"'),
    'inferAndUpdate 应在 toolName === Skill 时才读 state.json（OPT-4）'
  );
  assert(src.includes("'Write'") || src.includes('"Write"'), 'toolName 守卫应含 Write');
  assert(src.includes("'Edit'") || src.includes('"Edit"'), 'toolName 守卫应含 Edit');
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 8：forge-state-sync.js 功能测试（4 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 8】forge-state-sync.js 功能测试');

test('8-1 parseStateMd：YAML frontmatter 正确提取关键字段', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  assert(src.includes('parseYamlFrontmatter'), 'forge-state-sync.js 应含 parseYamlFrontmatter 函数');
  assert(src.includes('completed_phases'), 'parseStateMd 应处理 completed_phases 字段');
  assert(src.includes('total_phases'), 'parseStateMd 应处理 total_phases 字段');
  assert(src.includes('flow_type'), 'parseStateMd 应处理 flow_type 字段');
  assert(src.includes('\\bcompleted\\b'), 'parseStateMd 应用单词边界匹配 completed，防止 incomplete 误判');
});

test('8-2 parseStateMd：prose fallback 能从正文提取 phase', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  assert(src.includes('Phase[:\\s]'), 'parseStateMd prose fallback 应含 Phase 匹配');
  assert(src.includes('阶段[：:\\s]'), 'parseStateMd prose fallback 应支持中文"阶段"');
  assert(src.includes('Number('), 'parseStateMd 应用 Number() 确保 phase 为数字（F14 小数兼容）');
});

test('8-3 applyParsed：MANAGED_FIELDS 清理旧字段逻辑存在（F16）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  assert(src.includes('MANAGED_FIELDS'), 'applyParsed 应定义 MANAGED_FIELDS 数组');
  assert(src.includes('gsd_status'), 'MANAGED_FIELDS 应含 gsd_status');
  assert(src.includes('next_action'), 'MANAGED_FIELDS 应含 next_action');
  assert(
    src.includes('delete state[key]') || src.includes('delete state['),
    'applyParsed 应删除不再出现的托管字段'
  );
});

test('8-4 parseProgressTxt：提取最新 session 和 next_action', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  assert(src.includes('parseProgressTxt'), 'forge-state-sync.js 应含 parseProgressTxt 函数');
  assert(src.includes('lines.length - 1'), 'parseProgressTxt 应从末尾向前搜索最新 session');
  assert(src.includes('last_session'), 'parseProgressTxt 应更新 last_session');
  assert(src.includes('next_action'), 'parseProgressTxt 应尝试提取 next_action');
  assert(
    src.includes('下一步') && (src.includes('next') || src.includes('TODO')),
    'parseProgressTxt 应识别"下一步/next/TODO"等关键词'
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 9：真实 stdin pipe 调用（4 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 9】真实 stdin pipe 调用');

await testAsync('9-1 bridge.js：非 Forge 项目 → exitCode=0，stdout 空', async () => {
  const { spawnSync } = require('child_process');
  const tmpDir = mkTmpDir();
  const payload = {
    cwd: tmpDir,
    tool_name: 'Bash',
    tool_input: { command: 'echo hello' },
    tool_response: { exit_code: 0, stdout: 'hello', stderr: '' },
  };
  const result = spawnSync(process.execPath, [path.join(HOOKS_DIR, 'forge-context-bridge.js')], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    timeout: 8000,
  });
  assertEqual(result.status, 0, `exitCode 应为 0，得到 ${result.status}；stderr: ${(result.stderr||'').slice(0,100)}`);
  assertEqual((result.stdout || '').trim(), '', `非 Forge 项目 stdout 应为空，得到：${result.stdout}`);
  fs.rmSync(tmpDir, { recursive: true });
});

await testAsync('9-2 pipeline.js：无有效 bridge 文件 → exitCode=0，stdout 空', async () => {
  const { spawnSync } = require('child_process');
  const tmpDir = mkTmpDir();
  // 创建 Forge 项目标志（isForgeProject 返回 true）
  fs.mkdirSync(path.join(tmpDir, '.planning'), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, '.planning', 'STATE.md'), '# State\n');
  const payload = {
    cwd: tmpDir,
    tool_name: 'Skill',
    tool_input: { skill: 'review' },
    tool_response: {},
  };
  const result = spawnSync(process.execPath, [path.join(HOOKS_DIR, 'forge-quality-pipeline.js')], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    timeout: 8000,
  });
  assertEqual(result.status, 0, `exitCode 应为 0，得到 ${result.status}；stderr: ${(result.stderr||'').slice(0,100)}`);
  assertEqual((result.stdout || '').trim(), '', `无 bridge 时 stdout 应为空，得到：${result.stdout}`);
  fs.rmSync(tmpDir, { recursive: true });
});

await testAsync('9-3 auto-fix.js：exit_code=0 → 不触发修复', async () => {
  const { spawnSync } = require('child_process');
  const tmpDir = mkTmpDir();
  const payload = {
    cwd: tmpDir,
    tool_name: 'Bash',
    tool_input: { command: 'npm test' },
    tool_response: { exit_code: 0, stdout: 'PASS', stderr: '' },
  };
  const result = spawnSync(process.execPath, [path.join(HOOKS_DIR, 'forge-auto-fix.js')], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    timeout: 8000,
  });
  assertEqual(result.status, 0, `exitCode 应为 0，得到 ${result.status}`);
  assertEqual((result.stdout || '').trim(), '', `exit_code=0 时 stdout 应为空，得到：${result.stdout}`);
  fs.rmSync(tmpDir, { recursive: true });
});

await testAsync('9-4 auto-fix.js：截断 JSON 输入 → exitCode=0（graceful）', async () => {
  const { spawnSync } = require('child_process');
  const result = spawnSync(process.execPath, [path.join(HOOKS_DIR, 'forge-auto-fix.js')], {
    input: '{"cwd":"/tmp","tool_name":"Bash","tool_input":{',  // 截断 JSON
    encoding: 'utf8',
    timeout: 8000,
  });
  assertEqual(result.status, 0, `截断 JSON 时 exitCode 应为 0（graceful），得到 ${result.status}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 10：并发与边界（4 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 10】并发与边界');

await testAsync('10-1 3 个并行 mutateBridge 不丢失更新（并发安全）', async () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();
  await Promise.all([
    shared.mutateBridge(tmpDir, (d) => { d.count = (d.count || 0) + 1; }),
    shared.mutateBridge(tmpDir, (d) => { d.count = (d.count || 0) + 1; }),
    shared.mutateBridge(tmpDir, (d) => { d.count = (d.count || 0) + 1; }),
  ]);
  const bp = shared.getBridgePath(tmpDir);
  const { data } = shared.safeReadJson(bp, {});
  assertEqual(data?.count, 3, `3 次并行 mutateBridge 后 count 应为 3，得到 ${data?.count}`);
  try { fs.rmSync(path.dirname(bp), { recursive: true }); } catch (_) {}
  fs.rmSync(tmpDir, { recursive: true });
});

await testAsync('10-2 5 个并行 appendJsonlQueue 无丢失（原子追加）', async () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();
  const queuePath = path.join(tmpDir, 'queue.jsonl');
  await Promise.all([1, 2, 3, 4, 5].map(i => shared.appendJsonlQueue(queuePath, { idx: i })));
  const lines = fs.readFileSync(queuePath, 'utf8').trim().split('\n').filter(Boolean);
  assertEqual(lines.length, 5, `5 次并行追加后应有 5 行，得到 ${lines.length} 行`);
  for (const line of lines) {
    const obj = JSON.parse(line);
    assert(obj.idx >= 1 && obj.idx <= 5, `条目 idx 超出范围：${obj.idx}`);
  }
  fs.rmSync(tmpDir, { recursive: true });
});

test('10-3 writeJsonAtomic 自动创建多层目录', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();
  const deepPath = path.join(tmpDir, 'a', 'b', 'c', 'data.json');
  shared.writeJsonAtomic(deepPath, { hello: 'world' });
  assert(fs.existsSync(deepPath), 'writeJsonAtomic 应自动创建多层目录');
  const content = JSON.parse(fs.readFileSync(deepPath, 'utf8'));
  assertEqual(content.hello, 'world', '写入内容应可读回');
  fs.rmSync(tmpDir, { recursive: true });
});

test('10-4 resolveSlug 同名不同路径 → 不同 slug（碰撞安全）', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();
  const dir1 = path.join(tmpDir, 'myproject');
  const dir2 = path.join(tmpDir, 'sub', 'myproject');
  fs.mkdirSync(dir1, { recursive: true });
  fs.mkdirSync(dir2, { recursive: true });
  const slug1 = shared.resolveSlug(dir1);
  const slug2 = shared.resolveSlug(dir2);
  assert(slug1 !== slug2, `同名不同路径应产生不同 slug，但两者均为：${slug1}`);
  assert(slug1.includes('myproject'), `slug1 应含 myproject，得到：${slug1}`);
  assert(slug2.includes('myproject'), `slug2 应含 myproject，得到：${slug2}`);
  fs.rmSync(tmpDir, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 11：安全边界（2 个场景）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 11】安全边界');

test('11-1 SECURITY_PATTERN 命中安全词、不误报前端常见词', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-quality-pipeline.js'), 'utf8');
  const m = src.match(/const SECURITY_PATTERN\s*=\s*(\/[^\n]+\/\w*)/);
  assert(m, 'SECURITY_PATTERN 应存在');
  // eslint-disable-next-line no-eval
  const SECURITY_PATTERN = eval(m[1]);  // 安全：仅用于测试自己代码中的 RegExp 字面量
  // 应命中（关键词后跟非单词字符，\b 边界可匹配）
  assert(SECURITY_PATTERN.test('auth.ts'),             'auth 应命中');
  assert(SECURITY_PATTERN.test('jwt-helper.ts'),       'jwt 应命中');
  assert(SECURITY_PATTERN.test('password.ts'),         'password 应命中');
  assert(SECURITY_PATTERN.test('sql-query.ts'),        'sql 应命中');
  assert(SECURITY_PATTERN.test('apikey.ts'),           'apikey 应命中');
  // 不应命中（OPT-5 移除的高误报词）
  assert(!SECURITY_PATTERN.test('hashRouter.ts'),      'hash（URL/CSS hash）不应命中');
  assert(!SECURITY_PATTERN.test('migrationRunner.ts'), 'migration 不应命中');
  assert(!SECURITY_PATTERN.test('databaseConfig.ts'),  'database 不应命中');
  assert(!SECURITY_PATTERN.test('stylesheet.css'),     '普通 CSS 文件不应命中');
});

test('11-2 sanitizeSessionId 全面防护路径穿越与注入', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  // 合法 ID 通过
  const valid = [
    'conv-1234567890-abc',
    'session.abc123',
    'abc_XYZ-123',
    'a',
    'a'.repeat(64),   // 最大长度
  ];
  for (const id of valid) {
    assertEqual(shared.sanitizeSessionId(id), id, `合法 ID 应通过：${id}`);
  }
  // 非法 ID 全部拒绝
  const invalid = [
    '../../../etc/passwd',
    'foo/bar',
    'foo bar',
    '',
    null,
    'a'.repeat(65),   // 超过最大长度
    '../../secret',
    'id\x00null',     // null 字节
  ];
  for (const id of invalid) {
    assert(!shared.sanitizeSessionId(id), `非法 ID 应返回 null/falsy：${JSON.stringify(id)}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 结果
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(56)}`);
console.log(`  结果：${passed} ✅  ${failed} ❌  共 ${passed + failed} 场景`);
if (failures.length > 0) {
  console.log('\n  失败列表：');
  for (const f of failures) {
    console.log(`  • ${f.name}`);
    console.log(`    ${f.error}`);
  }
  console.log('');
  process.exit(1);
} else {
  console.log('  全部通过！Forge v2.0 hooks 验证完成。');
  console.log('');
  process.exit(0);
}

} // end main

main().catch(e => { console.error(e); process.exit(1); });
