#!/usr/bin/env node
// forge-session-start.js - v1.1.0
// SessionStart hook: 检测进行中的 Forge 项目 + 自动移动孤儿状态
//
// 相比 v1.0 (shell 版) 的改进：
// - 纯 Node.js，与其他 hooks 技术栈统一，无 python3 依赖
// - 孤儿检测：project_path 不存在 且 last_activity > 24h → 移到 .orphaned/
// - 双格式兼容：status "completed" 和旧格式 "complete" 都跳过

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// 消耗 stdin（SessionStart hook 要求）
process.stdin.resume();
process.stdin.on('data', () => {});
process.stdin.on('end', main);

function main() {
  const forgeDir = path.join(os.homedir(), '.forge', 'projects');

  if (!fs.existsSync(forgeDir)) {
    output(null);
    return;
  }

  const orphanedDir = path.join(forgeDir, '.orphaned');
  const now = Date.now();
  const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000; // 24 小时

  const activeProjects = [];

  let entries;
  try {
    entries = fs.readdirSync(forgeDir);
  } catch (e) {
    output(null);
    return;
  }

  for (const slug of entries) {
    // 跳过隐藏目录（.orphaned）和非目录
    if (slug.startsWith('.')) continue;

    const stateFile = path.join(forgeDir, slug, 'state.json');
    if (!fs.existsSync(stateFile)) continue;

    let state;
    try {
      state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    } catch (e) {
      continue;
    }

    const status = state.status || 'active';

    // 跳过已完成的项目（兼容 "complete" 和 "completed"）
    if (status === 'complete' || status === 'completed') continue;

    // 孤儿检测：project_path 不存在 且 last_activity 超过 24 小时
    const projectPath = state.project_path;
    const lastActivity = state.last_activity ? new Date(state.last_activity).getTime() : 0;
    const isStale = now - lastActivity > ORPHAN_AGE_MS;

    if (projectPath && !fs.existsSync(projectPath) && isStale) {
      // 移到 .orphaned/
      try {
        if (!fs.existsSync(orphanedDir)) {
          fs.mkdirSync(orphanedDir, { recursive: true });
        }
        const srcDir = path.join(forgeDir, slug);
        const destDir = path.join(orphanedDir, slug);
        fs.renameSync(srcDir, destDir);
      } catch (e) {
        // 移动失败则忽略，不影响其他项目显示
      }
      continue;
    }

    // 提取阶段信息
    let phase = '?';
    if (state.phase && typeof state.phase === 'object') {
      phase = state.phase.current ?? '?';
    } else if (state.phase_num !== undefined) {
      phase = state.phase_num;
    }

    const lastDate = state.last_activity ? String(state.last_activity).slice(0, 10) : '';
    const name = state.project_name || slug;

    activeProjects.push({ slug, name, phase, lastDate });
  }

  if (activeProjects.length === 0) {
    output(null);
    return;
  }

  const lines = [`🔨 Forge 检测到 ${activeProjects.length} 个进行中的项目：`, ''];

  for (const p of activeProjects) {
    let line = `  • ${p.name}（第 ${p.phase} 阶段）`;
    if (p.lastDate) line += ` — 最后活动：${p.lastDate}`;
    lines.push(line);
    lines.push(`    恢复命令：/forge resume ${p.slug}`);
    lines.push('');
  }

  lines.push('如需继续，输入对应的 /forge resume 命令。');
  lines.push('如需查看所有项目状态，输入 /forge:status');

  output(lines.join('\n'));
}

function output(msg) {
  if (!msg) {
    // 无活跃项目 — 静默退出
    process.exit(0);
  }
  const result = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: msg,
    },
  };
  process.stdout.write(JSON.stringify(result) + '\n');
}
