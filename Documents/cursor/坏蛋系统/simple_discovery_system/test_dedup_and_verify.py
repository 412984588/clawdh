#!/usr/bin/env python3
"""
🔍 测试去重功能和验证新平台系统
确保已验证平台不再重复验证
"""

import json
import requests
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup

class TestDedupAndVerify:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })

    def load_latest_verified_database(self):
        """加载最新的已验证平台数据库"""
        try:
            data_dir = Path(__file__).parent / "data"
            db_files = list(data_dir.glob("verified_platforms_database_*.json"))

            if db_files:
                latest_db = max(db_files, key=lambda f: f.stat().st_mtime)
                print(f"📁 使用数据库: {latest_db.name}")
                with open(latest_db, 'r', encoding='utf-8') as f:
                    db_data = json.load(f)
                    return set(db_data['verified_platforms']['all'])
            else:
                print("❌ 没有找到已验证平台数据库")
                return set()
        except Exception as e:
            print(f"⚠️ 无法加载已验证平台数据库: {e}")
            return set()

    def test_deduplication(self):
        """测试去重功能"""
        print("🔍 测试去重功能")
        print("="*50)

        verified_platforms = self.load_latest_verified_database()
        print(f"📊 已验证平台总数: {len(verified_platforms)} 个")

        # 检查一些已知应该被过滤的平台
        test_platforms = [
            "razorpay.com",      # 应该被过滤（之前验证过）
            "mollie.com",        # 应该被过滤（之前验证过）
            "stripe.com",        # 应该被过滤（已知平台）
            "paypal.com",        # 应该被过滤（已知平台）
            "paystack.com",       # 应该在候选列表中
            "dlocal.com",        # 应该在候选列表中
            "lemonsqueezy.com"   # 应该在候选列表中
        ]

        print("\n🧪 去重测试结果:")
        for platform in test_platforms:
            if platform.lower() in verified_platforms:
                print(f"  ✅ {platform:<20} - 已正确过滤")
            else:
                print(f"  ❌ {platform:<20} - 仍在候选列表")

        return verified_platforms

    def get_new_candidate_platforms(self, verified_platforms):
        """获取新的候选平台"""
        # 候选平台池
        candidate_platforms = [
            # 新兴支付处理平台
            "paystack.com", "dlocal.com", "paytm.com", "phonepe.com", "mobbypay.com",
            "paysera.com", "ecopayz.com", "mollie.com", "razorpay.com", "skrill.com",
            "webmoney.com", "payoneer.com", "checkout.com", "2checkout.com", "ccavenue.com",

            # 新兴SaaS和订阅平台
            "substack.com", "gumroad.com", "lemonsqueezy.com", "fastspring.com", "paddle.com",
            "subscriptionflow.com", "profitwell.com", "mrr.io", "chargebee.com", "zuora.com",

            # 新兴创作者平台
            "uscreen.com", "vimeo.com", "memberpress.com", "restrictcontentpro.com",
            "sammcart.com", "payhip.com", "dlcart.com", "fetchapp.com", "productdyno.com",

            # 新兴电商平台
            "woocommerce.com", "magento.com", "opencart.com", "volusion.com", "3dcart.com",
            "godaddy.com", "bigcartel.com", "tictail.com", "ecwid.com",

            # 新兴银行和金融科技
            "venmo.com", "cashapp.me", "popmoney.com", "revolut.com", "monzo.com",
            "chime.com", "varo.com", "ally.com",

            # 专业支付处理
            "bluepay.com", "firstdata.com", "globalpaymentsinc.com", "worldpay.com",
            "stripeatlas.com",

            # 发票和计费
            "freshbooks.com", "quickbooks.intuit.com", "xero.com", "waveapps.com",
            "zohoinvoice.com", "invoice2go.com", "bill.com", "expensify.com",

            # 其他平台...
        ]

        # 严格过滤已验证平台
        new_platforms = []
        for platform in candidate_platforms:
            if platform.lower() not in verified_platforms:
                new_platforms.append(platform)

        print(f"\n📊 新平台筛选统计:")
        print(f"   候选池总数: {len(candidate_platforms)} 个")
        print(f"   已验证过滤: {len(candidate_platforms) - len(new_platforms)} 个")
        print(f"   新候选平台: {len(new_platforms)} 个")

        return new_platforms[:20]  # 返回前20个用于测试

    def quick_verify_platform(self, platform_name):
        """快速验证平台"""
        try:
            url = f"https://www.{platform_name}"
            response = self.session.get(url, timeout=10, allow_redirects=True)

            if response.status_code != 200:
                # 尝试其他URL格式
                alt_urls = [f"https://{platform_name}", f"https://{platform_name}.com"]
                for alt_url in alt_urls:
                    try:
                        response = self.session.get(alt_url, timeout=8, allow_redirects=True)
                        if response.status_code == 200:
                            url = alt_url
                            break
                    except:
                        continue

                if response.status_code != 200:
                    return None

            soup = BeautifulSoup(response.text, 'html.parser')
            page_text = soup.get_text().lower()

            # 快速4项标准检查
            us_keywords = ['ach', 'automated clearing house', 'direct deposit', 'bank transfer', 'usd', '$', 'dollar']
            us_score = sum(page_text.count(keyword) for keyword in us_keywords)

            signup_keywords = ['sign up', 'register', 'create account', 'get started', 'join']
            signup_score = sum(page_text.count(keyword) for keyword in signup_keywords)

            payment_keywords = ['receive payments', 'get paid', 'accept payments', 'contributions', 'donations', 'subscriptions']
            payment_score = sum(page_text.count(keyword) for keyword in payment_keywords)

            api_keywords = ['api', 'integration', 'developers', 'documentation', 'sdk']
            api_score = sum(page_text.count(keyword) for keyword in api_keywords)

            # 简单评分
            score = 0
            criteria_met = []

            if us_score > 3:
                score += 25
                criteria_met.append("🇺🇸美国市场")

            if signup_score > 3:
                score += 25
                criteria_met.append("🔑自注册")

            if payment_score > 5:
                score += 25
                criteria_met.append("💰收款能力")

            if api_score > 3:
                score += 25
                criteria_met.append("🔗集成能力")

            return {
                'platform_name': platform_name,
                'url': url,
                'page_title': soup.find('title').get_text().strip() if soup.find('title') else "无标题",
                'quick_score': score,
                'criteria_met': criteria_met,
                'quick_us_score': us_score,
                'quick_signup_score': signup_score,
                'quick_payment_score': payment_score,
                'quick_api_score': api_score
            }

        except Exception as e:
            return None

    def run_quick_verification_test(self, platforms):
        """运行快速验证测试"""
        print(f"\n🚀 开始快速验证测试 {len(platforms)} 个平台")
        print("="*50)

        results = []
        for platform in platforms:
            print(f"🔍 验证: {platform}")
            result = self.quick_verify_platform(platform)
            if result:
                results.append(result)
                score = result['quick_score']
                criteria = ', '.join(result['criteria_met'])
                print(f"✅ {platform:<20} - {score}/100 ({criteria})")
            else:
                print(f"❌ {platform:<20} - 验证失败")

        return results

    def update_verified_platforms_database(self, new_verified_platforms):
        """更新已验证平台数据库"""
        if not new_verified_platforms:
            print("⚠️ 没有新的已验证平台需要更新")
            return

        # 加载最新数据库
        verified_platforms = self.load_latest_verified_database()

        # 添加新验证的平台
        verified_platforms.update(new_verified_platforms)

        # 保存更新的数据库
        data_path = Path(__file__).parent / "data"
        data_path.mkdir(exist_ok=True)

        # 分类统计
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

        updated_db = {
            'database_created': datetime.now().isoformat(),
            'database_updated': datetime.now().isoformat(),
            'total_verified_platforms': len(verified_platforms),
            'verified_platforms': {
                'all': sorted(list(verified_platforms)),
                'payment_gateways': sorted(payment_gateways),
                'saas_platforms': sorted(saas_platforms),
                'banks_fintech': sorted(banks_fintech),
                'creator_economy': sorted(creator_economy),
                'marketplaces': sorted(marketplaces),
                'others': sorted(others)
            },
            'newly_added': new_verified_platforms
        }

        filename = f"verified_platforms_database_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(data_path / filename, 'w', encoding='utf-8') as f:
            json.dump(updated_db, f, ensure_ascii=False, indent=2)

        print(f"\n✅ 已验证平台数据库已更新:")
        print(f"   文件: {data_path / filename}")
        print(f"   总数: {len(verified_platforms)} 个平台")
        print(f"   新增: {len(new_verified_platforms)} 个平台")
        print(f"   新增平台: {', '.join(new_verified_platforms)}")

