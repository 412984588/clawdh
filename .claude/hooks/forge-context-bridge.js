#!/usr/bin/env node
// forge-context-bridge.js - v2.0.0
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
  return { status: 'idle', epoch: null, leaseUntil: null };
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

  // 检测 Web 项目
  try {
    const fp = path.join(cwd, '.claude', 'forge-project.json');
    if (fs.existsSync(fp)) {
      isWeb = JSON.parse(fs.readFileSync(fp, 'utf8')).is_web_project ?? false;
    } else {
      const hasNext = fs.existsSync(path.join(cwd, 'next.config.js')) ||
                      fs.existsSync(path.join(cwd, 'next.config.ts'));
      if (hasNext) {
        isWeb = true;
      } else if (fs.existsSync(path.join(cwd, 'package.json'))) {
        const pkg  = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        isWeb = !!(deps.next || deps.react || deps.vue || deps.nuxt || deps.svelte);
      }
    }
  } catch (_) {}

  return {
    project: { cwd: path.resolve(cwd), slug, isWeb, flowType },
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
}

// 测试命令匹配（OPT-10：补充 pnpm/cargo-nextest 模式）
const TEST_CMD = /\b(npm test|npm run test|pnpm test|pnpm run test|jest|vitest|pytest|py\.test|go test|cargo test|cargo nextest|yarn test|bun test)\b/;

// ─── 事件归约（inferAndUpdate）────────────────────────────────────────────────

function inferAndUpdate(draft, toolName, toolInput, toolResponse) {
  // ── Write / Edit / MultiEdit ──────────────────────────────────────────────
  if (toolName === 'Write' || toolName === 'Edit' || toolName === 'MultiEdit') {
    const fp = toolInput?.file_path || toolInput?.path || '';

    if (/\/PLAN\.md$/.test(fp) && fp.includes('.planning')) {
      // PLAN.md 写入 → plan_review 进入 required
      draft.gates.plan_review.status = 'required';
      draft.change.planWrittenAt     = new Date().toISOString();

    } else if (/\/SUMMARY\.md$/.test(fp) && fp.includes('.planning')) {
      // SUMMARY.md 写入 → tests 进入 required
      draft.gates.tests.status      = 'required';
      draft.change.summaryWrittenAt = new Date().toISOString();

    } else if (!fp.includes('/.planning/') && !fp.includes('/.claude/') && fp !== '') {
      // 源码变更 → changeEpoch++，下游门全部失效
      draft.change.changeEpoch++;
      // 去重追踪被修改的文件（最多保留 50 个）
      if (!draft.change.touchedFiles.includes(fp)) {
        draft.change.touchedFiles.push(fp);
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
    }
  }

  // ── Bash 命令 ─────────────────────────────────────────────────────────────
  if (toolName === 'Bash') {
    const cmd  = toolInput?.command || '';
    const exit = toolResponse?.exit_code ?? toolResponse?.exitCode ??
                 toolResponse?.returncode ?? (toolResponse?.isError ? 1 : 0);
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

  draft.audit.updatedAt = new Date().toISOString();
}

// ─── 上下文保存（入队 git，不内联执行）────────────────────────────────────────

function spawnDetachedWorker(workerPath) {
  try {
    // F20: 检查 worker 是否已在运行（锁存在 → 跳过生成，防止无限 spawn）
    const workerLockDir = path.join(os.homedir(), '.forge', 'runtime', 'git', 'worker.lock');
    if (fs.existsSync(workerLockDir)) return;
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

  if (isCritical) {
    // 入队 git checkpoint（P2#15：不内联同步执行）
    const qPath = shared.getGitQueuePath();
    shared.appendJsonlQueue(qPath, {
      cwd, slug, reason: 'context_critical',
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
      cwd, slug, reason: 'context_warning',
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
      draft.project.cwd  = path.resolve(cwd);
      inferAndUpdate(draft, toolName, toolInput, toolResponse);
    });

    // 上下文保存（只对有 session 的情况）
    const safeId = shared.sanitizeSessionId(sessionId);
    if (!safeId || !bridge) process.exit(0);

    // 检查是否被 .planning/config.json 禁用
    try {
      const { data: cfg } = shared.safeReadJson(path.join(cwd, '.planning', 'config.json'), {});
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
