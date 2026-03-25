#!/bin/bash
# Claude Code 停止工作通知脚本

# Paperclip agent bypass — hooks are for human sessions
if [ -n "${PAPERCLIP_RUN_ID:-}" ]; then exit 0; fi

# 记录日志（先记录，避免阻塞）
input="$(cat || true)"
session_id=""

if [[ -n "$input" ]] && command -v python3 >/dev/null 2>&1; then
  session_id="$(python3 - "$input" <<'PY'
import json
import sys

raw = sys.argv[1] if len(sys.argv) > 1 else ""
try:
    data = json.loads(raw) if raw else {}
except Exception:
    data = {}

if isinstance(data, dict):
    value = data.get("session_id") or data.get("sessionID") or ""
    print(value or "")
PY
)"
fi

echo "$(date '+%Y-%m-%d %H:%M:%S'): Claude stopped - Session: ${session_id:-unknown}" >> ~/.claude/stop-log.txt

# 系统通知（同步执行，确保在停止前完成）
osascript -e 'display notification "Claude Code 已停止运行" with title "工作已暂停" sound name "Glass"' 2>/dev/null

# 播放声音（同步执行，移除 & 后台符号）
afplay /System/Library/Sounds/Glass.aiff 2>/dev/null

# 返回 approve（不阻止停止）
echo '{"decision": "approve"}'
exit 0
