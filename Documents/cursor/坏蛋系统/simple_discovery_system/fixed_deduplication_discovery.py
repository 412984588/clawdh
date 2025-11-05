#!/usr/bin/env python3
"""
🔧 修正版100平台发现验证系统 - 解决去重问题
严格去重 + 完整过滤 + 智能URL映射
"""

import json
import requests
import time
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import concurrent.futures
import threading

class FixedHundredPlatformDiscoveryV4_1_1:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        self.verification_results = []
        self.lock = threading.Lock()

    def get_deduplicated_platforms(self):
        """获取严格去重的100个平台列表"""

        # 🏢 公司别名映射 - 避免同一公司重复验证
        company_aliases = {
            'wise.com': ['wise.com', 'transferwise.com'],
            'stripe.com': ['stripe.com', 'stripe.com/invoicing', 'stripe.com/business'],
            'paypal.com': ['paypal.com', 'paypal.com/business'],
            'square.com': ['square.com', 'squareup.com', 'squareup.com/appointments'],
            'adyen.com': ['adyen.com'],
            'braintree.com': ['braintree.com', 'braintreepayments.com'],
            'paddle.com': ['paddle.com'],
            'fastspring.com': ['fastspring.com'],
            'recurly.com': ['recurly.com'],
            'chargebee.com': ['chargebee.com'],
            'zuora.com': ['zuora.com'],
            'paysafe.com': ['paysafe.com', 'paysafe.net'],
        }

        # 📋 完整的已知验证平台列表（扩展到所有已验证过的平台）
        all_verified_platforms = {
            # 原始16个平台
            'dwolla.com', 'rotessa.com', 'paymentcloudinc.com', 'gocardless.com', 'paysafe.com',
            'moov.io', 'mercury.com', 'rho.co', 'bluehillpayments.com', 'dots.dev',
            'north.com', 'usbank.com', 'plaid.com', 'stripe.com', 'avidxchange.com', 'nationalprocessing.com',

            # 从最新验证结果中发现的已验证平台（避免重复）
            'paypal.com', 'squareup.com', 'wise.com', 'stripe.com', 'adyen.com', 'braintree.com',
            'paddle.com', 'recurly.com', 'zuora.com', 'chargebee.com', 'paysafe.net',

            # 本次100平台验证中已验证的平台
            'expensify.com', 'invoice2go.com', 'patreon.com', 'waveapps.com', 'zelle.com',
            'payrexx.com', 'wix.com', 'guru.com', 'squarespace.com', 'atlassian.com',
            'donorbox.org', 'checkout.com', 'flutterwave.com', 'trainerize.com',
            'sellfy.com', 'acuityscheduling.com', 'kajabi.com', 'givebutter.com'
        }

        # 🎯 精选100个候选平台（严格去重）
        candidate_platforms = [
            # SaaS和订阅管理平台
            "chargebee.com", "paddle.com", "fastspring.com", "recurly.com", "zuora.com",
            "chartmogul.com", "profitwell.com", "baremetrics.com", "subscriptionflow.com",

            # 支付网关和处理器
            "mollie.com", "razorpay.com", "worldpay.com", "globalpay.com", "2checkout.com",
            "ccavenue.com", "payoneer.com", "skrill.com", "neteller.com", "ecopayz.com",

            # 创作者经济平台
            "teachable.com", "thinkific.com", "podia.com", "learnworlds.com", "uscreen.com",
            "gumroad.com", "payhip.com", "memberpress.com", "restrictcontentpro.com",

            # 电子商务平台
            "shopify.com", "bigcommerce.com", "woocommerce.com", "magento.com", "opencart.com",
            "prestashop.com", "volusion.com", "3dcart.com", "weebly.com", "godaddy.com",

            # 银行和金融科技
            "venmo.com", "cashapp.me", "popmoney.com", "revolut.com", "n26.com",
            "monzo.com", "chime.com", "varo.com", "ally.com",

            # 专业支付处理
            "authorize.net", "bluepay.com", "firstdata.com", "globalpaymentsinc.com",
            "paysimple.com", "stripeatlas.com",

            # 发票和计费
            "freshbooks.com", "quickbooks.intuit.com", "xero.com", "waveapps.com",
            "zohoinvoice.com", "bill.com",

            # 市场平台
            "ebay.com", "etsy.com", "amazon.com", "bonanza.com", "ruby lane.com",

            # 自由职业平台
            "upwork.com", "fiverr.com", "freelancer.com", "peopleperhour.com", "toptal.com",

            # 预约调度
            "calendly.com", "booksy.com", "mindbody.com", "zenplanner.com", "fresha.com",

            # 捐赠众筹
            "gofundme.com", "kickstarter.com", "indiegogo.com", "classy.org", "kettle.co",

            # 租金物业
            "buildium.com", "appfolio.com", "yardi.com", "rentecafe.com", "turbotenant.com",

            # 健身运动
            "myfitnesspal.com", "classpass.com", "fitbit.com", "peloton.com", "zwift.com",

            # 教育学习
            "udemy.com", "coursera.org", "skillshare.com",

            # 咨询服务
            "clarity.fm", "codementorx.io", "gitcoin.co",

            # 软件开发
            "github.com", "gitlab.com", "bitbucket.org", "jira.com", "microsoft.com", "google.com",

            # 旅行住宿
            "booking.com", "airbnb.com", "expedia.com", "tripadvisor.com", "hotels.com", "vrbo.com",

            # 食品餐饮
            "doordash.com", "ubereats.com", "grubhub.com", "postmates.com", "instacart.com",

            # 运输物流
            "uber.com", "lyft.com", "dhl.com", "fedex.com", "ups.com", "usps.com",

            # 媒体娱乐
            "netflix.com", "spotify.com", "youtube.com", "hulu.com", "disneyplus.com",

            # 电信服务
            "att.com", "verizon.com", "t-mobile.com", "comcast.com", "charter.com",

            # 保险服务
            "geico.com", "progressive.com", "statefarm.com", "allstate.com",

            # 医疗健康
            "teladoc.com", "zocdoc.com", "doximity.com", "webmd.com", "healthgrades.com",

            # 房地产
            "zillow.com", "realtor.com", "redfin.com", "trulia.com", "loopnet.com"
        ]

        # 🔄 严格去重逻辑
        seen_companies = set()
        final_platforms = []

        for platform in candidate_platforms:
            # 确定主公司域名
            main_domain = platform.split('/')[0]  # 去掉路径部分

            # 检查是否属于已知公司别名
            company_name = None
            for main, aliases in company_aliases.items():
                if main_domain in aliases:
                    company_name = main
                    break

            if company_name:
                if company_name not in seen_companies and company_name not in all_verified_platforms:
                    seen_companies.add(company_name)
                    final_platforms.append(platform)
            else:
                if main_domain not in seen_companies and main_domain not in all_verified_platforms:
                    seen_companies.add(main_domain)
                    final_platforms.append(platform)

        print(f"🔍 去重统计:")
        print(f"   原始候选: {len(candidate_platforms)} 个")
        print(f"   已知过滤: {len(all_verified_platforms)} 个")
        print(f"   最终保留: {len(final_platforms)} 个")

        return final_platforms[:100]  # 确保最多100个

    def verify_single_platform(self, platform_name):
        """验证单个平台"""
        try:
            # 标准化URL处理
            url = self.determine_platform_url(platform_name)

            response = self.session.get(url, timeout=15, allow_redirects=True)
            if response.status_code != 200:
                return None

            soup = BeautifulSoup(response.text, 'html.parser')
            page_text = soup.get_text().lower()

            # 4项标准验证
            us_market = self.verify_us_market(soup, page_text)
            self_reg = self.verify_self_registration(soup, page_text)
            payment_receiving = self.verify_payment_receiving(soup, page_text)
            integration = self.verify_integration(soup, page_text)

            # 银行直接提取功能验证
            bank_features = self.verify_bank_direct_debit_features(soup, page_text)

            # 计算分数
            score = 0
            criteria_met = []

            if us_market['passed']:
                score += 25
                criteria_met.append("🇺🇸美国市场服务")

            if self_reg['passed']:
                score += 25
                criteria_met.append("🔑自注册功能")

            if payment_receiving['passed']:
                score += 25
                criteria_met.append("💰收款能力")

            if integration['passed']:
                score += 25
                criteria_met.append("🔗集成能力")

            analysis = {
                'platform_name': platform_name,
                'url': url,
                'verification_time': datetime.now().isoformat(),
                'page_title': self.extract_title(soup),
                'us_market_analysis': us_market,
                'self_registration_analysis': self_reg,
                'payment_receiving_analysis': payment_receiving,
                'integration_analysis': integration,
                'bank_direct_debit_features': bank_features,
                'v4_1_1_score': score,
                'v4_1_1_criteria_met': criteria_met,
                'final_recommendation': self.make_recommendation(us_market, self_reg, payment_receiving, integration, bank_features)
            }

            return analysis

        except Exception as e:
            return None

    def determine_platform_url(self, platform_name):
        """确定平台的标准URL"""
        urls_to_try = [
            f"https://www.{platform_name}",
            f"https://{platform_name}",
            f"https://{platform_name}.com",
        ]

        for url in urls_to_try:
            try:
                response = self.session.head(url, timeout=5)
                if response.status_code == 200:
                    return url
            except:
                continue

        return f"https://www.{platform_name}"

    def verify_us_market(self, soup, page_text):
        """验证美国市场服务"""
        ach_keywords = ['ach', 'automated clearing house', 'direct deposit', 'bank transfer', 'usd', '$', 'dollar', 'united states']
        ach_count = sum(page_text.count(keyword) for keyword in ach_keywords)

        return {
            'ach_keyword_count': ach_count,
            'passed': ach_count > 3
        }

    def verify_self_registration(self, soup, page_text):
        """验证自注册功能"""
        signup_keywords = ['sign up', 'register', 'create account', 'get started', 'join', 'apply']
        signup_count = sum(page_text.count(keyword) for keyword in signup_keywords)

        # 检查注册元素
        signup_elements = 0
        for tag in ['a', 'button']:
            for element in soup.find_all(tag):
                text = element.get_text().lower()
                if any(keyword in text for keyword in signup_keywords):
                    signup_elements += 1

        return {
            'signup_keyword_count': signup_count,
            'signup_elements_count': signup_elements,
            'passed': signup_count > 3 or signup_elements > 1
        }

    def verify_payment_receiving(self, soup, page_text):
        """验证收款能力"""
        receiving_keywords = [
            'receive payments', 'get paid', 'accept payments', 'collect payments',
            'contributions', 'donations', 'tips', 'subscriptions', 'sales',
            'service fees', 'consulting fees', 'commissions', 'rent',
            # 银行直接提取关键词
            'direct debit', 'bank withdrawal', 'pre-authorized debit', 'automatic withdrawal',
            'payment authorization', 'scheduled payments', 'recurring payments'
        ]

        sending_keywords = ['send money', 'pay bills', 'make payments', 'outgoing payments']

        receiving_count = sum(page_text.count(keyword) for keyword in receiving_keywords)
        sending_count = sum(page_text.count(keyword) for keyword in sending_keywords)

        return {
            'receiving_keyword_count': receiving_count,
            'sending_keyword_count': sending_count,
            'passed': receiving_count > sending_count and receiving_count > 5
        }

    def verify_integration(self, soup, page_text):
        """验证集成能力"""
        api_keywords = ['api', 'integration', 'developers', 'documentation', 'sdk']
        api_count = sum(page_text.count(keyword) for keyword in api_keywords)

        # 查找API文档链接
        api_docs = 0
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text().lower()
            if any(keyword in href or keyword in text for keyword in ['api', 'docs', 'developer']):
                api_docs += 1

        return {
            'api_keyword_count': api_count,
            'api_docs_count': api_docs,
            'passed': api_count > 3 or api_docs > 1
        }

    def verify_bank_direct_debit_features(self, soup, page_text):
        """验证银行直接提取功能"""
        # 信用卡/Apple Pay支持
        credit_card_indicators = ['credit card', 'visa', 'mastercard', 'amex', 'apple pay', 'digital wallet', 'payment processing']
        has_credit_card_support = any(indicator in page_text for indicator in credit_card_indicators)

        # 银行直接提取支持
        direct_debit_indicators = [
            'direct debit', 'bank withdrawal', 'pre-authorized debit', 'preauthorized payment',
            'automatic withdrawal', 'bank draft', 'electronic funds transfer', 'eft',
            'pull payment', 'pull funds', 'ach debit', 'payment authorization',
            'customer authorization', 'scheduled payments', 'recurring payments'
        ]
        direct_debit_count = sum(page_text.count(keyword) for keyword in direct_debit_indicators)
        has_direct_debit_support = direct_debit_count > 0

        return {
            'has_credit_card_support': has_credit_card_support,
            'has_direct_debit_support': has_direct_debit_support,
            'keyword_count': direct_debit_count,
            'passed': has_credit_card_support or has_direct_debit_support
        }

    def extract_title(self, soup):
        """提取页面标题"""
        title_tag = soup.find('title')
        return title_tag.get_text().strip() if title_tag else "无标题"

    def make_recommendation(self, us_market, self_reg, payment_receiving, integration, bank_features):
        """生成推荐"""
        # 银行功能优先推荐
        if bank_features['has_credit_card_support'] or bank_features['has_direct_debit_support']:
            if bank_features['has_credit_card_support'] and bank_features['has_direct_debit_support']:
                return "✅ 支持双重银行功能，强烈推荐 🏦"
            elif bank_features['has_credit_card_support']:
                return "✅ 支持信用卡/Apple Pay，推荐使用"
            else:
                return "✅ 支持银行直接提取，推荐使用 🏦"

        # 基于分数推荐
        passed_count = sum([
            us_market['passed'],
            self_reg['passed'],
            payment_receiving['passed'],
            integration['passed']
        ])

        if passed_count >= 3:
            return "✅ 推荐使用"
        elif passed_count >= 2:
            return "⚠️ 可考虑使用"
        else:
            return "❌ 不推荐使用"

def main():
    """主函数"""
    print("🔧 修正版100平台发现验证系统 v4.1.1")
    print("🎯 目标: 严格去重 + 完整过滤 + 智能URL映射")
    print("🏦 新功能: 银行直接提取/预授权扣款功能检测")
    print("="*70)

    discovery = FixedHundredPlatformDiscoveryV4_1_1()

    # 获取严格去重的平台列表
    platforms = discovery.get_deduplicated_platforms()
    print(f"📋 最终平台列表: {len(platforms)} 个（严格去重后）")

    print(f"\n📝 平台列表:")
    for i, platform in enumerate(platforms, 1):
        print(f"   {i:2d}. {platform}")

if __name__ == "__main__":
    main()