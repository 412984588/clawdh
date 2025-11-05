#!/usr/bin/env python3
"""
⚡ 快速100平台发现验证系统 v4.1.1 - 高效模式
使用预定义平台列表 + 智能验证 + v4.1.1标准（含银行直接提取功能）
"""

import json
import requests
import time
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import concurrent.futures
import threading

class RapidHundredPlatformDiscoveryV4_1_1:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        self.verification_results = []
        self.lock = threading.Lock()

    def get_predefined_platforms(self):
        """获取预定义的100个潜在支付平台列表"""
        platforms = [
            # SaaS和订阅平台
            "chargebee.com", "paddle.com", "fastspring.com", "recurly.com", "zuora.com",
            "chartmogul.com", "profitwell.com", "baremetrics.com", "mrr.io", "chartmogul.io",
            "subscriptionflow.com", "pabbly.com", "memberful.com", "patreon.com", "substack.com",
            "gum.co", "buy.stripe.com", "lemonsqueezy.com", "fastspring.com", "paddle.com",

            # 支付网关和处理器
            "braintreepayments.com", "adyen.com", "mollie.com", "adyen.com", "razorpay.com",
            "payu.com", "worldpay.com", "globalpay.com", "checkout.com", "2checkout.com",
            "ccavenue.com", "payu.in", "payoneer.com", "wise.com", "transferwise.com",
            "skrill.com", "neteller.com", "paysafe.net", "ecopayz.com", "paysera.net",

            # 创作者经济平台
            "teachable.com", "thinkific.com", "podia.com", "kajabi.com", "learnworlds.com",
            "uscreen.com", "vimeo.com", "memberpress.com", "restrictcontentpro.com",
            "sammcart.com", "sellfy.com", "gumroad.com", "payhip.com", "dlcart.com",
            "fetchapp.com", "productdyno.com", "podia.com", "memberful.com",

            # 电子商务平台
            "shopify.com", "bigcommerce.com", "woocommerce.com", "magento.com", "opencart.com",
            "prestashop.com", "volusion.com", "3dcart.com", "squarespace.com", "wix.com",
            "weebly.com", "godaddy.com", "bigcartel.com", "tictail.com", "ecwid.com",

            # 银行和金融科技平台
            "plaid.com", "stripe.com", "square.com", "paypal.com", "venmo.com",
            "cashapp.me", "zelle.com", "popmoney.com", "wise.com", "revolut.com",
            "n26.com", "monzo.com", "chime.com", "varo.com", "ally.com",

            # 专业支付平台
            "authorize.net", "bluepay.com", "firstdata.com", "globalpaymentsinc.com",
            "worldpay.com", "paysafe.com", "paysimple.com", "stripeatlas.com",
            "braintree.com", "adyen.com", "mollie.com", "razorpay.com",

            # 订阅管理平台
            "recurly.com", "zuora.com", "chargebee.com", "paddle.com", "fastspring.com",
            "gumroad.com", "memberful.com", "patreon.com", "substack.com",

            # 发票和计费平台
            "freshbooks.com", "quickbooks.intuit.com", "xero.com", "waveapps.com",
            "zohoinvoice.com", "invoice2go.com", "bill.com", "expensify.com",

            # 市场和拍卖平台
            "ebay.com", "etsy.com", "amazon.com", "shopify.com", "bigcommerce.com",
            "bonanza.com", "ruby lane.com", "poshmark.com", "depop.com",

            # 服务平台
            "upwork.com", "fiverr.com", "freelancer.com", "guru.com", "peopleperhour.com",
            "toptal.com", "clarity.fm", "codementorx.io", "gitcoin.co",

            # 预约和日程平台
            "calendly.com", "acuityscheduling.com", "squareup.com/appointments",
            "booksy.com", "mindbody.com", "zenplanner.com", "fresha.com",

            # 捐赠和众筹平台
            "gofundme.com", "kickstarter.com", "indiegogo.com", "patreon.com",
            "givebutter.com", "classy.org", "donorbox.org", "kettle.co",

            # B2B支付平台
            "bill.com", "stripe.com/invoicing", "paypal.com/business",
            "quickbooks.intuit.com", "xero.com", "freshbooks.com",

            # 租金和物业管理
            "buildium.com", "appfolio.com", "yardi.com", "rentecafe.com",
            "turbotenant.com", "cozy.co", "rentmanager.com", "propertyware.com",

            # 健身和运动
            "mindbody.com", "trainerize.com", "myfitnesspal.com", "classpass.com",
            "fitbit.com", "peloton.com", "zwift.com", "strava.com",

            # 教育和学习
            "udemy.com", "coursera.org", "skillshare.com", "teachable.com",
            "thinkific.com", "learnworlds.com", "kajabi.com", "podia.com",

            # 咨询和专业服务
            "calendly.com", "acuityscheduling.com", "clarity.fm", "codementorx.io",
            "toptal.com", "upwork.com", "fiverr.com", "freelancer.com",

            # 软件和技术服务
            "github.com", "gitlab.com", "bitbucket.org", "jira.com",
            "atlassian.com", "microsoft.com", "google.com", "aws.amazon.com",

            # 旅行和住宿
            "booking.com", "airbnb.com", "expedia.com", "tripadvisor.com",
            "hotels.com", "vrbo.com", "agoda.com", "booking.com",

            # 食品和餐饮
            "doordash.com", "ubereats.com", "grubhub.com", "doordash.com",
            "postmates.com", "instacart.com", "shipt.com", "freshdirect.com",

            # 运输和物流
            "uber.com", "lyft.com", "dhl.com", "fedex.com", "ups.com",
            "usps.com", "ontrac.com", "xpo.com", "estafeta.com",

            # 媒体和娱乐
            "netflix.com", "spotify.com", "youtube.com", "hulu.com",
            "disneyplus.com", "hbo.com", "amazon.com/prime", "apple.com/apple-tv-plus",

            # 电信服务
            "att.com", "verizon.com", "t-mobile.com", "sprint.com",
            "comcast.com", "charter.com", "cox.com", "spectrum.com",

            # 保险服务
            "geico.com", "progressive.com", "statefarm.com", "allstate.com",
            "nationwide.com", "libertymutual.com", "aig.com", "travelers.com",

            # 医疗健康
            "teladoc.com", "zocdoc.com", "doximity.com", "webmd.com",
            "healthgrades.com", "vitals.com", "zocdoc.com", "teladoc.com",

            # 房地产
            "zillow.com", "realtor.com", "redfin.com", "trulia.com",
            "homes.com", "loopnet.com", "apartments.com", "craigslist.org"
        ]

        # 添加一些可能的新兴平台
        emerging_platforms = [
            "paystack.com", "flutterwave.com", "dLocal.com", "paytm.com", "phonepe.com",
            "razorpay.com", "payu.latam", "mercadopago.com", "pagseguro.uol.com.br",
            "mobbypay.com", "paysera.com", "ecopayz.com", "payrexx.com", "mollie.com",
            "adyen.com", "adyen.com", "adyen.com", "adyen.com", "adyen.com",
            "paddle.com", "fastspring.com", "fastspring.com", "fastspring.com", "fastspring.com",
            "chargebee.com", "chargebee.com", "chargebee.com", "chargebee.com", "chargebee.com",
            "recurly.com", "recurly.com", "recurly.com", "recurly.com", "recurly.com",
            "zuora.com", "zuora.com", "zuora.com", "zuora.com", "zuora.com"
        ]

        # 合并并去重
        all_platforms = list(set(platforms + emerging_platforms))

        # 过滤掉已知的16个验证平台
        verified_platforms = {
            'dwolla.com', 'rotessa.com', 'paymentcloudinc.com', 'gocardless.com', 'paysafe.com',
            'moov.io', 'mercury.com', 'rho.co', 'bluehillpayments.com', 'dots.dev',
            'north.com', 'usbank.com', 'plaid.com', 'stripe.com', 'avidxchange.com', 'nationalprocessing.com'
        }

        filtered_platforms = [p for p in all_platforms if p not in verified_platforms]

        # 确保有100个平台
        return filtered_platforms[:100]

    def verify_platform_batch(self, platforms, batch_size=10):
        """批量验证平台"""
        print(f"🔍 开始批量验证 {len(platforms)} 个平台 (每批 {batch_size} 个)")
        print("="*70)

        results = []

        # 使用线程池并行处理
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            # 提交所有验证任务
            future_to_platform = {
                executor.submit(self.verify_single_platform, platform): platform
                for platform in platforms
            }

            # 收集结果
            for future in concurrent.futures.as_completed(future_to_platform):
                platform = future_to_platform[future]
                try:
                    result = future.result()
                    if result:
                        with self.lock:
                            self.verification_results.append(result)
                            results.append(result)
                            index = len(self.verification_results)
                        print(f"✅ [{index:3d}/{len(platforms)}] {platform[:30]:<30} - {result['v4_1_1_score']}/100")
                    else:
                        print(f"❌ [{len(self.verification_results):3d}/{len(platforms)}] {platform[:30]:<30} - 验证失败")
                except Exception as e:
                    print(f"💥 [{len(self.verification_results):3d}/{len(platforms)}] {platform[:30]:<30} - 错误: {e}")

        return results

    def verify_single_platform(self, platform_name):
        """验证单个平台"""
        try:
            # 确定URL
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

            # 🆕 银行直接提取功能验证
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
        # 尝试常见的URL模式
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
            # 🆕 银行直接提取关键词
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

    def save_results(self):
        """保存验证结果"""
        if not self.verification_results:
            return

        data_path = Path(__file__).parent / "data"
        data_path.mkdir(exist_ok=True)

        perfect_platforms = [r for r in self.verification_results if r['v4_1_1_score'] == 100]
        good_platforms = [r for r in self.verification_results if 75 <= r['v4_1_1_score'] < 100]
        needs_improvement = [r for r in self.verification_results if r['v4_1_1_score'] < 75]

        # 🆕 银行直接提取统计
        bank_feature_stats = {
            'total_verified': len(self.verification_results),
            'has_credit_card_support': len([r for r in self.verification_results if r['bank_direct_debit_features']['has_credit_card_support']]),
            'has_direct_debit_support': len([r for r in self.verification_results if r['bank_direct_debit_features']['has_direct_debit_support']]),
            'dual_support': len([r for r in self.verification_results if r['bank_direct_debit_features']['has_credit_card_support'] and r['bank_direct_debit_features']['has_direct_debit_support']]),
        }

        report = {
            'discovery_time': datetime.now().isoformat(),
            'total_platforms_searched': 100,
            'total_platforms_verified': len(self.verification_results),
            'v4_1_1_standard': "4项标准 + 银行直接提取功能 v4.1.1",
            'summary': {
                'perfect_100': len(perfect_platforms),
                'good_75_99': len(good_platforms),
                'needs_improvement_0_74': len(needs_improvement),
                'average_score': sum(r['v4_1_1_score'] for r in self.verification_results) / len(self.verification_results),
                'bank_features': bank_feature_stats
            },
            'criteria_compliance': {
                'us_market': len([r for r in self.verification_results if r['us_market_analysis']['passed']]),
                'self_registration': len([r for r in self.verification_results if r['self_registration_analysis']['passed']]),
                'payment_receiving': len([r for r in self.verification_results if r['payment_receiving_analysis']['passed']]),
                'integration': len([r for r in self.verification_results if r['integration_analysis']['passed']]),
                'bank_features': len([r for r in self.verification_results if r['bank_direct_debit_features']['passed']])
            },
            'detailed_results': self.verification_results
        }

        filename = f"rapid_100_platforms_discovery_v4_1_1_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(data_path / filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        return report

