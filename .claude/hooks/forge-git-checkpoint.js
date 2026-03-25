#!/usr/bin/env node
// forge-git-checkpoint.js - v1.0.0
// PostToolUse hook（Write|Edit|MultiEdit）: 入队 git checkpoint
//
// 机制：
// - 读 bridge 检查 context.warningLevel（由 bridge hook 设置）
// - warningLevel 触发时写 job 到 ~/.forge/runtime/git/queue.jsonl
// - spawn forge-git-worker.js（detached，独立进程，不阻塞 hook 响应）
//
// 修复（P2#15）：不再内联同步 git commit，彻底消除 hook 响应阻塞

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const shared = require('./forge-shared');

// ─── Forge 项目检测 ────────────────────────────────────────────────────────────

function isForgeProject(cwd) {
  if (fs.existsSync(path.join(cwd, '.planning', 'STATE.md'))) return true;
  const slug = shared.resolveSlug(cwd);
  return fs.existsSync(path.join(os.homedir(), '.forge', 'projects', slug, 'state.json'));
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

let input = '';
const timeout = setTimeout(() => process.exit(0), 8000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => (input += c));
process.stdin.on('end', async () => {
  clearTimeout(timeout);
  try {
    const data     = JSON.parse(input);
    const cwd      = data.cwd || process.cwd();
    const toolName = data.tool_name || '';

    // 只处理 Write/Edit/MultiEdit（其他工具不触发 git checkpoint）
    if (!['Write', 'Edit', 'MultiEdit'].includes(toolName)) process.exit(0);

    // 只在 Forge 项目中运行
    if (!isForgeProject(cwd)) process.exit(0);

    // 读 bridge 快照（只读，不加锁）
    const { data: bridge, corrupt } = shared.readBridgeSnapshot(cwd);
    if (!bridge || corrupt || bridge._schema_version !== 2) process.exit(0);

    // 检查 context.warningLevel（由 forge-context-bridge.js 设置）
    const warningLevel = bridge.context?.warningLevel;
    if (!warningLevel) process.exit(0);  // 未触发告警 → 不入队

    const slug         = bridge.project?.slug || shared.resolveSlug(cwd);
    const touchedFiles = bridge.change?.touchedFiles || [];

    // 入队 git job
    const qPath = shared.getGitQueuePath();
    await shared.appendJsonlQueue(qPath, {
      cwd, slug,
      reason:       `checkpoint_${warningLevel}`,
      touchedFiles,
    });

    // spawn worker（detached，不阻塞）
    const workerPath = path.join(__dirname, 'forge-git-worker.js');
    if (fs.existsSync(workerPath)) {
      try {
        spawnSync('node', [workerPath], {
          detached: true,
          stdio:    'ignore',
        });
      } catch (_) {}
    }

    // 静默退出，不注入 additionalContext（bridge hook 已处理提示）
    process.exit(0);
  } catch (e) {
    shared.logHookError('forge-git-checkpoint', e);
    process.exit(0);
  }
});
