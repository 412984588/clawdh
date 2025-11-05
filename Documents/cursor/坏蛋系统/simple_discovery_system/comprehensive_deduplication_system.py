#!/usr/bin/env python3
"""
🚫 完整去重系统 - 所有已验证平台不再验证
收集所有验证记录，确保每个平台只验证一次
"""

import json
import requests
import time
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import concurrent.futures
import threading

class ComprehensiveDeduplicationSystem:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        self.verification_results = []
        self.lock = threading.Lock()

    def collect_all_verified_platforms(self):
        """收集所有已验证过的平台"""

        verified_platforms = set()

        # 1. 从v4.1深度验证结果收集（16个平台）
        try:
            with open(Path(__file__).parent / "data" / "final_deep_verification_v4_1_results.json", 'r', encoding='utf-8') as f:
                v4_1_data = json.load(f)
                for platform in v4_1_data.get('detailed_results', []):
                    # 提取主域名
                    platform_name = platform.get('platform_name', '').lower()
                    url = platform.get('url', '')
                    domain = self.extract_domain(url)

                    verified_platforms.add(platform_name.lower())
                    if domain:
                        verified_platforms.add(domain)

        except FileNotFoundError:
            print("⚠️ v4.1验证结果文件未找到")

        # 2. 从100平台验证结果收集（75个平台）
        try:
            # 查找最新的100平台验证结果
            data_dir = Path(__file__).parent / "data"
            rapid_files = list(data_dir.glob("rapid_100_platforms_discovery_v4_1_1_*.json"))

            if rapid_files:
                latest_file = max(rapid_files, key=lambda f: f.stat().st_mtime)
                with open(latest_file, 'r', encoding='utf-8') as f:
                    rapid_data = json.load(f)
                    for platform in rapid_data.get('detailed_results', []):
                        platform_name = platform.get('platform_name', '').lower()
                        url = platform.get('url', '')
                        domain = self.extract_domain(url)

                        verified_platforms.add(platform_name.lower())
                        if domain:
                            verified_platforms.add(domain)

        except FileNotFoundError:
            print("⚠️ 100平台验证结果文件未找到")

        # 3. 从其他验证文件收集
        other_files = [
            "verification_results.json",
            "discovery_queue.json",
            "final_verification_summary.json",
            "total_verification_summary.json"
        ]

        for filename in other_files:
            try:
                with open(Path(__file__).parent / "data" / filename, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                    # 处理不同的文件格式
                    if 'detailed_results' in data:
                        platforms = data['detailed_results']
                    elif 'results' in data:
                        platforms = data['results']
                    else:
                        platforms = [data] if isinstance(data, dict) else []

                    for platform in platforms:
                        if isinstance(platform, dict):
                            platform_name = platform.get('platform_name', platform.get('name', '')).lower()
                            url = platform.get('url', '')
                            domain = self.extract_domain(url)

                            if platform_name:
                                verified_platforms.add(platform_name.lower())
                            if domain:
                                verified_platforms.add(domain)

            except (FileNotFoundError, json.JSONDecodeError):
                continue

        # 4. 添加已知的别名映射
        company_aliases = {
            'stripe.com': ['stripe.com', 'stripe.com/invoicing', 'stripe.com/business'],
            'paypal.com': ['paypal.com', 'paypal.com/business'],
            'square.com': ['square.com', 'squareup.com', 'squareup.com/appointments'],
            'wise.com': ['wise.com', 'transferwise.com'],
            'adyen.com': ['adyen.com'],
            'braintree.com': ['braintree.com', 'braintreepayments.com'],
            'paddle.com': ['paddle.com'],
            'paysafe.com': ['paysafe.com', 'paysafe.net'],
        }

        # 扩展验证平台集合以包含所有别名
        expanded_verified = set(verified_platforms)
        for main_domain, aliases in company_aliases.items():
            if any(alias in verified_platforms for alias in aliases):
                expanded_verified.update(aliases)

        return expanded_verified

    def extract_domain(self, url):
        """从URL提取主域名"""
        if not url:
            return ""

        # 移除协议
        url = url.replace('https://', '').replace('http://', '')

        # 移除www前缀
        if url.startswith('www.'):
            url = url[4:]

        # 提取主域名（忽略路径）
        domain = url.split('/')[0]

        return domain.lower()

    def get_comprehensive_verified_list(self):
        """获取所有已验证平台的完整列表"""
        verified_platforms = self.collect_all_verified_platforms()

        print(f"🔍 完整去重系统统计:")
        print(f"   已验证平台总数: {len(verified_platforms)} 个")
        print(f"   包含公司别名映射")

        # 按类别分组显示
        payment_gateways = []
        saas_platforms = []
        banks_fintech = []
        creator_economy = []
        marketplaces = []
        others = []

        for platform in sorted(verified_platforms):
            if any(keyword in platform for keyword in ['stripe', 'paypal', 'adyen', 'braintree', 'paddle']):
                payment_gateways.append(platform)
            elif any(keyword in platform for keyword in ['chargebee', 'recurly', 'zuora', 'chartmogul']):
                saas_platforms.append(platform)
            elif any(keyword in platform for keyword in ['bank', 'plaid', 'mercury', 'moov', 'rho']):
                banks_fintech.append(platform)
            elif any(keyword in platform for keyword in ['patreon', 'kajabi', 'teachable', 'podia']):
                creator_economy.append(platform)
            elif any(keyword in platform for keyword in ['ebay', 'etsy', 'amazon', 'shopify']):
                marketplaces.append(platform)
            else:
                others.append(platform)

        print(f"\n📊 已验证平台分类:")
        print(f"   💳 支付网关: {len(payment_gateways)} 个")
        print(f"   📈 SaaS平台: {len(saas_platforms)} 个")
        print(f"   🏦 银行金融: {len(banks_fintech)} 个")
        print(f"   🎨 创作者经济: {len(creator_economy)} 个")
        print(f"   🛒 市场平台: {len(marketplaces)} 个")
        print(f"   📦 其他平台: {len(others)} 个")

        return {
            'all_verified': verified_platforms,
            'payment_gateways': payment_gateways,
            'saas_platforms': saas_platforms,
            'banks_fintech': banks_fintech,
            'creator_economy': creator_economy,
            'marketplaces': marketplaces,
            'others': others
        }

    def get_new_platform_candidates(self, required_count=100):
        """获取新的候选平台列表（严格排除已验证平台）"""
        verified_info = self.get_comprehensive_verified_list()
        verified_platforms = verified_info['all_verified']

        # 候选平台池（大幅扩展以找到足够的新平台）
        candidate_pool = [
            # 新兴支付处理平台
            "paystack.com", "flutterwave.com", "dlocal.com", "paytm.com", "phonepe.com",
            "mobbypay.com", "paysera.com", "ecopayz.com", "payrexx.com", "mollie.com",
            "checkout.com", "2checkout.com", "ccavenue.com", "razorpay.com",
            "skrill.com", "neteller.com", "webmoney.com", "payoneer.com",

            # 新兴SaaS和订阅平台
            "memberful.com", "substack.com", "gumroad.com", "buy.stripe.com", "lemonsqueezy.com",
            "fastspring.com", "paddle.com", "subscriptionflow.com", "baremetrics.com",
            "profitwell.com", "mrr.io", "chargebee.com", "zuora.com",

            # 新兴创作者平台
            "uscreen.com", "vimeo.com", "memberpress.com", "restrictcontentpro.com",
            "sammcart.com", "sellfy.com", "payhip.com", "dlcart.com", "fetchapp.com",
            "productdyno.com",

            # 新兴电商平台
            "bigcommerce.com", "woocommerce.com", "magento.com", "opencart.com",
            "prestashop.com", "volusion.com", "3dcart.com", "weebly.com",
            "godaddy.com", "bigcartel.com", "tictail.com", "ecwid.com",

            # 新兴银行和金融科技
            "venmo.com", "cashapp.me", "zelle.com", "popmoney.com", "revolut.com",
            "n26.com", "monzo.com", "chime.com", "varo.com", "ally.com",

            # 专业支付处理
            "authorize.net", "bluepay.com", "firstdata.com", "globalpaymentsinc.com",
            "worldpay.com", "paysimple.com", "stripeatlas.com",

            # 发票和计费
            "freshbooks.com", "quickbooks.intuit.com", "xero.com", "waveapps.com",
            "zohoinvoice.com", "invoice2go.com", "bill.com", "expensify.com",

            # 新兴市场和拍卖
            "bonanza.com", "ruby lane.com", "poshmark.com", "depop.com",

            # 新兴自由职业平台
            "upwork.com", "fiverr.com", "freelancer.com", "peopleperhour.com",
            "toptal.com", "clarity.fm", "codementorx.io", "gitcoin.co",

            # 新兴预约平台
            "calendly.com", "booksy.com", "mindbody.com", "zenplanner.com", "fresha.com",

            # 新兴捐赠众筹
            "gofundme.com", "kickstarter.com", "indiegogo.com", "classy.org", "kettle.co",

            # 新兴物业管理
            "buildium.com", "appfolio.com", "yardi.com", "rentecafe.com", "turbotenant.com",
            "cozy.co", "rentmanager.com", "propertyware.com",

            # 新兴健身平台
            "myfitnesspal.com", "classpass.com", "fitbit.com", "peloton.com", "zwift.com", "strava.com",

            # 新兴教育平台
            "udemy.com", "coursera.org", "skillshare.com", "teachable.com",
            "thinkific.com", "learnworlds.com",

            # 新兴软件平台
            "github.com", "gitlab.com", "bitbucket.org", "jira.com", "atlassian.com",
            "microsoft.com", "google.com", "aws.amazon.com",

            # 新兴旅行平台
            "booking.com", "airbnb.com", "expedia.com", "tripadvisor.com", "hotels.com",
            "vrbo.com", "agoda.com",

            # 新兴食品平台
            "doordash.com", "ubereats.com", "grubhub.com", "postmates.com",
            "instacart.com", "shipt.com", "freshdirect.com",

            # 新兴运输平台
            "uber.com", "lyft.com", "dhl.com", "fedex.com", "ups.com", "usps.com",
            "ontrac.com", "xpo.com", "estafeta.com",

            # 新兴媒体平台
            "netflix.com", "spotify.com", "youtube.com", "hulu.com", "disneyplus.com",
            "hbo.com", "apple.com/apple-tv-plus",

            # 新兴电信
            "att.com", "verizon.com", "t-mobile.com", "sprint.com", "comcast.com",
            "charter.com", "cox.com", "spectrum.com",

            # 新兴保险
            "geico.com", "progressive.com", "statefarm.com", "allstate.com",
            "nationwide.com", "libertymutual.com", "aig.com", "travelers.com",

            # 新兴医疗
            "teladoc.com", "zocdoc.com", "doximity.com", "webmd.com", "healthgrades.com",
            "vitals.com",

            # 新兴房地产
            "zillow.com", "realtor.com", "redfin.com", "trulia.com", "homes.com",
            "loopnet.com", "apartments.com", "craigslist.org"
        ]

        # 严格过滤：排除所有已验证平台及其别名
        new_platforms = []
        for platform in candidate_pool:
            domain = self.extract_domain(f"https://{platform}")

            # 检查平台本身和域名是否已验证
            if (platform.lower() not in verified_platforms and
                domain not in verified_platforms and
                not any(verified in platform.lower() for verified in verified_platforms)):
                new_platforms.append(platform)

        print(f"\n📊 候选平台统计:")
        print(f"   总候选池: {len(candidate_pool)} 个")
        print(f"   已验证过滤: {len(candidate_pool) - len(new_platforms)} 个")
        print(f"   新候选平台: {len(new_platforms)} 个")

        # 确保有足够的新平台
        if len(new_platforms) < required_count:
            print(f"⚠️ 警告: 只有 {len(new_platforms)} 个新平台，少于要求的 {required_count} 个")

        return new_platforms[:required_count]

    def save_verified_platforms_database(self):
        """保存已验证平台数据库"""
        verified_info = self.get_comprehensive_verified_list()

        database = {
            'database_created': datetime.now().isoformat(),
            'total_verified_platforms': len(verified_info['all_verified']),
            'verified_platforms': {
                'all': sorted(list(verified_info['all_verified'])),
                'payment_gateways': sorted(verified_info['payment_gateways']),
                'saas_platforms': sorted(verified_info['saas_platforms']),
                'banks_fintech': sorted(verified_info['banks_fintech']),
                'creator_economy': sorted(verified_info['creator_economy']),
                'marketplaces': sorted(verified_info['marketplaces']),
                'others': sorted(verified_info['others'])
            }
        }

        filename = f"verified_platforms_database_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        data_path = Path(__file__).parent / "data"
        data_path.mkdir(exist_ok=True)

        with open(data_path / filename, 'w', encoding='utf-8') as f:
            json.dump(database, f, ensure_ascii=False, indent=2)

        print(f"\n💾 已验证平台数据库已保存到: {data_path / filename}")
        return filename

def main():
    """主函数"""
    print("🚫 完整去重系统 - 所有已验证平台不再验证")
    print("🎯 目标: 收集所有验证记录，确保零重复")
    print("="*70)

    dedup_system = ComprehensiveDeduplicationSystem()

    # 收集所有已验证平台
    verified_info = dedup_system.get_comprehensive_verified_list()

    # 获取新候选平台
    new_candidates = dedup_system.get_new_platform_candidates(100)

    if new_candidates:
        print(f"\n🎯 新候选平台列表 ({len(new_candidates)} 个):")
        for i, platform in enumerate(new_candidates, 1):
            print(f"   {i:2d}. {platform}")

    # 保存数据库
    dedup_system.save_verified_platforms_database()

if __name__ == "__main__":
    main()