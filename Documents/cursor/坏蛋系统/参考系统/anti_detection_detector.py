#!/usr/bin/env python3
"""
反爬虫绕过检测器
专门处理403错误和反爬虫保护
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import aiohttp
import ssl
import json
import random
import time
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
from urllib.parse import urljoin, urlparse
import certifi
from bs4 import BeautifulSoup

class AntiDetectionDetector:
    """反爬虫绕过检测器"""

    def __init__(self, timeout: int = 60, max_retries: int = 5):
        self.timeout = timeout
        self.max_retries = max_retries

        # 配置SSL上下文
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

        # User-Agent轮换
        self.user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]

        # 代理设置 (如果需要)
        self.proxies = [
            None,  # 直连
            # 可以添加代理服务器
        ]

    def get_random_headers(self, url: str) -> Dict[str, str]:
        """生成随机请求头"""
        headers = {
            'User-Agent': random.choice(self.user_agents),
            'Accept': random.choice([
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.9'
            ]),
            'Accept-Language': random.choice([
                'en-US,en;q=0.9',
                'en-US,en;q=0.8',
                'en-GB,en;q=0.9,en;q=0.8',
                'zh-CN,zh;q=0.9,en;q=0.8'
            ]),
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        }

        # 添加域名特定的头
        domain = urlparse(url).netloc.lower()

        # 针对Thinkific的特殊处理
        if 'thinkific.com' in domain:
            headers.update({
                'Referer': 'https://www.google.com/',
                'DNT': '1',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"macOS"'
            })

        # 针对Whatnot的特殊处理
        elif 'whatnot.com' in domain:
            headers.update({
                'Referer': 'https://www.whatnot.com/',
                'Origin': 'https://www.whatnot.com',
                'DNT': '1'
            })

        return headers

    async def fetch_with_retry_anti_detection(self, session: aiohttp.ClientSession, url: str) -> Tuple[Optional[str], List[str]]:
        """带反爬虫绕过的内容获取"""
        errors = []

        for attempt in range(self.max_retries):
            try:
                # 随机延迟
                if attempt > 0:
                    delay = random.uniform(2, 5) * attempt
                    await asyncio.sleep(delay)

                # 生成新的请求头
                headers = self.get_random_headers(url)

                # 设置超时
                timeout = aiohttp.ClientTimeout(total=self.timeout)

                # 尝试不同的请求方法
                methods = ['GET', 'GET']  # 主要是GET,但可以添加其他策略

                for method in methods:
                    try:
                        async with session.request(
                            method,
                            url,
                            headers=headers,
                            timeout=timeout,
                            ssl=self.ssl_context,
                            allow_redirects=True,
                            max_redirects=10
                        ) as response:
                            content = await response.text()

                            # 检查响应状态
                            if response.status == 200:
                                if len(content) > 1000:  # 确保有足够内容
                                    return content, errors
                                else:
                                    error_msg = f"内容过短: {len(content)} 字符"
                                    errors.append(f"Attempt {attempt + 1}: {error_msg}")

                            elif response.status == 403:
                                error_msg = f"403 Forbidden - 尝试新策略"
                                errors.append(f"Attempt {attempt + 1}: {error_msg}")

                                # 特殊处理403
                                if attempt == 0:
                                    # 第一次403,尝试添加Referer
                                    headers['Referer'] = 'https://www.google.com/search?q=' + url
                                elif attempt == 1:
                                    # 第二次403,尝试模拟移动端
                                    headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
                                elif attempt == 2:
                                    # 第三次403,尝试添加更多头
                                    headers.update({
                                        'X-Requested-With': 'XMLHttpRequest',
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    })

                            elif response.status == 429:
                                error_msg = f"429 Too Many Requests - 延迟重试"
                                errors.append(f"Attempt {attempt + 1}: {error_msg}")
                                await asyncio.sleep(random.uniform(10, 20))

                            elif response.status in [301, 302, 303, 307, 308]:
                                error_msg = f"重定向 {response.status}"
                                errors.append(f"Attempt {attempt + 1}: {error_msg}")

                            else:
                                error_msg = f"HTTP {response.status}"
                                errors.append(f"Attempt {attempt + 1}: {error_msg}")

                    except aiohttp.ClientError as e:
                        error_msg = f"请求错误: {str(e)}"
                        errors.append(f"Attempt {attempt + 1}: {error_msg}")

            except asyncio.TimeoutError:
                error_msg = f"请求超时 (尝试 {attempt + 1}/{self.max_retries})"
                errors.append(error_msg)

            except Exception as e:
                error_msg = f"未知错误: {str(e)}"
                errors.append(f"Attempt {attempt + 1}: {error_msg}")

        return None, errors

    def extract_stripe_indicators_robust(self, content: str, url: str) -> Dict[str, Any]:
        """增强的Stripe指标提取"""
        indicators = {
            'stripe_detected': False,
            'confidence': 0.0,
            'connect_type': 'Unknown',
            'self_registration': False,
            'payment_capability': False,
            'evidence': {
                'js_indicators': [],
                'api_indicators': [],
                'connect_indicators': [],
                'registration_indicators': [],
                'payment_indicators': [],
                'config_indicators': [],
                'meta_indicators': []
            },
            'technical_details': []
        }

        if not content:
            return indicators

        content_lower = content.lower()

        # 基础Stripe检测模式
        stripe_patterns = {
            'js_patterns': [
                r'js\.stripe\.com',
                r'checkout\.stripe\.com',
                r'connect\.stripe\.com',
                r'stripe\.com/js',
                r'payment\.stripe\.com'
            ],
            'api_patterns': [
                r'api\.stripe\.com/v1/',
                r'payment_intent',
                r'checkout_session',
                r'customers',
                r'subscriptions'
            ],
            'connect_patterns': [
                r'stripe\.connect',
                r'express\.stripe',
                r'connect\.stripe\.com/express',
                r'account_links'
            ],
            'registration_patterns': [
                r'sign.*up',
                r'create.*account',
                r'register',
                r'get.*started',
                r'start.*selling'
            ],
            'payment_patterns': [
                r'accept.*payments',
                r'payment.*processing',
                r'sell.*products',
                r'digital.*sales'
            ]
        }

        # 检测各种模式
        for category, patterns in stripe_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, content_lower, re.IGNORECASE)
                if matches:
                    evidence_key = category.replace('_patterns', '_indicators')
                    indicators['evidence'][evidence_key].extend(matches)

        # HTML深度解析
        try:
            soup = BeautifulSoup(content, 'html.parser')

            # 检测script标签
            scripts = soup.find_all('script')
            for script in scripts:
                src = script.get('src', '').lower()
                script_content = script.get_text().lower()

                if any(keyword in src for keyword in ['stripe', 'checkout', 'payment']):
                    indicators['evidence']['js_indicators'].append(f"script_src:{src}")

                if script_content and any(keyword in script_content for keyword in ['stripe', 'payment']):
                    indicators['evidence']['config_indicators'].append("script_content_stripe")

            # 检测meta标签
            meta_tags = soup.find_all('meta')
            for meta in meta_tags:
                content_attr = meta.get('content', '').lower()
                if content_attr and any(keyword in content_attr for keyword in ['stripe', 'payment', 'checkout']):
                    indicators['evidence']['meta_indicators'].append(f"meta:{content_attr[:50]}")

            # 检测表单和按钮
            buttons = soup.find_all(['button', 'a'], string=re.compile(r'sign.*up|register|get.*started', re.IGNORECASE))
            if buttons:
                indicators['evidence']['registration_indicators'].append("signup_buttons_found")

            forms = soup.find_all('form')
            for form in forms:
                if form.get('action') and 'stripe' in form.get('action', '').lower():
                    indicators['evidence']['config_indicators'].append("stripe_form_found")

        except Exception as e:
            indicators['technical_details'].append(f"HTML解析错误: {str(e)}")

        # 计算置信度
        score = 0.0
        if indicators['evidence']['js_indicators']:
            score += 0.3
        if indicators['evidence']['connect_indicators']:
            score += 0.3
        if indicators['evidence']['registration_indicators']:
            score += 0.2
        if indicators['evidence']['payment_indicators']:
            score += 0.1
        if indicators['evidence']['config_indicators']:
            score += 0.1

        indicators['confidence'] = min(score, 1.0)
        indicators['stripe_detected'] = score > 0.15
        indicators['self_registration'] = bool(indicators['evidence']['registration_indicators'])
        indicators['payment_capability'] = bool(indicators['evidence']['payment_indicators'])

        # 确定Connect类型
        if indicators['evidence']['connect_indicators']:
            indicators['connect_type'] = 'Express' if 'express' in str(indicators['evidence']['connect_indicators']).lower() else 'Custom'
        elif indicators['evidence']['js_indicators']:
            indicators['connect_type'] = 'Payment'

        return indicators

    async def detect_with_anti_detection(self, url: str, platform_name: str = "") -> Dict[str, Any]:
        """带反爬虫绕过的检测"""
        start_time = datetime.now()

        result = {
            'url': url,
            'platform_name': platform_name,
            'success': False,
            'stripe_detected': False,
            'confidence': 0.0,
            'connect_type': 'Unknown',
            'self_registration': False,
            'payment_capability': False,
            'evidence': {},
            'errors': [],
            'warnings': [],
            'scan_duration': 0.0,
            'detection_time': start_time.isoformat()
        }

        # 创建会话
        connector = aiohttp.TCPConnector(
            ssl=self.ssl_context,
            limit=10,
            force_close=True,
            enable_cleanup_closed=True
        )

        timeout = aiohttp.ClientTimeout(total=self.timeout)

        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            # 获取内容
            content, errors = await self.fetch_with_retry_anti_detection(session, url)
            result['errors'].extend(errors)

            if content:
                result['success'] = True

                # 提取Stripe指标
                indicators = self.extract_stripe_indicators_robust(content, url)

                result.update({
                    'stripe_detected': indicators['stripe_detected'],
                    'confidence': indicators['confidence'],
                    'connect_type': indicators['connect_type'],
                    'self_registration': indicators['self_registration'],
                    'payment_capability': indicators['payment_capability'],
                    'evidence': indicators['evidence'],
                    'warnings': indicators['technical_details']
                })

            result['scan_duration'] = (datetime.now() - start_time).total_seconds()

        return result

async def test_anti_detection():
    """测试反爬虫检测器"""
    print("🛡️ 开始反爬虫检测测试...")
    print("="*80)

    detector = AntiDetectionDetector(timeout=60, max_retries=5)

    # 测试之前失败的403平台
    test_platforms = [
        {"url": "https://www.thinkific.com/", "name": "Thinkific", "expected": True},
        {"url": "https://www.whatnot.com/", "name": "Whatnot", "expected": True},
    ]

    results = []

    for platform in test_platforms:
        print(f"\n🎯 检测: {platform['name']}")
        print(f"   URL: {platform['url']}")

        try:
            result = await detector.detect_with_anti_detection(platform['url'], platform['name'])
            results.append(result)

            # 显示结果
            if result['success']:
                status = "✅ 检测到" if result['stripe_detected'] else "❌ 未检测到"
                print(f"   访问状态: ✅ 成功")
                print(f"   Stripe检测: {status}")
                print(f"   置信度: {result['confidence']:.2f}")
                print(f"   Connect类型: {result['connect_type']}")
                print(f"   自注册: {'✅' if result['self_registration'] else '❌'}")
                print(f"   收款能力: {'✅' if result['payment_capability'] else '❌'}")
                print(f"   扫描时间: {result['scan_duration']:.1f}秒")

                # 显示证据
                evidence = result['evidence']
                if any(evidence.values()):
                    print(f"   发现证据:")
                    for key, values in evidence.items():
                        if values:
                            print(f"     {key}: {len(values)}个")
                else:
                    print(f"   ⚠️ 未发现直接证据")
            else:
                print(f"   访问状态: ❌ 失败")
                if result['errors']:
                    print(f"   错误: {result['errors'][-1]}")

        except Exception as e:
            print(f"   ❌ 检测异常: {str(e)}")

    # 保存结果
    with open("anti_detection_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n📄 反爬虫测试结果已保存到: anti_detection_test_results.json")

    # 统计
    successful = sum(1 for r in results if r['success'])
    stripe_detected = sum(1 for r in results if r.get('stripe_detected'))

    print(f"\n📊 反爬虫测试统计:")
    print(f"   总测试: {len(test_platforms)}个平台")
    print(f"   访问成功: {successful}个")
    print(f"   Stripe检测: {stripe_detected}个")
    print(f"   成功率: {successful/len(test_platforms)*100:.1f}%")

    return results

if __name__ == "__main__":
    import re
    asyncio.run(test_anti_detection())