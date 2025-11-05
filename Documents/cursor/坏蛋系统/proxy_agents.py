#!/usr/bin/env python3
import requests
import json
import time
import random
import re

class ProxyEnabledAgent:
    """支持代理的Agent"""

    def __init__(self, name):
        self.name = name
        self.cache_file = 'proxy_results.json'
        self.results = self.load_cache()

        # 加载代理列表
        self.proxies = self.load_github_proxies()
        self.current_proxy_index = 0

        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

        # 极简平台列表
        self.platforms = [
            ("Stripe", "stripe.com", "支付集成平台"),
            ("Shopify", "shopify.com", "电商建站平台"),
            ("BigCommerce", "bigcommerce.com", "电商平台"),
            ("WooCommerce", "woocommerce.com", "电商平台"),
            ("Kajabi", "kajabi.com", "知识付费教育平台"),
            ("Patreon", "patreon.com", "创作者订阅平台"),
            ("Substack", "substack.com", "创作者写作平台"),
            ("Teachable", "teachable.com", "在线课程教育平台"),
            ("Gumroad", "gumroad.com", "数字产品销售平台"),
        ]
        self.index = 0

    def load_github_proxies(self):
        """从GitHub加载免费代理列表"""
        try:
            print("🔄 从GitHub加载代理列表...")
            response = requests.get(
                "https://github.com/proxifly/free-proxy-list/raw/main/proxies/https.txt",
                timeout=30
            )

            if response.status_code == 200:
                proxy_text = response.text.strip()
                proxies = []

                for line in proxy_text.split('\n'):
                    line = line.strip()
                    if line and not line.startswith('#'):
                        # 解析代理格式：ip:port
                        if ':' in line:
                            proxies.append({
                                'http': f'http://{line}',
                                'https': f'http://{line}',
                                'ip_port': line
                            })

                print(f"✅ 成功加载 {len(proxies)} 个代理")
                return proxies
            else:
                print(f"❌ 代理列表加载失败，状态码: {response.status_code}")
                return []

        except Exception as e:
            print(f"❌ 加载代理列表失败: {e}")
            return []

    def get_random_proxy(self):
        """获取随机代理"""
        if not self.proxies:
            return None

        proxy = random.choice(self.proxies)
        print(f"🌐 使用代理: {proxy['ip_port']}")
        return proxy

    def visit_website_with_proxy(self, url, max_retries=3):
        """使用代理访问网站"""
        retry_count = 0

        while retry_count < max_retries:
            proxy = self.get_random_proxy()

            try:
                print(f"    🌐 {self.name}: 通过代理 {proxy['ip_port']} 访问 {url}")

                proxies_to_use = {
                    'http': proxy['http'],
                    'https': proxy['https']
                }

                response = self.session.get(
                    url,
                    timeout=15,
                    proxies=proxies_to_use
                )

                content = response.text.lower()
                print(f"    📄 {self.name}: 页面内容长度 {len(content)} 字符")
                return content

            except Exception as e:
                retry_count += 1
                print(f"    ⚠️ {self.name}: 第{retry_count}次代理访问失败 - {e}")

                if retry_count >= max_retries:
                    print(f"    ❌ {self.name}: 代理访问失败 - 已重试{max_retries}次")
                    return None

                # 等待后重试
                time.sleep(2 ** retry_count)

        return None

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

    def _check_personal_registration(self, name, content):
        """检查个人注册"""
        keywords = ['sign up', 'create account', 'register', 'join', '个人注册', '创建账户']
        return any(kw in content for kw in keywords)

    def _check_payment_reception(self, name, content):
        """检查支付接收"""
        keywords = ['receive payment', 'get paid', 'donation', 'tip', 'support', '收款', '打赏']
        return any(kw in content for kw in keywords)

    def _check_stripe_connect_integration(self, name, domain, content):
        """检测任何域名的Stripe Connect集成"""
        connect_indicators = [
            'stripe connect', 'connect express', 'connect custom',
            'platform payments', 'marketplace payments', 'software payments',
            'stripe.com/connect', 'connect.stripe.com', 'stripe payments',
            'powered by stripe', 'stripe api', 'stripe integration',
            'stripe checkout', 'stripe elements', 'stripe terminal',
            'stripe for platforms', 'stripe for marketplaces',
            'stripe for saas', 'stripe for software', 'stripe for business'
        ]

        standard_indicators = [
            'stripe standard', 'standard account', 'individual account',
            'personal stripe account', 'standard stripe integration',
            'create stripe account'
        ]

        has_connect = any(indicator in content for indicator in connect_indicators)
        has_standard = any(indicator in content for indicator in standard_indicators)

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

        # 使用代理访问网站
        content = self.visit_website_with_proxy(f"https://{domain}")
        if not content:
            return None

        # 4项验证
        tests = [
            ("个人注册", self._check_personal_registration(name, content)),
            ("支付接收", self._check_payment_reception(name, content)),
            ("Stripe Connect", self._check_stripe_connect_integration(name, domain, content)),
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
            print(f"    🔍 {self.name}: 所有平台已发现完毕")
            return []

        selected = available_platforms[:count]

        self.index += count

        print(f"    🔍 过滤结果: 总平台{len(self.platforms)}, 已验证{len(already_validated)}, 可用{len(available_platforms)}")
        print(f"    🎯 {self.name}: 发现 {len(selected)} 个新平台")

        return selected

# 代理版验证Agent
class ProxyValidator(ProxyEnabledAgent):
    """代理版验证Agent"""
    pass

def run_proxy_system():
    """运行代理版系统"""
    print("🌐 GitHub代理版个人收款银行转账平台发现系统")
    print("代理来源: https://github.com/proxifly/free-proxy-list")
    print("=" * 80)

    scout = ProxyEnabledAgent("Scout")
    validator = ProxyValidator("Validator")
    validated_platforms = set()

    print("🚀 开始代理版验证")
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

        # 休息一下避免太频繁
        time.sleep(2)

if __name__ == "__main__":
    run_proxy_system()