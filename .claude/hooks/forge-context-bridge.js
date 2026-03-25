#!/usr/bin/env node
// forge-context-bridge.js - v2.4.0
// PostToolUse hook: 事件归约层
//
// 修复（相比 v1.x）：
// - P2#10  phaseEpoch 驱动：gsd:plan-phase 只在阶段号真正变化时重置 gates
// - P2#15  git 操作入队：不再内联同步 git commit，改为写 queue + spawn worker
// - P3#16  非 Forge 项目提前退出：不再为所有 cwd 写 bridge 文件
// - P3#19  metrics 验证：remaining 合法性检查（0-100 浮点数）
// - 并发安全：通过 shared.mutateBridge（advisory lock）保护 bridge 写入

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { spawn } = require('child_process');

const shared = require('./forge-shared');

// ─── 配置 ─────────────────────────────────────────────────────────────────────

function loadForgeConfig() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.forge', 'config.json'), 'utf8'));
    return {
      WARNING_THRESHOLD:  raw.context_thresholds?.warning       ?? 35,
      CRITICAL_THRESHOLD: raw.context_thresholds?.critical      ?? 25,
      DEBOUNCE_CALLS:     raw.context_thresholds?.debounce_calls ?? 5,
    };
  } catch (_) {
    return { WARNING_THRESHOLD: 35, CRITICAL_THRESHOLD: 25, DEBOUNCE_CALLS: 5 };
  }
}

const { WARNING_THRESHOLD, CRITICAL_THRESHOLD, DEBOUNCE_CALLS } = loadForgeConfig();
const STALE_SECONDS = 60;

// ─── Bridge 默认结构（v2.0 新 schema）────────────────────────────────────────

function emptyGate() {
  // Bug2 fix: failCount 纳入初始值，resetGate/resetAllGates 均清零
  return { status: 'idle', epoch: null, leaseUntil: null, failCount: 0 };
}

function defaultBridge(cwd, slug) {
  // 从 forge state.json 读取已有信息
  let isWeb = false, flowType = 'new', phaseNum = 1, phaseTotal = null;
  try {
    const { data, corrupt } = shared.safeReadJson(
      path.join(os.homedir(), '.forge', 'projects', slug, 'state.json'), {}
    );
    if (data && !corrupt) {  // F08：使用 safeReadJson 返回的 corrupt 标志
      flowType   = data.flow_type || 'new';
      phaseNum   = data.phase?.current ?? 1;  // F14：?? 允许 phase 0（|| 会把 0 当 falsy）
      phaseTotal = data.phase?.total   || null;
    }
  } catch (_) {}

  // 检测 Web 项目（C5 fix：用 resolveProjectRoot 统一 worktree/子目录身份）
  try {
    const root = shared.resolveProjectRoot(cwd);
    const fp = path.join(root, '.claude', 'forge-project.json');
    if (fs.existsSync(fp)) {
      isWeb = JSON.parse(fs.readFileSync(fp, 'utf8')).is_web_project ?? false;
    } else {
      const hasNext = fs.existsSync(path.join(root, 'next.config.js')) ||
                      fs.existsSync(path.join(root, 'next.config.ts'));
      if (hasNext) {
        isWeb = true;
      } else if (fs.existsSync(path.join(root, 'package.json'))) {
        const pkg  = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        isWeb = !!(deps.next || deps.react || deps.vue || deps.nuxt || deps.svelte);
      }
    }
  } catch (_) {}

  return {
    // D4 fix: 用 resolveProjectRoot 统一 project.cwd（不再存裸 cwd）
    project: { cwd: shared.resolveProjectRoot(cwd), slug, isWeb, flowType },
    phase:   { current: phaseNum, total: phaseTotal, phaseEpoch: 0 },
    change: {
      changeEpoch:      0,
      touchedFiles:     [],
      planWrittenAt:    null,
      summaryWrittenAt: null,
      securityRisk:     { required: false, reasons: [], files: [] },
    },
    gates: {
      plan_review: emptyGate(),
      tests:       emptyGate(),
      code_review: emptyGate(),
      qa:          emptyGate(),
      security:    emptyGate(),
      benchmark:   emptyGate(),
      ship:        emptyGate(),
      escalation:  emptyGate(),  // P2 fix: 质量门全卡死时的人工介入告警门
    },
    context: { warningLevel: null, lastSaveAt: null },
    audit:   { lastToolName: null, updatedAt: null },
    // v1→v2 迁移标记，供 pipeline 判断 schema 版本
    _schema_version: 2,
  };
}

