#!/usr/bin/env python3
"""
🔄 REASSESS PLATFORMS V2.0 - 基于新标准重新评估平台
新标准：个人用户 + 营业商户 + EIN都可接受，重点是收款能力
"""

import json
from datetime import datetime
from pathlib import Path

def reassess_platforms_with_new_criteria():
    """基于新标准重新评估所有验证通过的平台"""

    # 读取之前验证结果
    data_path = Path(__file__).parent / "data"
    with open(data_path / "final_verification_summary.json", 'r', encoding='utf-8') as f:
        final_data = json.load(f)

    platforms = final_data.get('all_successful_platforms', [])
    print(f"🔄 重新评估 {len(platforms)} 个平台 (基于新标准)")
    print("="*60)

    # 新的评估标准
    valid_platforms = []
    invalid_platforms = []

    for platform in platforms:
        name = platform.get('platform_name', platform.get('name', 'Unknown'))
        url = platform.get('platform_url', platform.get('url', ''))

        # 获取验证标准详情
        if 'verification_criteria' in platform:
            vc = platform['verification_criteria']
        elif 'final_verification' in platform and 'verification_criteria' in platform['final_verification']:
            vc = platform['final_verification']['verification_criteria']
        else:
            vc = {}

        # 新标准评估
        issues = []
        is_valid = True

        # 1. 美国市场服务 (保持原标准)
        if not vc.get('us_market', False):
            issues.append("❌美国市场服务")
            is_valid = False

        # 2. 自注册功能 (新标准：个人+商户+EIN都可接受)
        if not vc.get('self_registration', False):
            issues.append("❌自注册功能")
            is_valid = False

        # 3. 第三方收款 (关键：必须是收款而非付款)
        if not vc.get('third_party_payment', False):
            issues.append("❌第三方收款")
            is_valid = False

        # 4. 支付集成方式 (保持原标准)
        if not vc.get('embedded_payment', False):
            issues.append("❌支付集成")
            is_valid = False

        # 特殊检查：基于用户反馈排除明显不符合的平台
        problem_platforms = [
            "OpenACH",  # 开源项目
            "CrossRiver",  # 纯企业API服务
            "TabaPay",  # B2B金融科技
            "Ramp",  # 企业支出管理
            "Aeropay",  # 付款导向
            "Bilt Rewards"  # 房租付款(付款导向)
        ]

        if name in problem_platforms:
            is_valid = False
            issues.append("❌用户质疑平台")

        # 分类存储
        assessment = {
            'platform_name': name,
            'url': url,
            'original_criteria': vc,
            'issues': issues,
            'is_valid_v2': is_valid,
            'score': len([c for c in vc.values() if c]) * 25  # 原始分数
        }

        if is_valid:
            valid_platforms.append(assessment)
        else:
            invalid_platforms.append(assessment)

    # 输出结果
    print(f"\n🎯 新标准评估结果:")
    print(f"✅ 有效平台: {len(valid_platforms)} 个")
    print(f"❌ 无效平台: {len(invalid_platforms)} 个")
    print(f"📊 有效率: {len(valid_platforms)/len(platforms)*100:.1f}%")

    print(f"\n🏆 新标准验证通过的 {len(valid_platforms)} 个平台:")
    print("-" * 80)
    for i, platform in enumerate(valid_platforms, 1):
        name = platform['platform_name']
        score = platform['score']
        url = platform['url']
        print(f"  {i:2d}. {name:<30} - {score:3d}分 - {url}")

    print(f"\n❌ 被排除的 {len(invalid_platforms)} 个平台:")
    print("-" * 80)
    for i, platform in enumerate(invalid_platforms, 1):
        name = platform['platform_name']
        issues = ', '.join(platform['issues'])
        print(f"  {i:2d}. {name:<30} - {issues}")

    # 保存新评估结果
    reassessment_report = {
        'reassessment_time': datetime.now().isoformat(),
        'total_platforms': len(platforms),
        'valid_platforms_count': len(valid_platforms),
        'invalid_platforms_count': len(invalid_platforms),
        'valid_rate': len(valid_platforms)/len(platforms),
        'new_criteria': {
            'self_registration': '个人用户+营业商户+EIN都可接受',
            'payment_direction': '必须是收款(非付款)',
            'us_market': '保持原标准',
            'integration': '保持原标准',
            'exclusions': '排除开源项目、纯企业API服务'
        },
        'valid_platforms': valid_platforms,
        'invalid_platforms': invalid_platforms
    }

    with open(data_path / "reassessment_v2_results.json", 'w', encoding='utf-8') as f:
        json.dump(reassessment_report, f, ensure_ascii=False, indent=2)

    print(f"\n💾 新标准评估结果已保存: {data_path / 'reassessment_v2_results.json'}")

    return reassessment_report

def extract_platform_urls():
    """提取有效平台的URL列表"""
    data_path = Path(__file__).parent / "data"

    with open(data_path / "reassessment_v2_results.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    valid_platforms = data['valid_platforms']

    print(f"\n🔗 新标准验证通过的 {len(valid_platforms)} 个平台URL:")
    print("="*60)

    for i, platform in enumerate(valid_platforms, 1):
        name = platform['platform_name']
        url = platform['url']
        score = platform['score']
        print(f"{i:2d}. {name}")
        print(f"    URL: {url}")
        print(f"    分数: {score}/100")
        print()

    return valid_platforms

if __name__ == "__main__":
    # 重新评估平台
    report = reassess_platforms_with_new_criteria()

    # 提取URL列表
    valid_platforms = extract_platform_urls()

    print(f"\n🎯 总结:")
    print(f"   基于新标准，实际符合要求的平台: {len(valid_platforms)} 个")
    print(f"   新标准包括: 个人用户、营业商户、EIN都可接受")
    print(f"   重点: 必须是收款能力(非付款能力)")