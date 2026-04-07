#!/bin/bash
# TRE 公司全员心跳调度器
# 每 5 分钟由 cron 触发，美东时间 08:00-14:00 暂停（自动处理 DST）

# cron 环境没有完整 PATH，必须显式添加 homebrew 路径
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# 清除可能被父进程继承的 agent 认证变量（否则 CLI 会用 agent JWT 而非 board 权限）
unset PAPERCLIP_API_KEY PAPERCLIP_AGENT_ID PAPERCLIP_RUN_ID

set -uo pipefail

LOG="/Users/zhimingdeng/.paperclip/logs/heartbeat.log"
LOCKDIR="/tmp/paperclip-heartbeat.lock.d"

# 防止并发 — 用 mkdir 原子锁（macOS 兼容，无需 flock）
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') [SKIP] 上一轮仍在运行，跳过本次" >> "$LOG"
  exit 0
fi
trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT

echo "$(date '+%Y-%m-%d %H:%M:%S') [START] 心跳调度开始" >> "$LOG"

# 所有 agent ID（优先级顺序：Builder > QA > Scout > Sales > 支持）
AGENTS=(
  "168332b9-25fe-4989-b703-e5a6bf354127"  # CEO（优先触发，确保新任务及时分配）
  "67478c2c-44c6-48d0-b3c9-f43b879ab834"  # Builder-A
  "8fe5958d-5c8a-433f-b165-b0061849f80e"  # Builder-B
  "c647353d-9789-4c14-94d5-ef5647e79d91"  # Scout
  "f0b5a1a7-9930-43a1-9f36-27dfe495b45c"  # Content QA
  "fb8bffbf-7ec4-4af3-a014-d83a27bf4432"  # Release Gate（批量模式已启用，加回定时触发清积压）
  "28b4f4ad-bda8-4dee-8cec-d496431ddf84"  # Sales Agent
  "2a46c518-5fe7-48ee-8a6f-53c827d1f714"  # Marketing Agent
  "7a3e17dd-d0fa-4cd8-95d4-c5f745e4696a"  # Ops Analyst
  # PM Gate 和 Scout 当前 paused，不加入定时心跳
)

NAMES=(
  "CEO" "Builder-A" "Builder-B" "Scout" "Content-QA"
  "Release-Gate" "Sales-Agent" "Marketing-Agent" "Ops-Analyst"
)

TRIGGERED=0
SKIPPED=0

for i in "${!AGENTS[@]}"; do
  AID="${AGENTS[$i]}"
  ANAME="${NAMES[$i]}"

  # 触发心跳（后台运行，不等待完成）
  npx paperclipai heartbeat run \
    --agent-id "$AID" \
    --source timer \
    --trigger system \
    --timeout-ms 600000 \
    >> "$LOG" 2>&1 &

  TRIGGERED=$((TRIGGERED + 1))
  echo "$(date '+%Y-%m-%d %H:%M:%S') [BEAT] $ANAME 已触发" >> "$LOG"

  # 错开 2 秒避免同时启动
  sleep 2
done

echo "$(date '+%Y-%m-%d %H:%M:%S') [DONE] 已触发 $TRIGGERED 个 agent" >> "$LOG"
