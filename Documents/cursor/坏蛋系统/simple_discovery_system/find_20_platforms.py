#!/usr/bin/env python3
"""
🎯 FIND 20 PLATFORMS - 专门寻找并验证20个新支付平台
使用绝对真实的方法，无任何模拟

目标：
1. 真实搜索20个候选平台
2. 逐一验证每个平台
3. 生成详细验证报告
"""

import json
import time
from datetime import datetime
from pathlib import Path
from no_simulation_system import NoSimulationSystem

class Find20Platforms:
    def __init__(self):
        self.system = NoSimulationSystem()
        self.results_file = Path(__file__).parent / "data" / "20_platforms_results.json"
        self.log_file = Path(__file__).parent / "data" / "20_platforms.log"

    def log_message(self, message):
        """记录日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)

        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry + '\n')
        except Exception as e:
            print(f"❌ 写入日志失败: {e}")

    def preselected_platforms(self):
        """预选20个可能符合条件的支付平台"""
        platforms = [
            {"name": "Square", "url": "https://squareup.com"},
            {"name": "Payoneer", "url": "https://www.payoneer.com"},
            {"name": "Wise (formerly TransferWise)", "url": "https://wise.com"},
            {"name": "Paddle", "url": "https://www.paddle.com"},
            {"name": "FastSpring", "url": "https://www.fastspring.com"},
            {"name": "Gumroad", "url": "https://gumroad.com"},
            {"name": "Patreon", "url": "https://www.patreon.com"},
            {"name": "Ko-fi", "url": "https://ko-fi.com"},
            {"name": "Buy Me a Coffee", "url": "https://www.buymeacoffee.com"},
            {"name": "Stripe Connect", "url": "https://stripe.com/connect"},
            {"name": "PayPal for Business", "url": "https://www.paypal.com/business"},
            {"name": "Braintree", "url": "https://www.braintreepayments.com"},
            {"name": "Adyen", "url": "https://www.adyen.com"},
            {"name": "Chargebee", "url": "https://www.chargebee.com"},
            {"name": "Recurly", "url": "https://recurly.com"},
            {"name": "Zuora", "url": "https://www.zuora.com"},
            {"name": "FreshBooks", "url": "https://www.freshbooks.com"},
            {"name": "Wave", "url": "https://www.waveapps.com"},
            {"name": "QuickBooks Payments", "url": "https://quickbooks.intuit.com/payments"},
            {"name": "Helcim", "url": "https://www.helcim.com"}
        ]
        return platforms

    def search_additional_platforms(self):
        """通过搜索发现更多平台"""
        self.log_message("🔍 通过搜索发现更多平台...")

        search_queries = [
            "fintech payment platforms USA",
            "ACH payment solutions for business",
            "payment processors for creators",
            "digital wallet platforms USA",
            "online payment gateways 2025"
        ]

        discovered_platforms = []

        for query in search_queries:
            self.log_message(f"🔍 搜索: {query}")
            results = self.system.real_http_search(query)

            for result in results:
                platform = {
                    "name": result['title'],
                    "url": result['url'],
                    "source": "search",
                    "query": query
                }
                discovered_platforms.append(platform)

            # 避免请求过于频繁
            time.sleep(2)

        self.log_message(f"🎯 搜索发现 {len(discovered_platforms)} 个平台")
        return discovered_platforms

    def verify_platform_detailed(self, platform):
        """详细验证单个平台"""
        self.log_message(f"🔍 详细验证: {platform['name']}")

        # 基础验证
        verification = self.system.real_http_verify(platform['url'], platform['name'])
        verification.update(platform)

        # 添加详细分析
        if verification.get('accessible', False):
            # 检查特定的支付特征
            try:
                response = self.system.session.get(platform['url'], timeout=30)
                page_content = response.text.lower()

                # ACH相关检测
                ach_keywords = ['ach', 'automated clearing house', 'direct deposit', 'bank transfer', 'e-check']
                ach_count = sum(page_content.count(keyword) for keyword in ach_keywords)
                verification['ach_keyword_count'] = ach_count
                verification['has_ach_capability'] = ach_count > 0

                # 费用结构检测
                pricing_keywords = ['pricing', 'fees', 'cost', 'rates', 'percentage']
                pricing_count = sum(page_content.count(keyword) for keyword in pricing_keywords)
                verification['pricing_keyword_count'] = pricing_count
                verification['has_pricing_info'] = pricing_count > 0

                # API文档检测
                api_keywords = ['api', 'documentation', 'developers', 'sdk', 'integration']
                api_count = sum(page_content.count(keyword) for keyword in api_keywords)
                verification['api_keyword_count'] = api_count
                verification['has_api_documentation'] = api_count > 0

                # 计算综合得分
                base_score = verification.get('success_rate', 0)
                ach_bonus = 0.1 if verification.get('has_ach_capability', False) else 0
                pricing_bonus = 0.05 if verification.get('has_pricing_info', False) else 0
                api_bonus = 0.05 if verification.get('has_api_documentation', False) else 0

                verification['comprehensive_score'] = min(base_score + ach_bonus + pricing_bonus + api_bonus, 1.0)

            except Exception as e:
                self.log_message(f"  ⚠️ 详细分析失败: {e}")
                verification['comprehensive_score'] = verification.get('success_rate', 0)

        return verification

    def find_and_verify_20_platforms(self):
        """寻找并验证20个平台"""
        self.log_message("🚀 开始寻找并验证20个支付平台")

        # 步骤1: 使用预选平台
        preselected = self.preselected_platforms()
        self.log_message(f"📋 预选平台: {len(preselected)} 个")

        # 步骤2: 搜索额外平台
        discovered = self.search_additional_platforms()

        # 步骤3: 合并并去重
        all_platforms = preselected + discovered
        seen_urls = set()
        unique_platforms = []

        for platform in all_platforms:
            if platform['url'] not in seen_urls:
                seen_urls.add(platform['url'])
                unique_platforms.append(platform)

        self.log_message(f"🎯 去重后平台总数: {len(unique_platforms)}")

        # 步骤4: 逐一验证
        verification_results = []
        successful_verifications = 0
        failed_verifications = 0

        # 限制为20个平台
        platforms_to_verify = unique_platforms[:20]

        for i, platform in enumerate(platforms_to_verify, 1):
            self.log_message(f"\n{'='*50}")
            self.log_message(f"🔍 验证平台 {i}/20: {platform['name']}")
            self.log_message(f"🌐 URL: {platform['url']}")

            try:
                # 详细验证
                verification = self.verify_platform_detailed(platform)
                verification_results.append(verification)

                if verification.get('verification_success', False):
                    successful_verifications += 1
                    self.log_message(f"✅ 验证成功! 综合得分: {verification.get('comprehensive_score', 0):.2f}")
                else:
                    failed_verifications += 1
                    self.log_message(f"❌ 验证失败: {verification.get('error', 'Unknown error')}")

                # 避免请求过于频繁
                time.sleep(3)

            except Exception as e:
                self.log_message(f"❌ 验证过程出错: {e}")
                failed_verifications += 1

        # 步骤5: 生成报告
        report = {
            'execution_time': datetime.now().isoformat(),
            'total_platforms_tested': len(platforms_to_verify),
            'successful_verifications': successful_verifications,
            'failed_verifications': failed_verifications,
            'success_rate': successful_verifications / len(platforms_to_verify) if platforms_to_verify else 0,
            'verification_results': verification_results,
            'summary': {}
        }

        # 按得分排序
        successful_platforms = [r for r in verification_results if r.get('verification_success', False)]
        successful_platforms.sort(key=lambda x: x.get('comprehensive_score', 0), reverse=True)

        # 生成总结
        report['summary'] = {
            'top_5_platforms': successful_platforms[:5],
            'all_successful_platforms': successful_platforms,
            'failed_platforms': [r for r in verification_results if not r.get('verification_success', False)],
            'average_score': sum(p.get('comprehensive_score', 0) for p in successful_platforms) / len(successful_platforms) if successful_platforms else 0
        }

        # 保存结果
        try:
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            self.log_message(f"💾 结果已保存: {self.results_file}")
        except Exception as e:
            self.log_message(f"❌ 保存结果失败: {e}")

        # 打印总结
        self.log_message(f"\n🎉 20平台验证完成!")
        self.log_message(f"📊 总验证数: {len(platforms_to_verify)}")
        self.log_message(f"✅ 成功验证: {successful_verifications}")
        self.log_message(f"❌ 验证失败: {failed_verifications}")
        self.log_message(f"📈 总成功率: {successful_verifications/len(platforms_to_verify)*100:.1f}%")

        if successful_platforms:
            self.log_message(f"🏆 平均得分: {report['summary']['average_score']:.2f}")
            self.log_message(f"\n🎯 前5名平台:")
            for i, platform in enumerate(successful_platforms[:5], 1):
                name = platform['platform_name']
                score = platform.get('comprehensive_score', 0)
                self.log_message(f"  {i}. {name} - 得分: {score:.2f}")

        return report

def main():
    """主函数"""
    finder = Find20Platforms()
    finder.find_and_verify_20_platforms()

if __name__ == "__main__":
    main()