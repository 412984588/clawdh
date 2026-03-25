#!/usr/bin/env bash
# Memory Persistence: Session Start Hook
# 自动读取 PROGRESS.md 并注入上下文

set -euo pipefail

# 查找项目根目录的 PROGRESS.md
find_progress_file() {
    local dir="$PWD"
    while [ "$dir" != "/" ]; do
        if [ -f "$dir/docs/PROGRESS.md" ]; then
            echo "$dir/docs/PROGRESS.md"
            return 0
        elif [ -f "$dir/PROGRESS.md" ]; then
            echo "$dir/PROGRESS.md"
            return 0
        fi
        dir=$(dirname "$dir")
    done
    return 1
}

# JSON 转义函数
escape_for_json() {
    local input="$1"
    # 使用 sed 进行转义
    printf '%s' "$input" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' | tr '\n' ' ' | sed 's/  */ \\n/g'
}

# 读取并注入上下文
if progress_file=$(find_progress_file 2>/dev/null); then
    # 读取最近 50 行进度
    recent_progress=$(head -50 "$progress_file" 2>/dev/null || echo "")
    
    if [ -n "$recent_progress" ]; then
        escaped_progress=$(escape_for_json "$recent_progress")
        cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<MEMORY_CONTEXT>\\n📝 自动加载的项目进度 (PROGRESS.md):\\n\\n${escaped_progress}\\n\\n💡 提示: 上次工作的进度已加载，可以继续工作。\\n</MEMORY_CONTEXT>"
  }
}
EOF
        exit 0
    fi
fi

# 没有找到 PROGRESS.md
echo "{}"
exit 0