// 如果是旧 v1 schema（有 quality_gates 字段），重置为新 schema
function migrateIfNeeded(draft, cwd, slug) {
  if (draft._schema_version === 2) return;
  // 旧 bridge → 重建，保留 cwd/slug 信息避免 defaultBridge 重读慢路径
  Object.keys(draft).forEach(k => delete draft[k]);
  Object.assign(draft, defaultBridge(cwd, slug));
}

// ─── 下游门列表（源码变更时失效）──────────────────────────────────────────────

const DOWNSTREAM_GATES = ['tests', 'code_review', 'qa', 'security', 'benchmark', 'ship'];

function resetGate(draft, name) {
  draft.gates[name] = emptyGate();
}

function resetAllGates(draft) {
  for (const g of Object.keys(draft.gates)) resetGate(draft, g);
  // 同时清 securityRisk，防止上阶段的安全标记粘滞到新阶段（P2#4）
  if (draft.change) draft.change.securityRisk = { required: false, reasons: [], files: [] };
}

function markGatePassed(draft, name) {
  if (!draft.gates[name]) return;
  draft.gates[name].status    = 'passed';
  draft.gates[name].epoch     = draft.change.changeEpoch;
  draft.gates[name].leaseUntil = null;
  // C-NEW-1 fix: 清零 failCount，否则 3 次失败后 ship/escalation 会永久阻断，
  // 即使后续成功也无法解锁
  draft.gates[name].failCount  = 0;
}

// M2 fix: Skill/Agent 失败时标记质量门为 failed，避免 lease 卡住 10 分钟 + 无限重试
function markGateFailed(draft, name) {
  if (!draft.gates?.[name]) return;
  draft.gates[name].status    = 'failed';
  draft.gates[name].leaseUntil = null;
  draft.gates[name].failCount  = (draft.gates[name].failCount || 0) + 1;
}

// DUP-1: 测试命令匹配正则移至 forge-shared.js 统一维护
const TEST_CMD = shared.TEST_PATTERN;

// ─── 事件归约（inferAndUpdate）────────────────────────────────────────────────

