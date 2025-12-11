#!/bin/bash
# 平台发现系统启动脚本

echo "🚀 个人收款平台发现系统"
echo "================================"
echo ""
echo "选择运行模式："
echo "1. 增强版CrewAI系统（使用智谱GLM-4.6）"
echo "2. 批量处理器（规则引擎模式）"
echo "3. 智能爬虫系统（真实平台爬取）"
echo "4. 查看系统状态"
echo "5. 退出"
echo ""

read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🤖 启动增强版CrewAI系统..."
        python3 enhanced_crewai_system.py
        ;;
    2)
        echo ""
        echo "⚡ 启动批量处理器..."
        python3 batch_processor.py
        ;;
    3)
        echo ""
        echo "🕷️ 启动智能爬虫系统..."
        python3 smart_crawler.py
        ;;
    4)
        echo ""
        echo "📊 系统状态："
        echo "--------------------------------"

        # 统计已验证平台
        if [ -f "verified_platforms.json" ]; then
            verified_count=$(cat verified_platforms.json | jq '.platforms | length')
            echo "✅ 已验证平台: $verified_count 个"
        else
            echo "❌ 未找到 verified_platforms.json"
        fi

        # 统计已拒绝平台
        if [ -f "rejected_platforms.json" ]; then
            rejected_count=$(cat rejected_platforms.json | jq '.platforms | length')
            echo "❌ 已拒绝平台: $rejected_count 个"
        else
            echo "❌ 未找到 rejected_platforms.json"
        fi

        # 计算成功率
        if [ -f "verified_platforms.json" ] && [ -f "rejected_platforms.json" ]; then
            verified=$(cat verified_platforms.json | jq '.platforms | length')
            rejected=$(cat rejected_platforms.json | jq '.platforms | length')
            total=$((verified + rejected))
            if [ $total -gt 0 ]; then
                success_rate=$(echo "scale=1; $verified * 100 / $total" | bc)
                echo "📈 总成功率: $success_rate%"
            fi
        fi

        # 显示最近的分析报告
        if [ -f "analysis_report.json" ]; then
            echo ""
            echo "📋 最新分析报告:"
            cat analysis_report.json | jq '{
                "成功率": .success_rate,
                "建议": .strategy_suggestion.reason,
                "优化": .strategy_suggestion.suggestion
            }'
        fi
        ;;
    5)
        echo "👋 再见！"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac