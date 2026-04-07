#!/bin/bash
# 美东时间 08:00 暂停所有活跃 agent（平台级暂停，wakeup 也无效）

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

LOG="/Users/zhimingdeng/.paperclip/logs/heartbeat.log"
STATE_FILE="/Users/zhimingdeng/.paperclip/logs/paused-agents.txt"
COMPANY_ID="f085943e-7457-43fd-8f59-dd6f3d9fdf4e"

# 只在美东 8 点整触发（5 分钟窗口内只执行一次）
ET_HOUR=$(TZ="America/New_York" date '+%H')
if [ "$ET_HOUR" -ne 8 ]; then
  exit 0
fi

# 已经暂停过了（状态文件存在），跳过
if [ -f "$STATE_FILE" ]; then
  exit 0
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') [PAUSE] 美东 08:00 — 开始暂停所有活跃 agent" >> "$LOG"

# 只暂停 claude_local agents（GLM/MiniMax 的 pi_local 不停）
ACTIVE_IDS=$(curl -s "http://127.0.0.1:3100/api/companies/${COMPANY_ID}/agents" | \
  python3 -c "
import json, sys
agents = json.load(sys.stdin)
for a in agents:
    if a.get('adapterType') == 'claude_local' and a.get('status') in ('running', 'idle', 'active'):
        print(a['id'])
")

if [ -z "$ACTIVE_IDS" ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [PAUSE] 无活跃 agent，跳过" >> "$LOG"
  exit 0
fi

# 暂停并记录
> "$STATE_FILE"
while IFS= read -r ID; do
  [ -z "$ID" ] && continue
  NAME=$(curl -s "http://127.0.0.1:3100/api/agents/${ID}" | python3 -c "import json,sys; print(json.load(sys.stdin).get('name','?'))")
  curl -s -X PATCH "http://127.0.0.1:3100/api/agents/${ID}" \
    -H "Content-Type: application/json" \
    -d '{"status": "paused"}' > /dev/null
  echo "$ID" >> "$STATE_FILE"
  echo "$(date '+%Y-%m-%d %H:%M:%S') [PAUSE] $NAME ($ID) 已暂停" >> "$LOG"
done <<< "$ACTIVE_IDS"

COUNT=$(wc -l < "$STATE_FILE" | tr -d ' ')
echo "$(date '+%Y-%m-%d %H:%M:%S') [PAUSE] 休息时段开始，共暂停 ${COUNT} 个 claude_local agent" >> "$LOG"

# 只终止 claude_local agents 的 heartbeat 进程（按 agent-id 精确匹配，不影响 pi_local）
TOTAL_KILLED=0
while IFS= read -r ID; do
  [ -z "$ID" ] && continue
  CNT=$(pgrep -f "$ID" 2>/dev/null | wc -l | tr -d ' ')
  pkill -f "$ID" 2>/dev/null || true
  TOTAL_KILLED=$((TOTAL_KILLED + CNT))
done < "$STATE_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S') [PAUSE] 已终止 ${TOTAL_KILLED} 个 claude_local heartbeat 进程" >> "$LOG"
