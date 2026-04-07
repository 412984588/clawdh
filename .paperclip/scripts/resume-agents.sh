#!/bin/bash
# 美东时间 14:00 恢复被 pause-agents.sh 暂停的 agent

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

LOG="/Users/zhimingdeng/.paperclip/logs/heartbeat.log"
STATE_FILE="/Users/zhimingdeng/.paperclip/logs/paused-agents.txt"

# 只在美东 14 点整触发
ET_HOUR=$(TZ="America/New_York" date '+%H')
if [ "$ET_HOUR" -ne 14 ]; then
  exit 0
fi

# 没有状态文件，说明今天还没暂停过（或已恢复），跳过
if [ ! -f "$STATE_FILE" ]; then
  exit 0
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') [RESUME] 美东 14:00 — 开始恢复 agent" >> "$LOG"

COUNT=0
while IFS= read -r ID; do
  [ -z "$ID" ] && continue
  NAME=$(curl -s "http://127.0.0.1:3100/api/agents/${ID}" | python3 -c "import json,sys; print(json.load(sys.stdin).get('name','?'))")
  curl -s -X PATCH "http://127.0.0.1:3100/api/agents/${ID}" \
    -H "Content-Type: application/json" \
    -d '{"status": "active"}' > /dev/null
  echo "$(date '+%Y-%m-%d %H:%M:%S') [RESUME] $NAME ($ID) 已恢复" >> "$LOG"
  COUNT=$((COUNT + 1))
done < "$STATE_FILE"

rm -f "$STATE_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S') [RESUME] 工作时段开始，共恢复 ${COUNT} 个 agent" >> "$LOG"
