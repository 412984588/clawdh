#!/usr/bin/env python3
import requests
import json
import time
import re

class UltraMinimalAgent:
    """极端极简Agent - 只要Stripe Connect"""

    def __init__(self, name):
        self.name = name
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.cache_file = 'ultra_minimal_results.json'
        self.results = self.load_cache()

        # 极简平台列表 - 只要Stripe
        self.platforms = [
            ("Stripe", "stripe.com", "支付集成平台"),
            ("Stripe Connect", "connect.stripe.com", "支付平台"),
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
        return any(kw in content for kw in keywords)

    def _check_payment_reception(self, name, content):
        """检查支付接收"""
        keywords = ['receive payment', 'get paid', 'donation', 'tip', 'support', '收款', '打赏']
        return any(kw in content for kw in keywords)

    def _check_stripe_connect_only(self, name, domain, content):
        """极端极简：只要Stripe Connect"""
        if 'stripe' not in domain.lower():
            return False

        # 检查Connect指标
        connect_indicators = [
            'stripe connect', 'connect express', 'connect custom',
            'platform payments', 'marketplace payments', 'software payments'
        ]
        standard_indicators = [
            'stripe standard', 'standard account', 'individual account'
        ]

        has_connect = any(indicator in content for indicator in connect_indicators)
        has_standard = any(indicator in content for indicator in standard_indicators)

        # 优先检查Connect，无明确标识时假设为Connect
        return has_connect or not has_standard

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

        # 4项验证 - 极端极简版
        tests = [
            ("个人注册", self._check_personal_registration(name, content)),
            ("支付接收", self._check_payment_reception(name, content)),
            ("Stripe Connect", self._check_stripe_connect_only(name, domain, content)),
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
        """发现新平台"""
        # 过滤掉已经验证过的平台
        available_platforms = [p for p in self.platforms if p[0] not in already_validated]

        if not available_platforms:
            print(f"    🔍 {self.name}: 所有Stripe Connect平台已发现完毕")
            return []

        # 优先选择小型平台
        selected = available_platforms[:count]

        self.index += count

        print(f"    🔍 过滤结果: 总平台{len(self.platforms)}, 已验证{len(already_validated)}, 可用{len(available_platforms)}")
        print(f"    🎯 {self.name}: 发现 {len(selected)} 个Stripe Connect平台")

        return selected

# UltraMinimal验证Agent
class UltraMinimalValidator(UltraMinimalAgent):
    """极端极简验证Agent - 只要Stripe Connect"""
    pass

def run_ultra_minimal_system():
    """运行极端极简系统"""
    print("🎯 极端极简个人收款银行转账平台发现系统")
    print("核心原则: 只要Stripe Connect Express/Custom平台")
    print("=" * 80)

    scout = UltraMinimalAgent("Scout")
    validator = UltraMinimalValidator("Validator")
    validated_platforms = set()

    print("🚀 开始极端极简验证")
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
    run_ultra_minimal_system()