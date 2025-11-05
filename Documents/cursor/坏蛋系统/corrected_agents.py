#!/usr/bin/env python3
import requests
import json
import time
import re

class CorrectedAgent:
    """修正版Agent - 任何域名的Stripe Connect平台"""

    def __init__(self, name):
        self.name = name
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.cache_file = 'corrected_results.json'
        self.results = self.load_cache()

        # 修正版平台列表 - 任何域名只要集成了Stripe Connect就算
        self.platforms = [
            ("Shopify", "shopify.com", "电商建站平台"),      # 集成Stripe Connect
            ("BigCommerce", "bigcommerce.com", "电商平台"),      # 集成Stripe Connect
            ("Stripe", "stripe.com", "支付集成平台"),        # Stripe官网
            ("WooCommerce", "woocommerce.com", "电商平台"),      # 支持Stripe Connect
            ("Squarespace", "squarespace.com", "建站平台"),     # 集成Stripe Connect
            ("Wix", "wix.com", "建站平台"),               # 集成Stripe Connect
            ("Kajabi", "kajabi.com", "知识付费教育平台"),      # 集成Stripe Connect
            ("Teachable", "teachable.com", "在线课程教育平台"),    # 集成Stripe Connect
            ("Patreon", "patreon.com", "创作者订阅平台"),      # 集成Stripe Connect
            ("Substack", "substack.com", "创作者写作平台"),      # 集成Stripe Connect
            # 可以添加更多使用Stripe Connect的平台
        ]
        self.index = 0

    def load_cache(self):
        """加载缓存"""
        try:
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        except:
            return {}

    def save_cache(self):
        """保存缓存"""
        with open(self.cache_file, 'w') as f:
            json.dump(self.results, f, indent=2)

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
                time.sleep(2 ** retry_count)

        return None

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

    def _check_stripe_connect_integration(self, name, domain, content):
        """修正版：检测任何域名的Stripe Connect集成"""
        # 关键：不检查域名，只检查页面内容中的Stripe Connect集成

        # 检查Stripe Connect集成指标（不限域名）
        connect_indicators = [
            'stripe connect', 'connect express', 'connect custom',
            'platform payments', 'marketplace payments', 'software payments',
            'stripe.com/connect', 'connect.stripe.com', 'stripe payments',
            'powered by stripe', 'stripe api', 'stripe integration',
            'stripe checkout', 'stripe elements', 'stripe terminal',
            'stripe for platforms', 'stripe for marketplaces',
            'stripe for saas', 'stripe for software', 'stripe for business'
        ]

        # 排除Stripe Standard指标
        standard_indicators = [
            'stripe standard', 'standard account', 'individual account',
            'personal stripe account', 'standard stripe integration',
            'create stripe account'  # 个人创建Stripe账户的页面
        ]

        has_connect = any(indicator in content for indicator in connect_indicators)
        has_standard = any(indicator in content for indicator in standard_indicators)

        # 关键逻辑：有Connect集成且非Standard就算通过
        result = has_connect and not has_standard
        print(f"      💳 Stripe Connect检测: 集成={has_connect}, Standard={has_standard}, 通过={result}")

        return result

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
            ("Stripe Connect集成", self._check_stripe_connect_integration(name, domain, content)),
            ("美国/ACH支持", self._check_usa_ach_support(name, content))
        ]

        results = []
        passed = 0
        for test_name, test_result in tests:
            status = "✅ 通过" if test_result else "❌ 不通过"
            results.append(f"{test_name}: {status}")
            if test_result:
                passed += 1
            print(f"      {test_name}: {status}")

        overall = passed == 4
        summary = f"{passed}/4项通过"

        result = {
            'name': name,
            'domain': domain,
            'platform_type': platform_type,
            'overall': overall,
            'passed_tests': passed,
            'summary': summary,
            'details': results
        }

        self.results[name] = result
        self.save_cache()

        print(f"    📊 {self.name}: {name} 验证完成 - {summary}")
        return result

    def discover_platforms(self, count=3, already_validated=set()):
        """发现新平台 - 修正版"""
        # 过滤掉已经验证过的平台
        available_platforms = [p for p in self.platforms if p[0] not in already_validated]

        if not available_platforms:
            print(f"    🔍 {self.name}: 所有Stripe Connect平台已发现完毕")
            return []

        # 智能排序：优先选择已知集成Stripe的平台
        priority_platforms = sorted(available_platforms, key=lambda x: x[0])  # 简单字母排序

        selected = priority_platforms[:count]

        self.index += count

        print(f"    🔍 过滤结果: 总平台{len(self.platforms)}, 已验证{len(already_validated)}, 可用{len(available_platforms)}")
        print(f"    🎯 {self.name}: 发现 {len(selected)} 个可能集成Stripe的平台")

        return selected

# 修正版验证Agent
class CorrectedValidator(CorrectedAgent):
    """修正版验证Agent - 检测任何域名的Stripe Connect集成"""
    pass

def run_corrected_system():
    """运行修正版系统"""
    print("🎯 修正版个人收款银行转账平台发现系统")
    print("修正策略: 检测任何域名的Stripe Connect集成")
    print("=" * 80)

    scout = CorrectedAgent("Scout")
    validator = CorrectedValidator("Validator")
    validated_platforms = set()

    print("🚀 开始修正版验证")
    print("=" * 80)

    round_count = 0
    while True:
        round_count += 1
        print(f"\n🔄 第{round_count}轮")
        print("-" * 60)

        # Scout发现
        platforms = scout.discover_platforms(count=3, already_validated=validated_platforms)

        if not platforms:
            print(f"🔍 Scout: 所有Stripe Connect平台已发现完毕")
            break

        print(f"  📡 Scout发现:")
        for name, domain, ptype in platforms:
            print(f"    📍 {name} ({domain}) - {ptype}")

        # Validator验证
        print(f"  ✅ Validator验证:")
        for name, domain, ptype in platforms:
            result = validator.validate_platform(name, domain, ptype)
            if result and result['overall']:
                validated_platforms.add(name)

        # 轮次总结
        passed_count = len([p for p in platforms if validator.validate_platform(p[0], p[1], p[2]) and validator.validate_platform(p[0], p[1], p[2])['overall']])
        print(f"\n📈 第{round_count}轮总结:")
        print(f"  ✅ 验证通过: {passed_count}/{len(platforms)} 个平台")

if __name__ == "__main__":
    run_corrected_system()