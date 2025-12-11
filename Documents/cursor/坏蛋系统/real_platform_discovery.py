#!/usr/bin/env python3
"""
真实平台发现系统 - 完全基于爬取和搜索
不生成任何虚假数据
"""

import json
import asyncio
import concurrent.futures
from datetime import datetime
from typing import List, Dict

from real_discovery_tool import RealPlatformDiscovery
from mcp_tools import MCP_TOOLS

class RealPlatformSystem:
    """真实平台发现系统"""

    def __init__(self, max_workers: int = 5):
        self.max_workers = max_workers
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        print(f"🚀 初始化真实平台发现系统")
        print(f"🔍 模式: 100%真实爬取，无生成数据")
        self.discovery = RealPlatformDiscovery()

    def discover_and_validate(self, count: int = 50):
        """发现并验证真实平台"""
        print(f"\n{'='*60}")
        print(f"🔄 开始真实平台发现和验证")
        print(f"{'='*60}")

        # 1. 发现真实平台
        print(f"\n📡 第1步: 发现真实平台")
        platforms = self.discovery.discover_platforms(count)
        print(f"✅ 发现 {len(platforms)} 个真实平台")

        # 2. 验证平台
        print(f"\n🔍 第2步: 验证平台")
        verified_count = 0
        results = []

        # 使用线程池并行验证
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_platform = {
                executor.submit(self.validate_single_platform, platform): platform
                for platform in platforms
            }

            for future in concurrent.futures.as_completed(future_to_platform):
                platform = future_to_platform[future]
                try:
                    result = future.result()
                    results.append(result)

                    if result['verified']:
                        verified_count += 1
                        MCP_TOOLS['data'].save_platform(result, 'verified')
                        print(f"  ✅ 通过: {platform.get('name', 'Unknown')}")
                    else:
                        MCP_TOOLS['data'].save_platform(result, 'rejected')
                        print(f"  ❌ 拒绝: {platform.get('name', 'Unknown')}")

                except Exception as e:
                    print(f"  💥 错误: {str(e)}")

        # 3. 生成报告
        print(f"\n📊 第3步: 生成报告")
        success_rate = (verified_count / len(platforms)) * 100 if platforms else 0

        report = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "discovery_method": "real_web_scraping",
            "total_discovered": len(platforms),
            "verified_count": verified_count,
            "rejected_count": len(platforms) - verified_count,
            "success_rate": success_rate,
            "results": results
        }

        # 保存报告
        with open(f'real_discovery_report_{self.session_id}.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        # 打印摘要
        print(f"\n📈 发现和验证完成:")
        print(f"  - 总发现: {len(platforms)} 个")
        print(f"  - 已验证: {verified_count} 个")
        print(f"  - 已拒绝: {len(platforms) - verified_count} 个")
        print(f"  - 成功率: {success_rate:.1f}%")

        return report

    def validate_single_platform(self, platform: Dict) -> Dict:
        """验证单个平台"""
        url = platform.get('url', '')
        if not url:
            return {
                "platform": platform,
                "verified": False,
                "error": "无效URL",
                "verification_details": "平台没有有效的URL"
            }

        # 爬取网站内容
        scraper_result = MCP_TOOLS['scraper'].scrape_website(url)

        if scraper_result['status'] != 'success':
            return {
                "platform": platform,
                "verified": False,
                "error": scraper_result.get('error', '未知错误'),
                "verification_details": f"无法访问网站: {scraper_result.get('error', '未知错误')}"
            }

        # 执行4项验证
        validation_results = MCP_TOOLS['validator'].extract_validation_criteria(
            scraper_result['content'],
            scraper_result['title']
        )

        # 收集证据
        evidence = MCP_TOOLS['evidence'].collect_evidence(url, validation_results)

        # 生成报告
        report = {
            "platform": platform,
            "validation_results": validation_results,
            "evidence": evidence,
            "verified": all(validation_results.values()),
            "verification_details": json.dumps(evidence, ensure_ascii=False),
            "scraped_content_length": len(scraper_result['content']),
            "scraped_title": scraper_result['title']
        }

        return report

def main():
    """主函数"""
    print("🤖 真实平台发现系统 v1.0")
    print("="*50)

    # 配置参数
    count = 20  # 发现20个平台

    # 创建系统
    system = RealPlatformSystem()

    # 运行发现和验证
    report = system.discover_and_validate(count)

    # 分析整体统计
    print(f"\n📈 整体统计:")
    verified = MCP_TOOLS['data'].load_verified_platforms()
    rejected = MCP_TOOLS['data'].load_rejected_platforms()

    total = len(verified) + len(rejected)
    success_rate = (len(verified) / total) * 100 if total > 0 else 0

    print(f"  - 累计验证: {total} 个")
    print(f"  - 已通过: {len(verified)} 个")
    print(f"  - 已拒绝: {len(rejected)} 个")
    print(f"  - 总成功率: {success_rate:.1f}%")

if __name__ == "__main__":
    main()