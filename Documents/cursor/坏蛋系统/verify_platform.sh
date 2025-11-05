#!/bin/bash

# 🎯 资金中转平台验证技能快速启动器
# HTTP 403突破 + 4项标准验证 + Playwright自动化

# 使用方法:
# ./verify_platform.sh [platform_url] [platform_name]

echo "🎯 资金中转平台验证技能 v1.0"
echo "========================================="

if [ $# -eq 0 ]; then
    echo "📋 使用方法:"
    echo "  ./verify_platform.sh [platform_url] [platform_name]"
    echo ""
    echo "🔧 示例:"
    echo "  ./verify_platform.sh https://www.thinkific.com/ Thinkific"
    echo "  ./verify_platform.sh https://www.whatnot.com/ Whatnot"
    echo ""
    echo "📚 技能文档: SKILLS_Platform_Verification_Master.md"
    echo "🐍 Python脚本: skill_platform_verifier.py"
    exit 1
fi

PLATFORM_URL=$1
PLATFORM_NAME=${2:-"未命名平台"}

echo "🎯 验证平台: $PLATFORM_NAME"
echo "🔗 平台地址: $PLATFORM_URL"
echo ""

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到python3，请先安装Python"
    exit 1
fi

# 检查技能文件
if [ ! -f "skill_platform_verifier.py" ]; then
    echo "❌ 错误: 未找到skill_platform_verifier.py文件"
    echo "💡 请确保在正确的目录中运行此脚本"
    exit 1
fi

echo "🚀 启动验证技能..."
echo ""

# 执行技能验证
python3 skill_platform_verifier.py "$PLATFORM_URL" "$PLATFORM_NAME"

echo ""
echo "✅ 技能执行完成!"
echo "📊 验证结果将保存在当前目录"
echo ""
echo "🎯 下一步建议:"
echo "  1. 查看生成的验证报告"
echo "  2. 检查4项标准验证结果"
echo "  3. 确认支付/提现方式"
echo "  4. 评估平台适用性"