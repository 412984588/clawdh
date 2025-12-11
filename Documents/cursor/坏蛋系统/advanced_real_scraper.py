#!/usr/bin/env python3
"""
高级真实平台爬取器 - 使用多种数据源发现真实平台
"""

import requests
import json
import re
import time
from bs4 import BeautifulSoup
from urllib.parse import quote, urlparse
from typing import List, Dict
import random

class AdvancedRealScraper:
    """高级真实平台爬取器"""

    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def search_bing(self, query: str, num_results: int = 50) -> List[Dict]:
        """使用Bing搜索（比Google更容易访问）"""
        platforms = []

        try:
            url = f"https://www.bing.com/search?q={quote(query)}&count={num_results}"
            response = self.session.get(url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找搜索结果
                search_results = soup.find_all('li', class_='b_algo')

                for result in search_results:
                    # 获取链接
                    link_tag = result.find('h2')
                    if link_tag:
                        a_tag = link_tag.find('a')
                        if a_tag and a_tag.get('href'):
                            url = a_tag['href']
                            title = a_tag.get_text().strip()

                            # 跳过某些域名
                            skip_domains = ['microsoft.com', 'linkedin.com', 'facebook.com',
                                          'twitter.com', 'instagram.com', 'youtube.com']
                            domain = urlparse(url).netloc.replace('www.', '')

                            if not any(skip in domain for skip in skip_domains):
                                platforms.append({
                                    'name': title,
                                    'url': url,
                                    'domain': domain,
                                    'source': 'bing_search'
                                })

        except Exception as e:
            print(f"Bing搜索错误: {e}")

        return platforms

    def scrape_alternative_to(self, platform_name: str) -> List[Dict]:
        """从AlternativeTo网站爬取替代品"""
        platforms = []

        try:
            # 构建URL
            search_url = f"https://alternativeto.net/software/{platform_name}/"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找替代品列表
                alternatives = soup.find_all('div', class_='ListItem')

                for item in alternatives[:50]:
                    link_tag = item.find('a', {'data-item-action': 'Name'})
                    if link_tag:
                        name = link_tag.get_text().strip()
                        href = link_tag.get('href', '')

                        if href.startswith('http'):
                            domain = urlparse(href).netloc.replace('www.', '')

                            platforms.append({
                                'name': name,
                                'url': href,
                                'domain': domain,
                                'source': f'alternative_to_{platform_name}'
                            })

        except Exception as e:
            print(f"AlternativeTo爬取错误: {e}")

        return platforms

    def scrape_product_hunt(self, topic: str) -> List[Dict]:
        """从Product Hunt爬取产品"""
        platforms = []

        try:
            # 使用搜索API
            search_url = f"https://www.producthunt.com/search?q={quote(topic)}"
            response = self.session.get(search_url, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找产品卡片
                products = soup.find_all('article', {'data-test': 'post-item'})

                for product in products[:30]:
                    title_tag = product.find('h3')
                    if title_tag:
                        name = title_tag.get_text().strip()

                        # 获取产品链接
                        link_tag = product.find('a', {'data-test': 'post-url'})
                        if link_tag and link_tag.get('href'):
                            url = f"https://producthunt.com{link_tag['href']}"

                            platforms.append({
                                'name': name,
                                'url': url,
                                'domain': 'producthunt.com',
                                'source': 'product_hunt'
                            })

        except Exception as e:
            print(f"Product Hunt爬取错误: {e}")

        return platforms

    def scrape_crowdfunding_platforms(self) -> List[Dict]:
        """爬取众筹平台列表"""
        known_platforms = [
            {
                'name': 'Kickstarter',
                'url': 'https://www.kickstarter.com',
                'domain': 'kickstarter.com',
                'source': 'known_list'
            },
            {
                'name': 'Indiegogo',
                'url': 'https://www.indiegogo.com',
                'domain': 'indiegogo.com',
                'source': 'known_list'
            },
            {
                'name': 'GoFundMe',
                'url': 'https://www.gofundme.com',
                'domain': 'gofundme.com',
                'source': 'known_list'
            },
            {
                'name': 'Patreon',
                'url': 'https://www.patreon.com',
                'domain': 'patreon.com',
                'source': 'known_list'
            },
            {
                'name': 'Buy Me a Coffee',
                'url': 'https://www.buymeacoffee.com',
                'domain': 'buymeacoffee.com',
                'source': 'known_list'
            },
            {
                'name': 'Ko-fi',
                'url': 'https://ko-fi.com',
                'domain': 'ko-fi.com',
                'source': 'known_list'
            },
            {
                'name': 'Substack',
                'url': 'https://substack.com',
                'domain': 'substack.com',
                'source': 'known_list'
            },
            {
                'name': 'Gumroad',
                'url': 'https://gumroad.com',
                'domain': 'gumroad.com',
                'source': 'known_list'
            },
            {
                'name': 'Memberful',
                'url': 'https://memberful.com',
                'domain': 'memberful.com',
                'source': 'known_list'
            },
            {
                'name': 'Acast',
                'url': 'https://acast.com',
                'domain': 'acast.com',
                'source': 'known_list'
            }
        ]

        return known_platforms

    def find_payment_platforms(self) -> List[Dict]:
        """查找支付处理平台"""
        search_terms = [
            "stripe connect platform",
            "payment platform for creators",
            "paypal alternative for business",
            "receive payments online platform",
            "payout platform for freelancers"
        ]

        platforms = []

        for term in search_terms:
            print(f"   搜索: {term}")
            results = self.search_bing(term, 20)
            platforms.extend(results)

            # 避免过于频繁的请求
            time.sleep(1)

        return platforms

    def discover_creator_platforms(self) -> List[Dict]:
        """发现创作者平台"""
        all_platforms = []

        # 1. 从AlternativeTo爬取Patreon的替代品
        print("   爬取Patreon替代品...")
        patreon_alternatives = self.scrape_alternative_to('patreon')
        all_platforms.extend(patreon_alternatives)

        # 2. 从Product Hunt搜索
        print("   搜索Product Hunt...")
        hunt_results = self.scrape_product_hunt('creator economy')
        all_platforms.extend(hunt_results)

        # 3. 获取已知平台
        print("   获取已知平台...")
        known_platforms = self.scrape_crowdfunding_platforms()
        all_platforms.extend(known_platforms)

        # 4. 搜索支付平台
        print("   搜索支付平台...")
        payment_platforms = self.find_payment_platforms()
        all_platforms.extend(payment_platforms)

        # 去重
        seen = set()
        unique_platforms = []

        for platform in all_platforms:
            domain = platform.get('domain', '')
            if domain and domain not in seen:
                seen.add(domain)
                unique_platforms.append(platform)

        return unique_platforms

    def validate_platform_exists(self, platform: Dict) -> bool:
        """验证平台是否真实存在"""
        try:
            url = platform.get('url', '')
            if not url:
                return False

            # 尝试访问URL
            response = self.session.head(url, timeout=5, allow_redirects=True)
            return response.status_code == 200

        except:
            return False

# 测试
if __name__ == "__main__":
    scraper = AdvancedRealScraper()

    print("🚀 开始高级真实平台爬取...")
    platforms = scraper.discover_creator_platforms()

    print(f"\n✅ 发现 {len(platforms)} 个平台")

    # 验证前10个平台
    print("\n验证前10个平台...")
    valid_count = 0

    for i, platform in enumerate(platforms[:10]):
        exists = scraper.validate_platform_exists(platform)
        status = "✅" if exists else "❌"
        print(f"{status} {platform.get('name', 'Unknown')} - {platform.get('url', '')}")
        if exists:
            valid_count += 1

    print(f"\n验证结果: {valid_count}/10 个平台真实存在")