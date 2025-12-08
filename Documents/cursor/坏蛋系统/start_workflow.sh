#!/bin/bash
# 平台发现验证工作流启动脚本

cd /Users/zhimingdeng/Documents/cursor/坏蛋系统

echo "🚀 启动平台发现验证系统"
echo "========================"

# 检查是否已有运行的进程
if [ -f workflow.pid ]; then
    PID=$(cat workflow.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️ 已有运行中的进程 (PID: $PID)"
        echo "如需重启，请先运行: ./stop_workflow.sh"
        exit 1
    else
        rm workflow.pid
    fi
fi

# 检查环境变量
if [ ! -f .env ]; then
    echo "❌ 未找到.env文件"
    exit 1
fi

# 启动工作流
echo "📦 批量大小: ${1:-50}"
echo "⏱️  间隔时间: ${2:-120}秒"
echo ""

nohup python claude_auto_workflow.py \
    --batch-size=${1:-50} \
    --interval=${2:-120} \
    > workflow.log 2>&1 &

echo $! > workflow.pid
echo "✅ 已启动 (PID: $(cat workflow.pid))"
echo ""
echo "查看日志: tail -f workflow.log"
echo "停止运行: ./stop_workflow.sh"
