#!/usr/bin/env python3
"""
专注平台爬取器 - 只爬取真实存在的平台
基于精选的已验证真实平台进行扩展
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
from datetime import datetime
import random
import os

class FocusedPlatformCrawler:
    """专注的真实平台爬取器"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        # 精选的真实平台列表（手工验证过）
        self.seed_platforms = [
            {'name': 'Patreon', 'domain': 'patreon.com', 'category': 'creator'},
            {'name': 'Ko-fi', 'domain': 'ko-fi.com', 'category': 'creator'},
            {'name': 'Buy Me a Coffee', 'domain': 'buymeacoffee.com', 'category': 'creator'},
            {'name': 'Gumroad', 'domain': 'gumroad.com', 'category': 'creator'},
            {'name': 'Substack', 'domain': 'substack.com', 'category': 'creator'},
            {'name': 'OnlyFans', 'domain': 'onlyfans.com', 'category': 'creator'},
            {'name': 'Fansly', 'domain': 'fansly.com', 'category': 'creator'},
            {'name': 'Memberful', 'domain': 'memberful.com', 'category': 'creator'},
            {'name': 'Acast', 'domain': 'acast.com', 'category': 'podcast'},
            {'name': 'Anchor', 'domain': 'anchor.fm', 'category': 'podcast'},
            {'name': 'Buzzsprout', 'domain': 'buzzsprout.com', 'category': 'podcast'},
            {'name': 'Transistor', 'domain': 'transistor.fm', 'category': 'podcast'},
            {'name': 'Teachable', 'domain': 'teachable.com', 'category': 'education'},
            {'name': 'Thinkific', 'domain': 'thinkific.com', 'category': 'education'},
            {'name': 'Podia', 'domain': 'podia.com', 'category': 'education'},
            {'name': 'LearnWorlds', 'domain': 'learnworlds.com', 'category': 'education'},
            {'name': 'Kajabi', 'domain': 'kajabi.com', 'category': 'education'},
            {'name': 'Stripe', 'domain': 'stripe.com', 'category': 'payment'},
            {'name': 'PayPal', 'domain': 'paypal.com', 'category': 'payment'},
            {'name': 'Square', 'domain': 'squareup.com', 'category': 'payment'},
            {'name': 'Wise', 'domain': 'wise.com', 'category': 'payment'},
            {'name': 'Venmo', 'domain': 'venmo.com', 'category': 'payment'},
            {'name': 'Cash App', 'domain': 'cash.app', 'category': 'payment'},
            {'name': 'GoFundMe', 'domain': 'gofundme.com', 'category': 'crowdfunding'},
            {'name': 'Kickstarter', 'domain': 'kickstarter.com', 'category': 'crowdfunding'},
            {'name': 'Indiegogo', 'domain': 'indiegogo.com', 'category': 'crowdfunding'},
            {'name': 'GoFundMe', 'domain': 'gofundme.com', 'category': 'crowdfunding'}
        ]

        # 已发现的平台
        self.discovered_domains = set()
        self.discovered_platforms = []

    def search_duckduckgo(self, query: str, max_results: int = 5) -> list:
        """使用DuckDuckGo搜索"""
        results = []
        try:
            search_url = f"https://duckduckgo.com/html/?q={query.replace(' ', '+')}"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                search_results = soup.find_all('div', class_='result')

                for result in search_results[:max_results]:
                    link_tag = result.find('a', class_='result__a')
                    if link_tag and link_tag.get('href'):
                        href = link_tag['href']
                        title = link_tag.get_text().strip()

                        # 跳过DuckDuckGo的重定向链接
                        if href.startswith('//duckduckgo.com/l/'):
                            continue

                        # 解析域名
                        if href.startswith('http'):
                            parsed = urlparse(href)
                            domain = parsed.netloc.replace('www.', '')

                            if domain and len(domain) > 5:
                                results.append({
                                    'title': title,
                                    'url': href,
                                    'domain': domain
                                })

            time.sleep(2)  # 避免被限制

        except Exception as e:
            print(f"搜索错误: {e}")

        return results

    def find_alternatives(self, platform: dict) -> list:
        """查找平台的替代品"""
        alternatives = []
        name = platform['name']
        category = platform.get('category', '')

        # 构建搜索查询
        queries = [
            f"{name} alternatives",
            f"like {name} but for creators",
            f"{name} competitor",
            f"similar to {name}"
        ]

        if category == 'creator':
            queries.extend([
                "creator platform like patreon",
                "monetization platform for creators",
                "alternative to patreon for content creators"
            ])
        elif category == 'payment':
            queries.extend([
                "payment processor like stripe",
                "online payment solution",
                "stripe competitor"
            ])

        for query in queries[:3]:
            print(f"   搜索: {query}")
            results = self.search_duckduckgo(query, max_results=3)

            for result in results:
                domain = result['domain']

                # 跳过已知域名
                skip_domains = {
                    'google.com', 'facebook.com', 'twitter.com', 'wikipedia.org',
                    'youtube.com', 'instagram.com', 'linkedin.com', 'reddit.com'
                }

                if (domain not in skip_domains and
                    domain not in self.discovered_domains and
                    domain != platform['domain']):

                    # 验证网站是否相关
                    if self.verify_platform_site(domain, category):
                        alternatives.append({
                            'name': result['title'],
                            'url': result['url'],
                            'domain': domain,
                            'source': f"{name}_alternative",
                            'category': category,
                            'discovery_method': 'search'
                        })
                        self.discovered_domains.add(domain)

        return alternatives

    def verify_platform_site(self, domain: str, category: str) -> bool:
        """验证网站是否是相关平台"""
        try:
            url = f"https://{domain}"
            response = self.session.get(url, timeout=10, allow_redirects=True)

            if response.status_code == 200:
                content = response.text.lower()

                # 根据类别检查关键词
                if category == 'creator':
                    keywords = ['creator', 'patreon', 'monetize', 'support', 'membership', 'subscribe']
                elif category == 'payment':
                    keywords = ['payment', 'pay', 'checkout', 'merchant', 'payment processor']
                elif category == 'education':
                    keywords = ['course', 'teach', 'learn', 'education', 'online course']
                elif category == 'crowdfunding':
                    keywords = ['fund', 'crowd', 'back', 'pledge', 'campaign']
                else:
                    keywords = ['platform', 'service', 'tool']

                # 计算匹配的关键词数量
                matches = sum(1 for kw in keywords if kw in content)
                return matches >= 2  # 至少匹配2个关键词

        except:
            pass

        return False

    def crawl_category_discovery(self, category: str) -> list:
        """通过类别搜索发现新平台"""
        platforms = []
        print(f"\n🔍 搜索 {category} 类别的平台...")

        # 类别特定的搜索查询
        if category == 'creator':
            queries = [
                "creator monetization platforms 2024",
                "new creator platforms like patreon",
                "content creator payment platforms"
            ]
        elif category == 'payment':
            queries = [
                "new payment processors 2024",
                "stripe alternatives for business",
                "online payment platforms"
            ]
        elif category == 'education':
            queries = [
                "online course platforms",
                "teachable alternatives",
                "create and sell courses online"
            ]
        else:
            queries = [
                f"{category} platforms",
                f"best {category} services"
            ]

        for query in queries:
            results = self.search_duckduckgo(query, max_results=3)

            for result in results:
                domain = result['domain']

                if domain not in self.discovered_domains:
                    if self.verify_platform_site(domain, category):
                        platforms.append({
                            'name': result['title'],
                            'url': result['url'],
                            'domain': domain,
                            'source': 'category_search',
                            'category': category,
                            'discovery_method': 'category'
                        })
                        self.discovered_domains.add(domain)

        return platforms

    def discover_platforms(self, target_count: int = 30) -> list:
        """发现新平台的主方法"""
        print(f"\n🚀 开始专注平台发现 (目标: {target_count}个)...")
        print("="*60)

        all_platforms = []

        # 1. 基于种子平台查找替代品
        print("\n1️⃣ 查找已知平台的替代品...")
        sample_platforms = random.sample(self.seed_platforms, min(10, len(self.seed_platforms)))

        for platform in sample_platforms[:5]:  # 限制为5个平台
            print(f"\n   查找 {platform['name']} 的替代品...")
            alternatives = self.find_alternatives(platform)
            all_platforms.extend(alternatives)

        # 2. 按类别搜索
        print("\n2️⃣ 按类别搜索新平台...")
        categories = ['creator', 'payment', 'education']

        for category in categories:
            category_platforms = self.crawl_category_discovery(category)
            all_platforms.extend(category_platforms)

        # 去重并限制数量
        unique_platforms = []
        seen_domains = set()

        for platform in all_platforms:
            domain = platform['domain']
            if domain not in seen_domains:
                seen_domains.add(domain)
                unique_platforms.append(platform)

        # 最终验证并限制数量
        verified_platforms = []
        for platform in unique_platforms[:target_count]:
            # 再次验证确保质量
            if self.verify_platform_site(platform['domain'], platform.get('category', '')):
                verified_platforms.append(platform)

        print(f"\n📊 发现完成!")
        print(f"   - 发现总数: {len(all_platforms)}")
        print(f"   - 去重后: {len(unique_platforms)}")
        print(f"   - 验证通过: {len(verified_platforms)}")

        # 保存结果
        self.save_results(verified_platforms)

        return verified_platforms

    def save_results(self, platforms: list):
        """保存发现的平台"""
        data = {
            'timestamp': datetime.now().isoformat(),
            'method': 'focused_crawling',
            'seed_platforms_count': len(self.seed_platforms),
            'discovered_count': len(platforms),
            'platforms': platforms
        }

        with open('focused_discovered_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n💾 发现的平台已保存到 focused_discovered_platforms.json")

# 主程序
if __name__ == "__main__":
    crawler = FocusedPlatformCrawler()

    # 发现20个真实平台
    platforms = crawler.discover_platforms(20)

    print("\n🎯 发现的真实平台:")
    print("="*60)
    for i, platform in enumerate(platforms, 1):
        print(f"\n{i}. {platform.get('name')}")
        print(f"   🌐 网站: https://{platform.get('domain')}")
        print(f"   📂 类别: {platform.get('category')}")
        print(f"   🔍 来源: {platform.get('source')}")