#!/usr/bin/env python3
import time
import random
import json
import os
import requests

class SimpleRealAgent:
    """简单真实的Agent - 直接访问网站验证"""

    def __init__(self, name):
        self.name = name
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def visit_website(self, url, max_retries=3):
        """访问网站获取真实信息"""
        retry_count = 0

        while retry_count < max_retries:
            try:
                print(f"    🌐 {self.name}: 访问 {url}")
                response = self.session.get(url, timeout=15)
                content = response.text.lower()
                print(f"    📄 {self.name}: 页面内容长度 {len(content)} 字符")
                return content
            except Exception as e:
                retry_count += 1
                print(f"    ⚠️ {self.name}: 第{retry_count}次访问失败 - {e}")

                if retry_count >= max_retries:
                    print(f"    ❌ {self.name}: 访问失败 - 已重试{max_retries}次")
                    return None

                # 等待后重试
                time.sleep(2 ** retry_count)  # 递增等待时间

        return None

class ScoutRealAgent(SimpleRealAgent):
    """Scout Agent - 真实发现平台"""
    def __init__(self):
        super().__init__("Scout")
        self.platforms = [
            ("PayPal", "paypal.com", "支付平台"),
            ("Patreon", "patreon.com", "创作者订阅平台"),
            ("Buy Me a Coffee", "buymeacoffee.com", "创作者打赏平台"),
            ("Stripe", "stripe.com", "支付集成平台"),
            ("GoFundMe", "gofundme.com", "个人众筹募捐平台"),
            ("Ko-fi", "ko-fi.com", "创作者打赏平台"),
            ("Venmo", "venmo.com", "个人支付平台"),
            ("Square", "squareup.com", "个人支付系统平台"),
            ("YouTube", "youtube.com", "视频创作者平台"),
            ("TikTok", "tiktok.com", "短视频创作者平台"),
            ("Substack", "substack.com", "创作者写作平台"),
            ("Medium", "medium.com", "创作者写作平台"),
            ("Ghost", "ghost.org", "博客写作平台"),
            ("Indiegogo", "indiegogo.com", "创意项目众筹平台"),
            ("Kickstarter", "kickstarter.com", "创意项目众筹平台"),
            ("Eventbrite", "eventbrite.com", "活动票务平台"),
            ("Teachable", "teachable.com", "在线课程教育平台"),
            ("Thinkific", "thinkific.com", "在线课程教育平台"),
            ("Kajabi", "kajabi.com", "知识付费教育平台"),
            ("LearnWorlds", "learnworlds.com", "知识付费教育平台"),
            ("Podia", "podia.com", "在线课程教育平台"),
            ("Gumroad", "gumroad.com", "数字产品销售平台"),
            ("Etsy", "etsy.com", "手工制品销售平台"),
            ("Shopify", "shopify.com", "电商建站平台"),
            ("BigCommerce", "bigcommerce.com", "电商平台"),
            ("WooCommerce", "woocommerce.com", "电商平台"),
            ("Bandcamp", "bandcamp.com", "音乐人销售平台"),
            ("Twitch", "twitch.com", "游戏直播平台"),
            ("Instagram", "instagram.com", "社交电商平台"),
            ("Facebook", "facebook.com", "社交支付平台"),
            ("Twitter", "twitter.com", "社交平台"),
            ("LinkedIn", "linkedin.com", "职业社交平台"),
            ("Discord", "discord.com", "社区平台"),
            ("Mighty Networks", "mightynetworks.com", "社区平台"),
            ("Circle", "circle.so", "社区平台"),
            ("Memberful", "memberful.com", "会员订阅平台"),
            ("DeviantArt", "deviantart.com", "创作者艺术平台"),
            ("Redbubble", "redbubble.com", "创作者艺术品平台"),
            ("Society6", "society6.com", "创作者艺术品平台"),
            ("Zazzle", "zazzle.com", "创作者定制产品平台"),
            ("Cafepress", "cafepress.com", "创作者定制产品平台"),
            ("Printful", "printful.com", "按需打印平台"),
            ("Printify", "printify.com", "按需打印平台"),
            ("Spring", "spring.com", "创作者定制平台"),
            ("Teespring", "teespring.com", "创作者服装平台"),
            ("Represent", "represent.com", "创作者服装平台"),
            ("4Fund", "4fund.com", "众筹募捐平台"),
            ("Fundly", "fundly.com", "个人众筹募捐平台"),
            ("YouCaring", "youcaring.com", "个人众筹募捐平台"),
            ("Crowdfunder", "crowdfunder.co.uk", "众筹募捐平台"),
            ("GoGetFunding", "gogetfunding.com", "个人众筹募捐平台"),
            ("FundRazr", "fundrazr.com", "社交众筹平台"),
            ("Plumfund", "plumfund.com", "个人募捐平台"),
            ("JustGiving", "justgiving.com", "慈善募捐平台"),
            ("Classy", "classy.org", "非营利募捐平台"),
            ("Network for Good", "networkforgood.com", "慈善募捐平台"),
            ("Donorbox", "donorbox.com", "非营利募捐平台"),
            ("Seedrs", "seedrs.com", "股权众筹平台"),
            ("Crowdcube", "crowdcube.com", "股权众筹平台"),
            ("AngelList", "angel.co", "投资平台"),
            ("Wefunder", "wefunder.com", "股权众筹平台"),
            ("Republic", "republic.co", "股权众筹平台"),
            ("StartEngine", "startengine.com", "股权众筹平台"),
            ("SeedInvest", "seedinvest.com", "股权众筹平台"),
            ("Microventures", "microventures.com", "股权众筹平台"),
            ("Fundable", "fundable.com", "商业众筹平台"),
            ("Crowd Supply", "crowdsupply.com", "硬件众筹平台"),
            ("Ulule", "ulule.com", "创意众筹平台"),
            ("KissKissBankBank", "kisskissbankbank.com", "创意众筹平台"),
            ("Pledgemusic", "pledgemusic.com", "音乐众筹平台"),
            ("OpenSea", "opensea.io", "NFT交易平台"),
            ("Figma", "figma.com", "设计工具平台"),
            ("Canva", "canva.com", "设计工具平台"),
            ("Adobe", "adobe.com", "设计素材平台"),
            ("Upwork", "upwork.com", "自由职业平台"),
            ("Fiverr", "fiverr.com", "自由职业平台"),
            ("AWS", "aws.amazon.com", "云服务平台"),
            ("DigitalOcean", "digitalocean.com", "云服务平台"),
            ("GitHub", "github.com", "开发者平台")
        ]
        self.discovered_names = set()  # 记录已发现的平台名称
        self.index = 0

    def discover_platforms(self, count=3, already_validated=set()):
        """发现新平台"""
        # 过滤掉已经验证过的平台
        available_platforms = [p for p in self.platforms if p[0] not in already_validated and p[0] not in self.discovered_names]

        if not available_platforms:
            print(f"    🔍 {self.name}: 所有平台已发现完毕")
            return []

        selected = available_platforms[:count]

        # 记录已发现的平台
        for platform in selected:
            self.discovered_names.add(platform[0])

        self.index += count

        print(f"    🔍 过滤结果: 总平台{len(self.all_platforms)}, 已验证{len(already_validated)}, 已发现{len(self.discovered_names)}, 可用{len(available_platforms)}")
        print(f"    🎯 {self.name}: 发现 {len(selected)} 个新平台")
        return selected

