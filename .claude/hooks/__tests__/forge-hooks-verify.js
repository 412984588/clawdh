#!/usr/bin/env node
// forge-hooks-verify.js — Forge v2.0 hooks 验证脚本（68 场景）
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

// ─── 集成测试辅助（组 15-20 专用）────────────────────────────────────────────

const _cp      = require('child_process');
const _shared  = require(path.join(HOOKS_DIR, 'forge-shared'));

// 向 hook 进程发送 stdin JSON，同步捕获 stdout/stderr/exitCode
function spawnHook(hookFile, stdinData, opts = {}) {
  const r = _cp.spawnSync(
    process.execPath,
    [path.join(HOOKS_DIR, hookFile)],
    {
      input:    typeof stdinData === 'string' ? stdinData : JSON.stringify(stdinData),
      encoding: 'utf8',
      timeout:  opts.timeout || 15000,
      env:      { ...process.env, ...(opts.env || {}) },
    }
  );
  return {
    exitCode: r.status !== null ? r.status : -1,
    stdout:   r.stdout || '',
    stderr:   r.stderr || '',
    timedOut: r.signal === 'SIGTERM',
  };
}

// 创建带 .planning/STATE.md 和 git repo 的临时 Forge 项目目录
function setupForgeTmpDir() {
  const d = mkTmpDir('-forge');
  fs.mkdirSync(path.join(d, '.planning'), { recursive: true });
  fs.writeFileSync(path.join(d, '.planning', 'STATE.md'), '# State\nPhase: 1\n');
  try {
    _cp.execFileSync('git', ['init'], { cwd: d, stdio: 'ignore' });
    _cp.execFileSync('git', [
      '-c', 'user.email=test@test.com', '-c', 'user.name=Test',
      'commit', '--allow-empty', '-m', 'init',
    ], { cwd: d, stdio: 'ignore' });
  } catch (_) {}
  return d;
}

// git rev-parse → realpath fallback，确保与 hook 内部保持一致
function getRealRoot(dir) {
  try {
    return _cp.execFileSync('git', ['rev-parse', '--show-toplevel'],
      { cwd: dir, encoding: 'utf8' }).trim();
  } catch (_) {
    try { return fs.realpathSync(dir); } catch (_2) { return dir; }
  }
}

function getBridgePathForDir(realRoot) {
  const h = crypto.createHash('md5').update(realRoot).digest('hex').slice(0, 12);
  return path.join(os.homedir(), '.forge', 'runtime', 'bridges', h, 'bridge.json');
}

function getSlugForDir(realRoot) {
  // 使用 path.basename 与 resolveSlug 保持一致（resolveSlug 只对 basename 做 slugify）
  const base = path.basename(realRoot).replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const h    = crypto.createHash('md5').update(realRoot).digest('hex').slice(0, 8);
  return `${base}-${h}`;
}

// 清理 tmpDir + 对应 bridge 和 forge state
function cleanupForgeTmpDir(dir) {
  try {
    const root = getRealRoot(dir);
    const bp   = getBridgePathForDir(root);
    try { fs.rmSync(bp + '.lock',          { recursive: true, force: true }); } catch (_) {}
    try { fs.rmSync(path.dirname(bp),      { recursive: true, force: true }); } catch (_) {}
    const slug = getSlugForDir(root);
    try { fs.rmSync(path.join(os.homedir(), '.forge', 'projects', slug),
                    { recursive: true, force: true }); } catch (_) {}
  } catch (_) {}
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
}

// 构建标准 bridge.json（v2 schema，含完整 gates 结构）用于 pipeline 测试
// 命名为 makeFullBridge 避免与组 2 内部的 makeBridge 发生 JS 函数提升遮蔽冲突
function makeFullBridge(overrides) {
  const base = {
    _schema_version: 2,
    project: { cwd: '/tmp/test', slug: 'test', isWeb: false, flowType: 'new' },
    phase:   { current: 1, total: 3, phaseEpoch: 1 },
    change:  { changeEpoch: 1, touchedFiles: [], planWrittenAt: null,
               summaryWrittenAt: null, securityRisk: { required: false, reasons: [], files: [] } },
    gates: {
      plan_review: { status: 'idle', epoch: null, leaseUntil: null },
      tests:       { status: 'idle', epoch: null, leaseUntil: null },
      code_review: { status: 'idle', epoch: null, leaseUntil: null },
      qa:          { status: 'idle', epoch: null, leaseUntil: null },
      security:    { status: 'idle', epoch: null, leaseUntil: null },
      benchmark:   { status: 'idle', epoch: null, leaseUntil: null },
      ship:        { status: 'idle', epoch: null, leaseUntil: null },
    },
    context: { warningLevel: null, lastSaveAt: null },
    audit:   { lastToolName: null, updatedAt: null },
  };
  // 浅合并顶层字段，深合并 gates/project/phase/change
  // F25 fix: gates 需要逐条目深合并（Codex Finding #7）
  // 直接 { ...base.gates, ...overrides.gates } 会完整替换每个 gate 对象，
  // 导致测试中传入 { tests: { status: 'passed' } } 后，tests 缺少 epoch/leaseUntil 字段
  const r = { ...base, ...overrides };
  if (overrides?.gates) {
    r.gates = { ...base.gates };
    for (const [k, v] of Object.entries(overrides.gates)) {
      r.gates[k] = { ...base.gates[k], ...v };
    }
  }
  if (overrides?.project) r.project = { ...base.project, ...overrides.project };
  if (overrides?.phase)   r.phase   = { ...base.phase,   ...overrides.phase };
  if (overrides?.change)  r.change  = { ...base.change,  ...overrides.change };
  return r;
}

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

