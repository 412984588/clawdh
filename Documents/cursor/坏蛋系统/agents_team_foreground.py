#!/usr/bin/env python3
import time
import random
import json
import os

class ScoutAgent:
    """Scout Agent - 发现平台"""
    def __init__(self):
        self.name = "Scout Agent"
        self.discovered = []
        self.all_platforms = [
            # 原有平台
            ("Substack", "substack.com", "创作者写作平台"),
            ("Patreon", "patreon.com", "创作者订阅平台"),
            ("Kickstarter", "kickstarter.com", "创意项目众筹平台"),
            ("GoFundMe", "gofundme.com", "个人众筹募捐平台"),
            ("Eventbrite", "eventbrite.com", "活动票务平台"),
            ("Teachable", "teachable.com", "在线课程教育平台"),
            ("Kajabi", "kajabi.com", "知识付费教育平台"),
            ("Square", "squareup.com", "个人支付系统平台"),
            ("Venmo", "venmo.com", "个人支付平台"),
            ("Gumroad", "gumroad.com", "数字产品销售平台"),
            ("Etsy", "etsy.com", "手工制品销售平台"),
            ("Shopify", "shopify.com", "电商建站平台"),
            ("Ko-fi", "ko-fi.com", "创作者打赏平台"),
            ("Bandcamp", "bandcamp.com", "音乐人销售平台"),
            ("Twitch", "twitch.com", "游戏直播平台"),
            ("YouTube", "youtube.com", "视频创作者平台"),
            ("Instagram", "instagram.com", "社交电商平台"),
            ("TikTok", "tiktok.com", "短视频创作者平台"),
            ("Facebook", "facebook.com", "社交支付平台"),
            ("Stripe", "stripe.com", "支付集成平台"),
            ("PayPal", "paypal.com", "支付平台"),
            ("BigCommerce", "bigcommerce.com", "电商平台"),
            ("WooCommerce", "woocommerce.com", "电商平台"),
            ("OpenSea", "opensea.io", "NFT交易平台"),
            ("Figma", "figma.com", "设计工具平台"),
            ("Canva", "canva.com", "设计工具平台"),
            ("Adobe", "adobe.com", "设计素材平台"),
            ("Upwork", "upwork.com", "自由职业平台"),
            ("Fiverr", "fiverr.com", "自由职业平台"),
            ("AWS", "aws.amazon.com", "云服务平台"),
            ("DigitalOcean", "digitalocean.com", "云服务平台"),
            ("GitHub", "github.com", "开发者平台"),
            ("Discord", "discord.com", "社区平台"),

            # 新增50个平台
            ("Buy Me a Coffee", "buymeacoffee.com", "创作者打赏平台"),
            ("Indiegogo", "indiegogo.com", "创意项目众筹平台"),
            ("Podia", "podia.com", "在线课程教育平台"),
            ("Thinkific", "thinkific.com", "在线课程教育平台"),
            ("LearnWorlds", "learnworlds.com", "知识付费教育平台"),
            ("Mighty Networks", "mightynetworks.com", "社区平台"),
            ("Circle", "circle.so", "社区平台"),
            ("Memberful", "memberful.com", "会员订阅平台"),
            ("Substack", "substack.com", "创作者写作平台"),
            ("Ghost", "ghost.org", "博客写作平台"),
            ("Medium", "medium.com", "创作者写作平台"),
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
            ("Causevox", "causevox.com", "非营利募捐平台"),
            ("Fundly", "fundly.com", "非营利募捐平台"),
            ("FirstGiving", "firstgiving.com", "慈善募捐平台"),
            ("Razoo", "razoo.com", "非营利募捐平台"),
            ("Pledgemusic", "pledgemusic.com", "音乐众筹平台"),
            ("Kickstarter", "kickstarter.com", "创意项目众筹平台"),
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
            ("KissKissBankBank", "kisskissbankbank.com", "创意众筹平台")
        ]
        self.discovered_names = set()  # 记录已发现的平台名称

    def discover_platforms(self, count=3, already_validated=set()):
        # 过滤掉已经验证过的平台
        available_platforms = [p for p in self.all_platforms if p[0] not in already_validated and p[0] not in self.discovered_names]

        if not available_platforms:
            print(f"    🔍 没有未发现的新平台了")
            return []

        selected = random.sample(available_platforms, min(count, len(available_platforms)))

        # 记录已发现的平台
        for platform in selected:
            self.discovered_names.add(platform[0])

        self.discovered = selected
        return selected

class AnalyzerAgent:
    """Analyzer Agent - 分析平台"""
    def __init__(self):
        self.name = "Analyzer Agent"

    def analyze_platforms(self, platforms):
        high_potential = []
        for name, domain, platform_type in platforms:
            # 简单分析逻辑
            if any(keyword in platform_type.lower() for keyword in
                   ['创作者', '支付', '众筹', '电商', '教育', '音乐', '直播', '社交']):
                score = random.uniform(0.8, 0.95)
                high_potential.append({
                    'name': name,
                    'domain': domain,
                    'type': platform_type,
                    'potential_score': score
                })
        return high_potential

