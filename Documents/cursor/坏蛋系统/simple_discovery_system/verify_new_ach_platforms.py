#!/usr/bin/env python3
"""
🚀 VERIFY NEW ACH PLATFORMS - 快速验证新发现的ACH平台
基于Exa搜索结果，验证新的支付平台
"""

import json
import time
from datetime import datetime
from pathlib import Path
from no_simulation_system import NoSimulationSystem

# 从Exa搜索结果中提取的新平台
NEW_ACH_PLATFORMS = [
    {"name": "Dwolla", "url": "https://www.dwolla.com"},
    {"name": "AvidXchange", "url": "https://www.avidxchange.com"},
    {"name": "Rotessa", "url": "https://rotessa.com"},
    {"name": "PaymentCloud", "url": "https://paymentcloudinc.com"},
    {"name": "GoCardless", "url": "https://gocardless.com"},
    {"name": "Paysafe", "url": "https://www.paysafe.com"},
    {"name": "National Processing", "url": "https://nationalprocessing.com"},
    {"name": "ACHWorks", "url": "https://ww3.achworks.com"},
    {"name": "Aeropay", "url": "https://www.aeropay.com"},
    {"name": "Ramp", "url": "https://ramp.com"}
]

def verify_new_ach_platforms():
    """快速验证新发现的ACH平台"""
    system = NoSimulationSystem()
    results_file = Path(__file__).parent / "data" / "new_ach_platforms_results.json"

    print("🚀 快速验证新发现的ACH平台...")
    print(f"📋 待验证平台: {len(NEW_ACH_PLATFORMS)} 个")

    verification_results = []
    successful_count = 0

    for i, platform in enumerate(NEW_ACH_PLATFORMS, 1):
        print(f"\n🔍 验证 {i}/{len(NEW_ACH_PLATFORMS)}: {platform['name']}")

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
        'total_tested': len(NEW_ACH_PLATFORMS),
        'successful': successful_count,
        'success_rate': successful_count / len(NEW_ACH_PLATFORMS),
        'results': verification_results
    }

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 新ACH平台验证完成!")
    print(f"📊 总验证: {len(NEW_ACH_PLATFORMS)} 个")
    print(f"✅ 成功: {successful_count} 个")
    print(f"📈 成功率: {successful_count/len(NEW_ACH_PLATFORMS)*100:.1f}%")

    # 显示成功平台
    successful_platforms = [r for r in verification_results if r.get('verification_success', False)]
    if successful_platforms:
        print(f"\n🎯 新验证通过的 {len(successful_platforms)} 个ACH平台:")
        for i, platform in enumerate(successful_platforms, 1):
            print(f"  {i:2d}. {platform['platform_name']:<30} - 得分: {platform.get('success_rate', 0):.1%}")

    return report

if __name__ == "__main__":
    verify_new_ach_platforms()