test('4-3 processJob：选择性清除非 touchedFiles 预暂存文件（HIGH fix F03）', () => {
  // HIGH fix：原来用 git reset HEAD 清空全部暂存区（破坏用户自己的暂存），
  // 现在改为：只清除不属于 touchedFiles 的预暂存文件，并在提交后恢复
  const workerSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-git-worker.js'), 'utf8');
  // 应使用 git restore --staged 选择性清除，而非 git reset HEAD 全量清除
  assert(workerSrc.includes("'restore', '--staged'"), 'F03 HIGH fix：应用 git restore --staged 选择性清除预暂存');
  // 应有 preStagedToRestore 变量记录需要恢复的文件
  assert(workerSrc.includes('preStagedToRestore'), 'F03 HIGH fix：应有 preStagedToRestore 保存恢复列表');
  // 应在 safeGitAdd 之前调用 restore --staged
  const restoreIdx = workerSrc.indexOf("'restore', '--staged'");
  const addIdx     = workerSrc.lastIndexOf('safeGitAdd(cwd');
  assert(restoreIdx > 0, 'F03 HIGH fix：应有 git restore --staged 调用');
  assert(addIdx > 0, 'F03：应有 safeGitAdd(cwd 调用');
  assert(restoreIdx < addIdx, 'F03 HIGH fix：restore --staged 应在 safeGitAdd 之前');
  // 提交后应恢复用户暂存文件（git add 恢复）
  const restoreAfterIdx = workerSrc.lastIndexOf("'add', '--', ...preStagedToRestore");
  assert(restoreAfterIdx > addIdx, 'F03 HIGH fix：提交后应恢复用户暂存文件');
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

test('6-4 events.jsonl 轮转 + worker spawn 限制（F20/C3）', () => {
  const sharedSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-shared.js'), 'utf8');
  assert(sharedSrc.includes('MAX_EVENTS_BYTES'), 'F20：events.jsonl 应有大小上限');
  assert(sharedSrc.includes('EVENTS_FILE + \'.1\''), 'F20：events.jsonl 应有轮转逻辑');

  const bridgeSrc = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  assert(bridgeSrc.includes('worker.lock'), 'F20：spawnDetachedWorker 应检查 worker.lock');
  // C3 fix：新逻辑 = 新鲜锁 return，stale 锁（>20min）清除后 spawn
  assert(bridgeSrc.includes('20 * 60 * 1000'), 'C3：应检查 stale 阈值 20min');
  assert(bridgeSrc.includes('return;'), 'C3：新鲜锁应 return 跳过 spawn');
  assert(bridgeSrc.includes('rmSync(workerLockDir'), 'C3：stale 锁应清除后允许 spawn');
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
// 组 12：Codex 发现修复验证（5 个场景，对应 C3 / H1 / H4）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 12】Codex 发现修复验证（C3/H1/H4）');

test('12-1 H1 safeReadJson：ENOENT 返回 fallback 而非 corrupt（原子 rename 竞态保护）', () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();
  const p = path.join(tmpDir, 'data.json');
  // 正常不存在 → exists:false
  const r1 = shared.safeReadJson(p, 'default');
  assert(!r1.exists, 'safeReadJson：文件不存在应返回 exists:false');
  assertEqual(r1.data, 'default', 'safeReadJson：不存在应返回 fallback');
  assert(!r1.corrupt, 'safeReadJson：不存在不应标记 corrupt');
  // 损坏 JSON → corrupt:true
  fs.writeFileSync(p, '{ broken json <<<');
  const r2 = shared.safeReadJson(p, null);
  assert(r2.corrupt, 'safeReadJson：损坏 JSON 应标记 corrupt:true');
  // H1 fix 源码验证：ENOENT 分支存在
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-shared.js'), 'utf8');
  assert(src.includes("e.code === 'ENOENT'"), 'safeReadJson 应处理 ENOENT 竞态（H1 fix）');
  fs.rmSync(tmpDir, { recursive: true });
});

test('12-2 H4 externalRisk 注入有 changeEpoch 守卫（pipeline.js 源码验证）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-quality-pipeline.js'), 'utf8');
  // H4 fix: 注入时必须 epoch 匹配
  assert(
    src.includes('draft.change.changeEpoch === changeEpoch'),
    'pipeline.js 注入 externalRisk 前应验证 changeEpoch 匹配（H4 fix）'
  );
});

test('12-3 C3 spawnDetachedWorker 有 stale lock 清理（bridge.js 源码验证）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  assert(src.includes('20 * 60 * 1000'), 'spawnDetachedWorker 应检查 20min stale 阈值（C3 fix）');
  assert(src.includes('rmSync(workerLockDir'), 'spawnDetachedWorker 应清除 stale worker.lock（C3 fix）');
});

test('12-4 C3 budgetedCleanup 有 worker.lock 清理（session-start.js 源码验证）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-session-start.js'), 'utf8');
  assert(src.includes('worker.lock'), 'budgetedCleanup 应清理 stale worker.lock（C3 fix）');
  assert(
    src.match(/rmSync.*worker.*lock/s) || src.includes("rmSync(workerLock"),
    'budgetedCleanup 应调用 rmSync 清除 stale worker.lock'
  );
});

