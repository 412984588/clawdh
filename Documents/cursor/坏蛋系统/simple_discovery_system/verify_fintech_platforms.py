#!/usr/bin/env python3
"""
🚀 VERIFY FINTECH PLATFORMS - 验证新发现的fintech平台
基于最新搜索结果验证更多支付平台
"""

import json
import time
from datetime import datetime
from pathlib import Path
from no_simulation_system import NoSimulationSystem

# 从最新搜索结果中提取的新平台
NEW_FINTECH_PLATFORMS = [
    {"name": "Moov", "url": "https://moov.io"},
    {"name": "Parafin", "url": "https://www.parafin.com"},
    {"name": "Mercury", "url": "https://mercury.com"},
    {"name": "Rho", "url": "https://www.rho.co"},
    {"name": "BlueHill Payments", "url": "https://bluehillpayments.com"},
    {"name": "Slope", "url": "https://slope.dev"},
    {"name": "Dots", "url": "https://dots.dev"},
    {"name": "Chime Bank", "url": "https://chime.com"},
    {"name": "Bilt Rewards", "url": "https://biltrewards.com"},
    {"name": "Seedtable", "url": "https://www.seedtable.com"}
]

def verify_fintech_platforms():
    """快速验证新发现的fintech平台"""
    system = NoSimulationSystem()
    results_file = Path(__file__).parent / "data" / "fintech_platforms_results.json"

    print("🚀 快速验证新发现的fintech平台...")
    print(f"📋 待验证平台: {len(NEW_FINTECH_PLATFORMS)} 个")

    verification_results = []
    successful_count = 0

    for i, platform in enumerate(NEW_FINTECH_PLATFORMS, 1):
        print(f"\n🔍 验证 {i}/{len(NEW_FINTECH_PLATFORMS)}: {platform['name']}")

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
        'total_tested': len(NEW_FINTECH_PLATFORMS),
        'successful': successful_count,
        'success_rate': successful_count / len(NEW_FINTECH_PLATFORMS),
        'results': verification_results
    }

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Fintech平台验证完成!")
    print(f"📊 总验证: {len(NEW_FINTECH_PLATFORMS)} 个")
    print(f"✅ 成功: {successful_count} 个")
    print(f"📈 成功率: {successful_count/len(NEW_FINTECH_PLATFORMS)*100:.1f}%")

    # 显示成功平台
    successful_platforms = [r for r in verification_results if r.get('verification_success', False)]
    if successful_platforms:
        print(f"\n🎯 新验证通过的 {len(successful_platforms)} 个fintech平台:")
        for i, platform in enumerate(successful_platforms, 1):
            print(f"  {i:2d}. {platform['platform_name']:<30} - 得分: {platform.get('success_rate', 0):.1%}")

    return report

def generate_total_summary():
    """生成总计验证报告"""
    data_path = Path(__file__).parent / "data"

    # 读取所有验证结果
    total_successful = 0
    total_platforms = 0
    all_successful_platforms = []

    result_files = [
        "20_platforms_results.json",
        "new_ach_platforms_results.json",
        "fintech_platforms_results.json"
    ]

    for filename in result_files:
        file_path = data_path / filename
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                successful = [r for r in data.get('results', []) if r.get('verification_success', False)]
                total_successful += len(successful)
                total_platforms += data.get('total_tested', 0)
                all_successful_platforms.extend(successful)

                print(f"📊 {filename}: {len(successful)}/{data.get('total_tested', 0)} 通过")

            except Exception as e:
                print(f"❌ 读取 {filename} 失败: {e}")

    print(f"\n🎉 总计验证结果:")
    print(f"📊 总验证平台: {total_platforms}")
    print(f"✅ 验证通过: {total_successful}")
    print(f"📈 总成功率: {total_successful/total_platforms*100:.1f}%" if total_platforms > 0 else "📈 总成功率: 0%")

    if all_successful_platforms:
        print(f"\n🏆 所有 {len(all_successful_platforms)} 个验证通过的平台:")
        for i, platform in enumerate(all_successful_platforms, 1):
            name = platform['platform_name']
            score = platform.get('success_rate', 0)
            print(f"  {i:2d}. {name:<35} - 得分: {score:.1%}")

    # 保存总计报告
    summary_report = {
        'summary_time': datetime.now().isoformat(),
        'total_platforms_tested': total_platforms,
        'total_successful': total_successful,
        'overall_success_rate': total_successful/total_platforms if total_platforms > 0 else 0,
        'all_successful_platforms': all_successful_platforms
    }

    summary_file = data_path / "total_verification_summary.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary_report, f, ensure_ascii=False, indent=2)

    print(f"\n💾 总计报告已保存: {summary_file}")

if __name__ == "__main__":
    # 验证新的fintech平台
    verify_fintech_platforms()

    # 生成总计报告
    print("\n" + "="*60)
    generate_total_summary()