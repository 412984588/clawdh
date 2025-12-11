#!/usr/bin/env python3
"""
真实网站爬取工作流
爬取真实的支付和创作者平台数据
"""

import asyncio
import sys
from datetime import datetime

# 导入爬虫模块
from real_web_scraper import RealWebScraper

async def main():
    print("🚀 真实平台爬取系统")
    print("="*50)
    print("功能：")
    print("- 爬取真实的平台目录网站")
    print("- 搜索真实的支付和创作者平台")
    print("- 不需要任何API密钥")
    print("="*50)

    # 启动爬虫
    print("\n🌐 启动爬取...")
    scraper = RealWebScraper()
    platforms = await scraper.run_scraping_session(max_pages=100)
    scraper.save_platforms(platforms)

    print(f"\n✅ 爬取完成！发现 {len(platforms)} 个真实平台")
    print("📋 查看结果：pending_platforms.json")

if __name__ == "__main__":
    asyncio.run(main())