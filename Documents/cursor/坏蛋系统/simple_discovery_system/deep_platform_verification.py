#!/usr/bin/env python3
"""
🔍 DEEP PLATFORM VERIFICATION - 深度验证用户质疑的平台功能
基于用户反馈，重新仔细检查平台是否真正符合4项标准
"""

import json
import requests
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup

class DeepPlatformVerifier:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })

    def deep_verify_platform(self, url, platform_name):
        """深度验证平台功能"""
        print(f"🔍 深度验证: {platform_name}")
        print(f"🌐 URL: {url}")

        try:
            response = self.session.get(url, timeout=30)
            if response.status_code != 200:
                print(f"❌ 无法访问平台 (HTTP {response.status_code})")
                return None

            soup = BeautifulSoup(response.text, 'html.parser')

            # 提取关键信息
            analysis = {
                'platform_name': platform_name,
                'url': url,
                'verification_time': datetime.now().isoformat(),
                'page_title': self.extract_title(soup),
                'self_registration_analysis': self.analyze_self_registration(soup, platform_name),
                'payment_direction_analysis': self.analyze_payment_direction(soup, platform_name),
                'ach_capability_analysis': self.analyze_ach_capability(soup, platform_name),
                'integration_analysis': self.analyze_integration(soup, platform_name),
                'recommendation': self.make_recommendation(soup, platform_name)
            }

            return analysis

        except Exception as e:
            print(f"❌ 深度验证失败: {e}")
            return None

    def extract_title(self, soup):
        """提取页面标题"""
        title_tag = soup.find('title')
        return title_tag.get_text().strip() if title_tag else "无标题"

    def analyze_self_registration(self, soup, platform_name):
        """分析自注册功能"""
        print(f"  🔍 分析自注册功能...")

        # 查找注册相关链接和元素
        signup_keywords = [
            'sign up', 'signup', 'register', 'create account', 'get started',
            'join', 'apply now', 'start now', 'open account'
        ]

        signup_links = []
        signup_buttons = []

        # 查找链接
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text().lower()

            if any(keyword in href or keyword in text for keyword in signup_keywords):
                signup_links.append({
                    'text': link.get_text().strip(),
                    'href': link['href']
                })

        # 查找按钮
        for button in soup.find_all(['button', 'input'], type=['submit', 'button']):
            if button.get('type') in ['submit', 'button'] or button.name in ['submit', 'button']:
                value = button.get('value') or button.get_text() or ''
                if value and any(keyword in value.lower() for keyword in signup_keywords):
                    signup_buttons.append(value.strip())

        # 检查是否有企业注册或邀请制
        enterprise_keywords = ['enterprise', 'business', 'contact sales', 'request demo', 'invitation only']
        page_text = soup.get_text().lower()
        enterprise_only = any(keyword in page_text for keyword in enterprise_keywords)

        analysis = {
            'has_signup_links': len(signup_links) > 0,
            'signup_count': len(signup_links) + len(signup_buttons),
            'sample_links': signup_links[:3],
            'enterprise_only': enterprise_only,
            'can_self_register': len(signup_links) > 0 and not enterprise_only
        }

        print(f"     注册链接数量: {analysis['signup_count']}")
        print(f"     企业专用: {analysis['enterprise_only']}")
        print(f"     可自注册: {analysis['can_self_register']}")

        return analysis

    def analyze_payment_direction(self, soup, platform_name):
        """分析支付方向（收款还是付款）"""
        print(f"  💰 分析支付方向...")

        page_text = soup.get_text().lower()

        # 收款关键词（平台帮助用户收款）
        receive_keywords = [
            'receive payments', 'get paid', 'accept payments', 'collect payments',
            'charge customers', 'invoice', 'billing', 'get paid faster',
            'monetize', 'earn money', 'revenue'
        ]

        # 付款关键词（平台帮助用户付款）
        send_keywords = [
            'send money', 'pay bills', 'make payments', 'outgoing payments',
            'disburse', 'payout', 'vendor payments', 'contractor payments',
            'employee payments', 'transfer money'
        ]

        receive_count = sum(page_text.count(keyword) for keyword in receive_keywords)
        send_count = sum(page_text.count(keyword) for keyword in send_keywords)

        analysis = {
            'receive_payment_focus': receive_count > send_count,
            'send_payment_focus': send_count > receive_count,
            'receive_keyword_count': receive_count,
            'send_keyword_count': send_count,
            'balance': abs(receive_count - send_count)
        }

        print(f"     收款关键词: {analysis['receive_keyword_count']}")
        print(f"     付款关键词: {analysis['send_keyword_count']}")
        print(f"     主要方向: {'收款' if analysis['receive_payment_focus'] else '付款' if analysis['send_payment_focus'] else '平衡'}")

        return analysis

    def analyze_ach_capability(self, soup, platform_name):
        """分析ACH能力"""
        print(f"  🏦 分析ACH能力...")

        page_text = soup.get_text().lower()

        ach_keywords = [
            'ach', 'automated clearing house', 'direct deposit', 'bank transfer',
            'wire transfer', 'e-check', 'electronic check', 'bank account'
        ]

        ach_count = sum(page_text.count(keyword) for keyword in ach_keywords)

        # 检查是否有具体的ACH功能页面
        ach_pages = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text().lower()
            if 'ach' in href or 'ach' in text:
                ach_pages.append(link['href'])

        analysis = {
            'ach_keyword_count': ach_count,
            'has_ach_pages': len(ach_pages) > 0,
            'ach_pages_count': len(ach_pages),
            'has_ach_capability': ach_count > 5  # 设定一个阈值
        }

        print(f"     ACH关键词: {analysis['ach_keyword_count']}")
        print(f"     ACH页面: {analysis['ach_pages_count']}")
        print(f"     有ACH能力: {analysis['has_ach_capability']}")

        return analysis

    def analyze_integration(self, soup, platform_name):
        """分析集成能力"""
        print(f"  🔗 分析集成能力...")

        page_text = soup.get_text().lower()

        api_keywords = [
            'api', 'application programming interface', 'developers',
            'sdk', 'software development kit', 'documentation',
            'integration', 'embed', 'connect', 'webhook'
        ]

        api_count = sum(page_text.count(keyword) for keyword in api_keywords)

        # 查找API文档链接
        api_docs = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text().lower()
            if any(keyword in href or keyword in text for keyword in ['api', 'developer', 'docs']):
                api_docs.append(link['href'])

        analysis = {
            'api_keyword_count': api_count,
            'has_api_docs': len(api_docs) > 0,
            'api_docs_count': len(api_docs),
            'has_integration_capability': api_count > 3  # 设定一个阈值
        }

        print(f"     API关键词: {analysis['api_keyword_count']}")
        print(f"     API文档: {analysis['api_docs_count']}")
        print(f"     有集成能力: {analysis['has_integration_capability']}")

        return analysis

    def make_recommendation(self, soup, platform_name):
        """给出推荐建议"""
        page_text = soup.get_text().lower()

        # 某些平台明显是B2B或特定用途
        b2b_indicators = ['enterprise', 'business to business', 'b2b', 'wholesale']
        specific_use_cases = ['rent', 'subscription', 'gaming', 'healthcare', 'legal']

        recommendation = "需要进一步验证"

        if any(indicator in page_text for indicator in b2b_indicators):
            recommendation = "可能是B2B平台，需确认是否支持个人用户"
        elif any(use_case in page_text for use_case in specific_use_cases):
            for use_case in specific_use_cases:
                if use_case in page_text:
                    recommendation = f"可能是{use_case}专用平台"
                    break
        elif 'financial institution' in page_text or 'bank' in page_text:
            recommendation = "可能是金融机构，需要资质"

        return recommendation

