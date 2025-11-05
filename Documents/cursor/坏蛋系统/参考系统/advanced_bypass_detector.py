#!/usr/bin/env python3
"""
高级反爬虫绕过检测器
使用多策略方法绕过强反爬虫保护
作者: Jenny团队
版本: 2.0.0
"""

import asyncio
import aiohttp
import ssl
import json
import random
import time
import base64
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
from urllib.parse import urljoin, urlparse
import certifi
from bs4 import BeautifulSoup

class AdvancedBypassDetector:
    """高级反爬虫绕过检测器"""

    def __init__(self, timeout: int = 90, max_retries: int = 8):
        self.timeout = timeout
        self.max_retries = max_retries

        # 配置SSL上下文
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

        # 更真实的User-Agent列表
        self.real_user_agents = [
            # Chrome桌面版
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            # Safari桌面版
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
            # Firefox桌面版
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0',
            # Edge桌面版
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        ]

    def generate_realistic_headers(self, url: str, attempt: int = 0) -> Dict[str, str]:
        """生成非常真实的请求头"""
        headers = {
            'User-Agent': random.choice(self.real_user_agents),
            'Accept': random.choice([
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.9'
            ]),
            'Accept-Language': random.choice([
                'en-US,en;q=0.9',
                'en-GB,en;q=0.9,en;q=0.8',
                'en-US,en;q=0.8',
                'zh-CN,zh;q=0.9,en;q=0.8'
            ]),
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': random.choice(['max-age=0', 'no-cache']),
            'Pragma': 'no-cache',
        }

        # 添加现代浏览器的额外头
        user_agent = headers['User-Agent']
        if 'Chrome' in user_agent:
            headers.update({
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': random.choice(['"macOS"', '"Windows"', '"Linux"'])
            })
        elif 'Safari' in user_agent and 'Chrome' not in user_agent:
            headers.pop('Sec-Ch-Ua', None)
            headers.pop('Sec-Ch-Ua-Mobile', None)
            headers.pop('Sec-Ch-Ua-Platform', None)

        # 域名特定处理
        domain = urlparse(url).netloc.lower()

        # Thinkific特殊处理
        if 'thinkific.com' in domain:
            if attempt == 0:
                headers.update({
                    'Referer': 'https://www.google.com/',
                    'Sec-Fetch-Site': 'cross-site'
                })
            elif attempt == 1:
                headers.update({
                    'Referer': 'https://www.facebook.com/',
                    'Sec-Fetch-Site': 'cross-site'
                })
            elif attempt >= 2:
                # 尝试从搜索引擎来的流量
                headers.update({
                    'Referer': f'https://www.google.com/search?q={domain}',
                    'Sec-Fetch-Site': 'cross-site'
                })

        # Whatnot特殊处理
        elif 'whatnot.com' in domain:
            if attempt == 0:
                headers.update({
                    'Referer': 'https://www.twitch.tv/',
                    'Sec-Fetch-Site': 'cross-site'
                })
            elif attempt == 1:
                headers.update({
                    'Referer': 'https://www.youtube.com/',
                    'Sec-Fetch-Site': 'cross-site'
                })
            else:
                headers.update({
                    'Referer': f'https://www.google.com/search?q=whatnot+live+auctions',
                    'Sec-Fetch-Site': 'cross-site'
                })

        return headers

    async def create_custom_session(self) -> aiohttp.ClientSession:
        """创建自定义会话配置"""
        # 自定义连接器配置
        connector = aiohttp.TCPConnector(
            ssl=self.ssl_context,
            limit=5,  # 减少连接池大小
            limit_per_host=2,  # 每个主机限制连接数
            force_close=False,  # 不强制关闭连接以支持keepalive
            enable_cleanup_closed=True,
            ttl_dns_cache=300,  # DNS缓存时间
            use_dns_cache=True,
            keepalive_timeout=30
        )

        # 超时配置
        timeout = aiohttp.ClientTimeout(
            total=self.timeout,
            connect=30,
            sock_read=45
        )

        # Cookie配置
        cookie_jar = aiohttp.CookieJar(unsafe=True)

        return aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            cookie_jar=cookie_jar,
            headers={'Accept-Encoding': 'gzip, deflate, br'}
        )

    async def fetch_with_advanced_bypass(self, session: aiohttp.ClientSession, url: str) -> Tuple[Optional[str], List[str]]:
        """高级反爬虫绕过的内容获取"""
        errors = []

        for attempt in range(self.max_retries):
            try:
                # 指数退避 + 随机抖动
                if attempt > 0:
                    base_delay = 2 ** attempt
                    jitter = random.uniform(0.5, 2.0)
                    delay = base_delay + jitter
                    await asyncio.sleep(delay)

                # 生成新的请求头
                headers = self.generate_realistic_headers(url, attempt)

                # 策略1: 标准GET请求
                try:
                    async with session.get(
                        url,
                        headers=headers,
                        allow_redirects=True,
                        max_redirects=15,
                        ssl=self.ssl_context
                    ) as response:
                        content = await response.text()

                        if response.status == 200:
                            if len(content) > 2000:  # 增加最小内容长度要求
                                return content, errors
                            else:
                                errors.append(f"Attempt {attempt + 1}: 内容过短 ({len(content)} 字符)")

                        elif response.status == 403:
                            errors.append(f"Attempt {attempt + 1}: 403 Forbidden - 尝试新策略")

                            # 403特殊处理
                            if attempt < 3:
                                continue  # 尝试下一轮
                            else:
                                # 尝试策略2: HEAD请求获取基本信息
                                try:
                                    async with session.head(url, headers=headers) as head_response:
                                        if head_response.status == 200:
                                            errors.append("HEAD请求成功,但GET被阻止")
                                        else:
                                            errors.append(f"HEAD请求也失败: {head_response.status}")
                                except Exception as e:
                                    errors.append(f"HEAD请求异常: {str(e)}")

                        elif response.status == 429:
                            errors.append(f"Attempt {attempt + 1}: 429 Too Many Requests")
                            if attempt < 5:  # 429错误重试更多次
                                await asyncio.sleep(random.uniform(15, 30))
                                continue

                        else:
                            errors.append(f"Attempt {attempt + 1}: HTTP {response.status}")

                except aiohttp.ClientError as e:
                    errors.append(f"Attempt {attempt + 1}: 客户端错误: {str(e)}")

                # 策略2: 如果标准方法失败,尝试模拟移动端
                if attempt >= 3 and attempt < 6:
                    mobile_headers = headers.copy()
                    mobile_headers.update({
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                    })

                    try:
                        async with session.get(url, headers=mobile_headers) as response:
                            if response.status == 200:
                                content = await response.text()
                                if len(content) > 1000:
                                    return content, errors
                    except Exception as e:
                        errors.append(f"移动端尝试失败: {str(e)}")

                # 策略3: 尝试添加更多浏览器特征
                if attempt >= 6:
                    advanced_headers = headers.copy()
                    advanced_headers.update({
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Forwarded-For': f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
                        'Via': '1.1 chrome-proxy',
                    })

                    try:
                        async with session.get(url, headers=advanced_headers) as response:
                            if response.status == 200:
                                content = await response.text()
                                if len(content) > 500:
                                    return content, errors
                    except Exception as e:
                        errors.append(f"高级尝试失败: {str(e)}")

            except asyncio.TimeoutError:
                errors.append(f"Attempt {attempt + 1}: 请求超时")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(random.uniform(10, 20))

            except Exception as e:
                errors.append(f"Attempt {attempt + 1}: 未知错误: {str(e)}")

        return None, errors

    def extract_stripe_indicators_advanced(self, content: str, url: str) -> Dict[str, Any]:
        """高级Stripe指标提取"""
        indicators = {
            'stripe_detected': False,
            'confidence': 0.0,
            'connect_type': 'Unknown',
            'self_registration': False,
            'payment_capability': False,
            'evidence_count': 0,
            'detailed_evidence': {
                'js_patterns': [],
                'api_patterns': [],
                'connect_patterns': [],
                'business_patterns': [],
                'registration_patterns': [],
                'config_patterns': [],
                'meta_patterns': []
            }
        }

        if not content or len(content) < 500:
            return indicators

        content_lower = content.lower()
        domain = urlparse(url).netloc.lower()

        # 扩展的Stripe检测模式
        patterns = {
            'js_patterns': [
                r'js\.stripe\.com',
                r'checkout\.stripe\.com',
                r'connect\.stripe\.com',
                r'payment\.stripe\.com',
                r'stripe\.com/js',
                r'stripe\.com/v3',
                r'stripe\.network',
                r'api\.stripe\.com/js'
            ],
            'api_patterns': [
                r'api\.stripe\.com/v1/',
                r'payment_intent',
                r'checkout_session',
                r'customers',
                r'subscriptions',
                r'charges',
                r'payment_methods'
            ],
            'connect_patterns': [
                r'stripe\.connect',
                r'express\.stripe',
                r'custom.*stripe',
                r'account_links',
                r'oauth\.stripe'
            ],
            'business_patterns': [
                r'online.*course',
                r'digital.*product',
                r'sell.*course',
                r'payment.*processing',
                r'accept.*payments',
                r'merchant.*account'
            ],
            'registration_patterns': [
                r'sign.*up',
                r'create.*account',
                r'register',
                r'get.*started',
                r'start.*selling',
                r'creator.*signup'
            ],
            'config_patterns': [
                r'pk_live_',
                r'pk_test_',
                r'stripe_publishable',
                r'stripe.*key',
                r'data-stripe'
            ],
            'meta_patterns': [
                r'stripe',
                r'checkout',
                r'payment.*gateway',
                r'secure.*payment'
            ]
        }

        # 检测模式
        evidence_count = 0
        for category, pattern_list in patterns.items():
            matches = []
            for pattern in pattern_list:
                found = re.findall(pattern, content_lower, re.IGNORECASE)
                if found:
                    matches.extend(found)
                    evidence_count += len(found)

            if matches:
                indicators['detailed_evidence'][category] = list(set(matches))

        # HTML解析检测
        try:
            soup = BeautifulSoup(content, 'html.parser')

            # 检测script标签内容
            scripts = soup.find_all('script')
            for script in scripts:
                src = script.get('src', '').lower()
                script_content = script.get_text().lower()

                if any(keyword in src for keyword in ['stripe', 'checkout', 'payment']):
                    indicators['detailed_evidence']['js_patterns'].append(f"script:{src}")
                    evidence_count += 1

                if script_content and any(keyword in script_content for keyword in ['stripe', 'payment']):
                    indicators['detailed_evidence']['config_patterns'].append("embedded_script")
                    evidence_count += 1

            # 检测表单和按钮
            signup_elements = soup.find_all(['button', 'a'], string=re.compile(r'sign.*up|register|get.*started', re.IGNORECASE))
            if signup_elements:
                indicators['detailed_evidence']['registration_patterns'].append("signup_buttons")
                evidence_count += len(signup_elements)

            # 检测隐藏的Stripe配置
            config_elements = soup.find_all(attrs={"data-stripe": True})
            if config_elements:
                indicators['detailed_evidence']['config_patterns'].append("data_stripe_elements")
                evidence_count += len(config_elements)

        except Exception as e:
            indicators['detailed_evidence']['meta_patterns'].append(f"parse_error:{str(e)}")

        # 计算置信度
        indicators['evidence_count'] = evidence_count

        # 基于证据数量和类型的评分
        score = 0.0
        if indicators['detailed_evidence']['js_patterns']:
            score += 0.3
        if indicators['detailed_evidence']['connect_patterns']:
            score += 0.3
        if indicators['detailed_evidence']['api_patterns']:
            score += 0.2
        if indicators['detailed_evidence']['business_patterns']:
            score += 0.1
        if indicators['detailed_evidence']['registration_patterns']:
            score += 0.1
        if indicators['detailed_evidence']['config_patterns']:
            score += 0.1

        # 证据数量加成
        if evidence_count > 5:
            score += 0.1
        elif evidence_count > 10:
            score += 0.2

        indicators['confidence'] = min(score, 1.0)
        indicators['stripe_detected'] = score > 0.2  # 稍微提高阈值
        indicators['self_registration'] = bool(indicators['detailed_evidence']['registration_patterns'])
        indicators['payment_capability'] = bool(indicators['detailed_evidence']['business_patterns'])

        # 确定Connect类型
        if indicators['detailed_evidence']['connect_patterns']:
            if any('express' in str(pattern) for pattern in indicators['detailed_evidence']['connect_patterns']):
                indicators['connect_type'] = 'Express'
            else:
                indicators['connect_type'] = 'Custom'
        elif indicators['detailed_evidence']['js_patterns']:
            indicators['connect_type'] = 'Payment'

        return indicators

    async def detect_with_advanced_bypass(self, url: str, platform_name: str = "") -> Dict[str, Any]:
        """高级反爬虫绕过检测"""
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
            'evidence_count': 0,
            'detailed_evidence': {},
            'errors': [],
            'warnings': [],
            'scan_duration': 0.0,
            'detection_time': start_time.isoformat(),
            'bypass_attempts': 0
        }

        async with await self.create_custom_session() as session:
            # 获取内容
            content, errors = await self.fetch_with_advanced_bypass(session, url)
            result['errors'].extend(errors)
            result['bypass_attempts'] = len(errors)

            if content:
                result['success'] = True

                # 提取Stripe指标
                indicators = self.extract_stripe_indicators_advanced(content, url)

                result.update({
                    'stripe_detected': indicators['stripe_detected'],
                    'confidence': indicators['confidence'],
                    'connect_type': indicators['connect_type'],
                    'self_registration': indicators['self_registration'],
                    'payment_capability': indicators['payment_capability'],
                    'evidence_count': indicators['evidence_count'],
                    'detailed_evidence': indicators['detailed_evidence']
                })

                # 添加警告
                if indicators['stripe_detected'] and indicators['confidence'] < 0.4:
                    result['warnings'].append("检测到Stripe但置信度较低")

                if not indicators['stripe_detected'] and indicators['evidence_count'] > 2:
                    result['warnings'].append("发现一些证据但不足以确认Stripe")

            result['scan_duration'] = (datetime.now() - start_time).total_seconds()

        return result

