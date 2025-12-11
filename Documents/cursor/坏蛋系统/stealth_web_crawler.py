#!/usr/bin/env python3
"""
隐形爬虫 - 使用高级技术突破反爬虫限制
专门用于发现真实的支付和创作者平台
"""

import requests
import json
import time
import random
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from datetime import datetime
from typing import List, Dict
import os

class StealthWebCrawler:
    """隐形爬虫 - 使用高级技术避免被检测"""

    def __init__(self):
        # 使用真实的浏览器头
        self.real_headers = [
            # Chrome 120 Windows
            {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            },
            # Firefox 121 Mac
            {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            # Safari 17 iPhone
            {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            }
        ]

        # 代理列表（使用免费代理）
        self.proxies = [
            None,  # 不使用代理
            # 可以添加更多代理
        ]

        # 已验证的真实平台种子
        self.real_seeds = [
            'patreon.com', 'ko-fi.com', 'gumroad.com', 'substack.com',
            'buymeacoffee.com', 'memberful.com', 'podia.com', 'teachable.com',
            'thinkific.com', 'kajabi.com', 'stripe.com', 'paypal.com',
            'squareup.com', 'wise.com', 'venmo.com', 'cash.app',
            'gofundme.com', 'kickstarter.com', 'indiegogo.com',
            'youtube.com', 'twitch.tv', 'tiktok.com', 'instagram.com'
        ]

        # 真实的搜索查询
        self.search_queries = [
            "patreon alternative for creators",
            "platforms similar to ko-fi",
            "creator funding platforms like patreon",
            "best crowdfunding sites 2024",
            "receive payments online platform",
            "digital marketplace for creators",
            "monetize content platform",
            "independent creator tools",
            "subscription platform for artists",
            "crowdfunding for musicians"
        ]

    def get_random_headers(self):
        """获取随机浏览器头"""
        return random.choice(self.real_headers)

    async def search_ddg(self, query: str, max_results: int = 10):
        """使用DuckDuckGo搜索（更少限制）"""
        platforms = []

        try:
            headers = self.get_random_headers()

            # DuckDuckGo即时答案API
            url = "https://api.duckduckgo.com/"
            params = {
                'q': query,
                'format': 'json',
                'no_html': 1,
                'skip_disambig': 1
            }

            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(url, params=params, timeout=15) as response:
                    if response.status == 200:
                        data = await response.json()

                        # 提取相关主题
                        if 'RelatedTopics' in data:
                            for topic in data['RelatedTopics'][:max_results]:
                                if 'Text' in topic and 'FirstURL' in topic:
                                    text = topic['Text']
                                    url = topic['FirstURL']

                                    # 解析域名
                                    parsed = urlparse(url)
                                    domain = parsed.netloc.replace('www.', '')

                                    if domain and len(domain) > 5:
                                        platforms.append({
                                            'name': text.split(' - ')[0][:50],
                                            'url': url,
                                            'domain': domain,
                                            'source': 'ddg_search',
                                            'query': query
                                        })

                        # 延迟避免被限制
                        await asyncio.sleep(random.uniform(2, 4))

        except Exception as e:
            print(f"   ⚠️ DuckDuckGo搜索失败: {e}")

        return platforms

    async def search_alternative_to(self, platform: str):
        """从AlternativeTo获取真实替代品"""
        platforms = []

        try:
            headers = self.get_random_headers()

            # AlternativeTo API风格查询
            url = f"https://alternativeto.net/software/{platform.lower()}/"

            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(url, timeout=15) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')

                        # 查找替代品列表
                        items = soup.find_all('li', class_='ListItem')

                        for item in items[:10]:
                            link = item.find('a', href=True)
                            if link:
                                href = link.get('href')
                                name = link.get_text().strip()

                                # 获取完整URL
                                if href.startswith('/'):
                                    full_url = f"https://alternativeto.net{href}"

                                    # 尝试获取官网
                                    try:
                                        detail_response = await session.get(full_url, timeout=10)
                                        if detail_response.status == 200:
                                            detail_content = await detail_response.text()
                                            detail_soup = BeautifulSoup(detail_content, 'html.parser')

                                            # 查找官网按钮
                                            website_btn = detail_soup.find('a', class_='button')
                                            if website_btn:
                                                website_url = website_btn.get('href', '')
                                                if website_url and website_url.startswith('http'):
                                                    parsed = urlparse(website_url)
                                                    domain = parsed.netloc.replace('www.', '')

                                                    if domain and domain != 'alternativeto.net':
                                                        platforms.append({
                                                            'name': name,
                                                            'url': website_url,
                                                            'domain': domain,
                                                            'source': 'alternativeto',
                                                            'original': platform
                                                        })
                                    except:
                                        pass

                            # 延迟
                            await asyncio.sleep(random.uniform(1, 2))

        except Exception as e:
            print(f"   ⚠️ AlternativeTo搜索失败: {e}")

        return platforms

    async def verify_domain(self, domain: str):
        """验证域名是否真实存在"""
        try:
            # 简单的HTTP请求验证
            url = f"https://{domain}"
            headers = self.get_random_headers()

            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.head(url, timeout=5, allow_redirects=True) as response:
                    return response.status < 500
        except:
            return False

    def is_relevant_platform(self, platform: Dict) -> bool:
        """判断平台是否相关"""
        domain = platform['domain'].lower()

        # 检查是否是已知平台
        if domain in [seed.split('.')[0] for seed in self.real_seeds]:
            return True

        # 检查关键词
        relevant_keywords = [
            'patreon', 'ko-fi', 'gumroad', 'substack', 'memberful',
            'teachable', 'thinkific', 'kajabi', 'podia', 'stripe',
            'paypal', 'square', 'wise', 'gofundme', 'kickstarter',
            'creator', 'fund', 'donate', 'payment', 'shop',
            'store', 'marketplace', 'subscribe', 'monetize',
            'crowd', 'back', 'support', 'tip', 'coffee'
        ]

        return any(keyword in domain for keyword in relevant_keywords)

    async def discover_platforms(self, count: int = 50) -> List[Dict]:
        """发现真实平台的主方法"""
        print(f"\n🕵️ 隐形爬虫开始 (目标: {count}个)...")
        print("=" * 60)

        all_platforms = []
        seen_domains = set()

        # 策略1: 使用DuckDuckGo搜索
        print("\n1️⃣ DuckDuckGo搜索...")
        for query in self.search_queries[:5]:
            print(f"   🔍 搜索: {query}")
            results = await self.search_ddg(query, max_results=5)

            for platform in results:
                domain = platform['domain']
                if (domain not in seen_domains and
                    self.is_relevant_platform(platform) and
                    await self.verify_domain(domain)):
                    seen_domains.add(domain)
                    all_platforms.append(platform)

            await asyncio.sleep(random.uniform(3, 6))

        # 策略2: AlternativeTo搜索
        print("\n2️⃣ AlternativeTo搜索...")
        for seed in self.real_seeds[:5]:
            print(f"   🔍 搜索 {seed} 的替代品...")
            alternatives = await self.search_alternative_to(seed)

            for platform in alternatives:
                domain = platform['domain']
                if (domain not in seen_domains and
                    self.is_relevant_platform(platform) and
                    await self.verify_domain(domain)):
                    seen_domains.add(domain)
                    all_platforms.append(platform)

            await asyncio.sleep(random.uniform(3, 5))

        # 去重和限制数量
        unique_platforms = []
        for i, platform in enumerate(all_platforms):
            if platform['domain'] not in [p.get('domain') for p in unique_platforms]:
                unique_platforms.append(platform)
                if len(unique_platforms) >= count:
                    break

        print(f"\n📊 发现完成!")
        print(f"   - 搜索结果总数: {len(all_platforms)}")
        print(f"   - 去重后: {len(unique_platforms)}")
        print(f"   - 已验证域名: {sum(1 for p in unique_platforms if p.get('verified', True))}")

        # 保存结果
        self.save_results(unique_platforms)

        return unique_platforms[:count]

    def save_results(self, platforms: List[Dict]):
        """保存爬取结果"""
        data = {
            'timestamp': datetime.now().isoformat(),
            'method': 'stealth_web_crawling',
            'total_found': len(platforms),
            'platforms': platforms
        }

        with open('stealth_crawled_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n💾 结果已保存到 stealth_crawled_platforms.json")

# 主程序
if __name__ == "__main__":
    async def main():
        crawler = StealthWebCrawler()
        platforms = await crawler.discover_platforms(20)

        print("\n🎯 发现的平台:")
        print("=" * 60)
        for i, platform in enumerate(platforms, 1):
            print(f"\n{i}. {platform.get('name')}")
            print(f"   🌐 网站: {platform.get('url')}")
            print(f"   🔍 来源: {platform.get('source')}")

    asyncio.run(main())