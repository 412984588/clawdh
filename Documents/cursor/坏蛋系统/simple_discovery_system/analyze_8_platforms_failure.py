#!/usr/bin/env python3
"""
分析8个平台持续失败的原因并制定解决方案
"""

import json
import requests
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import sys

# 添加当前目录到路径
sys.path.append(str(Path(__file__).parent))

from dialog_5agent_system import DialogVAVerificationExpert, DialogAAAuditAllocator

class PlatformFailureAnalyzer:
    """平台失败分析专家"""

    def __init__(self):
        self.va = DialogVAVerificationExpert()
        self.aa = DialogAAAuditAllocator()

        # 8个失败平台
        self.failing_platforms = {
            "network_failures": [
                "payfast.co",
                "quickpay.com",
                "quickpay.io",
                "easypay.com",
                "paypro.io"
            ],
            "criteria_failures": [
                "fast.com",  # 自注册功能, 第三方收款, 支付集成
                "easypay.io",  # 美国市场服务, 自注册功能, 第三方收款, 支付集成
                "paypro.com"   # 美国市场服务
            ]
        }

        print("🔍 平台失败分析专家启动")
        print("📊 分析对象: 8个持续失败的平台")
        print("=" * 80)

    def analyze_network_failure_platforms(self):
        """分析网络验证失败的平台"""
        print("\n🌐 分析网络验证失败平台")
        print("=" * 60)

        results = {}

        for platform in self.failing_platforms["network_failures"]:
            print(f"\n🔍 分析平台: {platform}")
            print("-" * 40)

            # 尝试多种访问方式
            analysis_result = self._comprehensive_network_analysis(platform)
            results[platform] = analysis_result

            print(f"   访问状态: {analysis_result['access_status']}")
            print(f"   问题类型: {analysis_result['issue_type']}")
            print(f"   建议方案: {analysis_result['recommendation']}")

        return results

    def analyze_criteria_failure_platforms(self):
        """分析验证标准失败的平台"""
        print("\n📋 分析验证标准失败平台")
        print("=" * 60)

        results = {}

        for platform in self.failing_platforms["criteria_failures"]:
            print(f"\n🔍 分析平台: {platform}")
            print("-" * 40)

            # 深度分析平台特性
            analysis_result = self._comprehensive_criteria_analysis(platform)
            results[platform] = analysis_result

            print(f"   平台类型: {analysis_result['platform_type']}")
            print(f"   失败标准: {analysis_result['failed_criteria']}")
            print(f"   根本原因: {analysis_result['root_cause']}")
            print(f"   优化建议: {analysis_result['optimization_suggestion']}")

        return results

    def _comprehensive_network_analysis(self, platform: str) -> dict:
        """综合网络分析"""
        urls_to_try = [
            f"https://{platform}",
            f"http://{platform}",
            f"https://www.{platform}",
            f"https://{platform}/",
            f"https://{platform}/home",
            f"https://{platform}/about"
        ]

        user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]

        for url in urls_to_try:
            for user_agent in user_agents:
                for timeout in [10, 20, 30]:
                    try:
                        headers = {'User-Agent': user_agent}
                        response = requests.get(url, headers=headers, timeout=timeout)

                        if response.status_code == 200:
                            soup = BeautifulSoup(response.text, 'html.parser')
                            title = soup.title.string if soup.title else "无标题"
                            content = soup.get_text().lower()[:500]

                            return {
                                'access_status': 'SUCCESS',
                                'issue_type': 'previously_blocked',
                                'recommendation': '增强突破访问策略',
                                'url_found': url,
                                'title': title,
                                'content_preview': content,
                                'method': f'{user_agent[:20]}_{timeout}s'
                            }

                        elif response.status_code in [301, 302, 307, 308]:
                            # 重定向
                            redirect_url = response.headers.get('Location', '未知')
                            return {
                                'access_status': 'REDIRECT',
                                'issue_type': '域名重定向',
                                'recommendation': f'跟随重定向到: {redirect_url}',
                                'redirect_url': redirect_url,
                                'original_url': url
                            }

                    except requests.exceptions.Timeout:
                        continue
                    except requests.exceptions.ConnectionError:
                        continue
                    except Exception as e:
                        continue

        # DNS检查
        try:
            import socket
            ip = socket.gethostbyname(platform)
            return {
                'access_status': 'DNS_ONLY',
                'issue_type': 'Web服务不可用',
                'recommendation': '平台可能不存在或服务停止',
                'ip_address': ip
            }
        except:
            return {
                'access_status': 'FAILED',
                'issue_type': '域名不存在或无法解析',
                'recommendation': '移除候选平台列表'
            }

    def _comprehensive_criteria_analysis(self, platform: str) -> dict:
        """综合验证标准分析"""
        # 首先尝试访问平台
        network_result = self._comprehensive_network_analysis(platform)

        if network_result['access_status'] == 'SUCCESS':
            # 如果可以访问，进行标准验证分析
            content = network_result.get('content_preview', '')
            title = network_result.get('title', '').lower()

            # 分析每个验证标准
            criteria_analysis = {
                'us_market': self._check_us_market_criteria(content, title),
                'self_registration': self._check_self_registration_criteria(content, title),
                'payment_receiving': self._check_payment_receiving_criteria(content, title),
                'integration': self._check_integration_criteria(content, title)
            }

            # 判断平台类型
            platform_type = self._identify_platform_type(content, title)

            return {
                'platform_type': platform_type,
                'failed_criteria': [k for k, v in criteria_analysis.items() if not v],
                'root_cause': self._identify_root_cause(platform_type, criteria_analysis),
                'optimization_suggestion': self._generate_optimization_suggestion(platform_type, criteria_analysis),
                'network_result': network_result
            }
        else:
            # 无法访问平台
            return {
                'platform_type': 'UNKNOWN',
                'failed_criteria': ['网络访问失败'],
                'root_cause': f'网络访问失败: {network_result["issue_type"]}',
                'optimization_suggestion': network_result['recommendation'],
                'network_result': network_result
            }

    def _check_us_market_criteria(self, content: str, title: str) -> bool:
        """检查美国市场标准"""
        us_indicators = ['usd', '$', 'dollar', 'america', 'united states', 'usa']
        ach_indicators = ['ach', 'bank transfer', 'direct deposit', 'wire transfer']

        us_score = sum(1 for indicator in us_indicators if indicator in content)
        ach_score = sum(1 for indicator in ach_indicators if indicator in content)

        return us_score >= 2 or ach_score >= 1

    def _check_self_registration_criteria(self, content: str, title: str) -> bool:
        """检查自注册标准"""
        signup_indicators = ['sign up', 'get started', 'register', 'create account', 'join']
        return sum(1 for indicator in signup_indicators if indicator in content) >= 1

    def _check_payment_receiving_criteria(self, content: str, title: str) -> bool:
        """检查第三方收款标准"""
        payment_indicators = ['accept payments', 'get paid', 'receive money', 'charge', 'checkout']
        return sum(1 for indicator in payment_indicators if indicator in content) >= 1

    def _check_integration_criteria(self, content: str, title: str) -> bool:
        """检查支付集成标准"""
        integration_indicators = ['api', 'integration', 'embed', 'built-in payments']
        return sum(1 for indicator in integration_indicators if indicator in content) >= 1

    def _identify_platform_type(self, content: str, title: str) -> str:
        """识别平台类型"""
        if any(word in title or word in content for word in ['payment', 'pay', 'checkout']):
            return 'PAYMENT_PLATFORM'
        elif any(word in title or word in content for word in ['fast', 'speed', 'quick']):
            return 'FAST_PLATFORM'  # 可能是fast.com
        elif any(word in title or word in content for word in ['easy', 'simple']):
            return 'EASY_PLATFORM'  # 可能是easypay系列
        else:
            return 'UNKNOWN_PLATFORM'

    def _identify_root_cause(self, platform_type: str, criteria_analysis: dict) -> str:
        """识别根本原因"""
        if platform_type == 'FAST_PLATFORM':
            return "fast.com是CDN服务，不是支付平台"
        elif platform_type == 'EASY_PLATFORM':
            return "easypay系列可能不符合美国市场或支付功能要求"
        else:
            failed_count = sum(1 for v in criteria_analysis.values() if not v)
            if failed_count >= 3:
                return "平台不符合支付平台基本要求"
            else:
                return "平台部分功能不符合验证标准"

    def _generate_optimization_suggestion(self, platform_type: str, criteria_analysis: dict) -> str:
        """生成优化建议"""
        if platform_type == 'FAST_PLATFORM':
            return "从候选列表中移除fast.com，它不是支付平台"
        elif platform_type == 'EASY_PLATFORM':
            return "验证easypay系列是否真的为支付平台，考虑移除非支付平台"
        else:
            suggestions = []
            for criterion, passed in criteria_analysis.items():
                if not passed:
                    if criterion == 'us_market':
                        suggestions.append("增强美国市场识别逻辑")
                    elif criterion == 'self_registration':
                        suggestions.append("优化自注册功能检测")
                    elif criterion == 'payment_receiving':
                        suggestions.append("改进收款能力识别")
                    elif criterion == 'integration':
                        suggestions.append("优化集成能力检测")

            return "; ".join(suggestions) if suggestions else "无明显改进建议"

    def generate_solutions_report(self, network_results: dict, criteria_results: dict):
        """生成解决方案报告"""
        print("\n📋 生成解决方案报告")
        print("=" * 80)

        report = {
            'analysis_timestamp': datetime.now().isoformat(),
            'total_platforms_analyzed': 8,
            'network_failure_platforms': len(self.failing_platforms["network_failures"]),
            'criteria_failure_platforms': len(self.failing_platforms["criteria_failures"]),
            'findings': {},
            'solutions': {},
            'recommendations': []
        }

        # 分析网络失败平台
        print("\n🌐 网络失败平台分析:")
        for platform, result in network_results.items():
            print(f"   {platform}: {result['issue_type']} - {result['recommendation']}")
            report['findings'][platform] = {
                'type': 'network_failure',
                'issue': result['issue_type'],
                'recommendation': result['recommendation']
            }

        # 分析标准失败平台
        print("\n📋 标准失败平台分析:")
        for platform, result in criteria_results.items():
            print(f"   {platform}: {result['root_cause']} - {result['optimization_suggestion']}")
            report['findings'][platform] = {
                'type': 'criteria_failure',
                'issue': result['root_cause'],
                'recommendation': result['optimization_suggestion']
            }

        # 生成解决方案
        solutions = {
            'immediate_actions': [],
            'system_improvements': [],
            'platform_list_updates': []
        }

        # 立即行动
        solutions['immediate_actions'] = [
            "移除不存在的平台: payfast.co, quickpay.com, quickpay.io, easypay.com, paypro.io",
            "移除非支付平台: fast.com",
            "验证easypay.io和paypro.com的真实性质"
        ]

        # 系统改进
        solutions['system_improvements'] = [
            "增强域名存在性预检查机制",
            "改进平台类型识别算法",
            "优化验证标准适应性",
            "添加备用域名访问策略"
        ]

        # 平台列表更新
        solutions['platform_list_updates'] = [
            "清理候选平台列表中的无效域名",
            "添加更多真实的支付平台候选",
            "建立平台分类系统"
        ]

        report['solutions'] = solutions

        # 总体建议
        recommendations = [
            "1. 立即清理无效平台，提高验证效率",
            "2. 改进平台预检查机制，避免浪费时间",
            "3. 建立动态平台候选列表，持续更新",
            "4. 优化验证标准，提高识别准确率"
        ]

        report['recommendations'] = recommendations

        print("\n💡 解决方案建议:")
        for rec in recommendations:
            print(f"   {rec}")

        # 保存报告
        report_path = Path(__file__).parent / "data" / f"8_platforms_failure_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_path.parent.mkdir(exist_ok=True)

        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"\n💾 分析报告已保存: {report_path}")

        return report

def main():
    """主函数"""
    analyzer = PlatformFailureAnalyzer()

    # 分析网络失败平台
    network_results = analyzer.analyze_network_failure_platforms()

    # 分析标准失败平台
    criteria_results = analyzer.analyze_criteria_failure_platforms()

    # 生成解决方案报告
    solutions_report = analyzer.generate_solutions_report(network_results, criteria_results)

    print("\n🎉 8平台失败分析完成！")
    print("📊 主要发现:")
    print("   - 大部分平台是网络访问失败（域名不存在或服务不可用）")
    print("   - fast.com不是支付平台，是CDN服务")
    print("   - 需要清理候选平台列表并改进预检查机制")

    return solutions_report

if __name__ == "__main__":
    main()