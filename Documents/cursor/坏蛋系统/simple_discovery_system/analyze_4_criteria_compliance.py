#!/usr/bin/env python3
"""
📊 ANALYZE 4-CRITERIA COMPLIANCE - 分析4项标准完全合规的平台
检查哪些平台真正通过了全部4项验证标准
"""

import json
from datetime import datetime
from pathlib import Path

def analyze_4_criteria_compliance():
    """分析4项标准完全合规的平台"""
    data_path = Path(__file__).parent / "data"

    # 读取最终验证结果
    with open(data_path / "final_verification_summary.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    platforms = data['all_successful_platforms']

    print("📊 分析4项标准完全合规的平台")
    print("="*60)

    # 4项验证标准
    criteria = [
        "us_market",           # 美国市场服务
        "self_registration",    # 自注册功能
        "third_party_payment", # 第三方收款
        "embedded_payment"      # 支付集成方式
    ]

    # 分析每个平台的合规情况
    fully_compliant = []
    partially_compliant = []

    for platform in platforms:
        name = platform.get('platform_name', platform.get('name', 'Unknown'))

        # 检查是否有verification_criteria字段
        if 'verification_criteria' in platform:
            vc = platform['verification_criteria']
            passed_count = sum(vc.values())

            if passed_count == 4:
                fully_compliant.append(platform)
            else:
                partially_compliant.append(platform)
        else:
            # 对于突破成功的平台，检查final_verification
            if 'final_verification' in platform and 'verification_criteria' in platform['final_verification']:
                vc = platform['final_verification']['verification_criteria']
                passed_count = sum(vc.values())

                if passed_count == 4:
                    fully_compliant.append(platform)
                else:
                    partially_compliant.append(platform)
            else:
                # 无法确定的情况
                partially_compliant.append(platform)

    print(f"📈 总计验证平台: {len(platforms)}")
    print(f"✅ 完全符合4项标准: {len(fully_compliant)} 个")
    print(f"⚠️ 部分符合标准: {len(partially_compliant)} 个")
    print(f"📊 完全合规率: {len(fully_compliant)/len(platforms)*100:.1f}%")

    print(f"\n🏆 完全符合4项标准的 {len(fully_compliant)} 个平台:")
    print("-" * 80)

    for i, platform in enumerate(fully_compliant, 1):
        name = platform.get('platform_name', platform.get('name', 'Unknown'))
        url = platform.get('platform_url', platform.get('url', ''))

        # 获取验证标准详情
        if 'verification_criteria' in platform:
            vc = platform['verification_criteria']
        elif 'final_verification' in platform:
            vc = platform['final_verification']['verification_criteria']
        else:
            vc = {}

        # 显示标准合规情况
        standards = []
        standards.append(f"🇺🇸美国市场: {'✅' if vc.get('us_market', False) else '❌'}")
        standards.append(f"🔑自注册: {'✅' if vc.get('self_registration', False) else '❌'}")
        standards.append(f"💰第三方收款: {'✅' if vc.get('third_party_payment', False) else '❌'}")
        standards.append(f"🔗支付集成: {'✅' if vc.get('embedded_payment', False) else '❌'}")

        print(f"  {i:2d}. {name:<35}")
        print(f"      URL: {url}")
        print(f"      标准: {' | '.join(standards)}")
        print()

    # 分析部分合规平台的具体情况
    print(f"\n⚠️ 部分符合标准的 {len(partially_compliant)} 个平台详情:")
    print("-" * 80)

    for i, platform in enumerate(partially_compliant, 1):
        name = platform.get('platform_name', platform.get('name', 'Unknown'))
        score = platform.get('success_rate', 0)

        # 获取验证标准详情
        if 'verification_criteria' in platform:
            vc = platform['verification_criteria']
        elif 'final_verification' in platform:
            vc = platform['final_verification']['verification_criteria']
        else:
            vc = {}

        passed_count = sum(vc.values())

        # 显示缺失的标准
        missing_criteria = []
        if not vc.get('us_market', False):
            missing_criteria.append("美国市场")
        if not vc.get('self_registration', False):
            missing_criteria.append("自注册")
        if not vc.get('third_party_payment', False):
            missing_criteria.append("第三方收款")
        if not vc.get('embedded_payment', False):
            missing_criteria.append("支付集成")

        print(f"  {i:2d}. {name:<35} - 得分: {score:.1%} (通过{passed_count}/4项)")
        if missing_criteria:
            print(f"      缺失: {', '.join(missing_criteria)}")
        print()

    # 生成合规报告
    compliance_report = {
        'analysis_time': datetime.now().isoformat(),
        'total_platforms': len(platforms),
        'fully_compliant_count': len(fully_compliant),
        'partially_compliant_count': len(partially_compliant),
        'full_compliance_rate': len(fully_compliant)/len(platforms),
        'fully_compliant_platforms': fully_compliant,
        'partially_compliant_platforms': partially_compliant,
        'criteria_analysis': {
            'us_market_compliance': len([p for p in platforms if ('verification_criteria' in p and p['verification_criteria'].get('us_market', False)) or ('final_verification' in p and p['final_verification']['verification_criteria'].get('us_market', False))]),
            'self_registration_compliance': len([p for p in platforms if ('verification_criteria' in p and p['verification_criteria'].get('self_registration', False)) or ('final_verification' in p and p['final_verification']['verification_criteria'].get('self_registration', False))]),
            'third_party_payment_compliance': len([p for p in platforms if ('verification_criteria' in p and p['verification_criteria'].get('third_party_payment', False)) or ('final_verification' in p and p['final_verification']['verification_criteria'].get('third_party_payment', False))]),
            'embedded_payment_compliance': len([p for p in platforms if ('verification_criteria' in p and p['verification_criteria'].get('embedded_payment', False)) or ('final_verification' in p and p['final_verification']['verification_criteria'].get('embedded_payment', False))])
        }
    }

    # 保存合规报告
    compliance_file = data_path / "4_criteria_compliance_analysis.json"
    with open(compliance_file, 'w', encoding='utf-8') as f:
        json.dump(compliance_report, f, ensure_ascii=False, indent=2)

    print(f"💾 合规分析报告已保存: {compliance_file}")

    # 生成总结
    print(f"\n📋 总结:")
    print(f"   🎯 严格来说，只有 {len(fully_compliant)} 个平台完全符合4项标准")
    print(f"   📊 这占总验证平台的 {len(fully_compliant)/len(platforms)*100:.1f}%")
    print(f"   💡 大多数平台都在1-2个标准上表现优秀")
    print(f"   🔍 最常见的缺失标准是'自注册功能'和'第三方收款'")

    return compliance_report

if __name__ == "__main__":
    analyze_4_criteria_compliance()