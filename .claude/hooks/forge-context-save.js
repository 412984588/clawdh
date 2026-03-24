#!/usr/bin/env node
// forge-context-save.js - v1.0.0
// PostToolUse hook: 主动保存上下文，而不只是提醒
//
// 改进自 gsd-context-monitor.js：
// - 35% 剩余: 自动 git commit 保存工作进度
// - 25% 剩余: 额外写 HANDOFF.json + ~/.forge 快照
// - 两个阈值都注入中文 additionalContext

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const WARNING_THRESHOLD = 35;
const CRITICAL_THRESHOLD = 25;
const STALE_SECONDS = 60;
const DEBOUNCE_CALLS = 5;

function slugify(p) {
  return p.replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function tryGitCommit(cwd, message) {
  try {
    // 检查是否有未提交的改动
    const status = execSync('git status --porcelain', { cwd, encoding: 'utf8', timeout: 5000 });
    if (status.trim()) {
      execSync(`git add -A && git commit -m "${message}"`, {
        cwd,
        encoding: 'utf8',
        timeout: 10000,
        shell: true
      });
      return true;
    }
    return false;
  } catch (e) {
    // git 失败不阻断主流程
    return false;
  }
}

function writeForgeSnapshot(cwd, slug, level, remaining) {
  try {
    const forgeDir = path.join(os.homedir(), '.forge', 'projects', slug);
    fs.mkdirSync(forgeDir, { recursive: true });

    const snapshotDir = path.join(forgeDir, 'snapshots');
    fs.mkdirSync(snapshotDir, { recursive: true });

    const ts = Date.now();
    const snapshot = {
      timestamp: new Date().toISOString(),
      project_path: cwd,
      level,
      remaining_percentage: remaining,
      resume_command: `/forge resume ${slug}`
    };

    // 写快照
    fs.writeFileSync(
      path.join(snapshotDir, `${ts}.json`),
      JSON.stringify(snapshot, null, 2)
    );

    // 更新 state.json（如果存在）
    const statePath = path.join(forgeDir, 'state.json');
    let state = {};
    if (fs.existsSync(statePath)) {
      try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch (e) {}
    }
    state.last_context_save = new Date().toISOString();
    state.context_snapshot = path.join(snapshotDir, `${ts}.json`);
    if (level === 'critical') {
      state.status = 'paused_context';
      state.resume_command = `/forge resume ${slug}`;
    }
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

    return true;
  } catch (e) {
    return false;
  }
}

function writeHandoff(cwd, slug) {
  try {
    const planningDir = path.join(cwd, '.planning');
    if (!fs.existsSync(planningDir)) return false;

    // 读现有 STATE.md
    const stateMdPath = path.join(planningDir, 'STATE.md');
    const stateContent = fs.existsSync(stateMdPath) ? fs.readFileSync(stateMdPath, 'utf8') : '';

    const handoff = {
      timestamp: new Date().toISOString(),
      trigger: 'context_critical_auto_save',
      project_slug: slug,
      resume_command: `/forge resume ${slug}`,
      state_summary: stateContent.slice(0, 500),
      note: '由 forge-context-save.js 自动生成。使用 /forge resume 恢复工作。'
    };

    fs.writeFileSync(
      path.join(planningDir, 'HANDOFF.json'),
      JSON.stringify(handoff, null, 2)
    );

    return true;
  } catch (e) {
    return false;
  }
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 10000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const sessionId = data.session_id;
    if (!sessionId) process.exit(0);

    const cwd = data.cwd || process.cwd();

    // 检查是否被禁用
    const configPath = path.join(cwd, '.planning', 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.hooks?.context_warnings === false) process.exit(0);
      } catch (e) {}
    }

    const tmpDir = os.tmpdir();
    const metricsPath = path.join(tmpDir, `claude-ctx-${sessionId}.json`);
    if (!fs.existsSync(metricsPath)) process.exit(0);

    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (metrics.timestamp && (now - metrics.timestamp) > STALE_SECONDS) process.exit(0);

    const remaining = metrics.remaining_percentage;
    const usedPct = metrics.used_pct;
    if (remaining > WARNING_THRESHOLD) process.exit(0);

    // 防抖
    const warnPath = path.join(tmpDir, `forge-ctx-${sessionId}-warned.json`);
    let warnData = { callsSinceWarn: 0, lastLevel: null };
    let firstWarn = true;
    if (fs.existsSync(warnPath)) {
      try { warnData = JSON.parse(fs.readFileSync(warnPath, 'utf8')); firstWarn = false; } catch (e) {}
    }
    warnData.callsSinceWarn = (warnData.callsSinceWarn || 0) + 1;

    const isCritical = remaining <= CRITICAL_THRESHOLD;
    const currentLevel = isCritical ? 'critical' : 'warning';
    const severityEscalated = isCritical && warnData.lastLevel === 'warning';

    if (!firstWarn && warnData.callsSinceWarn < DEBOUNCE_CALLS && !severityEscalated) {
      fs.writeFileSync(warnPath, JSON.stringify(warnData));
      process.exit(0);
    }
    warnData.callsSinceWarn = 0;
    warnData.lastLevel = currentLevel;
    fs.writeFileSync(warnPath, JSON.stringify(warnData));

    // 获取项目 slug
    const slug = slugify(path.basename(cwd));
    const isGsdActive = fs.existsSync(path.join(cwd, '.planning', 'STATE.md'));

    let actions = [];

    if (isCritical) {
      // 25%: git commit + 写 HANDOFF.json + forge 快照
      const committed = tryGitCommit(cwd, 'chore(forge): context critical — auto save [forge-hook]');
      if (committed) actions.push('✅ 已自动提交代码');

      if (isGsdActive) {
        const handoffWritten = writeHandoff(cwd, slug);
        if (handoffWritten) actions.push('✅ 已写入恢复文件 (.planning/HANDOFF.json)');
      }

      writeForgeSnapshot(cwd, slug, 'critical', remaining);
      actions.push(`✅ 已保存快照到 ~/.forge/projects/${slug}/`);

    } else {
      // 35%: git commit 保存进度
      const committed = tryGitCommit(cwd, 'chore(forge): context warning — checkpoint [forge-hook]');
      if (committed) actions.push('✅ 已自动提交代码检查点');

      writeForgeSnapshot(cwd, slug, 'warning', remaining);
    }

    const actionStr = actions.length > 0 ? '\n' + actions.join('\n') : '';

    let message;
    if (isCritical) {
      message = `⛔ CONTEXT CRITICAL: 上下文已用 ${usedPct}%，剩余 ${remaining}%。` +
        `\n已自动保存工作进度。${actionStr}` +
        `\n请立即完成当前原子任务后停止。下次继续用：/forge resume ${slug}`;
    } else {
      message = `⚠️ CONTEXT WARNING: 上下文已用 ${usedPct}%，剩余 ${remaining}%。` +
        `${actionStr}` +
        `\n避免开始新的复杂任务，尽快完成当前阶段。`;
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: message
      }
    };
    process.stdout.write(JSON.stringify(output));
  } catch (e) {
    process.exit(0);
  }
});
