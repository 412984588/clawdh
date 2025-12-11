#!/usr/bin/env python3
"""
真实平台验证器 - 验证已知平台的真实性
基于已知的平台列表进行验证和爬取
"""

import requests
import json
import time
from urllib.parse import urlparse
from datetime import datetime

# 已知的真实创作者和收款平台列表
KNOWN_REAL_PLATFORMS = [
    # 创作者平台
    {"name": "Patreon", "domain": "patreon.com", "type": "creator"},
    {"name": "Ko-fi", "domain": "ko-fi.com", "type": "creator"},
    {"name": "Buy Me a Coffee", "domain": "buymeacoffee.com", "type": "creator"},
    {"name": "Gumroad", "domain": "gumroad.com", "type": "creator"},
    {"name": "Substack", "domain": "substack.com", "type": "creator"},
    {"name": "Memberful", "domain": "memberful.com", "type": "creator"},
    {"name": "Podia", "domain": "podia.com", "type": "creator"},
    {"name": "Acast", "domain": "acast.com", "type": "podcast"},
    {"name": "Anchor", "domain": "anchor.fm", "type": "podcast"},
    {"name": "Buzzsprout", "domain": "buzzsprout.com", "type": "podcast"},
    {"name": "Transistor", "domain": "transistor.fm", "type": "podcast"},
    {"name": "Simplecast", "domain": "simplecast.com", "type": "podcast"},
    {"name": "Libsyn", "domain": "libsyn.com", "type": "podcast"},

    # 教育平台
    {"name": "Teachable", "domain": "teachable.com", "type": "education"},
    {"name": "Thinkific", "domain": "thinkific.com", "type": "education"},
    {"name": "Kajabi", "domain": "kajabi.com", "type": "education"},
    {"name": "LearnWorlds", "domain": "learnworlds.com", "type": "education"},
    {"name": "Podia", "domain": "podia.com", "type": "education"},
    {"name": "Udemy", "domain": "udemy.com", "type": "education"},
    {"name": "Skillshare", "domain": "skillshare.com", "type": "education"},

    # 支付平台
    {"name": "Stripe", "domain": "stripe.com", "type": "payment"},
    {"name": "PayPal", "domain": "paypal.com", "type": "payment"},
    {"name": "Square", "domain": "squareup.com", "type": "payment"},
    {"name": "Wise", "domain": "wise.com", "type": "payment"},
    {"name": "Venmo", "domain": "venmo.com", "type": "payment"},
    {"name": "Cash App", "domain": "cash.app", "type": "payment"},
    {"name": "Zelle", "domain": "zellepay.com", "type": "payment"},

    # 众筹平台
    {"name": "GoFundMe", "domain": "gofundme.com", "type": "crowdfunding"},
    {"name": "Kickstarter", "domain": "kickstarter.com", "type": "crowdfunding"},
    {"name": "Indiegogo", "domain": "indiegogo.com", "type": "crowdfunding"},
    {"name": "Fundly", "domain": "fundly.com", "type": "crowdfunding"},
    {"name": "Crowdfunder", "domain": "crowdfunder.com", "type": "crowdfunding"},

    # 订阅平台
    {"name": "Substack", "domain": "substack.com", "type": "subscription"},
    {"name": "ConvertKit", "domain": "convertkit.com", "type": "subscription"},
    {"name": "Mailchimp", "domain": "mailchimp.com", "type": "subscription"},
    {"name": "AWeber", "domain": "aweber.com", "type": "subscription"},

    # 其他创作者工具
    {"name": "YouTube", "domain": "youtube.com", "type": "video"},
    {"name": "Twitch", "domain": "twitch.tv", "type": "video"},
    {"name": "TikTok", "domain": "tiktok.com", "type": "video"},
    {"name": "Instagram", "domain": "instagram.com", "type": "social"},
    {"name": "Twitter", "domain": "twitter.com", "type": "social"},
    {"name": "LinkedIn", "domain": "linkedin.com", "type": "social"},

    # 小众平台
    {"name": "Flattr", "domain": "flattr.com", "type": "micropayment"},
    {"name": "Liberapay", "domain": "liberapay.com", "type": "donation"},
    {"name": "Open Collective", "domain": "opencollective.com", "type": "donation"},
    {"name": "GitHub Sponsors", "domain": "github.com", "type": "donation"},
    {"name": "Gitcoin", "domain": "gitcoin.co", "type": "donation"},
]

