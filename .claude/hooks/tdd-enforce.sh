#!/bin/bash
# TDD 强制执行脚本（阶段1优化版）
# 集成意图识别：引用 intent-detection.json

# TDD 已禁用（enabled: false）
# 此脚本保留用于文档目的，实际逻辑由 intent-detection.json 控制

# 加载意图识别配置
CONFIG_SOURCE="${HOME}/.claude/hooks/intent-detection.json"

# 解析 JSON 配置函数
load_config() {
    if [ ! -f "$CONFIG_SOURCE" ]; then
        echo "⚠️ 配置文件不存在：$CONFIG_SOURCE"
        return 1
    fi

    # 使用 python3 解析 JSON（兼容性更好）
    python3 -c "
import json
import sys

try:
    with open('$CONFIG_SOURCE', 'r') as f:
        config = json.load(f)
        print(json.dumps(config))
except Exception as e:
    sys.exit(1)
" 2>/dev/null || return 1
}

# 主函数
main() {
    local user_message="$1"

    # TDD 已禁用，只提示信息
    echo "⚠️ TDD 强制已禁用（见 settings.json 或 intent-detection.json）"
    echo "💡 如需启用，请修改配置文件"
    echo ""
    echo "当前用户消息：$user_message"
}

# 执行主函数
main "$@"