def main():
    print("🔍 去重功能测试和新平台验证系统")
    print("🎯 目标: 确保去重功能正常工作 + 验证新平台")
    print("="*70)

    tester = TestDedupAndVerify()

    # 1. 测试去重功能
    verified_platforms = tester.test_deduplication()

    # 2. 获取新的候选平台
    new_candidates = tester.get_new_candidate_platforms(verified_platforms)

    if not new_candidates:
        print("❌ 没有找到新的候选平台")
        return

    # 3. 运行快速验证测试
    results = tester.run_quick_verification_test(new_candidates)

    # 4. 识别通过4项标准的平台
    qualified_platforms = []
    for result in results:
        if len(result['criteria_met']) == 4:  # 通过所有4项标准
            qualified_platforms.append(result['platform_name'])

    # 5. 显示结果
    print(f"\n📊 快速验证结果:")
    print(f"   验证平台总数: {len(results)} 个")
    print(f"   通过4项标准: {len(qualified_platforms)} 个")

    if qualified_platforms:
        print(f"\n🌟 通过4项标准的平台:")
        for platform in qualified_platforms:
            result = next(r for r in results if r['platform_name'] == platform)
            print(f"   🏆 {platform:<20} - {result['quick_score']}/100 {', '.join(result['criteria_met'])}")

    # 6. 更新已验证平台数据库
    tester.update_verified_platforms_database(qualified_platforms)

if __name__ == "__main__":
    main()