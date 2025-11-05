#!/usr/bin/env python3
"""
🚀 VERIFY API-FIRST ACH PLATFORMS - 验证API优先的ACH平台
基于成功模式分析，验证高成功率的API优先ACH平台
"""

import json
import time
from datetime import datetime
from pathlib import Path
from no_simulation_system import NoSimulationSystem

# 从搜索结果中提取的API优先ACH平台 - 预计90%+成功率
API_FIRST_ACH_PLATFORMS = [
    {"name": "CrossRiver", "url": "https://www.crossriver.com"},
    {"name": "KeyBank Developer", "url": "https://www.key.com"},
    {"name": "OpenACH", "url": "https://openach.com"},
    {"name": "ACH Banking", "url": "https://achbanking.com"},
    {"name": "North Pay-by-Bank", "url": "https://north.com"},
    {"name": "Modern Treasury", "url": "https://www.moderntreasury.com"},
    {"name": "US Bank Developer", "url": "https://www.usbank.com"},
    {"name": "TabaPay", "url": "https://www.tabapay.com"},
    {"name": "Plaid", "url": "https://plaid.com"},
    {"name": "Stripe ACH", "url": "https://stripe.com"}
]

def verify_api_first_ach_platforms():
    """验证API优先的ACH平台"""
    system = NoSimulationSystem()
    results_file = Path(__file__).parent / "data" / "api_first_ach_results.json"

    print("🚀 验证API优先ACH平台")
    print(f"📋 基于18个成功平台分析，预计90%+成功率")
    print(f"🎯 待验证平台: {len(API_FIRST_ACH_PLATFORMS)} 个")

    verification_results = []
    successful_count = 0

    for i, platform in enumerate(API_FIRST_ACH_PLATFORMS, 1):
        print(f"\n🔍 验证 {i}/{len(API_FIRST_ACH_PLATFORMS)}: {platform['name']}")
        print(f"   类型: API优先ACH平台")

        try:
            # 使用no_simulation_system的真实验证
            verification = system.real_http_verify(platform['url'], platform['name'])
            verification.update(platform)
            verification_results.append(verification)

            if verification.get('verification_success', False):
                successful_count += 1
                print(f"✅ {platform['name']} - 验证通过! 得分: {verification.get('success_rate', 0):.1%}")
            else:
                print(f"❌ {platform['name']} - 验证失败: {verification.get('error', 'Unknown')}")

            # 短暂等待避免过于频繁
            time.sleep(2)

        except Exception as e:
            print(f"❌ 验证 {platform['name']} 时出错: {e}")

    # 保存结果
    report = {
        'execution_time': datetime.now().isoformat(),
        'total_tested': len(API_FIRST_ACH_PLATFORMS),
        'successful': successful_count,
        'success_rate': successful_count / len(API_FIRST_ACH_PLATFORMS),
        'expected_success_rate': 0.9,  # 基于18个平台分析的预期
        'actual_vs_expected': successful_count / len(API_FIRST_ACH_PLATFORMS) / 0.9,
        'results': verification_results
    }

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 API优先ACH平台验证完成!")
    print(f"📊 总验证: {len(API_FIRST_ACH_PLATFORMS)} 个")
    print(f"✅ 成功: {successful_count} 个")
    print(f"📈 实际成功率: {successful_count/len(API_FIRST_ACH_PLATFORMS)*100:.1f}%")
    print(f"🎯 预期成功率: 90%")
    print(f"📊 实际vs预期: {successful_count/len(API_FIRST_ACH_PLATFORMS)/0.9*100:.1f}%")

    # 显示成功平台
    successful_platforms = [r for r in verification_results if r.get('verification_success', False)]
    if successful_platforms:
        print(f"\n🎯 新验证通过的 {len(successful_platforms)} 个API优先ACH平台:")
        for i, platform in enumerate(successful_platforms, 1):
            print(f"  {i:2d}. {platform['platform_name']:<30} - 得分: {platform.get('success_rate', 0):.1%}")

    return report

