#!/usr/bin/env node
// forge-quality-pipeline.js - v2.0.0
// PostToolUse hook（Skill|Agent|Task）: 质量门 FSM
//
// 修复（相比 v1.x）：
// - P2#9   安全检测改用 git diff（不再看 last_tool.output_tail 字符串）
// - P2#11  lease 超时自动回 required（消除 pending_triggers 永久死锁）
// - P3#16  非 Forge 项目提前退出
// Gate 状态流：idle → required → leased → passed/failed

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const shared = require('./forge-shared');

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const LEASE_TTL_MS = 10 * 60 * 1000;  // 10 分钟 lease，超时自动回 required

// gstack preamble 跳过说明（所有质量门注入时附带）
const PREAMBLE_SKIP = `（gstack 执行说明：读取 SKILL.md 后从 "## Step 0" 或 "# /{命令名}" 标记开始执行。跳过 Preamble bash block、Lake Intro、Telemetry、Session Tracking。所有 AskUserQuestion 自动选推荐选项。所有 "STOP and wait" 自动继续。）`;

// ─── 安全检测（P2#9：改用 git diff 而非 output_tail）─────────────────────────

const SECURITY_PATTERN = /\b(auth|token|password|secret|session|cookie|jwt|sql|database|migration|encrypt|hash|bcrypt|argon|oauth|permission|rbac)\b/i;

function evaluateSecurityRisk(cwd, touchedFiles) {
  if (!touchedFiles || touchedFiles.length === 0) {
    return { required: false, reasons: [], files: [] };
  }
  try {
    const diff = execFileSync(
      'git',
      ['diff', '--unified=0', '--', ...touchedFiles.slice(0, 20)],
      { cwd, encoding: 'utf8', timeout: 3000 }
    );
    const pathHit = touchedFiles.some(f => SECURITY_PATTERN.test(f));
    const diffHit = SECURITY_PATTERN.test(diff);
    return {
      required: pathHit || diffHit,
      reasons:  [pathHit && 'path', diffHit && 'diff'].filter(Boolean),
      files:    touchedFiles,
    };
  } catch (_) {
    // F10 fix：git 失败时无法判断风险，保守策略触发安全门而非静默放行
    return { required: true, reasons: ['git_error'], files: touchedFiles.slice(0, 20) };
  }
}

// ─── Forge 项目检测（P3#16）──────────────────────────────────────────────────

function isForgeProject(cwd) {
  if (fs.existsSync(path.join(cwd, '.planning', 'STATE.md'))) return true;
  const slug = shared.resolveSlug(cwd);
  return fs.existsSync(path.join(os.homedir(), '.forge', 'projects', slug, 'state.json'));
}

// ─── 辅助判断 ─────────────────────────────────────────────────────────────────

function allCoreGatesPassed(bridge) {
  const ce = bridge.change?.changeEpoch ?? 0;
  const g  = bridge.gates;
  if (!g) return false;
  // 测试 + 代码审查必须通过，且 epoch 匹配（避免旧结果误判）
  if (g.tests?.status       !== 'passed' || g.tests?.epoch       !== ce) return false;
  if (g.code_review?.status !== 'passed' || g.code_review?.epoch !== ce) return false;
  // Web 项目额外要求 QA
  if (bridge.project?.isWeb && (g.qa?.status !== 'passed' || g.qa?.epoch !== ce)) return false;
  return true;
}

function isLastPhase(bridge) {
  const { current, total } = bridge.phase || {};
  if (!current || !total) return false;
  return current >= total;
}

// lease 是否已过期（过期的 leased 门应回到 required）
function isLeaseExpired(gate) {
  if (gate.status !== 'leased') return false;
  if (!gate.leaseUntil)        return true;
  return Date.parse(gate.leaseUntil) <= Date.now();
}

// ─── 质量 FSM：选择下一个要注入的门（P2#11 lease 超时机制）─────────────────

