#!/usr/bin/env python3
"""
简化版403绕过检测器
专门针对Thinkific和Whatnot的强保护机制
"""

import asyncio
import aiohttp
import ssl
import json
import random
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from bs4 import BeautifulSoup
import re

class SimpleBypassDetector:
    """简化的反爬虫绕过检测器"""

    def __init__(self):
        self.timeout = 30

        # SSL配置
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

        # 高级User-Agent
        self.user_agents = [
            # 最新Chrome版本
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            # Safari最新版本
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            # Firefox最新版本
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
            # Edge最新版本
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
        ]

    def get_realistic_headers(self, url: str, method: str = "desktop") -> Dict[str, str]:
        """生成逼真的请求头"""
        domain = url.split('/')[2].lower()

        if method == "mobile":
            headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
                'Sec-Ch-Ua': '"Google Chrome";v="120", "Chromium";v="120", "Not=A?Brand";v="99"',
                'Sec-Ch-Ua-Mobile': '?1',
                'Sec-Ch-Ua-Platform': '"iOS"',
                'Viewport-Width': '390',
                'Sec-Gpc': '1'
            }
        else:
            headers = {
                'User-Agent': random.choice(self.user_agents),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"macOS"',
                'DNT': '1'
            }

        # 添加可靠的Referer
        if 'thinkific.com' in domain:
            headers['Referer'] = 'https://www.google.com/search?q=thinkific+online+course+platform'
        elif 'whatnot.com' in domain:
            headers['Referer'] = 'https://www.google.com/search?q=whatnot+live+streaming+auction'
        else:
            headers['Referer'] = 'https://www.google.com/'

        return headers

    async def try_access(self, url: str, method: str = "desktop", attempt: int = 1) -> Tuple[Optional[str], List[str]]:
        """尝试访问URL"""
        errors = []

        try:
            # 生成逼真的请求头
            headers = self.get_realistic_headers(url, method)

            # 创建超短的会话以避免被检测
            timeout = aiohttp.ClientTimeout(total=self.timeout)

            async with aiohttp.ClientSession(timeout=timeout) as session:
                try:
                    async with session.get(
                        url,
                        headers=headers,
                        ssl=self.ssl_context,
                        allow_redirects=True,
                        max_redirects=5
                    ) as response:
                        content = await response.text()

                        if response.status == 200 and len(content) > 2000:
                            return content, []
                        elif response.status == 403:
                            error_msg = f"403 Forbidden - {method}方法失败"
                            errors.append(error_msg)
                        elif response.status == 429:
                            error_msg = f"429 Too Many Requests - 被限流"
                            errors.append(error_msg)
                        else:
                            error_msg = f"HTTP {response.status} - {method}方法失败"
                            errors.append(error_msg)

                except aiohttp.ClientError as e:
                    error_msg = f"客户端错误: {str(e)}"
                    errors.append(error_msg)

        except asyncio.TimeoutError:
            error_msg = f"请求超时 (尝试 {attempt})"
            errors.append(error_msg)

        except Exception as e:
            error_msg = f"未知错误: {str(e)}"
            errors.append(error_msg)

        return None, errors

    def extract_stripe_info(self, content: str, url: str) -> Dict[str, any]:
        """提取Stripe信息"""
        if not content:
            return {
                'stripe_detected': False,
                'confidence': 0.0,
                'connect_type': 'Unknown',
                'self_registration': False,
                'payment_capability': False,
                'evidence_count': 0,
                'evidence': {}
            }

        content_lower = content.lower()
        evidence = {}
        score = 0.0

        # 核心Stripe模式
        stripe_patterns = {
            'js_patterns': [
                r'js\.stripe\.com',
                r'checkout\.stripe\.com',
                r'connect\.stripe\.com',
                r'stripe\.com/js',
                r'payment\.stripe\.com'
            ],
            'connect_patterns': [
                r'stripe\.connect',
                r'express\.stripe',
                r'connect\.stripe\.com/express',
                r'account_links',
                r'stripe\.connect.*express'
            ],
            'api_patterns': [
                r'api\.stripe\.com/v1/',
                r'payment_intent',
                r'checkout_session',
                r'customers',
                r'subscriptions',
                r'charges'
            ],
            'registration_patterns': [
                r'sign.*up',
                r'create.*account',
                r'register',
                r'get.*started',
                r'start.*selling',
                r'creator.*signup',
                r'seller.*signup'
            ],
            'payment_patterns': [
                r'accept.*payments',
                r'payment.*processing',
                r'sell.*products',
                r'receive.*payments',
                r'merchant.*account'
            ]
        }

        # 检测模式
        total_evidence = 0
        for category, patterns in stripe_patterns.items():
            matches = []
            for pattern in patterns:
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
                evidence['script_evidence'] = script_evidence

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
        if evidence.get('js_patterns'):
            score += 0.4
        if evidence.get('connect_patterns'):
            score += 0.3
        if evidence.get('registration_patterns'):
            score += 0.2
        if evidence.get('payment_patterns'):
            score += 0.1

        # 确定Connect类型
        connect_type = 'Unknown'
        if evidence.get('connect_patterns'):
            connect_type = 'Express' if 'express' in str(evidence['connect_patterns']).lower() else 'Custom'
        elif evidence.get('js_patterns'):
            connect_type = 'Payment'

        return {
            'stripe_detected': score > 0.15,
            'confidence': min(score, 1.0),
            'connect_type': connect_type,
            'self_registration': bool(evidence.get('registration_patterns')),
            'payment_capability': bool(evidence.get('payment_patterns')),
            'evidence_count': total_evidence,
            'evidence': evidence
        }

    async def detect_platform(self, url: str, name: str) -> Dict[str, any]:
        """检测单个平台"""
        start_time = datetime.now()

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
            'errors': [],
            'bypass_method': None,
            'scan_duration': 0.0,
            'detection_time': start_time.isoformat()
        }

        # 尝试多种绕过方法
        methods = [
            ("desktop", "桌面浏览器"),
            ("mobile", "移动浏览器"),
            ("desktop", "桌面浏览器(延迟重试)"),
            ("mobile", "移动浏览器(延迟重试)")
        ]

        for i, (method, method_name) in enumerate(methods):
            print(f"   尝试 {method_name}...")

            # 添加延迟避免被识别为机器人
            if i > 0:
                await asyncio.sleep(random.uniform(3, 7))

            content, errors = await self.try_access(url, method, i + 1)
            result['errors'].extend(errors)

            if content:
                result['success'] = True
                result['bypass_method'] = method_name

                # 提取Stripe信息
                stripe_info = self.extract_stripe_info(content, url)
                result.update({
                    'stripe_detected': stripe_info['stripe_detected'],
                    'confidence': stripe_info['confidence'],
                    'connect_type': stripe_info['connect_type'],
                    'self_registration': stripe_info['self_registration'],
                    'payment_capability': stripe_info['payment_capability'],
                    'evidence_count': stripe_info['evidence_count'],
                    'evidence': stripe_info['evidence']
                })
                break

        result['scan_duration'] = (datetime.now() - start_time).total_seconds()
        return result