function inferAndUpdate(draft, toolName, toolInput, toolResponse) {
  // C1 fix: 快照当前状态，用于末尾脏检查（跳过无意义的 audit.updatedAt 更新）
  const _draftBefore = JSON.stringify(draft);

  // ── Write / Edit / MultiEdit ──────────────────────────────────────────────
  if (toolName === 'Write' || toolName === 'Edit' || toolName === 'MultiEdit') {
    const fp = toolInput?.file_path || toolInput?.path || '';

    // L2 fix: 使用 path.relative 做路径判断，替代 string includes（防止 my.planning.notes/ 误匹配）
    // Bug4 fix: fp 可能是相对路径，须先 resolve 成绝对路径再做 path.relative
    // 否则 path.relative('/repo', 'src/app.ts') 会得到 '../../src/app.ts' 等错误结果
    const projectCwd = draft.project?.cwd || '';
    const absFp = projectCwd && !path.isAbsolute(fp) ? path.resolve(projectCwd, fp) : fp;
    const rel = projectCwd ? path.relative(projectCwd, absFp) : absFp;
    const isInPlanning = rel.startsWith('.planning' + path.sep) && !rel.startsWith('..');
    const isInClaude   = rel.startsWith('.claude'   + path.sep) && !rel.startsWith('..');

    if (isInPlanning && path.basename(fp) === 'PLAN.md') {
      // PLAN.md 写入 → plan_review 进入 required
      draft.gates.plan_review.status = 'required';
      draft.change.planWrittenAt     = new Date().toISOString();

    } else if (isInPlanning && path.basename(fp) === 'SUMMARY.md') {
      // SUMMARY.md 写入 → tests 进入 required
      draft.gates.tests.status      = 'required';
      draft.change.summaryWrittenAt = new Date().toISOString();

    } else if (!isInPlanning && !isInClaude && fp !== '') {
      // 源码变更 → changeEpoch++，下游门全部失效
      draft.change.changeEpoch++;
      // M5 fix: touchedFiles 存入时规范化路径（消除 /var→/private/var symlink 身份分裂）
      // safeGitAdd 依赖 path.relative 边界检查，若 cwd 已 realpathSync 而 fp 未规范化，会被误判为越界
      const canonFp = (() => { try { return fs.realpathSync(absFp); } catch (_) { return absFp; } })();
      // 去重追踪被修改的文件（最多保留 50 个）
      if (!draft.change.touchedFiles.includes(canonFp)) {
        draft.change.touchedFiles.push(canonFp);
        if (draft.change.touchedFiles.length > 50) draft.change.touchedFiles.shift();
      }
      // 新文件加入后重置安全风险，让 pipeline 用最新 touchedFiles 重新评估（P2#4）
      draft.change.securityRisk = { required: false, reasons: [], files: [] };
      // 失效 epoch 不匹配的下游门
      const ce = draft.change.changeEpoch;
      for (const g of DOWNSTREAM_GATES) {
        if (draft.gates[g].epoch !== ce) {
          draft.gates[g].status    = 'idle';
          draft.gates[g].epoch     = null;
          draft.gates[g].leaseUntil = null;
          // Bug2 fix: epoch 切换时同步清零 failCount，防止旧失败次数跨 epoch 积累导致永久锁死
          draft.gates[g].failCount  = 0;
        }
      }
    }
  }

  // ── Skill 调用 ────────────────────────────────────────────────────────────
  if (toolName === 'Skill') {
    const skill   = toolInput?.skill || '';
    const isError = toolResponse?.isError === true;
    draft.audit.lastToolName = 'Skill:' + skill;

    if (skill === 'gsd:plan-phase') {
      // P2#10：只在阶段号真正变化时重置（phaseEpoch 驱动）
      const args     = String(toolInput?.args || '');
      const _parsed  = parseFloat(args);
      const phaseNum = Number.isNaN(_parsed) ? null : _parsed;  // OPT-11：phase=0 不再被 || null 截断
      if (phaseNum != null && phaseNum !== draft.phase.current) {
        draft.phase.current = phaseNum;
        draft.phase.phaseEpoch++;
        resetAllGates(draft);
        draft.change.touchedFiles  = [];
        draft.change.planWrittenAt = null;
        // changeEpoch 不重置：源码变更历史跨阶段保留
      }
      // 无论是否切换阶段，PLAN.md 将由 Write 事件触发 plan_review
    } else if (!isError) {
      // 成功的 Skill 调用 → 标记对应质量门通过
      if (/autoplan/.test(skill))                          markGatePassed(draft, 'plan_review');
      else if (/\breview\b/.test(skill) && !/qa-review/.test(skill)) markGatePassed(draft, 'code_review');
      else if (/\bqa\b/.test(skill))                       markGatePassed(draft, 'qa');
      else if (/\bcso\b/.test(skill))                      markGatePassed(draft, 'security');
      else if (/\bbenchmark\b/.test(skill))                markGatePassed(draft, 'benchmark');
      else if (/\bship\b/.test(skill))                     markGatePassed(draft, 'ship');
    } else {
      // M2 fix: Skill 失败时将 leased 门标记为 failed，防止 TTL 卡住 + 无限重试
      // Bug3 fix: 只在门实际处于 leased 状态时才标记 failed，防止 plan-eng-review 等
      // 误消耗 code_review 的 failCount（两者名字都含 "review" 但对应不同的门）
      // markGateFailed 内部有 gate 存在性检查，此处额外加 leased 状态守卫
      function _failIfLeased(name) {
        if (draft.gates?.[name]?.status === 'leased') markGateFailed(draft, name);
      }
      if (/autoplan/.test(skill))                          _failIfLeased('plan_review');
      else if (/\breview\b/.test(skill) && !/qa-review/.test(skill)) _failIfLeased('code_review');
      else if (/\bqa\b/.test(skill))                       _failIfLeased('qa');
      else if (/\bcso\b/.test(skill))                      _failIfLeased('security');
      else if (/\bbenchmark\b/.test(skill))                _failIfLeased('benchmark');
      else if (/\bship\b/.test(skill))                     _failIfLeased('ship');
    }
  }

  // ── Bash 命令 ─────────────────────────────────────────────────────────────
  if (toolName === 'Bash') {
    const cmd  = toolInput?.command || '';
    // DUP-4: 退出码解析统一用 shared.parseExitCode
    const exit = shared.parseExitCode(toolResponse);
    draft.audit.lastToolName = 'Bash';
    if (exit === 0 && TEST_CMD.test(cmd)) {
      markGatePassed(draft, 'tests');
    }
  }

  // ── Agent / Task ──────────────────────────────────────────────────────────
  if (toolName === 'Agent' || toolName === 'Task') {
    const st      = toolInput?.subagent_type || '';
    const isError = toolResponse?.isError === true;  // F02：失败的 Agent 不能标记门通过
    draft.audit.lastToolName = toolName + ':' + st;
    if (!isError && st === 'gsd-executor')               markGatePassed(draft, 'tests');    // verifier 已内嵌
    if (!isError && st === 'superpowers:code-reviewer')  markGatePassed(draft, 'code_review');
    if (!isError && st === 'gsd-verifier')               markGatePassed(draft, 'tests');
  }

  // 同步 phase/isWeb（OPT-4：只在 Skill/Write/Edit/MultiEdit 时读，减少~60% I/O）
  if (toolName === 'Skill' || toolName === 'Write' || toolName === 'Edit' || toolName === 'MultiEdit') {
    try {
      const { data, corrupt } = shared.safeReadJson(
        path.join(os.homedir(), '.forge', 'projects', draft.project.slug, 'state.json'), null
      );
      if (data && !corrupt) {  // F08：使用 safeReadJson 返回的 corrupt 标志
        if (data.phase?.current != null) draft.phase.current = data.phase.current;  // F14：!= null 允许 phase 0
        if (data.phase?.total)   draft.phase.total   = data.phase.total;
        if (data.flow_type)      draft.project.flowType = data.flow_type;
      }
    } catch (_) {}
  }

  // C1 fix: 只在有真实变更时更新 audit.updatedAt（在函数开头已捕获 _draftBefore）
  if (typeof _draftBefore === 'string' && _draftBefore !== JSON.stringify(draft)) {
    draft.audit.updatedAt = new Date().toISOString();
  }
}

