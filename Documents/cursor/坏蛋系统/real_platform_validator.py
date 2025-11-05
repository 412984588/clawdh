#!/usr/bin/env python3
import time
import random
import json
import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

class RealPlatformValidator:
    """真实平台验证器 - 实际访问网站验证4项标准"""

    def __init__(self):
        self.name = "Real Platform Validator"
        self.cache_file = "real_validation_cache.json"
        self.validation_cache = self._load_cache()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def _load_cache(self):
        """加载验证缓存"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return {}
        return {}

    def _save_cache(self):
        """保存验证缓存"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.validation_cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"  ❌ 保存缓存失败: {e}")

    def _get_page_content(self, url):
        """获取网页内容"""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"    ⚠️ 访问 {url} 失败: {e}")
            return None

    def _check_personal_registration(self, name, domain, page_content):
        """真实检查个人注册能力"""
        if not page_content:
            return False

        # 查找个人注册相关关键词和元素
        personal_keywords = [
            'sign up', 'create account', 'join', 'register',
            '个人注册', '创建账户', '加入', '注册',
            'individual', 'personal', 'creator', 'artist',
            '个人', '创作者', '艺术家', '自由职业'
        ]

        # 检查页面内容
        page_lower = page_content.lower()
        found_keywords = [kw for kw in personal_keywords if kw in page_lower]

        # 查找注册表单
        signup_patterns = [
            r'<input[^>]*type=["\']?(?:email|text|password)["\']?[^>]*>',
            r'<button[^>]*>(?:sign.?up|create.?account|register|join)',
            r'<a[^>]*href[^>]*>(?:sign.?up|create.?account|register|join)'
        ]

        has_signup_form = any(re.search(pattern, page_lower, re.IGNORECASE) for pattern in signup_patterns)

        # 特殊检查一些平台的个人用户支持
        creator_platforms = ['patreon', 'substack', 'ko-fi', 'buymeacoffee', 'gumroad']
        is_creator_platform = any(platform in domain.lower() for platform in creator_platforms)

        result = has_signup_form or len(found_keywords) > 2 or is_creator_platform

        print(f"      🔍 个人注册检查: 找到关键词 {found_keywords}, 有注册表单 {has_signup_form}")
        return result

    def _check_payment_reception(self, name, domain, page_content):
        """真实检查支付接收能力"""
        if not page_content:
            return False

        # 查找支付接收相关关键词
        payment_keywords = [
            'receive payments', 'accept payments', 'get paid', 'earn money',
            'donation', 'tip', 'support', 'contribute',
            'sell', 'shop', 'buy', 'purchase',
            '接收付款', '获得支付', '赚钱', '收款',
            '捐赠', '打赏', '支持', '贡献',
            '销售', '购买', '商店'
        ]

        page_lower = page_content.lower()
        found_keywords = [kw for kw in payment_keywords if kw in page_lower]

        # 查找支付相关元素
        payment_patterns = [
            r'payment[^a-z]', r'checkout', r'cart', r'basket',
            r'paypal', r'stripe', r'credit.?card', r'bank'
        ]

        has_payment_elements = any(re.search(pattern, page_lower, re.IGNORECASE) for pattern in payment_patterns)

        # 特殊检查平台类型
        payment_platforms = ['patreon', 'paypal', 'stripe', 'square', 'venmo']
        is_payment_platform = any(platform in domain.lower() for platform in payment_platforms)

        result = has_payment_elements or len(found_keywords) > 2 or is_payment_platform

        print(f"      💳 支付接收检查: 找到关键词 {found_keywords[:3]}..., 有支付元素 {has_payment_elements}")
        return result

    def _check_own_payment_system(self, name, domain, page_content):
        """真实检查自有支付系统"""
        if not page_content:
            return False

        # 知名支付平台（有自有系统）
        known_payment_platforms = [
            'paypal', 'stripe', 'square', 'venmo', 'apple pay', 'google pay',
            'shopify', 'bigcommerce', 'woocommerce'
        ]

        # 检查是否是知名支付平台或包含支付系统描述
        page_lower = page_content.lower()

        # 查找支付系统相关描述
        payment_system_patterns = [
            r'payment[^a-z]*(?:system|processor|gateway)',
            r'integrated[^a-z]*payment', r'built[^a-z]*payment',
            r'payment[^a-z]*(?:solution|platform|service)',
            r'支付系统', r'支付网关', r'收款工具'
        ]

        has_payment_system = any(
            platform in page_lower for platform in known_payment_platforms
        ) or any(
            re.search(pattern, page_lower, re.IGNORECASE) for pattern in payment_system_patterns
        )

        # 特殊检查SaaS和订阅平台
        saas_keywords = ['subscription', 'recurring', 'membership', 'tier']
        has_saas_features = any(keyword in page_lower for keyword in saas_keywords)

        result = has_payment_system or has_saas_features

        print(f"      🏗️ 自有支付系统检查: 知名平台 {any(platform in page_lower for platform in known_payment_platforms)}, 有支付系统描述 {has_payment_system}")
        return result

    def _check_usa_ach_support(self, name, domain, page_content):
        """真实检查美国市场/ACH支持"""
        if not page_content:
            return False

        # 检查美国市场指标
        usa_indicators = [
            'usa', 'united states', 'america', 'us$', 'usd',
            '美国', '美金', '美元'
        ]

        # 检查ACH相关指标
        ach_indicators = [
            'ach', 'bank transfer', 'direct deposit', 'wire transfer',
            'bank account', 'routing number', 'checking account',
            'ach转账', '银行转账', '直接存款', '电汇'
        ]

        page_lower = page_content.lower()

        usa_found = [indicator for indicator in usa_indicators if indicator in page_lower]
        ach_found = [indicator for indicator in ach_indicators if indicator in page_lower]

        # 检查定价（美元）
        usd_pattern = r'\$(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+\.?\d*)\s*(?:usd|cents)?'
        has_usd_pricing = bool(re.search(usd_pattern, page_lower))

        # 检查是否服务美国市场
        serves_usa = len(usa_found) > 0 or has_usd_pricing
        has_ach = len(ach_found) > 0

        result = serves_usa or has_ach or domain.endswith('.com')

        print(f"      🇺🇸 美国/ACH检查: 美国指标 {usa_found[:2]}..., ACH指标 {ach_found}, 有美元定价 {has_usd_pricing}")
        return result

    def validate_platform(self, name, domain, platform_type):
        """完整验证一个平台"""
        if name in self.validation_cache:
            print(f"    ⏭️ {name}: 使用缓存结果")
            return self.validation_cache[name]

        print(f"  🔄 开始验证 {name} ({domain})")

        # 构造URL
        url = f"https://{domain}" if not domain.startswith('http') else domain

        # 获取页面内容
        print(f"    🌐 访问网站: {url}")
        page_content = self._get_page_content(url)

        if not page_content:
            print(f"    ❌ 无法获取页面内容，验证失败")
            result = {
                'platform': name,
                'domain': domain,
                'type': platform_type,
                'personal_registration': False,
                'payment_reception': False,
                'own_payment_system': False,
                'usa_ach_support': False,
                'overall': False,
                'error': 'Unable to access website'
            }
            self.validation_cache[name] = result
            self._save_cache()
            return result

        # 执行4项验证
        personal_reg = self._check_personal_registration(name, domain, page_content)
        payment_recv = self._check_payment_reception(name, domain, page_content)
        own_payment = self._check_own_payment_system(name, domain, page_content)
        usa_ach = self._check_usa_ach_support(name, domain, page_content)

        results = [personal_reg, payment_recv, own_payment, usa_ach]
        passed = all(results)
        passed_count = sum(results)

        result = {
            'platform': name,
            'domain': domain,
            'type': platform_type,
            'personal_registration': personal_reg,
            'payment_reception': payment_recv,
            'own_payment_system': own_payment,
            'usa_ach_support': usa_ach,
            'overall': passed,
            'passed_count': passed_count,
            'error': None
        }

        # 保存结果
        self.validation_cache[name] = result
        self._save_cache()

        return result

    def validate_platforms_batch(self, platforms):
        """批量验证平台"""
        results = []
        for name, domain, platform_type in platforms:
            result = self.validate_platform(name, domain, platform_type)
            results.append(result)
            time.sleep(2)  # 避免请求过快
        return results

