#!/bin/bash
# OpenClaw 监控代理测试脚本
# 用于快速验证监控代理的基本功能

echo "========================================"
echo "OpenClaw 监控代理测试"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../"

# 测试 1: 检查 Python 语法
echo "📝 测试 1: 检查 Python 语法..."
python3 -m py_compile scripts/openclaw_monitor.py && echo "  ✅ openclaw_monitor.py 语法正确" || echo "  ❌ openclaw_monitor.py 语法错误"
python3 -m py_compile scripts/openclaw_diagnostics.py && echo "  ✅ openclaw_diagnostics.py 语法正确" || echo "  ❌ openclaw_diagnostics.py 语法错误"
python3 -m py_compile scripts/openclaw_recovery.py && echo "  ✅ openclaw_recovery.py 语法正确" || echo "  ❌ openclaw_recovery.py 语法错误"
python3 -m py_compile scripts/openclaw_learning.py && echo "  ✅ openclaw_learning.py 语法正确" || echo "  ❌ openclaw_learning.py 语法错误"
echo ""

# 测试 2: 验证模块导入
echo "📝 测试 2: 验证模块导入..."
cd scripts
python3 -c "
import openclaw_monitor
import openclaw_diagnostics
import openclaw_recovery
import openclaw_learning
print('  ✅ 所有模块导入成功')
" 2>&1
cd ..
echo ""

# 测试 3: 验证日志目录
echo "📝 测试 3: 验证日志目录..."
if [ -d "logs" ]; then
    echo "  ✅ logs/ 目录存在"
else
    echo "  ⚠️  logs/ 目录不存在（运行监控脚本时会自动创建）"
fi
echo ""

# 测试 4: 检查 OpenClaw CLI
echo "📝 测试 4: 检查 OpenClaw CLI..."
OPENCLAW_CLI="../../moltbot/extensions/memory-lancedb/node_modules/.bin/openclaw"
if [ -f "$OPENCLAW_CLI" ]; then
    echo "  ✅ OpenClaw CLI 找到: $OPENCLAW_CLI"
else
    echo "  ❌ OpenClaw CLI 未找到"
    echo "  尝试的路径："
    echo "    $OPENCLAW_CLI"
fi
echo ""

# 测试 5: 检查 OpenClaw 进程
echo "📝 测试 5: 检查 OpenClaw 进程状态..."
PROCESS_COUNT=$(ps aux | grep -i openclaw | grep -v grep | wc -l | tr -d ' ')
if [ "$PROCESS_COUNT" -gt 0 ]; then
    echo "  ✅ OpenClaw 进程运行中（共 $PROCESS_COUNT 个）"
else
    echo "  ⚠️  OpenClaw 进程未运行"
fi
echo ""

# 测试 6: 测试 OpenClaw Gateway 健康
echo "📝 测试 6: 测试 OpenClaw Gateway 健康..."
if [ -f "$OPENCLAW_CLI" ]; then
    $OPENCLAW_CLI gateway health
    if [ $? -eq 0 ]; then
        echo "  ✅ Gateway 健康检查通过"
    else
        echo "  ❌ Gateway 健康检查失败（可能 Gateway 未运行）"
    fi
else
    echo "  ⏭️  跳过健康检查（CLI 未找到）"
fi
echo ""

echo "========================================"
echo "测试完成"
echo "========================================"
echo ""
echo "下一步："
echo "1. 运行监控代理: python3 scripts/openclaw_monitor.py"
echo "2. 或创建 systemd 服务自动启动（Phase 5）"