def verify_questioned_platforms():
    """验证用户质疑的平台"""
    questioned_platforms = [
        {"name": "OpenACH", "url": "https://openach.com"},
        {"name": "CrossRiver", "url": "https://www.crossriver.com"},
        {"name": "TabaPay", "url": "https://www.tabapay.com"},
        {"name": "Ramp", "url": "https://ramp.com"},
        {"name": "Rho", "url": "https://www.rho.co"},
        {"name": "US Bank", "url": "https://www.usbank.com"},
        {"name": "PaymentCloud", "url": "https://paymentcloudinc.com"},
        {"name": "Paysafe", "url": "https://www.paysafe.com"},
        {"name": "BlueHill Payments", "url": "https://bluehillpayments.com"},
        {"name": "Aeropay", "url": "https://www.aeropay.com"},
        {"name": "Bilt Rewards", "url": "https://biltrewards.com"},
        {"name": "National Processing", "url": "https://nationalprocessing.com"}
    ]

    verifier = DeepPlatformVerifier()
    results = []

    print("🔍 深度验证用户质疑的平台")
    print("="*60)

    for platform in questioned_platforms:
        analysis = verifier.deep_verify_platform(platform['url'], platform['name'])
        if analysis:
            results.append(analysis)

            # 计算综合评分
            score = 0
            criteria_met = []

            if analysis['self_registration_analysis']['can_self_register']:
                score += 25
                criteria_met.append("自注册")
            else:
                criteria_met.append("❌自注册")

            if analysis['payment_direction_analysis'].get('receive_payment_focus', False):
                score += 25
                criteria_met.append("收款方向")
            else:
                criteria_met.append("❌付款方向")

            if analysis['ach_capability_analysis']['has_ach_capability']:
                score += 25
                criteria_met.append("ACH能力")
            else:
                criteria_met.append("❌ACH能力")

            if analysis['integration_analysis']['has_integration_capability']:
                score += 25
                criteria_met.append("集成能力")
            else:
                criteria_met.append("❌集成能力")

            analysis['overall_score'] = score
            analysis['criteria_met'] = criteria_met

            print(f"\n📊 {platform['name']} 深度分析结果:")
            print(f"   页面标题: {analysis['page_title']}")
            print(f"   自注册: {analysis['self_registration_analysis']['can_self_register']}")
            print(f"   支付方向: {'收款' if analysis['payment_direction_analysis'].get('receive_payment_focus', False) else '付款' if analysis['payment_direction_analysis'].get('send_payment_focus', False) else '平衡'}")
            print(f"   ACH能力: {analysis['ach_capability_analysis']['has_ach_capability']}")
            print(f"   集成能力: {analysis['integration_analysis']['has_integration_capability']}")
            print(f"   综合评分: {score}/100 ({' | '.join(criteria_met)})")
            print(f"   建议: {analysis['recommendation']}")

    # 保存详细结果
    data_path = Path(__file__).parent / "data"
    data_path.mkdir(exist_ok=True)

    report = {
        'analysis_time': datetime.now().isoformat(),
        'total_platforms_analyzed': len(results),
        'summary': {
            'can_self_register': len([r for r in results if r['self_registration_analysis']['can_self_register']]),
            'receive_payment_focus': len([r for r in results if r['payment_direction_analysis'].get('receive_payment_focus', False)]),
            'has_ach_capability': len([r for r in results if r['ach_capability_analysis']['has_ach_capability']]),
            'has_integration_capability': len([r for r in results if r['integration_analysis']['has_integration_capability']]),
            'high_score_platforms': len([r for r in results if r['overall_score'] >= 75])
        },
        'detailed_results': results
    }

    with open(data_path / "questioned_platforms_deep_analysis.json", 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n💾 详细分析结果已保存: {data_path / 'questioned_platforms_deep_analysis.json'}")

    # 生成总结
    print(f"\n🎯 深度验证总结:")
    print(f"   📊 总分析平台: {len(results)} 个")
    print(f"   🔑 可自注册: {report['summary']['can_self_register']} 个")
    print(f"   💰 收款导向: {report['summary']['receive_payment_focus']} 个")
    print(f"   🏦 ACH能力: {report['summary']['has_ach_capability']} 个")
    print(f"   🔗 集成能力: {report['summary']['has_integration_capability']} 个")
    print(f"   🏆 高分平台(≥75分): {report['summary']['high_score_platforms']} 个")

    return results

if __name__ == "__main__":
    verify_questioned_platforms()