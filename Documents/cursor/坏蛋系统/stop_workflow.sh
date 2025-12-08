#!/bin/bash
# 停止平台发现验证工作流

cd /Users/zhimingdeng/Documents/cursor/坏蛋系统

echo "⏹️ 停止工作流"

if [ -f workflow.pid ]; then
    PID=$(cat workflow.pid)
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "✅ 已停止进程 (PID: $PID)"
    else
        echo "⚠️ 进程已不存在"
    fi
    rm workflow.pid
else
    echo "⚠️ 未找到运行中的工作流"
fi
