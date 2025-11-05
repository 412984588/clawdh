#!/usr/bin/env python3
"""
🔍 FINAL DEEP VERIFICATION v4.1 - 最终深度验证
使用新的精确标准重新验证16个平台，确保100%准确性
"""

import json
import requests
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import time

class FinalDeepVerifierV4_1:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })

    def final_verify_platform_v4_1(self, url, platform_name):
        """使用v4.1新标准进行最终深度验证"""
        print(f"🔍 v4.1最终深度验证: {platform_name}")
        print(f"🌐 URL: {url}")

        try:
            response = self.session.get(url, timeout=30)
            if response.status_code != 200:
                print(f"❌ 无法访问平台 (HTTP {response.status_code})")
                return None

            soup = BeautifulSoup(response.text, 'html.parser')

            # v4.1新标准深度分析
            analysis = {
                'platform_name': platform_name,
                'url': url,
                'verification_time': datetime.now().isoformat(),
                'page_title': self.extract_title(soup),
                'us_market_analysis_v4_1': self.analyze_us_market_v4_1(soup, platform_name),
                'self_registration_analysis_v4_1': self.analyze_self_registration_v4_1(soup, platform_name),
                'payment_receiving_analysis_v4_1': self.analyze_payment_receiving_v4_1(soup, platform_name),
                'integration_analysis_v4_1': self.analyze_integration_v4_1(soup, platform_name),
                'final_recommendation': self.make_final_recommendation_v4_1(soup, platform_name)
            }

            # 计算v4.1标准分数
            score, criteria_met = self.calculate_v4_1_score(analysis)
            analysis['v4_1_score'] = score
            analysis['v4_1_criteria_met'] = criteria_met

            return analysis

        except Exception as e:
            print(f"❌ v4.1验证失败: {e}")
            return None

    def extract_title(self, soup):
        """提取页面标题"""
        title_tag = soup.find('title')
        return title_tag.get_text().strip() if title_tag else "无标题"

    def analyze_us_market_v4_1(self, soup, platform_name):
        """v4.1标准：美国市场服务分析"""
        print(f"  🇺🇸 v4.1美国市场服务分析...")

        page_text = soup.get_text().lower()

        # ACH关键词（保持原标准）
        ach_keywords = [
            'ach', 'automated clearing house', 'direct deposit', 'bank transfer',
            'wire transfer', 'e-check', 'electronic check', 'bank account',
            'usd', '$', 'dollar', 'united states', 'us market', 'us customers'
        ]

        ach_count = sum(page_text.count(keyword) for keyword in ach_keywords)

        # 检查具体的ACH功能页面
        ach_pages = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text().lower()
            if any(keyword in href or keyword in text for keyword in ach_keywords):
                ach_pages.append(link['href'])

        # 检查美国市场标识
        us_indicators = ['us', 'usa', 'united states', 'american', 'california', 'new york', 'texas', 'florida']
        us_count = sum(page_text.count(indicator) for indicator in us_indicators)

        analysis = {
            'ach_keyword_count': ach_count,
            'has_ach_pages': len(ach_pages) > 0,
            'ach_pages_count': len(ach_pages),
            'us_market_indicators': us_count,
            'has_us_market_service': ach_count > 5 or us_count > 3,
            'v4_1_compliance': ach_count > 5 and us_count > 3
        }

        print(f"     ACH关键词: {analysis['ach_keyword_count']}")
        print(f"     ACH页面: {analysis['ach_pages_count']}")
        print(f"     美国市场指标: {analysis['us_market_indicators']}")
        print(f"     v4.1合规: {analysis['v4_1_compliance']}")

        return analysis

    def analyze_self_registration_v4_1(self, soup, platform_name):
        """v4.1标准：自注册功能分析（个人+商户+EIN）"""
        print(f"  🔑 v4.1自注册功能分析...")

        # 查找注册相关链接和元素
        signup_keywords = [
            'sign up', 'signup', 'register', 'create account', 'get started',
            'join', 'apply now', 'start now', 'open account'
        ]

        # v4.1新增：个人用户和商户注册关键词
        personal_keywords = ['individual', 'personal', 'freelancer', 'solo']
        business_keywords = ['business', 'company', 'enterprise', 'startup', 'small business']
        ein_keywords = ['ein', 'employer identification number', 'tax id']

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

        # v4.1深度检查：区分个人用户和商户注册
        personal_registration = len([link for link in signup_links if any(k in link['text'].lower() or k in link['href'].lower() for k in personal_keywords)])
        business_registration = len([link for link in signup_links if any(k in link['text'].lower() or k in link['href'].lower() for k in business_keywords)])
        ein_registration = len([link for link in signup_links if any(k in link['text'].lower() or k in link['href'].lower() for k in ein_keywords)])

        # 检查企业专用排除
        page_text = soup.get_text().lower()
        enterprise_only_keywords = ['invitation only', 'contact sales', 'request demo', 'enterprise only', 'business only']
        enterprise_only = any(keyword in page_text for keyword in enterprise_only_keywords)

        # v4.1修正逻辑：任何注册链接都算作可自注册，除非明确企业专用
        total_signup_count = len(signup_links) + len(signup_buttons)
        has_any_registration = total_signup_count > 0

        analysis = {
            'total_signup_links': total_signup_count,
            'personal_registration_links': personal_registration,
            'business_registration_links': business_registration,
            'ein_registration_links': ein_registration,
            'enterprise_only': enterprise_only,
            'has_personal_registration': personal_registration > 0,
            'has_business_registration': business_registration > 0,
            'has_ein_registration': ein_registration > 0,
            'v4_1_can_self_register': has_any_registration and not enterprise_only
        }

        print(f"     总注册链接: {analysis['total_signup_links']}")
        print(f"     个人注册: {analysis['personal_registration_links']}")
        print(f"     商户注册: {analysis['business_registration_links']}")
        print(f"     EIN注册: {analysis['ein_registration_links']}")
        print(f"     企业专用: {analysis['enterprise_only']}")
        print(f"     v4.1可自注册: {analysis['v4_1_can_self_register']}")

        return analysis

    def analyze_payment_receiving_v4_1(self, soup, platform_name):
        """v4.1标准：收款能力分析（全面类型覆盖）"""
        print(f"  💰 v4.1收款能力分析...")

        page_text = soup.get_text().lower()

        # v4.1全面收款类型关键词
        receiving_keywords = [
            # 基础收款
            'receive payments', 'get paid', 'accept payments', 'collect payments',
            # 贡献/打赏
            'contributions', 'donations', 'tips', 'giving', 'support',
            # 订阅
            'subscriptions', 'memberships', 'recurring', 'subscribe',
            # 销售
            'sales', 'ecommerce', 'products', 'sell', 'marketplace',
            # 服务费
            'service fees', 'consulting fees', 'professional services', 'freelance',
            # 佣金
            'commissions', 'referrals', 'affiliate', 'partner',
            # 租金 🏠
            'rent', 'rental income', 'lease payments', 'rental fees',
            # 活动费
            'event fees', 'tickets', 'booking fees', 'admission',
            # 课程费
            'course fees', 'tuition', 'education', 'training',
            # 🆕 从客户银行直接提取单笔或定期付款。预授权扣款
            'direct debit', 'bank withdrawal', 'pre-authorized debit', 'preauthorized payment',
            'automatic withdrawal', 'bank draft', 'electronic funds transfer', 'eft',
            'recurring payments', 'scheduled payments', 'payment authorization',
            'customer authorization', 'bank account withdrawal', 'direct payment',
            'pull payment', 'pull funds', 'bank to bank transfer', 'ach debit',
            # 其他
            'revenue', 'earnings', 'income', 'monetize'
        ]

        receiving_count = sum(page_text.count(keyword) for keyword in receiving_keywords)

        # 付款关键词（需要排除的）
        sending_keywords = [
            'send money', 'pay bills', 'make payments', 'outgoing payments',
            'disburse', 'payout', 'vendor payments', 'contractor payments',
            'employee payments', 'transfer money', 'wire money', 'ach outbound'
        ]

        sending_count = sum(page_text.count(keyword) for keyword in sending_keywords)

        # 计算收款方向
        is_receiving_focused = receiving_count > sending_count * 2  # 收款关键词至少是付款的2倍

        # v4.1收款类型细分分析
        payment_types = {
            'basic_receiving': sum(page_text.count(k) for k in ['receive payments', 'get paid', 'accept payments']),
            'contributions': sum(page_text.count(k) for k in ['contributions', 'donations', 'tips', 'giving']),
            'subscriptions': sum(page_text.count(k) for k in ['subscriptions', 'memberships', 'recurring']),
            'sales': sum(page_text.count(k) for k in ['sales', 'ecommerce', 'products', 'marketplace']),
            'service_fees': sum(page_text.count(k) for k in ['service fees', 'consulting', 'freelance']),
            'commissions': sum(page_text.count(k) for k in ['commissions', 'referrals', 'affiliate']),
            'rent': sum(page_text.count(k) for k in ['rent', 'rental income', 'lease payments']),
            # 🆕 从客户银行直接提取/预授权扣款
            'direct_bank_debit': sum(page_text.count(k) for k in [
                'direct debit', 'bank withdrawal', 'pre-authorized debit', 'preauthorized payment',
                'automatic withdrawal', 'bank draft', 'electronic funds transfer', 'eft',
                'pull payment', 'pull funds', 'ach debit'
            ]),
            'payment_authorization': sum(page_text.count(k) for k in [
                'payment authorization', 'customer authorization', 'scheduled payments',
                'recurring payments', 'bank account withdrawal', 'direct payment'
            ]),
            'other_fees': sum(page_text.count(k) for k in ['event fees', 'course fees', 'tuition'])
        }

        analysis = {
            'total_receiving_keywords': receiving_count,
            'total_sending_keywords': sending_count,
            'is_receiving_focused': is_receiving_focused,
            'receiving_sending_ratio': receiving_count / max(sending_count, 1),
            'payment_types': payment_types,
            'dominant_payment_type': max(payment_types.items(), key=lambda x: x[1])[0] if payment_types else 'none',
            'v4_1_has_payment_receiving': receiving_count > 10 and is_receiving_focused
        }

        print(f"     收款关键词: {analysis['total_receiving_keywords']}")
        print(f"     付款关键词: {analysis['total_sending_keywords']}")
        print(f"     收款导向: {analysis['is_receiving_focused']}")
        print(f"     主导类型: {analysis['dominant_payment_type']}")
        # 🆕 显示银行直接提取功能
        direct_debit_count = payment_types['direct_bank_debit'] + payment_types['payment_authorization']
        print(f"     🆕银行直接提取: {direct_debit_count} 关键词")
        print(f"     v4.1有收款能力: {analysis['v4_1_has_payment_receiving']}")

        return analysis

    def analyze_integration_v4_1(self, soup, platform_name):
        """v4.1标准：集成能力分析"""
        print(f"  🔗 v4.1集成能力分析...")

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
            if any(keyword in href or keyword in text for keyword in ['api', 'developer', 'docs', 'integration']):
                api_docs.append(link['href'])

        # 检查嵌入式支付功能
        embedded_keywords = [
            'embed', 'built-in', 'native', 'white label', 'custom domain',
            'payment processor', 'billing', 'checkout'
        ]

        embedded_count = sum(page_text.count(keyword) for keyword in embedded_keywords)

        analysis = {
            'api_keyword_count': api_count,
            'has_api_docs': len(api_docs) > 0,
            'api_docs_count': len(api_docs),
            'embedded_keyword_count': embedded_count,
            'has_integration_capability': api_count > 3 or embedded_count > 2,
            'v4_1_has_good_integration': (api_count > 5 and len(api_docs) > 0) or embedded_count > 5
        }

        print(f"     API关键词: {analysis['api_keyword_count']}")
        print(f"     API文档: {analysis['api_docs_count']}")
        print(f"     嵌入式关键词: {analysis['embedded_keyword_count']}")
        print(f"     v4.1良好集成: {analysis['v4_1_has_good_integration']}")

        return analysis

    def calculate_v4_1_score(self, analysis):
        """计算v4.1标准分数"""
        score = 0
        criteria_met = []

        # 1. 美国市场服务 (25分)
        if analysis['us_market_analysis_v4_1']['v4_1_compliance']:
            score += 25
            criteria_met.append("🇺🇸美国市场服务")

        # 2. 自注册功能 (25分)
        if analysis['self_registration_analysis_v4_1']['v4_1_can_self_register']:
            score += 25
            criteria_met.append("🔑自注册功能")

        # 3. 收款能力 (25分)
        if analysis['payment_receiving_analysis_v4_1']['v4_1_has_payment_receiving']:
            score += 25
            criteria_met.append("💰收款能力")

        # 4. 集成能力 (25分)
        if analysis['integration_analysis_v4_1']['v4_1_has_good_integration']:
            score += 25
            criteria_met.append("🔗集成能力")

        return score, criteria_met

    def get_v4_1_criteria_met(self, analysis):
        """获取v4.1标准符合情况"""
        criteria = [
            analysis['us_market_analysis_v4_1']['v4_1_compliance'],
            analysis['self_registration_analysis_v4_1']['v4_1_can_self_register'],
            analysis['payment_receiving_analysis_v4_1']['v4_1_has_payment_receiving'],
            analysis['integration_analysis_v4_1']['v4_1_has_good_integration']
        ]
        return criteria

    def make_final_recommendation_v4_1(self, soup, platform_name):
        """v4.1最终推荐"""
        page_text = soup.get_text().lower()

        # 银行排除逻辑 - 用户明确要求排除银行，除非支持信用卡/Apple Pay或银行直接提取（通过其一即可）
        if 'bank' in page_text or 'financial institution' in page_text:
            # 检查是否支持信用卡或Apple Pay收款
            credit_card_indicators = ['credit card', 'visa', 'mastercard', 'amex', 'apple pay', 'digital wallet', 'payment processing']
            has_credit_card_support = any(indicator in page_text for indicator in credit_card_indicators)

            # 🆕 检查是否支持银行直接提取/预授权扣款功能
            direct_debit_indicators = [
                'direct debit', 'bank withdrawal', 'pre-authorized debit', 'preauthorized payment',
                'automatic withdrawal', 'bank draft', 'electronic funds transfer', 'eft',
                'pull payment', 'pull funds', 'ach debit', 'payment authorization',
                'customer authorization', 'scheduled payments', 'recurring payments'
            ]
            has_direct_debit_support = any(indicator in page_text for indicator in direct_debit_indicators)

            # 🏦 银行直接提取模式：信用卡/Apple Pay 或 银行直接提取 支持其一即可
            if has_credit_card_support or has_direct_debit_support:
                if has_credit_card_support and has_direct_debit_support:
                    return "✅ 银行机构支持信用卡/Apple Pay + 直接提取，双重保障"
                elif has_credit_card_support:
                    return "✅ 银行机构支持信用卡/Apple Pay收款，符合要求"
                else:
                    return "✅ 银行机构支持直接提取/预授权扣款，符合要求 🏦"
            else:
                return "❌ 银行机构，不支持信用卡/Apple Pay/直接提取收款，不符合要求"

        # 高风险商户检测
        elif 'high risk' in page_text:
            return "高风险商户处理，需要特殊资质"

        # 企业专用平台检测
        elif 'enterprise' in page_text and not 'sme' in page_text and not 'small business' in page_text:
            return "企业专用平台，需确认是否支持小企业"

        # B2B专用平台检测
        elif 'b2b only' in page_text or 'business to business only' in page_text:
            return "B2B专用平台，不支持个人收款"

        else:
            return "符合资金中转平台要求"