// ─── 上下文保存（入队 git，不内联执行）────────────────────────────────────────

function spawnDetachedWorker(workerPath) {
  try {
    // F20: 检查 worker 是否已在运行（锁存在 → 跳过，防止无限 spawn）
    // C3 fix: 同时检查 stale lock（>20min），防止 worker 崩溃后永久堵塞 git 队列
    const workerLockDir = path.join(os.homedir(), '.forge', 'runtime', 'git', 'worker.lock');
    if (fs.existsSync(workerLockDir)) {
      try {
        const lockAge = Date.now() - fs.statSync(workerLockDir).mtimeMs;
        if (lockAge < 20 * 60 * 1000) return;  // 新鲜锁 → worker 仍在运行，跳过
        // stale 锁（>20min）→ worker 已死，清除后继续 spawn
        fs.rmSync(workerLockDir, { recursive: true });
      } catch (_) { return; }  // 无法读取锁状态 → 保守跳过
    }
    const child = spawn('node', [workerPath], {
      detached: true, stdio: 'ignore',
    });
    child.unref();  // 立即解除引用，hook 进程不等待 worker 完成
  } catch (_) {}
}

function writeHandoff(cwd, slug) {
  try {
    const planDir = path.join(cwd, '.planning');
    if (!fs.existsSync(planDir)) return;
    const stateMd  = path.join(planDir, 'STATE.md');
    const summary  = fs.existsSync(stateMd) ? fs.readFileSync(stateMd, 'utf8').slice(0, 500) : '';
    shared.writeJsonAtomic(path.join(planDir, 'HANDOFF.json'), {
      timestamp:     new Date().toISOString(),
      trigger:       'context_critical_auto_save',
      project_slug:  slug,
      resume_command: `/forge resume ${slug}`,
      state_summary: summary,
      note: '由 forge-context-bridge.js v2 自动生成。使用 /forge resume 恢复工作。',
    });
  } catch (e) {
    shared.logHookError('forge-context-bridge/writeHandoff', e, { cwd, slug });
  }
}

