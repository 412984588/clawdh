#!/usr/bin/env node
// forge-state-sync.js - v1.0.0
// PostToolUse hook (Write|Edit): 同步 GSD 状态到 Forge State Hub
//
// 监控：
// - .planning/STATE.md 写入 → 解析并同步到 ~/.forge/projects/{slug}/state.json
// - claude-progress.txt 写入 → 同步最新 session 条目到 state.json
//
// 目的：保持两套记忆系统（GSD + 老金模式）的状态一致

const fs = require('fs');
const os = require('os');
const path = require('path');

function slugify(p) {
  return p.replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function readForgeState(slug) {
  const statePath = path.join(os.homedir(), '.forge', 'projects', slug, 'state.json');
  if (fs.existsSync(statePath)) {
    try { return JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch (e) {}
  }
  return {
    project_slug: slug,
    status: 'active',
    created_at: new Date().toISOString()
  };
}

function writeForgeState(slug, state) {
  const dir = path.join(os.homedir(), '.forge', 'projects', slug);
  fs.mkdirSync(dir, { recursive: true });
  const statePath = path.join(dir, 'state.json');
  // 原子写：先写临时文件再重命名
  const tmpPath = statePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2));
  fs.renameSync(tmpPath, statePath);
}

function parseStateMd(content) {
  // 从 STATE.md 提取关键信息
  const result = {};

  // 提取当前阶段 — 写成嵌套 phase 对象（与 SKILL.md 规范一致）
  const phaseMatch = content.match(/##\s*Current.*?Phase[^\n]*\n.*?(\d+)[^\n]*/i) ||
                     content.match(/Phase[:\s]+(\d+)/i) ||
                     content.match(/阶段[：:\s]+(\d+)/i);
  if (phaseMatch) {
    const current = parseInt(phaseMatch[1]);
    // 保留已有的 phase 对象，只更新 current
    result.phase = { ...(result.phase || {}), current };
  }

  // 提取状态
  const statusMatch = content.match(/Status[:\s]+([^\n]+)/i) ||
                      content.match(/状态[：:\s]+([^\n]+)/i);
  if (statusMatch) result.gsd_status = statusMatch[1].trim();

  // 提取最后更新时间
  const dateMatch = content.match(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/);
  if (dateMatch) result.gsd_last_updated = dateMatch[0];

  return result;
}

function parseProgressTxt(content) {
  // 从 claude-progress.txt 提取最新 session 条目
  const lines = content.split('\n');
  const result = { last_session: null };

  // 找最后一个 ## [日期] - Session N
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].match(/^##\s*\[/)) {
      result.last_session = lines[i].replace(/^##\s*/, '').trim();

      // 尝试提取下一步
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].match(/下一步|next|TODO/i)) {
          result.next_action = lines[j].replace(/^[#*-\s]+/, '').trim();
          break;
        }
      }
      break;
    }
  }
  return result;
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 10000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const toolInput = data.tool_input || data.input || {};

    // 获取被写入的文件路径
    const filePath = toolInput.file_path || toolInput.path || '';
    if (!filePath) process.exit(0);

    // B9 fix: 从 filePath 向上找项目根目录（含 .planning/ 的那层），而不是直接用 dirname
    let cwd = data.cwd;
    if (!cwd) {
      // 向上遍历，找到包含 .planning/ 的目录
      let dir = path.dirname(filePath);
      for (let i = 0; i < 5; i++) {
        if (fs.existsSync(path.join(dir, '.planning'))) { cwd = dir; break; }
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
      cwd = cwd || path.dirname(filePath);
    }
    const slug = slugify(path.basename(cwd));

    const isStateMd = filePath.includes('.planning') && filePath.endsWith('STATE.md');
    const isProgressTxt = path.basename(filePath) === 'claude-progress.txt' ||
                          path.basename(filePath) === 'PROGRESS.md';

    if (!isStateMd && !isProgressTxt) {
      process.exit(0);
    }

    if (!fs.existsSync(filePath)) process.exit(0);

    const content = fs.readFileSync(filePath, 'utf8');
    const state = readForgeState(slug);

    state.project_path = cwd;
    state.last_activity = new Date().toISOString();

    if (isStateMd) {
      const parsed = parseStateMd(content);
      Object.assign(state, parsed);
      if (!state.status || state.status === 'active') {
        state.status = 'active';
      }
    }

    if (isProgressTxt) {
      const parsed = parseProgressTxt(content);
      if (parsed.last_session) state.last_session = parsed.last_session;
      if (parsed.next_action) state.next_action = parsed.next_action;
    }

    writeForgeState(slug, state);
    // 静默退出，不注入 additionalContext（减少噪音）
    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});
