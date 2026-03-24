#!/usr/bin/env node
// forge-state-sync.js - v1.1.0
// PostToolUse hook (Write|Edit): 同步 GSD 状态到 Forge State Hub
//
// 监控：
// - .planning/STATE.md 写入 → 解析并同步到 ~/.forge/projects/{slug}/state.json
// - .planning/ 目录下任意文件写入 → 主动检查 STATE.md 是否变化（覆盖 worktree 合并盲区）
// - claude-progress.txt 写入 → 同步最新 session 条目到 state.json
//
// 目的：保持两套记忆系统（GSD + 老金模式）的状态一致
//
// v1.1.0 修复：
// - parseStateMd() 新增 YAML frontmatter 解析（completed_phases/status 等字段）
// - 主动 STATE.md 轮询（.planning/ 任意文件写入时检查 STATE.md mtime）
// - 碰撞安全 slug（同名不同路径的目录用 path hash 后缀区分）
// - 里程碑完成自动写入 status: "completed"

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

function slugify(p) {
  return p.replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

// 碰撞安全的项目 slug 解析
// 优先用 basename slug（向后兼容），仅在路径碰撞时加 hash 后缀
function resolveSlug(cwd) {
  const normalizedCwd = path.resolve(cwd);
  const baseName = slugify(path.basename(normalizedCwd));
  const existingPath = path.join(os.homedir(), '.forge', 'projects', baseName, 'state.json');

  if (fs.existsSync(existingPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      if (existing.project_path && path.resolve(existing.project_path) !== normalizedCwd) {
        // 路径碰撞：不同项目占用了同一个 basename slug，用 hash 后缀区分
        const hash = crypto.createHash('md5').update(normalizedCwd).digest('hex').slice(0, 8);
        return `${baseName}-${hash}`;
      }
    } catch (e) {}
  }
  return baseName;
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

// 解析 YAML frontmatter（---\n...\n---\n 格式）
function parseYamlFrontmatter(content) {
  const result = {};
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return result;

  const block = frontmatterMatch[1];
  for (const line of block.split('\n')) {
    const kv = line.match(/^(\w[\w_]*):\s*(.+)$/);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();
    const num = Number(value);
    result[key] = Number.isNaN(num) ? value : num;
  }
  return result;
}

function parseStateMd(content) {
  // 从 STATE.md 提取关键信息
  // 优先读 YAML frontmatter（更可靠），prose 正文作为 fallback
  const result = {};
  const yaml = parseYamlFrontmatter(content);

  // --- 当前阶段：YAML completed_phases > current_phase > prose 匹配 ---
  const yamlPhase = yaml.completed_phases ?? yaml.current_phase;
  if (yamlPhase != null && !Number.isNaN(Number(yamlPhase))) {
    result._phase_current = Number(yamlPhase);
  } else {
    const phaseMatch = content.match(/##\s*Current.*?Phase[^\n]*\n.*?(\d+)[^\n]*/i) ||
                       content.match(/\*\*Phase\*\*[:\s]+(\d+)/i) ||
                       content.match(/Phase[:\s]+(\d+)/i) ||
                       content.match(/阶段[：:\s]+(\d+)/i);
    if (phaseMatch) result._phase_current = parseInt(phaseMatch[1]);
  }

  // --- 总阶段数 ---
  if (yaml.total_phases != null) {
    result._phase_total = Number(yaml.total_phases);
  }

  // --- 里程碑完成标记 ---
  const yamlStatus = String(yaml.status || '');
  const isComplete = /complete|completed|milestone\s*complete/i.test(yamlStatus);
  if (isComplete) result._is_complete = true;

  // --- GSD 状态文字：YAML status > prose Status 行 ---
  if (yamlStatus) {
    result.gsd_status = yamlStatus;
  } else {
    const statusMatch = content.match(/Status[:\s]+([^\n]+)/i) ||
                        content.match(/状态[：:\s]+([^\n]+)/i);
    if (statusMatch) result.gsd_status = statusMatch[1].trim();
  }

  // --- 最后更新时间：YAML last_updated > prose 日期匹配 ---
  if (yaml.last_updated) {
    result.gsd_last_updated = String(yaml.last_updated);
  } else {
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/);
    if (dateMatch) result.gsd_last_updated = dateMatch[0];
  }

  return result;
}

// 主动检查 STATE.md 是否被外部更新（worktree merge 等不触发 Write/Edit 的场景）
// 比较 STATE.md 文件 mtime 与 state.json 记录的 _state_md_mtime
function checkStateMdChanged(projectRoot, state) {
  const stateMdPath = path.join(projectRoot, '.planning', 'STATE.md');
  if (!fs.existsSync(stateMdPath)) return null;

  const mtime = fs.statSync(stateMdPath).mtimeMs;
  const lastSyncedMtime = state._state_md_mtime || 0;

  if (mtime > lastSyncedMtime) {
    return { path: stateMdPath, mtime, content: fs.readFileSync(stateMdPath, 'utf8') };
  }
  return null;
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

    // v1.1: 碰撞安全 slug（同名不同路径时用 hash 后缀）
    const slug = resolveSlug(cwd);

    const isStateMd = filePath.includes('.planning') && filePath.endsWith('STATE.md');
    const isInPlanning = filePath.includes('.planning');
    const isProgressTxt = path.basename(filePath) === 'claude-progress.txt' ||
                          path.basename(filePath) === 'PROGRESS.md';

    // 只处理 .planning/ 文件或 progress.txt（其他文件无需同步）
    if (!isInPlanning && !isProgressTxt) {
      process.exit(0);
    }

    if (!fs.existsSync(filePath)) process.exit(0);

    const state = readForgeState(slug);
    state.project_path = cwd;
    state.last_activity = new Date().toISOString();
    let stateChanged = false;

    // 从解析结果更新 state 的工具函数
    function applyParsed(parsed) {
      const { _phase_current, _phase_total, _is_complete, ...rest } = parsed;
      Object.assign(state, rest);
      if (_phase_current !== undefined) {
        state.phase = { ...(state.phase || {}), current: _phase_current };
      }
      if (_phase_total !== undefined) {
        state.phase = { ...(state.phase || {}), total: _phase_total };
      }
      if (_is_complete) {
        // 里程碑完成 → 标记 completed
        state.status = 'completed';
      } else if (!state.status || state.status === 'active') {
        state.status = 'active';
      }
    }

    if (isStateMd) {
      const content = fs.readFileSync(filePath, 'utf8');
      applyParsed(parseStateMd(content));
      // 记录 STATE.md mtime，用于主动轮询的基准
      state._state_md_mtime = fs.statSync(filePath).mtimeMs;
      stateChanged = true;
    } else if (isInPlanning) {
      // v1.1: 主动轮询 — 检查 STATE.md 是否被 worktree 合并等外部操作更新
      const changed = checkStateMdChanged(cwd, state);
      if (changed) {
        applyParsed(parseStateMd(changed.content));
        state._state_md_mtime = changed.mtime;
        stateChanged = true;
      }
    }

    if (isProgressTxt) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = parseProgressTxt(content);
      if (parsed.last_session) state.last_session = parsed.last_session;
      if (parsed.next_action) state.next_action = parsed.next_action;
      stateChanged = true;
    }

    if (stateChanged) {
      writeForgeState(slug, state);
    }
    // 静默退出，不注入 additionalContext（减少噪音）
    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});