class ValidatorRealAgent(SimpleRealAgent):
    """Validator Agent - 真实验证4项标准"""
    def __init__(self):
        super().__init__("Validator")
        self.cache_file = "real_validation_results.json"
        self.results = self._load_results()

    def _load_results(self):
        """加载验证结果"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}

    def _save_results(self):
        """保存验证结果"""
        with open(self.cache_file, 'w') as f:
            json.dump(self.results, f, indent=2)

    def _check_personal_registration(self, name, content):
        """检查个人注册"""
        keywords = ['sign up', 'create account', 'register', 'join', '个人注册', '创建账户']

        # 特殊检查：非营利组织也可注册
        nonprofit_keywords = ['nonprofit', 'charity', 'organization', 'ein', '501(c)(3)', 'tax exempt']
        has_nonprofit_support = any(kw in content for kw in nonprofit_keywords)

        return any(kw in content for kw in keywords) or has_nonprofit_support

    def _check_payment_reception(self, name, content):
        """检查支付接收"""
        keywords = ['receive payment', 'get paid', 'donation', 'tip', 'support', '收款', '打赏']
        return any(kw in content for kw in keywords)

    def _check_own_payment_system(self, name, domain, content):
        """检查自有支付系统"""
        content_lower = content.lower()

        # 检查是否为Stripe平台
        if 'stripe' in domain.lower():
            # 验证是否为Stripe Connect Express/Custom，避免Stripe Standard
            connect_indicators = [
                'stripe connect', 'connect express', 'connect custom',
                'platform payments', 'marketplace payments', 'software payments'
            ]
            standard_indicators = [
                'stripe standard', 'standard account', 'individual account'
            ]

            has_connect = any(indicator in content_lower for indicator in connect_indicators)
            has_standard = any(indicator in content_lower for indicator in standard_indicators)

            # 优先检查Connect，如果没有明确标识则假设为Connect
            return has_connect or not has_standard

        # 只支持Stripe Connect平台
        payment_brands = [
            'stripe'  # 仅接受Stripe Connect Express/Custom
        ]

        # PayPal特殊处理 - 直接通过第3项
        if domain.lower() in paypal_direct_pass:
            return True

        # 支付平台特殊处理 - 直接通过第3项
        if domain.lower() in payment_direct_pass:
            return True

        # 只接受Stripe Connect平台 - 其他全部排除
        return domain.lower() == 'stripe.com'  # 只有Stripe域名才通过

    def _check_usa_ach_support(self, name, content):
        """检查美国/ACH支持"""
        usa_keywords = ['usa', 'united states', 'usd', '$', '美国', '美元']
        ach_keywords = ['ach', 'bank transfer', 'direct deposit', 'routing number']
        return any(kw in content for kw in usa_keywords + ach_keywords)

    def validate_platform(self, name, domain, platform_type):
        """验证一个平台"""
        if name in self.results:
            result = self.results[name]
            print(f"    ⏭️ {self.name}: {name} 已验证 - {result['summary']}")
            return result

        print(f"    🔍 {self.name}: 开始验证 {name}")

        # 访问网站
        content = self.visit_website(f"https://{domain}")
        if not content:
            return None

        # 4项验证
        tests = [
            ("个人注册", self._check_personal_registration(name, content)),
            ("支付接收", self._check_payment_reception(name, content)),
            ("自有支付系统", self._check_own_payment_system(name, domain, content)),
            ("美国/ACH支持", self._check_usa_ach_support(name, content))
        ]

        results = []
        passed = 0
        for test_name, test_result in tests:
            status = "✅ 通过" if test_result else "❌ 不通过"
            print(f"      {test_name}: {status}")
            results.append(f"{test_name}: {status}")
            if test_result:
                passed += 1

        summary = f"{passed}/4项通过"
        overall = passed == 4

        result = {
            'name': name,
            'domain': domain,
            'type': platform_type,
            'summary': summary,
            'overall': overall,
            'details': results
        }

        # 保存结果
        self.results[name] = result
        self._save_results()

        print(f"    📊 {self.name}: {name} 验证完成 - {summary}")
        return result

def run_simple_real_agents():
    """运行简单真实的agents"""
    print("🚀 简单真实Agents启动")
    print("🎯 Scout发现 → Validator真实验证")
    print("=" * 50)

    scout = ScoutRealAgent()
    validator = ValidatorRealAgent()

    cycle = 0
    try:
        while cycle < 50:
            cycle += 1
            print(f"\n🔄 第{cycle}轮")
            print("-" * 30)

            # Scout发现平台
            platforms = scout.discover_platforms(3, validator.results.keys())
            if not platforms:
                print("    🔍 所有平台已验证完毕")
                break

            print(f"  📡 Scout发现:")
            for name, domain, ptype in platforms:
                print(f"    📍 {name} ({domain}) - {ptype}")

            # Validator验证平台
            print(f"\n  ✅ Validator验证:")
            passed_count = 0
            for name, domain, ptype in platforms:
                result = validator.validate_platform(name, domain, ptype)
                if result and result['overall']:
                    passed_count += 1

            print(f"\n📈 第{cycle}轮总结:")
            print(f"  ✅ 验证通过: {passed_count}/{len(platforms)} 个平台")

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n⏹️ Agents停止")

    print(f"\n🏆 最终统计:")
    passed_platforms = [p for p in validator.results.values() if p['overall']]
    print(f"  🎯 总计通过: {len(passed_platforms)} 个平台")

    for platform in passed_platforms:
        print(f"    🏆 {platform['name']} - {platform['summary']}")

if __name__ == "__main__":
    run_simple_real_agents()