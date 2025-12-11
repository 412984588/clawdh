#!/usr/bin/env python3
"""
高级网络爬虫 - 使用多种策略绕过反爬虫限制
专注于发现真实的平台
"""

import requests
import json
import time
import random
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from datetime import datetime
from typing import List, Dict
import os

class AdvancedWebCrawler:
    """高级网络爬虫 - 绕过反爬虫限制"""

    def __init__(self):
        # 创建多个session用于轮换
        self.sessions = []
        for i in range(3):
            session = requests.Session()

            # 不同的User-Agent
            user_agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
            ]

            session.headers.update({
                'User-Agent': user_agents[i],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            })

            self.sessions.append(session)

        # 代理列表（可选）
        self.proxies = None

        # 已知平台列表（用于发现相似平台）
        self.seed_platforms = [
            'patreon.com', 'ko-fi.com', 'gumroad.com', 'substack.com',
            'memberful.com', 'buymeacoffee.com', 'podia.com',
            'teachable.com', 'thinkific.com', 'kajabi.com',
            'stripe.com', 'paypal.com', 'squareup.com', 'wise.com',
            'gofundme.com', 'kickstarter.com', 'indiegogo.com'
        ]

        # 搜索关键词组合
        self.search_patterns = [
            'creator platform',
            'monetization platform',
            'payment platform for creators',
            'patreon alternative',
            'ko-fi alternative',
            'gumroad alternative',
            'content creator tools',
            'membership platform',
            'subscription platform',
            'digital marketplace',
            'payment processing',
            'crowdfunding platform'
        ]

    def get_random_session(self):
        """获取随机的session"""
        return random.choice(self.sessions)

    def search_bing(self, query: str, max_results: int = 10) -> List[Dict]:
        """使用Bing搜索"""
        platforms = []

        try:
            session = self.get_random_session()
            url = f"https://www.bing.com/search?q={query.replace(' ', '+')}&count={max_results}"

            response = session.get(url, timeout=15, proxies=self.proxies)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找搜索结果
                search_results = soup.find_all('li', class_='b_algo')

                for result in search_results[:max_results]:
                    link_tag = result.find('h2')
                    if link_tag:
                        a_tag = link_tag.find('a')
                        if a_tag and a_tag.get('href'):
                            href = a_tag['href']
                            title = a_tag.get_text().strip()

                            # 跳过Bing内部链接
                            if 'bing.com' in href or 'msn.com' in href:
                                continue

                            # 清理URL
                            if href.startswith('/'):
                                continue

                            # 解析域名
                            parsed = urlparse(href)
                            domain = parsed.netloc.replace('www.', '')

                            if domain and len(domain) > 5:
                                platforms.append({
                                    'name': title,
                                    'url': href,
                                    'domain': domain,
                                    'source': 'bing_search',
                                    'query': query
                                })

                # 延迟避免被限制
                time.sleep(random.uniform(3, 6))

        except Exception as e:
            print(f"   ⚠️ Bing搜索失败: {e}")

        return platforms

    def search_brave(self, query: str, max_results: int = 10) -> List[Dict]:
        """使用Brave搜索"""
        platforms = []

        try:
            session = self.get_random_session()
            url = f"https://search.brave.com/search?q={query.replace(' ', '+')}"

            response = session.get(url, timeout=15, proxies=self.proxies)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找搜索结果
                search_results = soup.find_all('div', class_='web-snippet')

                for result in search_results[:max_results]:
                    a_tag = result.find('a', class_='web-result')
                    if a_tag and a_tag.get('href'):
                        href = a_tag['href']
                        title = a_tag.get_text().strip()

                        # 解析域名
                        parsed = urlparse(href)
                        domain = parsed.netloc.replace('www.', '')

                        if domain and len(domain) > 5:
                            platforms.append({
                                'name': title,
                                'url': href,
                                'domain': domain,
                                'source': 'brave_search',
                                'query': query
                            })

                time.sleep(random.uniform(2, 4))

        except Exception as e:
            print(f"   ⚠️ Brave搜索失败: {e}")

        return platforms

    def search_alternative_to(self, platform: str) -> List[Dict]:
        """从AlternativeTo搜索替代品"""
        platforms = []

        try:
            session = self.get_random_session()
            # 直接访问平台的替代品页面
            url = f"https://alternativeto.net/software/{platform.lower()}/"

            response = session.get(url, timeout=15, proxies=self.proxies)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找替代项目
                alt_items = soup.find_all('div', {'class': 'ListItem'})

                for item in alt_items[:10]:
                    link = item.find('a', href=True)
                    if link:
                        href = link.get('href')
                        name = link.get_text().strip()

                        if href.startswith('/'):
                            full_url = f"https://alternativeto.net{href}"
                        else:
                            full_url = href

                        # 尝试获取官网
                        try:
                            # 访问详情页获取官网
                            detail_response = session.get(full_url, timeout=10)
                            if detail_response.status_code == 200:
                                detail_soup = BeautifulSoup(detail_response.content, 'html.parser')

                                # 查找官网链接
                                website_link = detail_soup.find('a', {'class': 'button'})
                                if website_link:
                                    website = website_link.get('href', '')
                                    if website and website.startswith('http'):
                                        parsed = urlparse(website)
                                        domain = parsed.netloc.replace('www.', '')

                                        if domain:
                                            platforms.append({
                                                'name': name,
                                                'url': website,
                                                'domain': domain,
                                                'source': 'alternativeto',
                                                'original': platform
                                            })
                        except:
                            # 如果获取官网失败，使用AlternativeTo页面
                            parsed = urlparse(full_url)
                            domain = parsed.netloc.replace('www.', '')

                            if domain != 'alternativeto.net':
                                platforms.append({
                                    'name': name,
                                    'url': full_url,
                                    'domain': domain,
                                    'source': 'alternativeto',
                                    'original': platform
                                })

                time.sleep(random.uniform(3, 5))

        except Exception as e:
            print(f"   ⚠️ AlternativeTo搜索失败: {e}")

        return platforms

    def verify_domain_exists(self, domain: str) -> bool:
        """验证域名是否存在"""
        try:
            import socket
            # 简单的DNS查询
            socket.gethostbyname(domain)
            return True
        except:
            return False

    def verify_platform_relevance(self, platform: Dict) -> bool:
        """验证平台相关性"""
        domain = platform['domain']

        # 检查是否是已知的平台域名
        if domain in self.seed_platforms:
            return True

        # 检查域名包含的关键词
        platform_keywords = [
            'patreon', 'ko-fi', 'gumroad', 'substack', 'memberful',
            'teachable', 'thinkific', 'kajabi', 'podia', 'stripe',
            'paypal', 'square', 'wise', 'gofundme', 'kickstarter',
            'creator', 'monetize', 'donate', 'fund', 'payment',
            'shop', 'store', 'marketplace', 'subscription'
        ]

        return any(keyword in domain.lower() for keyword in platform_keywords)

    def discover_platforms(self, count: int = 50) -> List[Dict]:
        """发现新平台的主方法"""
        print(f"\n🔍 高级网络爬虫开始 (目标: {count}个)...")
        print("="*60)

        all_platforms = []
        seen_domains = set()

        # 策略1: 基于种子平台搜索替代品
        print("\n1️⃣ 搜索已知平台的替代品...")
        for seed in self.seed_platforms[:5]:  # 限制为5个种子平台
            print(f"   🔍 搜索 {seed} 的替代品...")
            alternatives = self.search_alternative_to(seed.split('.')[0])

            for platform in alternatives:
                domain = platform['domain']
                if domain not in seen_domains and self.verify_platform_relevance(platform):
                    seen_domains.add(domain)
                    all_platforms.append(platform)

            # 延迟
            time.sleep(random.uniform(5, 8))

        # 策略2: 使用搜索引擎
        print("\n2️⃣ 使用搜索引擎发现新平台...")
        search_engines = [self.search_bing, self.search_brave]

        for i, pattern in enumerate(self.search_patterns[:8]):  # 限制搜索数量
            print(f"   🔍 搜索: {pattern}")

            # 轮换使用不同的搜索引擎
            search_func = search_engines[i % len(search_engines)]
            results = search_func(pattern, max_results=5)

            for platform in results:
                domain = platform['domain']
                if domain not in seen_domains and self.verify_platform_relevance(platform):
                    seen_domains.add(domain)
                    all_platforms.append(platform)

            # 搜索间隔
            time.sleep(random.uniform(4, 7))

        # 去重并验证
        unique_platforms = []
        verified_platforms = []

        for platform in all_platforms:
            domain = platform['domain']
            if domain not in seen_domains:
                seen_domains.add(domain)

                # 最终验证域名存在
                if self.verify_domain_exists(domain):
                    verified_platforms.append(platform)

        # 限制数量
        result_platforms = verified_platforms[:count]

        print(f"\n📊 发现完成!")
        print(f"   - 搜索结果总数: {len(all_platforms)}")
        print(f"   - 去重后: {len(set(p['domain'] for p in all_platforms))}")
        print(f"   - 域名验证通过: {len(verified_platforms)}")
        print(f"   - 最终数量: {len(result_platforms)}")

        # 保存结果
        self.save_results(result_platforms)

        return result_platforms

    def save_results(self, platforms: List[Dict]):
        """保存结果"""
        data = {
            'timestamp': datetime.now().isoformat(),
            'method': 'advanced_web_crawling',
            'techniques_used': ['bing_search', 'brave_search', 'alternativeto'],
            'total_found': len(platforms),
            'platforms': platforms
        }

        with open('advanced_crawled_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n💾 结果已保存到 advanced_crawled_platforms.json")

# 主程序
if __name__ == "__main__":
    crawler = AdvancedWebCrawler()

    # 发现20个平台
    platforms = crawler.discover_platforms(20)

    print("\n🎯 发现的平台:")
    print("="*60)
    for i, platform in enumerate(platforms, 1):
        print(f"\n{i}. {platform.get('name')}")
        print(f"   🌐 网站: https://{platform.get('domain')}")
        print(f"   🔍 来源: {platform.get('source')}")
        print(f"   📝 查询: {platform.get('query', 'N/A')}")