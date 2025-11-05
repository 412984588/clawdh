#!/usr/bin/env python3
"""
SuperTab平台Stripe Connect检测
"""

import asyncio
import aiohttp
import ssl
import re
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urlparse

class QuickStripeDetector:
    def __init__(self):
        self.timeout = 30
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

    async def detect_stripe(self, url: str) -> dict:
        """快速检测Stripe Connect"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        }

        result = {
            'url': url,
            'success': False,
            'stripe_detected': False,
            'confidence': 0.0,
            'connect_type': 'Unknown',
            'self_registration': False,
            'payment_capability': False,
            'evidence_count': 0,
            'evidence': {},
            'scan_duration': 0.0,
            'detection_time': datetime.now().isoformat()
        }

        start_time = datetime.now()

        try:
            timeout = aiohttp.ClientTimeout(total=self.timeout)

            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url, headers=headers, ssl=self.ssl_context) as response:
                    if response.status == 200:
                        content = await response.text()
                        result['success'] = True

                        # 解析内容
                        stripe_info = self.analyze_content(content, url)
                        result.update(stripe_info)

                    else:
                        result['error'] = f"HTTP {response.status}"

        except Exception as e:
            result['error'] = str(e)

        result['scan_duration'] = (datetime.now() - start_time).total_seconds()
        return result

    def analyze_content(self, content: str, url: str) -> dict:
        """分析网页内容"""
        content_lower = content.lower()
        evidence = {}
        score = 0.0

        # Stripe检测模式
        patterns = {
            'stripe_js': [
                r'js\.stripe\.com',
                r'checkout\.stripe\.com',
                r'connect\.stripe\.com',
                r'stripe\.com/js'
            ],
            'stripe_connect': [
                r'stripe\.connect',
                r'express\.stripe',
                r'connect\.stripe\.com/express',
                r'account_links'
            ],
            'stripe_api': [
                r'api\.stripe\.com/v1/',
                r'payment_intent',
                r'checkout_session',
                r'customers'
            ],
            'registration': [
                r'sign.*up',
                r'create.*account',
                r'register',
                r'get.*started',
                r'start.*selling',
                r'creator.*signup'
            ],
            'payment_capability': [
                r'accept.*payments',
                r'payment.*processing',
                r'sell.*products',
                r'receive.*payments',
                r'merchant.*account'
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

        # HTML解析
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

            # 检测表单和按钮
            buttons = soup.find_all(['button', 'a'], string=re.compile(r'sign.*up|register|get.*started', re.IGNORECASE))
            if buttons:
                evidence['signup_buttons'] = len(buttons)

            # 检测meta标签
            meta_tags = soup.find_all('meta')
            for meta in meta_tags:
                content_attr = meta.get('content', '').lower()
                if content_attr and any(keyword in content_attr for keyword in ['stripe', 'payment', 'checkout']):
                    if 'meta_evidence' not in evidence:
                        evidence['meta_evidence'] = []
                    evidence['meta_evidence'].append(content_attr[:50])

        except Exception as e:
            evidence['parse_error'] = str(e)

        # 计算置信度
        if evidence.get('stripe_js'):
            score += 0.4
        if evidence.get('stripe_connect'):
            score += 0.3
        if evidence.get('registration'):
            score += 0.2
        if evidence.get('payment_capability'):
            score += 0.1

        # 确定Connect类型
        connect_type = 'Unknown'
        if evidence.get('stripe_connect'):
            connect_type = 'Express' if 'express' in str(evidence['stripe_connect']).lower() else 'Custom'
        elif evidence.get('stripe_js'):
            connect_type = 'Payment'

        return {
            'stripe_detected': score > 0.15,
            'confidence': min(score, 1.0),
            'connect_type': connect_type,
            'self_registration': bool(evidence.get('registration')),
            'payment_capability': bool(evidence.get('payment_capability')),
            'evidence_count': total_evidence,
            'evidence': evidence
        }

async def main():
    detector = QuickStripeDetector()

    print("🎯 检测 SuperTab 平台...")
    print("   URL: https://www.supertab.co/")

    result = await detector.detect_stripe('https://www.supertab.co/')

    print(f"\n📊 SuperTab 检测结果:")
    print(f"   检测成功: {'✅' if result['success'] else '❌'}")
    print(f"   Stripe检测: {'✅' if result['stripe_detected'] else '❌'}")
    print(f"   置信度: {result['confidence']:.2f}")
    print(f"   Connect类型: {result['connect_type']}")
    print(f"   自注册能力: {'✅' if result['self_registration'] else '❌'}")
    print(f"   收款能力: {'✅' if result['payment_capability'] else '❌'}")
    print(f"   证据数量: {result['evidence_count']}个")
    print(f"   扫描时间: {result['scan_duration']:.1f}秒")

    if result.get('error'):
        print(f"   ❌ 错误: {result['error']}")

    if result.get('evidence'):
        print(f"\n📋 发现的证据:")
        for evidence_type, items in result['evidence'].items():
            if items and evidence_type != 'parse_error':
                if isinstance(items, list):
                    print(f"   {evidence_type}: {len(items)}个 - {', '.join(items[:3])}")
                else:
                    print(f"   {evidence_type}: {items}")

    # 最终判断
    print(f"\n🎯 最终判断:")
    if result['success'] and result['stripe_detected']:
        if result['self_registration'] and result['payment_capability']:
            print("   ✅ 符合要求: 检测到Stripe Connect + 自注册收款能力")
        elif result['self_registration']:
            print("   ⚠️ 部分符合: 检测到Stripe Connect + 自注册能力,但收款能力不明确")
        elif result['payment_capability']:
            print("   ⚠️ 部分符合: 检测到Stripe Connect + 收款能力,但自注册能力不明确")
        else:
            print("   ❌ 不符合: 检测到Stripe,但缺乏自注册和收款能力证据")
    else:
        print("   ❌ 不符合: 未检测到有效的Stripe Connect实现")

if __name__ == "__main__":
    asyncio.run(main())