#!/usr/bin/env python3
"""
批量检测新平台 - 检测11个平台的Stripe Connect实现
"""

import asyncio
import aiohttp
import ssl
import re
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urlparse
import json

class BatchStripeDetector:
    def __init__(self):
        self.timeout = 25
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

    async def detect_platform(self, url: str, name: str) -> dict:
        """检测单个平台"""
        result = {
            'url': url,
            'platform_name': name,
            'success': False,
            'stripe_detected': False,
            'confidence': 0.0,
            'connect_type': 'Unknown',
            'self_registration': False,
            'payment_capability': False,
            'evidence_count': 0,
            'evidence': {},
            'scan_duration': 0.0,
            'detection_time': datetime.now().isoformat(),
            'error': None
        }

        start_time = datetime.now()

        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }

            timeout = aiohttp.ClientTimeout(total=self.timeout)

            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url, headers=headers, ssl=self.ssl_context) as response:
                    if response.status == 200:
                        content = await response.text()
                        result['success'] = True

                        # 分析内容
                        analysis = self.analyze_content(content, url)
                        result.update(analysis)
                    else:
                        result['error'] = f"HTTP {response.status}"

        except asyncio.TimeoutError:
            result['error'] = "请求超时"
        except Exception as e:
            result['error'] = str(e)

        result['scan_duration'] = (datetime.now() - start_time).total_seconds()
        return result

    def analyze_content(self, content: str, url: str) -> dict:
        """分析网页内容"""
        content_lower = content.lower()
        evidence = {}
        score = 0.0

        # 关键检测模式
        patterns = {
            'stripe_js': [
                r'js\.stripe\.com',
                r'checkout\.stripe\.com',
                r'connect\.stripe\.com',
                r'stripe\.com/js',
                r'payment\.stripe\.com'
            ],
            'stripe_connect': [
                r'stripe\.connect',
                r'express\.stripe',
                r'connect\.stripe\.com/express',
                r'account_links',
                r'dashboard\.stripe\.com/connect',
                r'stripe.*connect.*express'
            ],
            'stripe_api': [
                r'api\.stripe\.com/v1/',
                r'payment_intent',
                r'checkout_session',
                r'customers',
                r'subscriptions',
                r'charges',
                r'balance',
                r'payouts'
            ],
            'registration': [
                r'sign.*up',
                r'create.*account',
                r'register',
                r'get.*started',
                r'start.*selling',
                r'creator.*signup',
                r'seller.*signup',
                r'free.*trial',
                r'sign.*up.*free'
            ],
            'payment_capability': [
                r'accept.*payments',
                r'payment.*processing',
                r'sell.*products',
                r'receive.*payments',
                r'merchant.*account',
                r'accept.*credit.*cards',
                r'online.*payments',
                r'process.*payments',
                r'payment.*gateway'
            ]
        }

        # 检测模式
        total_evidence = 0
        for category, pattern_list in patterns.items():
            matches = []
            for pattern in pattern_list:
                found = re.findall(pattern, content_lower, re.IGNORECASE)
                if found:
                    matches.extend(found)
                    total_evidence += len(found)

            if matches:
                evidence[category] = list(set(matches))

        # HTML深度解析
        try:
            soup = BeautifulSoup(content, 'html.parser')

            # 检测script标签
            scripts = soup.find_all('script')
            script_evidence = []
            for script in scripts:
                src = script.get('src', '').lower()
                script_content = script.get_text().lower()

                if any(keyword in src for keyword in ['stripe', 'checkout', 'payment']):
                    script_evidence.append(f"src:{src}")

                if script_content and any(keyword in script_content for keyword in ['stripe', 'payment', 'checkout']):
                    script_evidence.append("content_stripe")

            if script_evidence:
                evidence['scripts'] = script_evidence

            # 检测表单和注册按钮
            signup_buttons = soup.find_all(['button', 'a'], string=re.compile(r'sign.*up|register|get.*started|start.*free|try.*free|create.*account', re.IGNORECASE))
            if signup_buttons:
                evidence['signup_buttons'] = len(signup_buttons)

            # 检测支付相关文本
            payment_texts = soup.find_all(string=re.compile(r'accept.*payments|payment.*processing|receive.*payments|merchant.*account', re.IGNORECASE))
            if payment_texts:
                evidence['payment_texts'] = len(payment_texts)

            # 检测meta标签
            meta_tags = soup.find_all('meta')
            for meta in meta_tags:
                content_attr = meta.get('content', '').lower()
                name_attr = meta.get('name', '').lower()
                if (content_attr and any(keyword in content_attr for keyword in ['stripe', 'payment', 'checkout'])) or \
                   (name_attr and any(keyword in name_attr for keyword in ['stripe', 'payment', 'checkout'])):
                    if 'meta_evidence' not in evidence:
                        evidence['meta_evidence'] = []
                    evidence['meta_evidence'].append(content_attr[:50])

            # 检测定价页面链接
            pricing_links = soup.find_all('a', href=re.compile(r'pricing|plans|cost|fees', re.IGNORECASE))
            if pricing_links:
                evidence['pricing_links'] = len(pricing_links)

        except Exception as e:
            evidence['parse_error'] = str(e)

        # 计算置信度
        if evidence.get('stripe_js'):
            score += 0.3
        if evidence.get('stripe_connect'):
            score += 0.4  # Connect是最重要的指标
        if evidence.get('stripe_api'):
            score += 0.1
        if evidence.get('registration'):
            score += 0.1
        if evidence.get('payment_capability'):
            score += 0.1

        # 额外证据加分
        if evidence.get('scripts'):
            score += 0.05
        if evidence.get('signup_buttons'):
            score += 0.05

        # 确定Connect类型
        connect_type = 'Unknown'
        if evidence.get('stripe_connect'):
            connect_type = 'Express' if any('express' in str(evidence['stripe_connect']).lower() for keyword in ['express']) else 'Custom'
        elif evidence.get('stripe_js'):
            connect_type = 'Payment'

        return {
            'stripe_detected': score > 0.2,  # 提高阈值确保准确性
            'confidence': min(score, 1.0),
            'connect_type': connect_type,
            'self_registration': bool(evidence.get('registration') or evidence.get('signup_buttons')),
            'payment_capability': bool(evidence.get('payment_capability') or evidence.get('payment_texts')),
            'evidence_count': total_evidence,
            'evidence': evidence
        }

    def meets_requirements(self, result: dict) -> bool:
        """判断是否符合要求"""
        return (
            result.get('success', False) and
            result.get('stripe_detected', False) and
            result.get('self_registration', False) and
            result.get('payment_capability', False) and
            result.get('confidence', 0) > 0.3
        )

