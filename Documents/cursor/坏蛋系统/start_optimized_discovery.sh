#!/bin/bash
# 启动优化版平台发现系统

echo "🚀 启动优化版平台发现系统"
echo "=================================="

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 显示选项
show_menu() {
    echo -e "\n${YELLOW}请选择发现模式:${NC}"
    echo "1) 智能真实发现（推荐） - 只发现真实存在的平台"
    echo "2) 增强版网络爬虫 - 修复选择器和反爬虫机制"
    echo "3) 测试两个工具的效果"
    echo "4) 查看已验证平台统计"
    echo "5) 退出"
    echo ""
}

# 检查Python依赖
check_dependencies() {
    echo -e "${YELLOW}检查依赖...${NC}"

    if ! python3 -c "import requests, beautifulsoup4, whois" 2>/dev/null; then
        echo -e "${RED}缺少依赖，正在安装...${NC}"
        pip3 install requests beautifulsoup4 python-whois lxml
    fi

    echo -e "${GREEN}依赖检查完成${NC}"
}

# 运行智能真实发现
run_intelligent_discovery() {
    echo -e "\n${GREEN}🔍 启动智能真实平台发现...${NC}"
    echo "特点："
    echo "- 基于已验证平台模式发现"
    echo "- DNS和HTTP验证确保真实性"
    echo "- 智能延迟避免封禁"
    echo "- 只返回真实存在的平台"
    echo ""

    read -p "目标发现数量 (默认15): " target_count
    target_count=${target_count:-15}

    python3 -c "
from intelligent_real_discovery import IntelligentRealDiscovery
discovery = IntelligentRealDiscovery()
platforms = discovery.discover_real_platforms($target_count)
"

    echo -e "\n${GREEN}✅ 智能发现完成，查看 intelligent_discovery_results.json${NC}"
}

# 运行增强版爬虫
run_enhanced_scraper() {
    echo -e "\n${GREEN}🕷️ 启动增强版网络爬虫...${NC}"
    echo "特点："
    echo "- 修复了CSS选择器问题"
    echo "- 智能User-Agent轮换"
    echo "- 反爬虫机制处理"
    echo "- 智能延迟和重试"
    echo ""

    read -p "目标发现数量 (默认20): " target_count
    target_count=${target_count:-20}

    python3 -c "
from enhanced_web_scraper import EnhancedWebScraper
scraper = EnhancedWebScraper()
platforms = scraper.discover_platforms($target_count)
"

    echo -e "\n${GREEN}✅ 爬虫完成，查看 enhanced_scraper_results.json${NC}"
}

# 运行测试
run_tests() {
    echo -e "\n${GREEN}🧪 运行工具测试...${NC}"
    echo "这将测试两个工具的效果并进行对比"
    echo ""

    python3 test_discovery_tools.py

    echo -e "\n${GREEN}✅ 测试完成${NC}"
}

# 显示统计
show_stats() {
    echo -e "\n${GREEN}📊 平台发现统计${NC}"
    echo "=================================="

    if [ -f "verified_platforms.json" ]; then
        count=$(python3 -c "
import json
with open('verified_platforms.json', 'r') as f:
    data = json.load(f)
    print(len(data.get('platforms', [])))
" 2>/dev/null)
        echo -e "已验证平台数量: ${YELLOW}$count${NC}"
    else
        echo -e "${RED}未找到 verified_platforms.json${NC}"
    fi

    echo ""
    echo "最近的发现结果:"

    for file in intelligent_discovery_results.json enhanced_scraper_results.json; do
        if [ -f "$file" ]; then
            timestamp=$(python3 -c "
import json
with open('$file', 'r') as f:
    data = json.load(f)
    print(data.get('timestamp', '')[:19])
" 2>/dev/null)
            count=$(python3 -c "
import json
with open('$file', 'r') as f:
    data = json.load(f)
    print(data.get('total_found', 0))
" 2>/dev/null)
            echo -e "  $file: $count 个平台 ($timestamp)"
        fi
    done
}

# 主程序
main() {
    check_dependencies

    while true; do
        show_menu
        read -p "请输入选项 (1-5): " choice
        case $choice in
            1)
                run_intelligent_discovery
                ;;
            2)
                run_enhanced_scraper
                ;;
            3)
                run_tests
                ;;
            4)
                show_stats
                ;;
            5)
                echo -e "\n${GREEN}再见！${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}无效选项，请重新选择${NC}"
                ;;
        esac

        echo -e "\n按回车继续..."
        read
    done
}

# 运行主程序
main