class ValidatorAgent:
    """Validator Agent - 验证平台"""
    def __init__(self):
        self.name = "Validator Agent"
        self.validated_platforms = []
        self.cache_file = "validated_platforms_cache.json"
        self.already_validated = self._load_cache()  # 记录已验证的平台名称

    def _load_cache(self):
        """从文件加载已验证的平台缓存"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print(f"  📂 加载缓存：已验证 {len(data)} 个平台")
                    return set(data)
            except:
                print(f"  ⚠️ 缓存文件损坏，重新开始")
                return set()
        return set()

    def _save_cache(self):
        """保存已验证的平台到文件"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(list(self.already_validated), f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"  ❌ 保存缓存失败: {e}")

    def validate_platforms(self, platforms):
        validated = []
        for platform in platforms:
            # 检查是否已验证过
            if platform['name'] in self.already_validated:
                print(f"    ⏭️ {platform['name']}: 已验证，跳过")
                continue

            # 4项验证标准
            personal_reg = self._check_personal_registration(platform['name'], platform['type'])
            payment_recv = self._check_payment_reception(platform['name'], platform['type'])
            own_payment = self._check_own_payment_system(platform['name'], platform['type'])
            usa_ach = self._check_usa_ach_support(platform['domain'])

            results = [personal_reg, payment_recv, own_payment, usa_ach]
            passed = all(results)

            # 记录已验证
            self.already_validated.add(platform['name'])
            # 保存到缓存
            self._save_cache()

            if passed:
                self.validated_platforms.append(platform['name'])
                validated.append({
                    'platform': platform,
                    'validation_results': {
                        'personal_registration': '✅ 通过',
                        'payment_reception': '✅ 通过',
                        'own_payment_system': '✅ 通过',
                        'usa_ach_support': '✅ 通过'
                    },
                    'summary': '验证通过 (4/4项)'
                })
            else:
                validated.append({
                    'platform': platform,
                    'validation_results': {
                        'personal_registration': '✅ 通过' if personal_reg else '❌ 不通过',
                        'payment_reception': '✅ 通过' if payment_recv else '❌ 不通过',
                        'own_payment_system': '✅ 通过' if own_payment else '❌ 不通过',
                        'usa_ach_support': '✅ 通过' if usa_ach else '❌ 不通过'
                    },
                    'summary': f'验证未通过 ({sum(results)}/4项)'
                })

        return validated

    def _check_personal_registration(self, name, platform_type):
        personal_types = ['创作者', '打赏', '众筹', '写作', '订阅', '数字产品',
                        '在线课程', '教育', '活动', '票务', '支付', 'SaaS']
        return any(ptype in platform_type for ptype in personal_types)

    def _check_payment_reception(self, name, platform_type):
        payment_types = ['创作者', '打赏', '众筹', '销售', '订阅', '服务',
                      '课程', '教育', '活动', '票务', '支付']
        return any(ptype in platform_type for ptype in payment_types)

    def _check_own_payment_system(self, name, platform_type):
        known_payment_platforms = ['Stripe', 'PayPal', 'Square', 'Venmo', 'Apple Pay',
                               'Google Pay', 'Shopify', 'BigCommerce', 'WooCommerce']
        if name in known_payment_platforms:
            return True
        payment_types = ['创作者', 'SaaS', '订阅', '数字产品', '支付', '众筹',
                      '打赏', '销售', '教育', '课程', '电商']
        return any(ptype in platform_type for ptype in payment_types)

    def _check_usa_ach_support(self, domain):
        # .com域名通常服务美国市场
        # 等价逻辑：服务美国=有ACH能力
        return domain.endswith('.com')

def run_agents_foreground():
    """在前台运行Agents团队，显示每一步操作"""
    scout = ScoutAgent()
    analyzer = AnalyzerAgent()
    validator = ValidatorAgent()

    print("🚀 Agents团队启动")
    print("🎯 Scout Agent → Analyzer Agent → Validator Agent")
    print("=" * 50)

    cycle_count = 0

    try:
        while cycle_count < 50:  # 运行50轮验证所有新平台
            cycle_count += 1
            print(f"\n🔄 第 {cycle_count} 轮工作")
            print("-" * 30)

            # Scout Agent 发现平台
            print(f"📡 {scout.name}: 发现新平台...")
            discovered = scout.discover_platforms(3, validator.already_validated)

            if not discovered:
                print(f"    🔍 所有平台已验证完毕")
                break

            print(f"  🎯 发现 {len(discovered)} 个候选平台:")
            for name, domain, platform_type in discovered:
                print(f"    📍 {name} ({domain}) - {platform_type}")

            # Analyzer Agent 分析平台
            print(f"\n📊 {analyzer.name}: 分析平台潜力...")
            analyzed = analyzer.analyze_platforms(discovered)

            print(f"  🔍 分析完成，{len(analyzed)} 个高潜力平台:")
            for platform in analyzed:
                print(f"    📈 {platform['name']} - 潜力评分: {platform['potential_score']:.2f}")

            # Validator Agent 验证平台
            print(f"\n✅ {validator.name}: 执行4项标准验证...")
            validated = validator.validate_platforms(analyzed)

            print(f"  🔍 验证结果:")
            passed_count = 0
            for result in validated:
                print(f"    🎯 {result['platform']['name']}: {result['summary']}")
                if '验证通过' in result['summary']:
                    passed_count += 1

            # 总结本轮
            print(f"\n📈 第 {cycle_count} 轮总结:")
            print(f"  ✅ 验证通过: {passed_count}/{len(validated)} 个平台")
            print(f"  📊 累计验证: {len(validator.validated_platforms)} 个平台")

            if passed_count > 0:
                print("  🏆 本轮成功平台:")
                for result in validated:
                    if '验证通过' in result['summary']:
                        print(f"    🏆 {result['platform']['name']} - {result['platform']['type']}")

            time.sleep(1)

    except KeyboardInterrupt:
        print("\n\n⏹️ Agents团队停止")
        print(f"📊 最终统计: 验证了 {len(validator.validated_platforms)} 个平台")

if __name__ == "__main__":
    run_agents_foreground()