async def main():
    print("🚀 开始批量检测11个新平台...")
    print("=" * 80)

    detector = BatchStripeDetector()

    # 新平台列表
    platforms = [
        {"url": "https://pocketsuite.io/", "name": "PocketSuite"},
        {"url": "https://www.kickserv.com/", "name": "KickServ"},
        {"url": "https://www.trainerize.com/", "name": "Trainerize"},
        {"url": "https://www.honeybook.com/", "name": "HoneyBook"},
        {"url": "https://www.squarespace.com/scheduling", "name": "Squarespace Scheduling"},
        {"url": "https://simplybook.me/zh/", "name": "SimplyBook (中文)"},
        {"url": "https://www.rover.com/", "name": "Rover"},
        {"url": "https://readyhubb.com/", "name": "ReadyHubb"},
        {"url": "https://www.dubsado.com/", "name": "Dubsado"},
        {"url": "https://floranext.com/", "name": "FloraNext"},
        {"url": "https://www.setmore.com/", "name": "Setmore"}
    ]

    results = []
    qualified_count = 0

    for i, platform in enumerate(platforms, 1):
        print(f"\n🎯 检测 {i}/{len(platforms)}: {platform['name']}")
        print(f"   URL: {platform['url']}")

        try:
            result = await detector.detect_platform(platform['url'], platform['name'])
            results.append(result)

            # 显示结果
            if result['success']:
                print(f"   ✅ 访问成功")

                if result['stripe_detected']:
                    print(f"   ✅ 检测到Stripe Connect")
                    print(f"   📊 置信度: {result['confidence']:.2f}")
                    print(f"   🔗 Connect类型: {result['connect_type']}")
                    print(f"   👤 自注册: {'✅' if result['self_registration'] else '❌'}")
                    print(f"   💰 收款能力: {'✅' if result['payment_capability'] else '❌'}")
                    print(f"   🔍 证据数量: {result['evidence_count']}个")

                    # 判断是否符合要求
                    if detector.meets_requirements(result):
                        qualified_count += 1
                        print(f"   🎯 **符合要求** ✅")
                    else:
                        print(f"   ❌ **不符合要求**")
                else:
                    print(f"   ❌ 未检测到Stripe Connect")
                    print(f"   📊 置信度: {result['confidence']:.2f}")

                print(f"   ⏱️ 扫描时间: {result['scan_duration']:.1f}秒")

                # 显示关键证据类型
                evidence = result.get('evidence', {})
                if evidence:
                    evidence_types = [k for k, v in evidence.items() if v and k != 'parse_error']
                    if evidence_types:
                        print(f"   📋 证据类型: {', '.join(evidence_types)}")

            else:
                print(f"   ❌ 访问失败: {result.get('error', '未知错误')}")

        except Exception as e:
            print(f"   ❌ 检测异常: {str(e)}")

        # 短暂延迟避免被限制
        if i < len(platforms):
            await asyncio.sleep(1)

    # 保存结果
    with open("new_platforms_batch_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n📄 批量检测结果已保存到: new_platforms_batch_results.json")

    # 统计结果
    successful = sum(1 for r in results if r['success'])
    stripe_detected = sum(1 for r in results if r.get('stripe_detected'))

    print(f"\n📊 批量检测统计:")
    print(f"   总测试平台: {len(platforms)}个")
    print(f"   访问成功: {successful}个 ({successful/len(platforms)*100:.1f}%)")
    print(f"   Stripe检测: {stripe_detected}个 ({stripe_detected/len(platforms)*100:.1f}%)")
    print(f"   符合要求: {qualified_count}个 ({qualified_count/len(platforms)*100:.1f}%)")

    print(f"\n🎯 符合要求的平台:")
    qualified_platforms = [r for r in results if detector.meets_requirements(r)]
    for platform in qualified_platforms:
        print(f"   ✅ {platform['platform_name']} (置信度: {platform['confidence']:.2f})")

    # 判断是否达到50%目标
    if qualified_count >= len(platforms) * 0.5:
        print(f"\n🎉 达成目标! {qualified_count}/{len(platforms)}个平台符合要求 (50%+)")
    else:
        print(f"\n⚠️ 未达目标, 仅{qualified_count}/{len(platforms)}个平台符合要求 ({qualified_count/len(platforms)*100:.1f}%)")

if __name__ == "__main__":
    asyncio.run(main())