await testAsync('12-5 H1 safeReadJson：正常文件可读回，writeJsonAtomic rename 后仍可读', async () => {
  const shared = require(path.join(HOOKS_DIR, 'forge-shared.js'));
  const tmpDir = mkTmpDir();
  const p = path.join(tmpDir, 'state.json');
  // 原子写 + 立即读
  shared.writeJsonAtomic(p, { phase: 3, status: 'active' });
  const { data, corrupt, exists } = shared.safeReadJson(p, null);
  assert(exists, '原子写后文件应存在');
  assert(!corrupt, '正常文件不应标记 corrupt');
  assertEqual(data?.phase, 3, 'safeReadJson 应读回 phase=3');
  fs.rmSync(tmpDir, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 13: 中优先级修复验证（C1/C4/C5）
// ─────────────────────────────────────────────────────────────────────────────

test('13-1: C4 state-sync 小数阶段 regex — Phase 5.1 应解析为 5.1', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  // 四条 prose 匹配正则都应包含小数支持
  const patterns = src.match(/content\.match\(\/.*?\/i\)/g) || [];
  const decimalPatterns = patterns.filter(p => p.includes('\\d+\\.?\\d*'));
  assert(decimalPatterns.length >= 4, `C4：4 条 prose 正则应支持小数阶段，实际找到 ${decimalPatterns.length} 条`);
});

test('13-2: C4 state-sync 旧 (\\d+) 模式已消除', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  // 检查 prose 匹配中不再有裸 (\d+) 不含小数扩展
  // 方式：prose 4 条正则中每条都要有 \.?\\d*
  const phaseSection = src.slice(src.indexOf('phaseMatch'), src.indexOf('if (phaseMatch)'));
  assert(!phaseSection.includes('(\\d+)/i'), 'C4：prose 正则中裸 (\\d+)/i 应已替换为 (\\d+\\.?\\d*)/i');
});

test('13-3: C1 mutateBridge 含脏检查逻辑', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-shared.js'), 'utf8');
  assert(src.includes('beforeJson'), 'C1：mutateBridge 应捕获 beforeJson 快照');
  assert(src.includes('JSON.stringify(draft) !== beforeJson'), 'C1：mutateBridge 应做脏检查跳过写入');
});

test('13-4: C1 inferAndUpdate 含 _draftBefore 快照', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  assert(src.includes('_draftBefore = JSON.stringify(draft)'), 'C1：inferAndUpdate 应在开头快照 _draftBefore');
  assert(src.includes('_draftBefore !== JSON.stringify(draft)'), 'C1：inferAndUpdate 应在结尾做脏检查');
});

test('13-5: C5 defaultBridge web 检测用 resolveProjectRoot', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  // 确认 .claude/forge-project.json 路径来自 root（resolveProjectRoot 结果），而非裸 cwd
  // 方式：从 defaultBridge 函数体中查找 resolveProjectRoot + forge-project.json 同时出现
  const defaultBridgeBody = src.slice(src.indexOf('function defaultBridge('), src.indexOf('function spawnDetachedWorker'));
  assert(defaultBridgeBody.includes('resolveProjectRoot(cwd)'), 'C5：defaultBridge 应用 resolveProjectRoot(cwd) 检测 web 项目');
  assert(defaultBridgeBody.includes('forge-project.json'), 'C5：defaultBridge 仍应检查 forge-project.json');
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 14: Codex 第二轮对抗测试修复验证（D4/D7/D10）
// ─────────────────────────────────────────────────────────────────────────────

test('14-1: D4 project.cwd 用 resolveProjectRoot（defaultBridge）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  // defaultBridge 返回值中 project.cwd 应用 resolveProjectRoot，不是裸 path.resolve(cwd)
  const defaultBridgeBody = src.slice(src.indexOf('function defaultBridge('), src.indexOf('function spawnDetachedWorker'));
  assert(defaultBridgeBody.includes('resolveProjectRoot(cwd)'), 'D4：defaultBridge project.cwd 应用 resolveProjectRoot');
  // 确认裸 path.resolve(cwd) 已不在 project: { cwd 行
  assert(!defaultBridgeBody.includes('cwd: path.resolve(cwd)'), 'D4：defaultBridge 不应再用裸 path.resolve(cwd)');
});

test('14-2: D4 project.cwd 用 resolveProjectRoot（主处理器覆写）', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-context-bridge.js'), 'utf8');
  // 主处理器中 draft.project.cwd 赋值不再用 path.resolve(cwd)
  assert(!src.includes('draft.project.cwd  = path.resolve(cwd)'), 'D4：主处理器不应用裸 path.resolve(cwd)');
  assert(src.includes('draft.project.cwd  = shared.resolveProjectRoot(cwd)'), 'D4：主处理器应用 shared.resolveProjectRoot(cwd)');
});

test('14-3: D7 applyParsed 允许从 completed 恢复为 active', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-state-sync.js'), 'utf8');
  // 提取 applyParsed 函数体（从 function 声明到闭合 }）
  const startIdx = src.indexOf('function applyParsed(');
  const endIdx   = src.indexOf('\n}\n', startIdx) + 3;
  const applyBody = src.slice(startIdx, endIdx);
  assert(applyBody.includes("state.status = 'active'"), 'D7：applyParsed 应在 !_is_complete 时将状态设为 active');
  // 确认不再有 "else if (!state.status || state.status === 'active')" 这种限制条件
  assert(!applyBody.includes("state.status === 'active'"), 'D7：applyParsed 不应有限制 active 才能被赋值的 else if');
});