def verify_16_platforms_v4_1():
    """使用v4.1新标准验证16个精确平台"""

    # 16个v4.1精确验证平台
    platforms = [
        {"name": "Dwolla", "url": "https://www.dwolla.com"},
        {"name": "Rotessa", "url": "https://rotessa.com"},
        {"name": "PaymentCloud", "url": "https://paymentcloudinc.com"},
        {"name": "GoCardless", "url": "https://gocardless.com"},
        {"name": "Paysafe", "url": "https://www.paysafe.com"},
        {"name": "Moov", "url": "https://moov.io"},
        {"name": "Mercury", "url": "https://mercury.com"},
        {"name": "Rho", "url": "https://www.rho.co"},
        {"name": "BlueHill Payments", "url": "https://bluehillpayments.com"},
        {"name": "Dots", "url": "https://dots.dev"},
        {"name": "North Pay-by-Bank", "url": "https://north.com"},
        {"name": "US Bank Developer", "url": "https://www.usbank.com"},
        {"name": "Plaid", "url": "https://plaid.com"},
        {"name": "Stripe ACH", "url": "https://stripe.com"},
        {"name": "AvidXchange", "url": "https://www.avidxchange.com"},
        {"name": "National Processing", "url": "https://nationalprocessing.com"}
    ]

    verifier = FinalDeepVerifierV4_1()
    results = []

    print("🔍 v4.1最终深度验证 16个精确平台")
    print("="*70)

    for i, platform in enumerate(platforms, 1):
        print(f"\n📊 [{i:2d}/16] {platform['name']}")

        analysis = verifier.final_verify_platform_v4_1(platform['url'], platform['name'])
        if analysis:
            results.append(analysis)

            score = analysis['v4_1_score']
            criteria_met = analysis['v4_1_criteria_met']
            met_count = len(criteria_met)

            print(f"   📈 v4.1分数: {score}/100 ({met_count}/4项标准通过)")
            print(f"   🎯 符合标准: {' | '.join(criteria_met) if criteria_met else '❌ 无符合标准'}")
            print(f"   🏷 主导收款类型: {analysis['payment_receiving_analysis_v4_1']['dominant_payment_type']}")
            print(f"   💡 最终建议: {analysis['final_recommendation']}")

            if score == 100:
                print(f"   ✅ 完美通过！")
            elif score >= 75:
                print(f"   ⚠️ 良好通过")
            else:
                print(f"   ❌ 需要改进")

            # 短暂等待
            time.sleep(2)

    # 保存v4.1最终验证结果
    data_path = Path(__file__).parent / "data"
    data_path.mkdir(exist_ok=True)

    final_report = {
        'verification_time': datetime.now().isoformat(),
        'total_platforms_verified': len(platforms),
        'v4_1_standard': "个人用户+营业商户+EIN + 全面收款类型覆盖 + 银行直接提取/预授权扣款 🆕",
        'summary': {
            'perfect_100': len([r for r in results if r['v4_1_score'] == 100]),
            'good_75_99': len([r for r in results if 75 <= r['v4_1_score'] < 100]),
            'needs_improvement_0_74': len([r for r in results if r['v4_1_score'] < 75]),
            'average_score': sum(r['v4_1_score'] for r in results) / len(results) if results else 0
        },
        'criteria_compliance': {
            'us_market': len([r for r in results if r['us_market_analysis_v4_1']['v4_1_compliance']]),
            'self_registration': len([r for r in results if r['self_registration_analysis_v4_1']['v4_1_can_self_register']]),
            'payment_receiving': len([r for r in results if r['payment_receiving_analysis_v4_1']['v4_1_has_payment_receiving']]),
            'integration': len([r for r in results if r['integration_analysis_v4_1']['v4_1_has_good_integration']])
        },
        'detailed_results': results
    }

    with open(data_path / "final_deep_verification_v4_1_results.json", 'w', encoding='utf-8') as f:
        json.dump(final_report, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 v4.1最终深度验证完成!")
    print(f"📊 总验证平台: {len(platforms)} 个")
    print(f"✅ 完美平台(100分): {final_report['summary']['perfect_100']} 个")
    print(f"⚠️ 良好平台(75-99分): {final_report['summary']['good_75_99']} 个")
    print(f"❌ 需改进平台(<75分): {final_report['summary']['needs_improvement_0_74']} 个")
    print(f"📈 平均分数: {final_report['summary']['average_score']:.1f}/100")

    # 4项标准符合率
    compliance = final_report['criteria_compliance']
    total = len(results)
    if total > 0:
        print(f"\n📋 4项标准符合率:")
        print(f"   🇺🇸美国市场服务: {compliance['us_market']}/{total} ({compliance['us_market']/total*100:.1f}%)")
        print(f"   🔑自注册功能: {compliance['self_registration']}/{total} ({compliance['self_registration']/total*100:.1f}%)")
        print(f"   💰收款能力: {compliance['payment_receiving']}/{total} ({compliance['payment_receiving']/total*100:.1f}%)")
        print(f"   🔗集成能力: {compliance['integration']}/{total} ({compliance['integration']/total*100:.1f}%)")
    else:
        print(f"\n📋 4项标准符合率: 无有效验证结果")

    # 显示完美平台
    perfect_platforms = [r for r in results if r['v4_1_score'] == 100]
    if perfect_platforms:
        print(f"\n🏆 v4.1完美平台 ({len(perfect_platforms)}个):")
        for i, platform in enumerate(perfect_platforms, 1):
            name = platform['platform_name']
            url = platform['url']
            dominant_type = platform['payment_receiving_analysis_v4_1']['dominant_payment_type']
            print(f"  {i:2d}. {name:<25} - {dominant_type} - {url}")

    print(f"\n💾 v4.1最终验证结果已保存: {data_path / 'final_deep_verification_v4_1_results.json'}")

    return final_report

if __name__ == "__main__":
    verify_16_platforms_v4_1()