async def test_advanced_bypass():
    """测试高级反爬虫绕过"""
    print("🚀 开始高级反爬虫绕过测试...")
    print("="*80)

    detector = AdvancedBypassDetector(timeout=90, max_retries=8)

    # 测试目标平台
    test_platforms = [
        {"url": "https://www.thinkific.com/", "name": "Thinkific", "expected": True, "category": "教育平台"},
        {"url": "https://www.whatnot.com/", "name": "Whatnot", "expected": True, "category": "直播拍卖"},
    ]

    results = []

    for platform in test_platforms:
        print(f"\n🎯 检测: {platform['name']} ({platform['category']})")
        print(f"   URL: {platform['url']}")

        try:
            result = await detector.detect_with_advanced_bypass(platform['url'], platform['name'])
            results.append(result)

            # 显示结果
            if result['success']:
                print(f"   ✅ 访问成功 (尝试了{result['bypass_attempts']}次)")

                if result['stripe_detected']:
                    print(f"   ✅ 检测到Stripe Connect")
                    print(f"   📊 置信度: {result['confidence']:.2f}")
                    print(f"   🔗 Connect类型: {result['connect_type']}")
                    print(f"   👤 自注册: {'✅' if result['self_registration'] else '❌'}")
                    print(f"   💰 收款能力: {'✅' if result['payment_capability'] else '❌'}")
                    print(f"   🔍 证据数量: {result['evidence_count']}个")

                    # 显示详细证据
                    evidence = result['detailed_evidence']
                    if any(evidence.values()):
                        print(f"   📋 发现的证据类型:")
                        for evidence_type, items in evidence.items():
                            if items:
                                print(f"     • {evidence_type}: {len(items)}个")
                                # 显示前几个关键证据
                                if evidence_type in ['js_patterns', 'connect_patterns', 'api_patterns']:
                                    for item in items[:2]:
                                        print(f"       - {item}")
                    else:
                        print(f"   ⚠️ 未发现直接Stripe证据")
                else:
                    print(f"   ❌ 未检测到Stripe Connect")
                    print(f"   📊 置信度: {result['confidence']:.2f}")
                    print(f"   🔍 证据数量: {result['evidence_count']}个")

                if result['warnings']:
                    print(f"   ⚠️ 警告: {', '.join(result['warnings'])}")

                print(f"   ⏱️ 扫描时间: {result['scan_duration']:.1f}秒")

            else:
                print(f"   ❌ 访问失败 (尝试了{result['bypass_attempts']}次)")
                if result['errors']:
                    last_error = result['errors'][-1] if result['errors'] else "未知错误"
                    print(f"   🚫 错误: {last_error}")

        except Exception as e:
            print(f"   ❌ 检测异常: {str(e)}")

        # 平台间延迟
        if platform != test_platforms[-1]:
            await asyncio.sleep(random.uniform(3, 6))

    # 保存详细结果
    with open("advanced_bypass_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n📄 高级绕过测试结果已保存到: advanced_bypass_test_results.json")

    # 统计
    successful_access = sum(1 for r in results if r['success'])
    stripe_detected = sum(1 for r in results if r.get('stripe_detected'))

    print(f"\n📊 高级绕过测试统计:")
    print(f"   总测试: {len(test_platforms)}个平台")
    print(f"   访问成功: {successful_access}个")
    print(f"   Stripe检测: {stripe_detected}个")
    print(f"   访问成功率: {successful_access/len(test_platforms)*100:.1f}%")
    print(f"   Stripe检测率: {stripe_detected/len(test_platforms)*100:.1f}%")

    return results

if __name__ == "__main__":
    import re
    asyncio.run(test_advanced_bypass())