// 返回门名（string）或 null
function nextGateToInject(bridge) {
  const ce  = bridge.change?.changeEpoch ?? 0;
  const g   = bridge.gates || {};

  // 按优先级排序的门定义
  const gateDefs = [
    {
      name:     'plan_review',
      requires: () => bridge.change?.planWrittenAt != null,
      msg:      () => `⚡ FORGE 质量门：阶段规划完成（PLAN.md 已创建）。\n质量门要求：立即执行计划审查。\n请调用 Skill("autoplan") 执行 gstack /autoplan（CEO + 设计 + 工程三重审查）。\n${PREAMBLE_SKIP}`,
    },
    {
      name:     'code_review',
      requires: () => g.tests?.status === 'passed',
      msg:      () => `⚡ FORGE 质量门：阶段代码执行完成（测试通过）。\n质量门要求：立即执行代码审查。\n请调用 Skill("review") 执行 gstack /review（diff-aware 模式，只看本次变更）。\n${PREAMBLE_SKIP}`,
    },
    {
      name:     'qa',
      requires: () => g.code_review?.status === 'passed' && bridge.project?.isWeb,
      msg:      () => `⚡ FORGE 质量门：代码审查完成，Web 项目需执行浏览器 QA。\n请调用 Skill("qa") 执行 gstack /qa（diff-aware 模式，只测本次变更页面）。\n${PREAMBLE_SKIP}`,
    },
    {
      name:     'security',
      requires: () => g.code_review?.status === 'passed' && bridge.change?.securityRisk?.required,
      msg:      () => `⚡ FORGE 质量门：检测到安全敏感代码变更（auth/token/password/sql 等）。\n请调用 Skill("cso") 执行 gstack /cso --diff（仅审计本次变更）。\n${PREAMBLE_SKIP}`,
    },
    {
      name:     'benchmark',
      requires: () => g.code_review?.status === 'passed' && bridge.project?.isWeb && (bridge.phase?.current || 0) >= 2,
      msg:      (b) => `⚡ FORGE 质量门：阶段 ${b.phase?.current} Web 项目代码审查完成，需执行性能基准测试。\n请调用 Skill("benchmark") 执行 gstack /benchmark。\n${PREAMBLE_SKIP}`,
    },
    {
      name:     'ship',
      requires: () => allCoreGatesPassed(bridge) && isLastPhase(bridge),
      msg:      () => `⚡ FORGE 质量门：所有阶段完成，全部质量门通过！\n最后步骤：创建 PR 并准备部署。\n请调用 Skill("ship") 执行 gstack /ship（全量测试 + 版本 + PR）。\n${PREAMBLE_SKIP}`,
    },
  ];

  for (const def of gateDefs) {
    if (!def.requires()) continue;
    const gate = g[def.name] || { status: 'idle', epoch: null, leaseUntil: null };

    // 已通过且 epoch 匹配 → 跳过
    if (gate.status === 'passed' && gate.epoch === ce) continue;

    // leased 且未过期 → 跳过（等待完成）
    if (gate.status === 'leased' && !isLeaseExpired(gate)) continue;

    // 其他情况（idle/required/failed/expired lease/epoch 不匹配）→ 需要注入
    return { name: def.name, message: def.msg(bridge) };
  }
  return null;
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

let input = '';
const timeout = setTimeout(() => process.exit(0), 15000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => (input += c));
process.stdin.on('end', async () => {
  clearTimeout(timeout);
  try {
    const data = JSON.parse(input);
    const cwd  = data.cwd || process.cwd();

    // P3#16：只在 Forge 项目中运行
    if (!isForgeProject(cwd)) process.exit(0);

    // 读 bridge 快照（只读，不加锁）
    const { data: bridge, corrupt } = shared.readBridgeSnapshot(cwd);
    if (!bridge || corrupt) process.exit(0);

    // 跳过旧 v1 schema（等 bridge hook 迁移后再用）
    if (bridge._schema_version !== 2) process.exit(0);

    // 主动评估安全风险（基于 git diff，P2#9）
    // 每次 pipeline 运行时更新一次，写回 bridge
    const touchedFiles = bridge.change?.touchedFiles || [];
    if (touchedFiles.length > 0) {  // 始终重新评估，不依赖旧状态（P2#4）
      const risk = evaluateSecurityRisk(cwd, touchedFiles);
      if (risk.required) {
        // 带锁更新安全风险字段
        await shared.mutateBridge(cwd, (draft) => {
          if (draft.change) draft.change.securityRisk = risk;
        }).catch(() => {});
        bridge.change.securityRisk = risk;  // 更新本地副本用于后续判断
      }
    }

    // 选择下一个需要触发的质量门
    const next = nextGateToInject(bridge);
    if (!next) process.exit(0);

    // 标记为 leased（F09 fix：lease 失败时阻断注入，防止重复触发）
    const leaseUntil = new Date(Date.now() + LEASE_TTL_MS).toISOString();
    let leased = false;
    try {
      await shared.mutateBridge(cwd, (draft) => {
        if (!draft.gates?.[next.name]) return;
        draft.gates[next.name].status    = 'leased';
        draft.gates[next.name].leaseUntil = leaseUntil;
      });
      leased = true;
    } catch (e) {
      shared.logHookError('forge-quality-pipeline/lease', e, { gate: next.name });
    }

    if (!leased) process.exit(0);

    // 注入质量命令到对话上下文
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: next.message,
      },
    }));
  } catch (e) {
    shared.logHookError('forge-quality-pipeline', e);
    process.exit(0);
  }
});
