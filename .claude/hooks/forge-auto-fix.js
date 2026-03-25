#!/usr/bin/env node
// forge-auto-fix.js - v2.0.0
// PostToolUse hook（Bash）: 检测失败并注入修复指令
//
// 机制：
// - exit_code != 0 且命令是测试/构建/lint → 注入修复指令
// - 同一错误重复出现超过 max 轮 → 升级到 /gsd:diagnose-issues
// - 使用 shared.mutateBridge 追踪 auto_fix 状态（并发安全，P1#1）

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const crypto = require('crypto');

const shared = require('./forge-shared');

// ─── 命令分类 ─────────────────────────────────────────────────────────────────

// OPT-10: 补充 pnpm/cargo-nextest 模式
const TEST_PATTERN  = /\b(npm test|npm run test|pnpm test|pnpm run test|jest|vitest|pytest|py\.test|go test|cargo test|cargo nextest|yarn test|bun test)\b/;
const BUILD_PATTERN = /\b(npm run build|pnpm build|pnpm run build|tsc|tsc --noEmit|yarn build|bun run build|next build|vite build)\b/;
const LINT_PATTERN  = /\b(npm run lint|pnpm lint|eslint|tslint|pylint|flake8|ruff)\b/;

function classifyCommand(cmd) {
  if (TEST_PATTERN.test(cmd))  return 'test';
  if (BUILD_PATTERN.test(cmd)) return 'build';
  if (LINT_PATTERN.test(cmd))  return 'lint';
  return 'other';
}

// ─── 修复消息生成 ──────────────────────────────────────────────────────────────

function buildFixMessage(type, errorSnippet, attempts, max) {
  const remaining = max - attempts;
  const roundInfo = `（第 ${attempts}/${max} 轮自动修复，还剩 ${remaining} 次机会）`;

  const base = {
    test:  `⚠️ FORGE 自动修复 ${roundInfo}：测试失败。\n请分析失败的测试用例，修复代码使所有测试通过。\n错误片段：\n\`\`\`\n${errorSnippet}\n\`\`\``,
    build: `⚠️ FORGE 自动修复 ${roundInfo}：构建失败。\n请分析构建错误，修复类型错误或导入问题。\n错误片段：\n\`\`\`\n${errorSnippet}\n\`\`\``,
    lint:  `⚠️ FORGE 自动修复 ${roundInfo}：Lint 错误。\n请运行 \`npx eslint --fix\` 自动修复，再手动修复剩余问题。\n错误片段：\n\`\`\`\n${errorSnippet}\n\`\`\``,
    other: `⚠️ FORGE 自动修复 ${roundInfo}：命令失败。\n请分析错误原因并修复。\n错误片段：\n\`\`\`\n${errorSnippet}\n\`\`\``,
  };

  return base[type] || base.other;
}

function buildEscalateMessage(type, errorSnippet) {
  if (type === 'lint') {
    return `⚠️ FORGE：Lint 错误经过 3 轮自动修复仍未解决。记录并继续（lint 为非阻断性）。\n请在完成核心功能后再处理剩余 lint 问题。`;
  }
  return `⛔ FORGE 自动修复已达上限：经过 3 轮自动修复仍未解决。\n升级到诊断模式：请调用 Skill("gsd:debug") 进行系统性 debug（并行 debug agent，找出根本原因）。\n错误片段：\n\`\`\`\n${errorSnippet}\n\`\`\``;
}

// ─── 错误签名（防止不同错误被当作同一问题计数）────────────────────────────────

function hashError(stderr) {
  return crypto.createHash('sha256').update(stderr.slice(0, 500)).digest('hex').slice(0, 16);
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

let input = '';
const timeout = setTimeout(() => process.exit(0), 10000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => (input += c));
process.stdin.on('end', async () => {
  clearTimeout(timeout);
  try {
    const data     = JSON.parse(input);
    const cwd      = data.cwd || process.cwd();
    const toolResp = data.tool_response || data.tool_result || {};

    // 只处理失败的 Bash 命令
    const exitCode = toolResp?.exit_code ?? toolResp?.exitCode ??
                     toolResp?.returncode ?? (toolResp?.isError ? 1 : 0);
    if (exitCode === 0) process.exit(0);

    const cmd  = (data.tool_input || {}).command || '';
    const type = classifyCommand(cmd);

    // OPT-2+3: 改用 shared.isForgeProject，缓存结果避免双重调用
    const isForge = shared.isForgeProject(cwd);
    if (type === 'other' && !isForge) process.exit(0);
    if (!isForge) process.exit(0);

    const stderr  = toolResp?.stderr || toolResp?.output || '';
    const snippet = stderr.slice(-600).trim() || `（命令：${cmd.slice(0, 80)}，退出码：${exitCode}）`;
    const errHash = hashError(stderr || cmd);

    // 带锁读改写 auto_fix 状态（P1#1 并发安全，P2#14 升级 catch）
    let fixResult = { issue_hash: null, attempts: 1, max: 3 };

    await shared.mutateBridge(cwd, (draft) => {
      const fix = draft.auto_fix || { issue_hash: null, attempts: 0, max: 3 };

      if (fix.issue_hash === errHash) {
        // 同一问题，累加计数
        fix.attempts = (fix.attempts || 0) + 1;
      } else {
        // 新问题，重置
        fix.issue_hash = errHash;
        fix.attempts   = 1;
      }

      draft.auto_fix = fix;
      fixResult      = fix;
    });

    let msg;
    if (fixResult.attempts >= fixResult.max) {
      msg = buildEscalateMessage(type, snippet);
    } else {
      msg = buildFixMessage(type, snippet, fixResult.attempts, fixResult.max);
    }

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: msg,
      },
    }));
  } catch (e) {
    shared.logHookError('forge-auto-fix', e);
    process.exit(0);
  }
});
