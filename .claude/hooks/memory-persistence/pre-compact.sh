#!/usr/bin/env bash
# Memory Persistence: Pre-Compact Hook
# 上下文压缩前自动保存当前状态

set -euo pipefail

# 查找项目根目录
find_project_root() {
    local dir="$PWD"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.git" ] || [ -f "$dir/package.json" ] || [ -f "$dir/pyproject.toml" ]; then
            echo "$dir"
            return 0
        fi
        dir=$(dirname "$dir")
    done
    echo "$PWD"
}

project_root=$(find_project_root)
progress_file="$project_root/docs/PROGRESS.md"

# 确保目录存在
mkdir -p "$(dirname "$progress_file")"

# 添加压缩前快照标记
timestamp=$(date "+%Y-%m-%d %H:%M")

# 输出提醒信息
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreCompact",
    "additionalContext": "<COMPACT_REMINDER>\\n⚠️ 上下文即将压缩！\\n\\n请在压缩前确保：\\n1. 当前工作进度已记录到 docs/PROGRESS.md\\n2. 重要决策和问题已文档化\\n3. 未完成的任务已标记\\n\\n时间: ${timestamp}\\n</COMPACT_REMINDER>"
  }
}
EOF
exit 0