class RealPlatformValidator:
    """验证已知真实平台"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        # 加载已验证的平台
        self.verified_domains = set()
        self.load_verified_domains()

    def load_verified_domains(self):
        """加载已验证的域名"""
        try:
            with open('verified_platforms.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                for platform in data.get('platforms', []):
                    domain = platform.get('domain', '')
                    if domain:
                        self.verified_domains.add(domain)
            print(f"✅ 已加载 {len(self.verified_domains)} 个已验证域名")
        except Exception as e:
            print(f"⚠️ 加载已验证域名失败: {e}")

    def validate_platform(self, platform: dict) -> dict:
        """验证单个平台"""
        domain = platform['domain']

        # 检查是否已验证
        if domain in self.verified_domains:
            return {
                **platform,
                'status': 'already_verified',
                'verified': True
            }

        print(f"\n🔍 验证平台: {platform['name']} ({domain})")

        # 验证网站可访问性
        try:
            url = f"https://{domain}"
            response = self.session.get(url, timeout=15, allow_redirects=True)

            if response.status_code == 200:
                # 检查内容相关性
                content = response.text.lower()
                platform_name = platform['name'].lower()

                # 基本验证
                if platform_name.replace(' ', '') in content.replace(' ', ''):
                    verified = True
                    status = 'verified'
                    print(f"   ✅ 平台验证通过")
                else:
                    verified = False
                    status = 'content_not_matching'
                    print(f"   ⚠️ 内容不完全匹配")

                # 检查关键功能
                has_payment = any(word in content for word in ['payment', 'pay', 'checkout', 'pricing'])
                has_signup = any(word in content for word in ['sign up', 'register', 'join', 'get started'])

                return {
                    **platform,
                    'status': status,
                    'verified': verified,
                    'has_payment': has_payment,
                    'has_signup': has_signup,
                    'http_status': response.status_code
                }
            else:
                print(f"   ❌ HTTP {response.status_code}")
                return {
                    **platform,
                    'status': 'http_error',
                    'verified': False,
                    'http_status': response.status_code
                }

        except Exception as e:
            print(f"   ❌ 错误: {str(e)[:50]}")
            return {
                **platform,
                'status': 'error',
                'verified': False,
                'error': str(e)
            }

    def validate_and_save_platforms(self, platforms: list, batch_size: int = 50):
        """批量验证平台并保存结果"""
        print(f"\n🚀 开始验证 {len(platforms)} 个平台...")
        print("="*60)

        validated_platforms = []
        verified_count = 0

        for i, platform in enumerate(platforms, 1):
            print(f"\n[{i}/{len(platforms)}] ", end="")

            validated = self.validate_platform(platform)
            validated_platforms.append(validated)

            if validated.get('verified'):
                verified_count += 1
                # 更新已验证域名集合
                self.verified_domains.add(platform['domain'])

            # 每验证10个保存一次
            if i % batch_size == 0 or i == len(platforms):
                self.save_batch_results(validated_platforms, f"validation_batch_{i}.json")

            # 延迟避免被限制
            time.sleep(2)

        # 保存最终结果
        self.save_final_results(validated_platforms)

        print(f"\n📊 验证完成!")
        print(f"   - 总数: {len(platforms)}")
        print(f"   - 验证通过: {verified_count}")
        print(f"   - 验证失败: {len(platforms) - verified_count}")

        return validated_platforms

    def save_batch_results(self, platforms: list, filename: str):
        """保存批次结果"""
        data = {
            'timestamp': datetime.now().isoformat(),
            'batch_size': len(platforms),
            'verified_count': sum(1 for p in platforms if p.get('verified')),
            'platforms': platforms
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def save_final_results(self, platforms: list):
        """保存最终结果"""
        # 分类保存
        verified = [p for p in platforms if p.get('verified')]
        failed = [p for p in platforms if not p.get('verified')]

        # 保存验证通过的
        verified_data = {
            'timestamp': datetime.now().isoformat(),
            'method': 'real_platform_validation',
            'total_verified': len(verified),
            'platforms': verified
        }
        with open('newly_verified_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(verified_data, f, ensure_ascii=False, indent=2)

        # 保存验证失败的
        failed_data = {
            'timestamp': datetime.now().isoformat(),
            'total_failed': len(failed),
            'platforms': failed
        }
        with open('validation_failed_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(failed_data, f, ensure_ascii=False, indent=2)

        print(f"\n💾 结果已保存:")
        print(f"   - 验证通过: newly_verified_platforms.json ({len(verified)} 个)")
        print(f"   - 验证失败: validation_failed_platforms.json ({len(failed)} 个)")

# 主程序
if __name__ == "__main__":
    validator = RealPlatformValidator()

    # 验证已知的真实平台列表
    print("开始验证已知的真实平台...")
    validated = validator.validate_and_save_platforms(KNOWN_REAL_PLATFORMS)

    # 显示验证通过的
    print("\n✅ 验证通过的平台:")
    print("="*60)
    for platform in validated:
        if platform.get('verified'):
            print(f"\n• {platform['name']}")
            print(f"  网站: https://{platform['domain']}")
            print(f"  类型: {platform['type']}")
            print(f"  状态: {platform['status']}")