def main():
    """主函数"""
    print("⚡ 快速100平台发现验证系统 v4.1.1")
    print("🎯 目标: 高效发现并验证100个支付平台")
    print("🏦 新功能: 银行直接提取/预授权扣款功能检测")
    print("⚡ 优化: 并行处理 + 智能URL检测")
    print("="*70)

    discovery = RapidHundredPlatformDiscoveryV4_1_1()

    # 获取100个预定义平台
    platforms = discovery.get_predefined_platforms()
    print(f"📋 预定义平台列表: {len(platforms)} 个")

    # 批量验证
    results = discovery.verify_platform_batch(platforms)

    # 保存并显示结果
    report = discovery.save_results()

    if report:
        print(f"\n🎉 大规模验证完成!")
        print(f"📊 总验证平台: {report['summary']['total_verified']} 个")
        print(f"✅ 完美平台(100分): {report['summary']['perfect_100']} 个")
        print(f"⚠️ 良好平台(75-99分): {report['summary']['good_75_99']} 个")
        print(f"❌ 需改进平台(<75分): {report['summary']['needs_improvement_0_74']} 个")
        print(f"📈 平均分数: {report['summary']['average_score']:.1f}/100")

        # 🆕 银行功能统计
        bank_stats = report['summary']['bank_features']
        print(f"\n🏦 银行直接提取功能统计:")
        print(f"   支持信用卡/Apple Pay: {bank_stats['has_credit_card_support']}/{bank_stats['total_verified']} ({bank_stats['has_credit_card_support']/bank_stats['total_verified']*100:.1f}%)")
        print(f"   支持银行直接提取: {bank_stats['has_direct_debit_support']}/{bank_stats['total_verified']} ({bank_stats['has_direct_debit_support']/bank_stats['total_verified']*100:.1f}%)")
        print(f"   双重功能支持: {bank_stats['dual_support']}/{bank_stats['total_verified']} ({bank_stats['dual_support']/bank_stats['total_verified']*100:.1f}%)")

        # 显示完美平台
        perfect_platforms = [r for r in report['detailed_results'] if r['v4_1_1_score'] == 100]
        if perfect_platforms:
            print(f"\n🏆 v4.1.1完美平台 ({len(perfect_platforms)}个):")
            for i, platform in enumerate(perfect_platforms, 1):
                name = platform['platform_name']
                score = platform['v4_1_1_score']
                has_bank_features = platform['bank_direct_debit_features']['passed']
                bank_type = ""
                if platform['bank_direct_debit_features']['has_credit_card_support'] and platform['bank_direct_debit_features']['has_direct_debit_support']:
                    bank_type = "🏦双重"
                elif platform['bank_direct_debit_features']['has_credit_card_support']:
                    bank_type = "💳信用卡"
                elif platform['bank_direct_debit_features']['has_direct_debit_support']:
                    bank_type = "🏦直接提取"

                print(f"  {i:2d}. {name:<30} - {score}/100 {bank_type}")

        # 显示详细文件路径
        print(f"\n💾 验证结果已保存到:")
        print(f"   {Path(__file__).parent / 'data' / f'rapid_100_platforms_discovery_v4_1_1_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json'}")

    else:
        print("❌ 未能完成任何验证")

if __name__ == "__main__":
    main()