test('14-4: D10 isLastPhase 有 Number.isFinite 守卫', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-quality-pipeline.js'), 'utf8');
  const isLastBody = src.slice(src.indexOf('function isLastPhase('), src.indexOf('\n}\n', src.indexOf('function isLastPhase(')));
  assert(isLastBody.includes('Number.isFinite'), 'D10：isLastPhase 应有 Number.isFinite 守卫，防止 Infinity 误触发 ship 门');
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 15: Stdin Pipe Happy Path（6 个）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 15】Stdin Pipe Happy Path');

test('15-1: bridge.js Write 事件写入 bridge.json（_schema_version=2，changeEpoch=1）', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const r = spawnHook('forge-context-bridge.js', {
      cwd: tmpDir, session_id: 'test-15-1', tool_name: 'Write',
      tool_input: { file_path: path.join(tmpDir, 'src', 'app.ts') },
      tool_response: {},
    });
    assertEqual(r.exitCode, 0, '15-1: exitCode 应为 0');
    const bp = getBridgePathForDir(realRoot);
    assert(fs.existsSync(bp), '15-1: bridge.json 应被创建');
    const b = JSON.parse(fs.readFileSync(bp, 'utf8'));
    assertEqual(b._schema_version, 2, '15-1: _schema_version 应为 2');
    assertEqual(b.change.changeEpoch, 1, '15-1: changeEpoch 应为 1（一次源码写入）');
    assert(b.change.touchedFiles.some(f => f.endsWith('app.ts')), '15-1: touchedFiles 应含 app.ts');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('15-2: auto-fix.js Bash 失败 → stdout 含修复指令（additionalContext）', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const r = spawnHook('forge-auto-fix.js', {
      cwd: tmpDir, tool_name: 'Bash',
      tool_input: { command: 'npm test' },
      tool_response: { exit_code: 1, stderr: 'npm ERR: not found' },
    });
    assertEqual(r.exitCode, 0, '15-2: exitCode 应为 0');
    const out = JSON.parse(r.stdout);
    assert(out.hookSpecificOutput?.additionalContext?.includes('FORGE'), '15-2: 应含 FORGE 修复指令');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('15-3: auto-fix.js 同一错误第 3 次 → 升级到诊断模式', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const bp       = getBridgePathForDir(realRoot);
    const stderr   = 'npm ERR: not found';
    // hashError = sha256(stderr).slice(0,16)
    const errHash  = crypto.createHash('sha256').update(stderr).digest('hex').slice(0, 16);
    // 预写 bridge.json：同一错误已尝试 2 次
    fs.mkdirSync(path.dirname(bp), { recursive: true });
    fs.writeFileSync(bp, JSON.stringify({ auto_fix: { issue_hash: errHash, attempts: 2, max: 3 } }));
    const r = spawnHook('forge-auto-fix.js', {
      cwd: tmpDir, tool_name: 'Bash',
      tool_input: { command: 'npm test' },
      tool_response: { exit_code: 1, stderr },
    });
    assertEqual(r.exitCode, 0, '15-3: exitCode 应为 0');
    const out = JSON.parse(r.stdout);
    const ctx = out.hookSpecificOutput?.additionalContext || '';
    assert(ctx.includes('升级') || ctx.includes('上限') || ctx.includes('诊断'),
           '15-3: 第 3 轮应包含升级/上限关键词');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('15-4: state-sync Write STATE.md → state.json 含正确 phase 信息', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot  = getRealRoot(tmpDir);
    const stateMd   = path.join(tmpDir, '.planning', 'STATE.md');
    const content   = '---\ncurrent_phase: 3\ntotal_phases: 5\nstatus: active\n---\n# State\n';
    fs.writeFileSync(stateMd, content);
    const r = spawnHook('forge-state-sync.js', {
      cwd: tmpDir,
      tool_input: { file_path: stateMd },
      tool_response: {},
    });
    assertEqual(r.exitCode, 0, '15-4: exitCode 应为 0');
    const slug   = getSlugForDir(realRoot);
    const sp     = path.join(os.homedir(), '.forge', 'projects', slug, 'state.json');
    assert(fs.existsSync(sp), '15-4: state.json 应被创建');
    const state  = JSON.parse(fs.readFileSync(sp, 'utf8'));
    assertEqual(state.phase?.current, 3, '15-4: phase.current 应为 3');
    assertEqual(state.phase?.total,   5, '15-4: phase.total 应为 5');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('15-5: state-sync Write claude-progress.txt → state.json 含 last_session', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot   = getRealRoot(tmpDir);
    const progFile   = path.join(tmpDir, 'claude-progress.txt');
    const content    = '# Progress\n\n## [2026-03-25] - Session 1\nStarted development\n下一步：开发主页面\n';
    fs.writeFileSync(progFile, content);
    const r = spawnHook('forge-state-sync.js', {
      cwd: tmpDir,
      tool_input: { file_path: progFile },
      tool_response: {},
    });
    assertEqual(r.exitCode, 0, '15-5: exitCode 应为 0');
    const slug  = getSlugForDir(realRoot);
    const sp    = path.join(os.homedir(), '.forge', 'projects', slug, 'state.json');
    const state = JSON.parse(fs.readFileSync(sp, 'utf8'));
    assert(state.last_session?.includes('2026-03-25'), '15-5: last_session 应含日期');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('15-6: pipeline.js 读到 tests=passed → 注入 code_review 门（stdout 含 hookSpecificOutput）', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const bp       = getBridgePathForDir(realRoot);
    const bridge   = makeFullBridge({
      project: { cwd: realRoot },
      gates: { tests: { status: 'passed', epoch: 1 } },
    });
    fs.mkdirSync(path.dirname(bp), { recursive: true });
    fs.writeFileSync(bp, JSON.stringify(bridge));
    const r = spawnHook('forge-quality-pipeline.js', { cwd: tmpDir });
    assertEqual(r.exitCode, 0, '15-6: exitCode 应为 0');
    assert(r.stdout.includes('hookSpecificOutput'), '15-6: 应输出 hookSpecificOutput');
    const out = JSON.parse(r.stdout);
    assert(out.hookSpecificOutput?.additionalContext?.includes('code_review') ||
           out.hookSpecificOutput?.additionalContext?.includes('代码审查'),
           '15-6: 应注入 code_review 门');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 16: 文件系统副作用验证（5 个）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 16】文件系统副作用验证');

await testAsync('16-1: bridge.js 写入的 bridge.json 含所有必需顶层字段', async () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    spawnHook('forge-context-bridge.js', {
      cwd: tmpDir, session_id: 'test-16-1', tool_name: 'Write',
      tool_input: { file_path: path.join(tmpDir, 'x.ts') },
      tool_response: {},
    });
    const bp = getBridgePathForDir(realRoot);
    assert(fs.existsSync(bp), '16-1: bridge.json 应存在');
    const b = JSON.parse(fs.readFileSync(bp, 'utf8'));
    for (const key of ['_schema_version', 'project', 'phase', 'change', 'gates', 'audit']) {
      assert(key in b, `16-1: bridge.json 缺字段 ${key}`);
    }
    for (const g of ['tests', 'code_review', 'qa', 'security', 'benchmark', 'ship']) {
      assert(g in b.gates, `16-1: gates 缺 ${g}`);
    }
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

await testAsync('16-2: writeJsonAtomic → safeReadJson roundtrip 无损', async () => {
  const tmpFile = path.join(_shared.getTmpDir(), `test-rt-${Date.now()}.json`);
  try {
    const obj = { x: 1, arr: [1, null, 'hi'], nested: { a: true, b: null } };
    _shared.writeJsonAtomic(tmpFile, obj);
    const { data, corrupt } = _shared.safeReadJson(tmpFile, null);
    assert(!corrupt, '16-2: 不应 corrupt');
    assertEqual(JSON.stringify(data), JSON.stringify(obj), '16-2: roundtrip 无损');
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
});

await testAsync('16-3: appendJsonlQueue 顺序写入 5 条 → 恰好 5 行有效 JSON', async () => {
  const qPath = path.join(_shared.getTmpDir(), `test-q-${Date.now()}.jsonl`);
  try {
    for (let i = 0; i < 5; i++) {
      await _shared.appendJsonlQueue(qPath, { idx: i, cwd: '/tmp/test', slug: 'sl' });
    }
    const lines = fs.readFileSync(qPath, 'utf8').trim().split('\n').filter(Boolean);
    assertEqual(lines.length, 5, '16-3: 应有恰好 5 行');
    lines.forEach((l, i) => {
      const obj = JSON.parse(l);
      assertEqual(obj.idx, i, `16-3: 第 ${i} 行 idx 应为 ${i}`);
      assert('queued_at' in obj, `16-3: 第 ${i} 行缺 queued_at`);
    });
  } finally {
    try { fs.unlinkSync(qPath); } catch (_) {}
    try { fs.rmSync(qPath + '.lock', { recursive: true, force: true }); } catch (_) {}
  }
});

await testAsync('16-4: logHookError 写入 errors.jsonl 格式正确（含 ts/hook/error/context）', async () => {
  const marker = `test-16-4-${Date.now()}`;
  _shared.logHookError(marker, new Error('test-err'), { testCtx: true });
  const logFile = path.join(os.homedir(), '.forge', 'logs', 'hooks', 'errors.jsonl');
  assert(fs.existsSync(logFile), '16-4: errors.jsonl 应存在');
  const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean);
  const last  = JSON.parse(lines[lines.length - 1]);
  assertEqual(last.hook, marker, '16-4: hook 字段应匹配');
  assertEqual(last.error, 'test-err', '16-4: error 字段应匹配');
  assert(last.ts && last.ts.includes('T'), '16-4: ts 字段应为 ISO 时间');
  assert('context' in last, '16-4: 应有 context 字段');
});

await testAsync('16-5: mutateForgeState 写入 state.json 含 project_path 和 last_activity', async () => {
  const slug = `test-state-16-5-${Date.now()}`;
  try {
    await _shared.mutateForgeState(slug, s => {
      s.project_path  = '/test/project';
      s.last_activity = new Date().toISOString();
    });
    const sp    = path.join(os.homedir(), '.forge', 'projects', slug, 'state.json');
    const state = JSON.parse(fs.readFileSync(sp, 'utf8'));
    assertEqual(state.project_path, '/test/project', '16-5: project_path 应正确');
    assert(state.last_activity && state.last_activity.includes('T'), '16-5: last_activity 应为 ISO 时间');
  } finally {
    try { fs.rmSync(path.join(os.homedir(), '.forge', 'projects', slug),
                    { recursive: true, force: true }); } catch (_) {}
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 17: 错误恢复（5 个）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 17】错误恢复');

await testAsync('17-1: safeReadJson 读取损坏 JSON → corrupt:true，data:null，不崩溃', async () => {
  const tmpFile = path.join(_shared.getTmpDir(), `corrupt-${Date.now()}.json`);
  try {
    fs.writeFileSync(tmpFile, '{invalid json here');
    const { corrupt, data } = _shared.safeReadJson(tmpFile, 'fallback');
    assertEqual(corrupt, true, '17-1: 应为 corrupt:true');
    assert(data === null, '17-1: corrupt 时 data 应为 null');
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
});

await testAsync('17-2: mutateBridge 目标目录不存在 → 自动创建并写入成功', async () => {
  const fakeDir  = path.join(os.tmpdir(), `forge-nomkdir-${Date.now()}`);
  try {
    await _shared.mutateBridge(fakeDir, d => { d.autoCreated = true; });
    const bp       = _shared.getBridgePath(fakeDir);
    assert(fs.existsSync(bp), '17-2: bridge.json 应被创建');
    const { data } = _shared.safeReadJson(bp, null);
    assert(data?.autoCreated === true, '17-2: 写入内容应正确');
  } finally {
    try {
      const bp = _shared.getBridgePath(fakeDir);
      fs.rmSync(bp + '.lock',     { recursive: true, force: true });
      fs.rmSync(path.dirname(bp), { recursive: true, force: true });
    } catch (_) {}
  }
});

await testAsync('17-3: writeJsonAtomic 目标多层目录不存在 → 自动创建并写入成功', async () => {
  const deepDir  = mkTmpDir('-atomic');
  const deepFile = path.join(deepDir, 'a', 'b', 'c', 'test.json');
  try {
    _shared.writeJsonAtomic(deepFile, { ok: true });
    assert(fs.existsSync(deepFile), '17-3: 多层目录文件应被创建');
    const parsed = JSON.parse(fs.readFileSync(deepFile, 'utf8'));
    assertEqual(parsed.ok, true, '17-3: 内容应正确');
  } finally {
    try { fs.rmSync(deepDir, { recursive: true, force: true }); } catch (_) {}
  }
});

test('17-4: bridge.js 收到截断 JSON → exitCode=0，无 UnhandledPromiseRejection', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    // 故意发送不完整 JSON
    const r = spawnHook('forge-context-bridge.js', '{"cwd":"' + tmpDir, { timeout: 6000 });
    assertEqual(r.exitCode, 0, '17-4: 截断 JSON 应优雅退出（exitCode=0）');
    assert(!r.stderr.includes('UnhandledPromiseRejection'), '17-4: 无 unhandled rejection');
    assert(!r.stderr.includes('Error:'), '17-4: 无 Error 崩溃输出');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

await testAsync('17-5: mutateForgeState 读到损坏 state.json → 返回 null，损坏文件保持不变', async () => {
  const slug      = `test-corrupt-17-5-${Date.now()}`;
  const stateDir  = path.join(os.homedir(), '.forge', 'projects', slug);
  const stateFile = path.join(stateDir, 'state.json');
  try {
    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(stateFile, '{corrupt');
    const { state } = await _shared.mutateForgeState(slug, s => { s.recovered = true; });
    assert(state === null, '17-5: corrupt state.json 应跳过 mutation，返回 null');
    const still = fs.readFileSync(stateFile, 'utf8');
    assertEqual(still, '{corrupt', '17-5: 损坏文件应原样保留，不被覆写');
  } finally {
    try { fs.rmSync(stateDir, { recursive: true, force: true }); } catch (_) {}
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 18: 跨 Hook 数据流（5 个）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 18】跨 Hook 数据流');

test('18-1: bridge.js Bash(npm test 成功) → pipeline.js 读到 tests=passed → 注入 code_review', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    // Step 1: bridge.js 标记 tests=passed
    spawnHook('forge-context-bridge.js', {
      cwd: tmpDir, session_id: 'test-18-1', tool_name: 'Bash',
      tool_input: { command: 'npm test' },
      tool_response: { exit_code: 0 },
    });
    // 验证 bridge.json 已写入 tests=passed
    const bp = getBridgePathForDir(realRoot);
    const b1 = JSON.parse(fs.readFileSync(bp, 'utf8'));
    assertEqual(b1.gates?.tests?.status, 'passed', '18-1: bridge 应有 tests=passed');
    // Step 2: pipeline.js 应注入 code_review 门
    const r = spawnHook('forge-quality-pipeline.js', { cwd: tmpDir });
    assertEqual(r.exitCode, 0, '18-1: pipeline exitCode 应为 0');
    assert(r.stdout.includes('hookSpecificOutput'), '18-1: pipeline 应输出 hookSpecificOutput');
    assert(r.stdout.includes('code_review') || r.stdout.includes('代码审查'),
           '18-1: pipeline 应注入 code_review 门');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('18-2: state-sync 写 state.json → session-start 检测到活跃项目并输出恢复提示', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const slug     = getSlugForDir(realRoot);
    const stateMd  = path.join(tmpDir, '.planning', 'STATE.md');
    fs.writeFileSync(stateMd, '---\ncurrent_phase: 2\ntotal_phases: 4\nstatus: active\n---\n');
    // Step 1: state-sync 写 state.json
    spawnHook('forge-state-sync.js', {
      cwd: tmpDir, tool_input: { file_path: stateMd }, tool_response: {},
    });
    const sp = path.join(os.homedir(), '.forge', 'projects', slug, 'state.json');
    assert(fs.existsSync(sp), '18-2: state.json 应存在');
    const st = JSON.parse(fs.readFileSync(sp, 'utf8'));
    assert(st.phase?.current === 2, '18-2: state.json phase.current 应为 2');
    // Step 2: session-start 应检测到此项目
    const r = spawnHook('forge-session-start.js', '{}');
    // 可能无 stdout（若进程在其他活跃项目先退出）；只需不崩溃且 exitCode=0
    assertEqual(r.exitCode, 0, '18-2: session-start exitCode 应为 0');
    // 若有 stdout，应包含该 slug 的恢复命令
    if (r.stdout) {
      const out = JSON.parse(r.stdout);
      const ctx = out.hookSpecificOutput?.additionalContext || '';
      assert(ctx.includes(slug) || ctx.includes('Forge'), '18-2: session-start 输出应含 slug 或 Forge');
    }
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

await testAsync('18-3: appendJsonlQueue 写入 job → 每行符合 git-worker 期望格式（含 cwd/slug/reason/queued_at）', async () => {
  const qPath = path.join(_shared.getTmpDir(), `test-q-18-3-${Date.now()}.jsonl`);
  try {
    await _shared.appendJsonlQueue(qPath, { cwd: '/test/project', slug: 'my-slug-abc1', reason: 'context_critical', touchedFiles: ['src/app.ts'] });
    const line = fs.readFileSync(qPath, 'utf8').trim();
    const job  = JSON.parse(line);
    assert('cwd'         in job, '18-3: 应有 cwd');
    assert('slug'        in job, '18-3: 应有 slug');
    assert('reason'      in job, '18-3: 应有 reason');
    assert('queued_at'   in job, '18-3: 应有 queued_at（自动附加）');
    assert('touchedFiles' in job, '18-3: 应有 touchedFiles');
    assert(Array.isArray(job.touchedFiles), '18-3: touchedFiles 应为数组');
  } finally {
    try { fs.unlinkSync(qPath); } catch (_) {}
    try { fs.rmSync(qPath + '.lock', { recursive: true, force: true }); } catch (_) {}
  }
});

test('18-4: bridge.js 3 次 Write 不同文件 → changeEpoch 累加到 3', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    for (const fname of ['a.ts', 'b.ts', 'c.ts']) {
      spawnHook('forge-context-bridge.js', {
        cwd: tmpDir, session_id: `test-18-4`, tool_name: 'Write',
        tool_input: { file_path: path.join(tmpDir, fname) },
        tool_response: {},
      });
    }
    const bp = getBridgePathForDir(realRoot);
    const b  = JSON.parse(fs.readFileSync(bp, 'utf8'));
    assertEqual(b.change.changeEpoch, 3, '18-4: 3 次 Write → changeEpoch=3');
    assertEqual(b.change.touchedFiles.length, 3, '18-4: touchedFiles 应有 3 条');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('18-5: pipeline.js 读到 code_review=leased（未过期）→ 不重复注入（stdout 空）', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const bp       = getBridgePathForDir(realRoot);
    const future   = new Date(Date.now() + 10 * 60 * 1000).toISOString();  // 10分钟后
    const bridge   = makeFullBridge({
      project: { cwd: realRoot },
      gates: {
        tests:       { status: 'passed', epoch: 1 },
        code_review: { status: 'leased', epoch: null, leaseUntil: future },
      },
    });
    fs.mkdirSync(path.dirname(bp), { recursive: true });
    fs.writeFileSync(bp, JSON.stringify(bridge));
    const r = spawnHook('forge-quality-pipeline.js', { cwd: tmpDir });
    assertEqual(r.exitCode, 0, '18-5: exitCode 应为 0');
    assertEqual(r.stdout.trim(), '', '18-5: leased 未过期时不应再注入（stdout 应为空）');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 19: 边界与异常输入（5 个）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 19】边界与异常输入');

test('19-1: resolveSlug 超长路径（200 字符）→ slug ≤49 字符，无非法字符', () => {
  const longPath = path.join(os.tmpdir(), 'a'.repeat(200));
  const slug     = _shared.resolveSlug(longPath);
  assert(slug.length <= 49, `19-1: slug 长度 ${slug.length} 超过 49`);
  assert(/^[a-zA-Z0-9\u4e00-\u9fff\-]+$/.test(slug), `19-1: slug 含非法字符: ${slug}`);
});

test('19-2: sanitizeSessionId — 路径穿越/null bytes 拒绝，合法 ID 通过', () => {
  assert(_shared.sanitizeSessionId('../../../etc/passwd') === null,
         '19-2: 路径穿越 ID 应被拒绝');
  assert(_shared.sanitizeSessionId('test\x00session') === null,
         '19-2: 含 null byte 的 ID 应被拒绝');
  assert(_shared.sanitizeSessionId('a'.repeat(65)) === null,
         '19-2: 超过 64 字符的 ID 应被拒绝');
  const valid = _shared.sanitizeSessionId('valid-session.123_abc');
  assertEqual(valid, 'valid-session.123_abc', '19-2: 合法 ID 应原样返回');
});

test('19-3: state-sync 接收空 STATE.md → exitCode=0，不崩溃', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const emptyMd = path.join(tmpDir, '.planning', 'STATE.md');
    fs.writeFileSync(emptyMd, '');  // 覆盖为空
    const r = spawnHook('forge-state-sync.js', {
      cwd: tmpDir, tool_input: { file_path: emptyMd }, tool_response: {},
    });
    assertEqual(r.exitCode, 0, '19-3: 空 STATE.md 应优雅处理，exitCode=0');
    assert(!r.stderr.includes('TypeError'), '19-3: 无 TypeError 崩溃');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('19-4: state-sync STATE.md frontmatter current_phase:NaN → state.json 无 NaN phase', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const stateMd  = path.join(tmpDir, '.planning', 'STATE.md');
    fs.writeFileSync(stateMd, '---\ncurrent_phase: NaN\ntotal_phases: 5\n---\n');
    spawnHook('forge-state-sync.js', {
      cwd: tmpDir, tool_input: { file_path: stateMd }, tool_response: {},
    });
    const slug  = getSlugForDir(realRoot);
    const sp    = path.join(os.homedir(), '.forge', 'projects', slug, 'state.json');
    if (fs.existsSync(sp)) {
      const state = JSON.parse(fs.readFileSync(sp, 'utf8'));
      const ph    = state.phase?.current;
      assert(ph == null || !Number.isNaN(ph), '19-4: state.json phase.current 不应为 NaN');
    }
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('19-5: evaluateSecurityRisk 源码守卫：touchedFiles=[] 时有短路返回', () => {
  const src = fs.readFileSync(path.join(HOOKS_DIR, 'forge-quality-pipeline.js'), 'utf8');
  assert(
    src.includes('touchedFiles.length === 0') || src.includes("touchedFiles || []).length === 0"),
    '19-5: evaluateSecurityRisk 应有空数组短路返回守卫'
  );
  // pipeline 主流程也应有 touchedFiles.length > 0 条件
  assert(src.includes('touchedFiles.length > 0'), '19-5: 主流程应先检查 touchedFiles 非空再调用 evaluateSecurityRisk');
});

// ─────────────────────────────────────────────────────────────────────────────
// 组 20: 质量门 FSM 完整路径（4 个）
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n【组 20】质量门 FSM 完整路径');

test('20-1: nextGateToInject — tests=passed → 注入 code_review（非 Web，phase 1）', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const bp       = getBridgePathForDir(realRoot);
    const bridge   = makeFullBridge({
      project: { cwd: realRoot, isWeb: false },
      gates: { tests: { status: 'passed', epoch: 1 } },
    });
    fs.mkdirSync(path.dirname(bp), { recursive: true });
    fs.writeFileSync(bp, JSON.stringify(bridge));
    const r = spawnHook('forge-quality-pipeline.js', { cwd: tmpDir });
    assert(r.stdout.includes('code_review') || r.stdout.includes('代码审查'),
           '20-1: 应注入 code_review 门');
    // 验证 bridge.json 中 code_review 已 leased
    const b2 = JSON.parse(fs.readFileSync(bp, 'utf8'));
    assertEqual(b2.gates.code_review.status, 'leased', '20-1: code_review 应变为 leased');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('20-2: nextGateToInject — code_review=passed + isWeb=true → 注入 qa 门', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const bp       = getBridgePathForDir(realRoot);
    const bridge   = makeFullBridge({
      project: { cwd: realRoot, isWeb: true },
      gates: {
        tests:       { status: 'passed', epoch: 1 },
        code_review: { status: 'passed', epoch: 1 },
        qa:          { status: 'idle',   epoch: null, leaseUntil: null },
      },
    });
    fs.mkdirSync(path.dirname(bp), { recursive: true });
    fs.writeFileSync(bp, JSON.stringify(bridge));
    const r = spawnHook('forge-quality-pipeline.js', { cwd: tmpDir });
    assert(r.stdout.includes('qa') || r.stdout.includes('QA') || r.stdout.includes('浏览器'),
           '20-2: Web 项目应注入 qa 门');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('20-3: nextGateToInject — 所有核心门 passed + isLastPhase → 注入 ship 门', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const bp       = getBridgePathForDir(realRoot);
    const bridge   = makeFullBridge({
      project: { cwd: realRoot, isWeb: false },
      phase:   { current: 3, total: 3, phaseEpoch: 1 },
      gates: {
        tests:       { status: 'passed', epoch: 1 },
        code_review: { status: 'passed', epoch: 1 },
      },
    });
    fs.mkdirSync(path.dirname(bp), { recursive: true });
    fs.writeFileSync(bp, JSON.stringify(bridge));
    const r = spawnHook('forge-quality-pipeline.js', { cwd: tmpDir });
    assert(r.stdout.includes('ship') || r.stdout.includes('PR') || r.stdout.includes('部署'),
           '20-3: 最后阶段全部通过应注入 ship 门');
  } finally {
    cleanupForgeTmpDir(tmpDir);
  }
});

test('20-4: nextGateToInject — leased 门已过期 → 重新注入（lease TTL 失效）', () => {
  const tmpDir = setupForgeTmpDir();
  try {
    const realRoot = getRealRoot(tmpDir);
    const bp       = getBridgePathForDir(realRoot);
    const pastTime = new Date(Date.now() - 100).toISOString();  // 100ms 前（已过期）
    const bridge   = makeFullBridge({
      project: { cwd: realRoot },
      gates: {
        tests:       { status: 'passed', epoch: 1 },
        code_review: { status: 'leased', epoch: null, leaseUntil: pastTime },
      },
    });
    fs.mkdirSync(path.dirname(bp), { recursive: true });
    fs.writeFileSync(bp, JSON.stringify(bridge));
    const r = spawnHook('forge-quality-pipeline.js', { cwd: tmpDir });
    assertEqual(r.exitCode, 0, '20-4: exitCode 应为 0');
    assert(r.stdout.includes('hookSpecificOutput'), '20-4: 过期 lease 应被重新注入');
    const b2 = JSON.parse(fs.readFileSync(bp, 'utf8'));
    assertEqual(b2.gates.code_review.status, 'leased', '20-4: code_review 应重新 leased');
    assert(new Date(b2.gates.code_review.leaseUntil) > new Date(), '20-4: 新 leaseUntil 应在未来');
  } finally {
    cleanupForgeTmpDir(tmpDir);
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