def generate_grand_total_summary():
    """生成总计验证报告"""
    data_path = Path(__file__).parent / "data"

    # 读取所有验证结果
    total_successful = 0
    total_platforms = 0
    all_successful_platforms = []

    result_files = [
        "20_platforms_results.json",      # 原始20个平台
        "new_ach_platforms_results.json", # 新ACH平台
        "fintech_platforms_results.json", # Fintech平台
        "immediate_breakthrough_results.json", # 突破结果
        "api_first_ach_results.json"      # API优先ACH平台
    ]

    print(f"\n" + "="*80)
    print(f"🏆 总计验证报告 - 基于成功模式的精准验证")
    print(f"="*80)

    for filename in result_files:
        file_path = data_path / filename
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                if filename == "immediate_breakthrough_results.json":
                    # 突破结果格式不同
                    successful = [r for r in data.get('results', []) if r.get('breakthrough_success', False) and r.get('final_verification', {}).get('verification_success', False)]
                    total_tested = data.get('total_platforms', 0)
                else:
                    successful = [r for r in data.get('results', []) if r.get('verification_success', False)]
                    total_tested = data.get('total_tested', 0)

                total_successful += len(successful)
                total_platforms += total_tested
                all_successful_platforms.extend(successful)

                success_rate = len(successful) / total_tested if total_tested > 0 else 0
                print(f"📊 {filename:<35}: {len(successful):2d}/{total_tested:2d} 通过 ({success_rate*100:.1f}%)")

            except Exception as e:
                print(f"❌ 读取 {filename} 失败: {e}")

    print(f"\n🎉 最终总计验证结果:")
    print(f"📊 总验证平台: {total_platforms}")
    print(f"✅ 验证通过: {total_successful}")
    print(f"📈 总成功率: {total_successful/total_platforms*100:.1f}%" if total_platforms > 0 else "📈 总成功率: 0%")

    # 去重（如果有重复平台）
    seen_urls = set()
    unique_platforms = []
    for platform in all_successful_platforms:
        url = platform.get('platform_url', platform.get('url', ''))
        if url not in seen_urls:
            seen_urls.add(url)
            unique_platforms.append(platform)

    print(f"🔍 去重后验证通过: {len(unique_platforms)} 个平台")

    if unique_platforms:
        print(f"\n🏆 所有 {len(unique_platforms)} 个验证通过的平台:")
        unique_platforms.sort(key=lambda x: x.get('success_rate', 0), reverse=True)

        for i, platform in enumerate(unique_platforms, 1):
            name = platform.get('platform_name', platform.get('name', 'Unknown'))
            score = platform.get('success_rate', 0)
            score_str = f"{score:.1%}" if score > 0 else "N/A"
            print(f"  {i:2d}. {name:<35} - 得分: {score_str}")

    # 保存最终总计报告
    final_summary_report = {
        'summary_time': datetime.now().isoformat(),
        'total_platforms_tested': total_platforms,
        'total_successful': len(unique_platforms),
        'overall_success_rate': len(unique_platforms)/total_platforms if total_platforms > 0 else 0,
        'all_successful_platforms': unique_platforms,
        'analysis_based': "基于18个成功平台深度分析",
        'success_patterns_identified': [
            "API优先驱动",
            "ACH直接能力",
            "开发者友好",
            "企业服务导向"
        ]
    }

    final_summary_file = data_path / "final_verification_summary.json"
    with open(final_summary_file, 'w', encoding='utf-8') as f:
        json.dump(final_summary_report, f, ensure_ascii=False, indent=2)

    print(f"\n💾 最终总计报告已保存: {final_summary_file}")
    print(f"\n🎯 成就解锁: {len(unique_platforms)}个验证通过的平台!")

    return final_summary_report

if __name__ == "__main__":
    # 验证API优先ACH平台
    api_results = verify_api_first_ach_platforms()

    # 生成最终总计报告
    print("\n" + "="*60)
    final_summary = generate_grand_total_summary()