#!/usr/bin/env bash
# forge-session-start.sh - v1.0.0
# SessionStart hook: 自动检测并公告进行中的 Forge 项目
#
# 扫描 ~/.forge/projects/ 下所有 state.json，
# 找到 status != "complete" 的项目，输出中文恢复提示。

set -euo pipefail

FORGE_DIR="$HOME/.forge/projects"

# 没有 forge 目录则静默退出
if [ ! -d "$FORGE_DIR" ]; then
  exit 0
fi

# 读取 stdin（hook 要求必须消耗 stdin）
INPUT=$(cat)

# 找所有活跃项目
ACTIVE_PROJECTS=()
DETAILS=()

for state_file in "$FORGE_DIR"/*/state.json; do
  [ -f "$state_file" ] || continue

  # 提取状态
  STATUS=$(python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d.get('status','active'))" "$state_file" 2>/dev/null || echo "active")

  if [ "$STATUS" = "complete" ]; then
    continue
  fi

  SLUG=$(basename "$(dirname "$state_file")")
  # 支持嵌套 phase.current 和旧式 phase_num 两种格式
  PHASE=$(python3 -c "
import json,sys
d=json.load(open(sys.argv[1]))
p = d.get('phase',{})
if isinstance(p, dict):
    print(p.get('current','?'))
else:
    print(d.get('phase_num','?'))
" "$state_file" 2>/dev/null || echo "?")
  LAST=$(python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(str(d.get('last_activity',''))[:10])" "$state_file" 2>/dev/null || echo "")
  NEXT=$(python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(str(d.get('next_action',''))[:40])" "$state_file" 2>/dev/null || echo "")

  DETAIL="  • ${SLUG}"
  [ "$PHASE" != "?" ] && DETAIL="${DETAIL}（第 ${PHASE} 阶段）"
  [ -n "$LAST" ] && DETAIL="${DETAIL} — 最后活动：${LAST}"
  [ -n "$NEXT" ] && DETAIL="${DETAIL}\n    下一步：${NEXT}"
  DETAIL="${DETAIL}\n    恢复命令：/forge resume ${SLUG}"

  ACTIVE_PROJECTS+=("$SLUG")
  DETAILS+=("$DETAIL")
done

# 没有活跃项目则静默退出
if [ ${#ACTIVE_PROJECTS[@]} -eq 0 ]; then
  exit 0
fi

COUNT=${#ACTIVE_PROJECTS[@]}

# 构建消息
MSG="🔨 Forge 检测到 ${COUNT} 个进行中的项目：\n\n"
for detail in "${DETAILS[@]}"; do
  MSG="${MSG}${detail}\n\n"
done
MSG="${MSG}如需继续，输入对应的 /forge resume 命令。\n如需查看所有项目状态，输入 /forge:status"

# 输出 JSON（SessionStart hook 格式）
python3 -c "
import json, sys
msg = sys.argv[1]
output = {
    'hookSpecificOutput': {
        'hookEventName': 'SessionStart',
        'additionalContext': msg
    }
}
print(json.dumps(output))
" "$MSG"