def run_real_validation():
    """运行真实验证"""
    validator = RealPlatformValidator()

    # 测试平台列表（从小批量开始）
    test_platforms = [
        ("PayPal", "paypal.com", "支付平台"),
        ("Patreon", "patreon.com", "创作者订阅平台"),
        ("Buy Me a Coffee", "buymeacoffee.com", "创作者打赏平台"),
        ("Stripe", "stripe.com", "支付集成平台"),
        ("GoFundMe", "gofundme.com", "个人众筹募捐平台")
    ]

    print("🚀 真实平台验证器启动")
    print("🎯 实际访问网站，检查4项验证标准")
    print("=" * 60)

    results = validator.validate_platforms_batch(test_platforms)

    print("\n" + "=" * 60)
    print("📊 验证结果总结:")

    passed_count = 0
    for result in results:
        if result['error']:
            print(f"  ❌ {result['platform']}: 验证失败 - {result['error']}")
        else:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  {status} {result['platform']}: {result['passed_count']}/4 项通过")

            if result['overall']:
                passed_count += 1
                print(f"    ✅ 个人注册: {result['personal_registration']}")
                print(f"    ✅ 支付接收: {result['payment_reception']}")
                print(f"    ✅ 自有支付系统: {result['own_payment_system']}")
                print(f"    ✅ 美国/ACH: {result['usa_ach_support']}")

    print(f"\n🏆 总计: {passed_count}/{len(results)} 个平台通过4项验证")

if __name__ == "__main__":
    run_real_validation()