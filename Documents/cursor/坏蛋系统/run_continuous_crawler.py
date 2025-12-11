#!/usr/bin/env python3
"""
持续运行爬虫 - 24/7自动发现和验证平台
"""

import time
import json
from datetime import datetime
from smart_crawler import SmartCrawler
from mcp_tools import MCP_TOOLS

def main():
    print("🚀 启动24/7持续爬虫系统")
    print("="*60)

    # 配置参数
    batch_size = 20  # 每批20个平台
    interval_minutes = 2  # 每2分钟一批

    # 创建爬虫系统
    crawler = SmartCrawler(max_workers=5)

    batch_count = 0

    try:
        while True:
            batch_count += 1
            print(f"\n{'='*60}")
            print(f"🔄 第 {batch_count} 批次 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'='*60}")

            # 发现平台
            print(f"\n📡 发现平台...")
            platforms = crawler.discover_real_platforms(batch_size)

            if platforms:
                # 验证平台
                print(f"\n🔍 验证 {len(platforms)} 个平台...")
                crawler.validate_platform_batch(platforms)

            # 分析整体统计
            crawler.analyze_overall_stats()

            # 保存批次日志
            log_entry = {
                "batch_number": batch_count,
                "timestamp": datetime.now().isoformat(),
                "platforms_discovered": len(platforms),
                "interval_minutes": interval_minutes
            }

            with open('continuous_crawler_log.json', 'a', encoding='utf-8') as f:
                f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')

            print(f"\n⏰ 等待 {interval_minutes} 分钟后开始下一批...")
            time.sleep(interval_minutes * 60)

    except KeyboardInterrupt:
        print("\n⚠️ 用户中断，正在保存进度...")
    except Exception as e:
        print(f"\n❌ 系统错误: {e}")
        import traceback
        traceback.print_exc()

    print("\n📊 最终统计:")
    crawler.analyze_overall_stats()

if __name__ == "__main__":
    main()