#!/usr/bin/env bash
# Memory Persistence: Session End Hook
# 会话结束时持久化状态提醒

set -euo pipefail

# 提醒消息
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "additionalContext": "<SESSION_END_REMINDER>\\n⚠️ 会话即将结束！\\n\\n请确保以下工作已完成：\\n1. [ ] 更新 docs/PROGRESS.md（记录本次工作进度）\\n2. [ ] 运行 git commit（如有代码修改）\\n3. [ ] 下次可用 /resume 恢复上下文\\n</SESSION_END_REMINDER>"
  }
}
EOF
exit 0