async def main():
    """主函数"""
    print("🚀 开始简化版403绕过测试...")
    print("=" * 80)

    detector = SimpleBypassDetector()

    # 测试之前失败的403平台
    test_platforms = [
        {"url": "https://www.thinkific.com/", "name": "Thinkific (教育平台)"},
        {"url": "https://www.whatnot.com/", "name": "Whatnot (直播拍卖)"}
    ]

    results = []

    for platform in test_platforms:
        print(f"\n🎯 检测: {platform['name']}")
        print(f"   URL: {platform['url']}")

        try:
            result = await detector.detect_platform(platform['url'], platform['name'])
            results.append(result)

            # 显示结果
            if result['success']:
                print(f"   ✅ 访问成功 (使用: {result['bypass_method']})")

                if result['stripe_detected']:
                    print(f"   ✅ 检测到Stripe Connect")
                    print(f"   📊 置信度: {result['confidence']:.2f}")
                    print(f"   🔗 Connect类型: {result['connect_type']}")
                    print(f"   👤 自注册: {'✅' if result['self_registration'] else '❌'}")
                    print(f"   💰 收款能力: {'✅' if result['payment_capability'] else '❌'}")
                    print(f"   🔍 证据数量: {result['evidence_count']}个")

                    # 显示关键证据
                    evidence = result['evidence']
                    if evidence:
                        print(f"   📋 关键证据:")
                        for evidence_type, items in evidence.items():
                            if items:
                                print(f"     {evidence_type}: {len(items) if isinstance(items, list) else items}个")
                else:
                    print(f"   ❌ 未检测到Stripe Connect")
                    print(f"   📊 置信度: {result['confidence']:.2f}")

                print(f"   ⏱️ 扫描时间: {result['scan_duration']:.1f}秒")
            else:
                print(f"   ❌ 访问失败 - 所有绕过方法都失败了")
                if result['errors']:
                    print(f"   主要错误: {result['errors'][-1]}")

        except Exception as e:
            print(f"   ❌ 检测异常: {str(e)}")

    # 保存结果
    with open("simple_bypass_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n📄 简化版绕过测试结果已保存到: simple_bypass_test_results.json")

    # 统计
    successful = sum(1 for r in results if r['success'])
    stripe_detected = sum(1 for r in results if r.get('stripe_detected'))

    print(f"\n📊 简化版绕过测试统计:")
    print(f"   总测试: {len(test_platforms)}个平台")
    print(f"   访问成功: {successful}个")
    print(f"   Stripe检测: {stripe_detected}个")
    print(f"   访问成功率: {successful/len(test_platforms)*100:.1f}%")

    if successful > 0:
        avg_duration = sum(r['scan_duration'] for r in results if r['success']) / successful
        print(f"   平均扫描时间: {avg_duration:.1f}秒")

if __name__ == "__main__":
    asyncio.run(main())