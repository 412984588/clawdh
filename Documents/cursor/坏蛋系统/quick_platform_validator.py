#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速平台验证工具
验证已发现的新平台是否符合4点核心标准
"""

import json
import time
from datetime import datetime
from typing import Dict, List

class QuickPlatformValidator:
    """快速平台验证器"""

    def __init__(self):
        self.results = []
        self.validated_platforms = set()

    def validate_platform(self, platform_info: Dict) -> Dict:
        """验证单个平台"""
        domain = platform_info.get('domain', '')
        name = platform_info.get('name', domain)

        # 4点核心验证标准
        scores = {
            'personal_registration': 0,  # 个人注册能力
            'payment_reception': 0,     # 支付接收能力
            'own_payment_system': 0,   # 自有支付系统
            'us_market_ach': 0        # 美国市场=ACH银行转账
        }

        # 基于平台信息进行快速评估
        description = platform_info.get('description', '').lower()
        category = platform_info.get('category', '').lower()

        # 1. 个人注册能力 (25%)
        if any(keyword in description for keyword in
                   ['personal', 'individual', 'freelance', 'creator', 'solo', '独立', '个人', '自由']):
            scores['personal_registration'] = 25
        elif category in ['creator', 'freelance', 'marketplace']:
            scores['personal_registration'] = 25

        # 2. 支付接收能力 (25%)
        if any(keyword in description for keyword in
                   ['payment', 'receive', 'collect', 'donate', 'tip', '打赏', '收款', '捐赠', '支付']):
            scores['payment_reception'] = 25
        elif category in ['payment', 'fintech', 'creator', 'marketplace']:
            scores['payment_reception'] = 25

        # 3. 自有支付系统 (25%)
        if any(keyword in description for keyword in
                   ['payment system', 'payment processing', 'checkout', 'gateway', '支付系统', '支付处理']):
            scores['own_payment_system'] = 25
        elif category in ['payment', 'fintech']:
            scores['own_payment_system'] = 25

        # 4. 美国市场=ACH银行转账 (25%)
        if any(keyword in description for keyword in
                   ['usa', 'america', 'us market', 'ach', 'bank transfer', '美国', '银行转账']):
            scores['us_market_ach'] = 25
        elif category in ['payment', 'fintech'] and domain.endswith('.com'):
            scores['us_market_ach'] = 25  # 大多数美国支付.com域名

        # 计算总分
        total_score = sum(scores.values())
        is_valid = total_score >= 75  # 至少75%才算通过

        return {
            'name': name,
            'domain': domain,
            'category': category,
            'description': description,
            'scores': scores,
            'total_score': total_score,
            'is_valid': is_valid,
            'validation_status': '✅ 通过' if is_valid else '❌ 不通过',
            'timestamp': datetime.now().isoformat()
        }

    def validate_platforms(self, platforms: List[Dict]) -> List[Dict]:
        """批量验证平台"""
        results = []

        print(f"🔍 开始快速验证 {len(platforms)} 个平台...")

        for i, platform in enumerate(platforms, 1):
            print(f"[{i}/{len(platforms)}] 验证: {platform.get('name', platform.get('domain'))}")

            result = self.validate_platform(platform)
            results.append(result)

            # 避免重复验证
            if platform.get('domain') not in self.validated_platforms:
                self.validated_platforms.add(platform.get('domain'))

        return results

    def generate_report(self, results: List[Dict]) -> Dict:
        """生成验证报告"""
        valid_count = sum(1 for r in results if r['is_valid'])
        total_count = len(results)
        success_rate = (valid_count / total_count * 100) if total_count > 0 else 0

        # 按类别统计
        category_stats = {}
        for result in results:
            category = result.get('category', 'unknown')
            if category not in category_stats:
                category_stats[category] = {'total': 0, 'valid': 0}
            category_stats[category]['total'] += 1
            if result['is_valid']:
                category_stats[category]['valid'] += 1

        return {
            'metadata': {
                'version': 'Quick-Validator-v1.0',
                'timestamp': datetime.now().isoformat(),
                'total_platforms': total_count,
                'valid_platforms': valid_count,
                'success_rate': f"{success_rate:.1f}%"
            },
            'summary': {
                'total_validated': total_count,
                'total_passed': valid_count,
                'success_rate': f"{success_rate:.1f}%",
                'category_breakdown': category_stats
            },
            'validated_platforms': results
        }

    def save_results(self, results: List[Dict], filename: str = None):
        """保存结果"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"quick_validation_results_{timestamp}.json"

        report = self.generate_report(results)

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"📄 结果已保存到: {filename}")
        return filename

def main():
    """主函数"""
    # 模拟一些新发现的平台进行验证
    newly_discovered_platforms = [
        {
            'name': 'GoFundMe',
            'domain': 'gofundme.com',
            'category': 'crowdfunding',
            'description': 'Personal crowdfunding platform for individuals and causes'
        },
        {
            'name': 'Indiegogo',
            'domain': 'indiegogo.com',
            'category': 'crowdfunding',
            'description': 'Crowdfunding platform for creative projects and entrepreneurs'
        },
        {
            'name': 'Patreon',
            'domain': 'patreon.com',
            'category': 'creator',
            'description': 'Membership platform for creators to receive monthly payments'
        },
        {
            'name': 'Buy Me a Coffee',
            'domain': 'buymeacoffee.com',
            'category': 'creator',
            'description': 'Simple platform for fans to support creators with small donations'
        },
        {
            'name': 'Stripe Connect',
            'domain': 'connect.stripe.com',
            'category': 'payment',
            'description': 'Stripe embedded payment solution for platforms and marketplaces'
        },
        {
            'name': 'Square',
            'domain': 'squareup.com',
            'category': 'payment',
            'description': 'Payment processing and business management for small businesses'
        },
        {
            'name': 'PayPal Business',
            'domain': 'paypal.com/business',
            'category': 'payment',
            'description': 'Business payment solutions with fraud protection'
        },
        {
            'name': 'Venmo Business',
            'domain': 'venmo.com',
            'category': 'payment',
            'description': 'Social payment app with business account features'
        },
        {
            'name': 'Cash App',
            'domain': 'cash.app',
            'category': 'payment',
            'description': 'Mobile payment app for peer-to-peer and business transactions'
        }
    ]

    validator = QuickPlatformValidator()

    print("🚀 启动快速平台验证系统")
    print("=" * 50)

    # 验证平台
    results = validator.validate_platforms(newly_discovered_platforms)

    # 生成报告
    report = validator.generate_report(results)

    # 显示摘要
    print("\n📊 验证完成摘要:")
    print(f"总验证平台: {report['summary']['total_validated']}")
    print(f"通过验证: {report['summary']['total_passed']}")
    print(f"成功率: {report['summary']['success_rate']}")

    print("\n✅ 通过验证的平台:")
    for result in results:
        if result['is_valid']:
            score_info = " | ".join([f"{k}: {v}%" for k, v in result['scores'].items()])
            print(f"  • {result['name']} ({result['domain']}) - {score_info}")

    print("\n❌ 未通过验证的平台:")
    for result in results:
        if not result['is_valid']:
            score_info = " | ".join([f"{k}: {v}%" for k, v in result['scores'].items()])
            print(f"  • {result['name']} ({result['domain']}) - {score_info}")

    # 保存结果
    filename = validator.save_results(results)

    print(f"\n✅ 验证完成！结果已保存到 {filename}")
    return report

if __name__ == "__main__":
    main()