function checkContextWarning(cwd, slug, sessionId, bridge) {
  // F06：先 sanitize sessionId，防止路径穿越攻击
  const safeId = shared.sanitizeSessionId(sessionId);
  if (!safeId) return null;
  // P3#19：metrics 验证（remaining 必须是 0-100 的合法数字）
  const metricsPath = path.join(shared.getTmpDir(), `claude-ctx-${safeId}.json`);
  // 兼容旧路径 /tmp
  const legacyPath  = path.join(os.tmpdir(), `claude-ctx-${safeId}.json`);
  const mPath       = fs.existsSync(metricsPath) ? metricsPath :
                      fs.existsSync(legacyPath)  ? legacyPath  : null;
  if (!mPath) return null;

  const { data: metrics, corrupt } = shared.safeReadJson(mPath, null);
  if (!metrics || corrupt) return null;

  // 验证 remaining 合法性
  const remaining = metrics.remaining_percentage;
  if (typeof remaining !== 'number' || remaining < 0 || remaining > 100 || isNaN(remaining)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (metrics.timestamp && (now - metrics.timestamp) > STALE_SECONDS) return null;
  if (remaining > WARNING_THRESHOLD) return null;

  // 防抖（safeId 已在函数顶部 F06 处声明）
  const warnKey = path.join(shared.getTmpDir(), `forge-ctx-${safeId}-warned.json`);
  let wd = { callsSinceWarn: 0, lastLevel: null };
  try { wd = JSON.parse(fs.readFileSync(warnKey, 'utf8')); } catch (_) {}
  wd.callsSinceWarn = (wd.callsSinceWarn || 0) + 1;
  const isCritical  = remaining <= CRITICAL_THRESHOLD;
  const escalated   = isCritical && wd.lastLevel === 'warning';
  if (wd.callsSinceWarn > 1 && wd.callsSinceWarn < DEBOUNCE_CALLS && !escalated) {
    shared.writeJsonAtomic(warnKey, wd);  // F15：原子写防并发损坏 warned.json
    return null;
  }
  wd.callsSinceWarn = 0;
  wd.lastLevel      = isCritical ? 'critical' : 'warning';
  shared.writeJsonAtomic(warnKey, wd);  // F15：原子写防并发损坏 warned.json

  const usedPct = metrics.used_pct != null ? metrics.used_pct : (100 - remaining);
  const acts    = [];

  // M3 fix: queue job 的 cwd 用 repo root，防止子目录 session 导致 safeGitAdd 路径边界误判
  // 提升到 if/else 前，确保 warning 分支也能使用（Bug1 fix: 原在 if 块内导致 warning 分支 ReferenceError）
  const rootCwd = shared.resolveProjectRoot(cwd);

  if (isCritical) {
    // 入队 git checkpoint（P2#15：不内联同步执行）
    const qPath = shared.getGitQueuePath();
    shared.appendJsonlQueue(qPath, {
      cwd: rootCwd, slug, reason: 'context_critical',
      touchedFiles: bridge.change?.touchedFiles || [],
    }).then(() => {
      const workerPath = path.join(__dirname, 'forge-git-worker.js');
      if (fs.existsSync(workerPath)) spawnDetachedWorker(workerPath);
    }).catch(e => shared.logHookError('forge-context-bridge/gitQueue', e, { cwd }));

    writeHandoff(cwd, slug);
    acts.push('✅ 已写入恢复文件 (.planning/HANDOFF.json)');
    acts.push('✅ 已入队 git checkpoint（异步执行）');

    // 快照
    try {
      const snapsDir = path.join(os.homedir(), '.forge', 'projects', slug, 'snapshots');
      fs.mkdirSync(snapsDir, { recursive: true });
      const ts = Date.now();
      shared.writeJsonAtomic(path.join(snapsDir, `${ts}.json`), {
        timestamp: new Date().toISOString(), project_path: cwd,
        level: 'critical', remaining_percentage: remaining,
        resume_command: `/forge resume ${slug}`,
      });
      acts.push(`✅ 已保存快照到 ~/.forge/projects/${slug}/`);
    } catch (_) {}

    return `⛔ CONTEXT CRITICAL: 上下文已用 ${usedPct}%，剩余 ${remaining}%。\n已自动保存工作进度。\n${acts.join('\n')}\n请立即完成当前原子任务后停止。下次继续用：/forge resume ${slug}`;
  } else {
    // 入队 warning checkpoint
    const qPath = shared.getGitQueuePath();
    shared.appendJsonlQueue(qPath, {
      cwd: rootCwd, slug, reason: 'context_warning',
      touchedFiles: bridge.change?.touchedFiles || [],
    }).then(() => {
      const workerPath = path.join(__dirname, 'forge-git-worker.js');
      if (fs.existsSync(workerPath)) spawnDetachedWorker(workerPath);
    }).catch(e => shared.logHookError('forge-context-bridge/gitQueueWarn', e, { cwd }));
    acts.push('✅ 已入队 git checkpoint（异步执行）');

    return `⚠️ CONTEXT WARNING: 上下文已用 ${usedPct}%，剩余 ${remaining}%。\n${acts.join('\n')}\n避免开始新的复杂任务，尽快完成当前阶段。`;
  }
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

let input = '';
const timeout = setTimeout(() => process.exit(0), 10000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => (input += c));
process.stdin.on('end', async () => {
  clearTimeout(timeout);
  try {
    const data         = JSON.parse(input);
    const cwd          = data.cwd || process.cwd();
    const sessionId    = data.session_id || '';
    const toolName     = data.tool_name  || '';
    const toolInput    = data.tool_input || {};
    const toolResponse = data.tool_response || data.tool_result || {};

    // P3#16：非 Forge 项目提前退出，不写任何文件（OPT-2：改用 shared.isForgeProject）
    if (!shared.isForgeProject(cwd)) process.exit(0);

    const slug = shared.resolveSlug(cwd);

    // 带锁更新 bridge
    const { bridge } = await shared.mutateBridge(cwd, (draft) => {
      // 如果是旧 v1 schema，先迁移
      migrateIfNeeded(draft, cwd, slug);
      // 确保必要字段存在（防御性初始化）
      if (!draft.project) Object.assign(draft, defaultBridge(cwd, slug));
      draft.project.slug = slug;
      // D4 fix: 和 defaultBridge 保持一致，project.cwd 用 resolveProjectRoot
      draft.project.cwd  = shared.resolveProjectRoot(cwd);
      inferAndUpdate(draft, toolName, toolInput, toolResponse);
    });

    // 上下文保存（只对有 session 的情况）
    const safeId = shared.sanitizeSessionId(sessionId);
    if (!safeId || !bridge) process.exit(0);

    // 检查是否被 .planning/config.json 禁用（C5 fix：用 resolveProjectRoot 统一路径）
    try {
      const cfgRoot = shared.resolveProjectRoot(cwd);
      const { data: cfg } = shared.safeReadJson(path.join(cfgRoot, '.planning', 'config.json'), {});
      if (cfg?.hooks?.context_warnings === false) process.exit(0);
    } catch (_) {}

    const msg = checkContextWarning(cwd, slug, safeId, bridge);
    if (!msg) process.exit(0);

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: msg },
    }));
  } catch (e) {
    shared.logHookError('forge-context-bridge', e);
    process.exit(0);
  }
});
