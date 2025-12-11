#!/usr/bin/env python3
"""
真实平台发现工具 - 爬取真实存在的平台
"""

import requests
import json
import re
from bs4 import BeautifulSoup
from urllib.parse import quote
from typing import List, Dict

class RealPlatformDiscovery:
    """发现真实平台的工具"""

    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

    def search_google(self, query: str, num_results: int = 50) -> List[Dict]:
        """使用Google搜索查找平台"""
        platforms = []

        # 搜索查询组合
        search_queries = [
            f"{query} alternative to patreon",
            f"{query} payment platform for creators",
            f"{query} donation platform for individuals",
            f"{query} crowdfunding platform usa",
            f"{query} stripe connect platforms"
        ]

        for search_query in search_queries:
            try:
                # 使用 DuckDuckGo（不需要API key）
                url = f"https://duckduckgo.com/html/?q={quote(search_query)}"
                response = requests.get(url, headers=self.headers, timeout=10)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # 提取搜索结果
                    results = soup.find_all('div', class_='result')

                    for result in results[:num_results // len(search_queries)]:
                        link_tag = result.find('a', class_='result__a')
                        if link_tag and link_tag.get('href'):
                            url = link_tag['href']

                            # 跳过已知的非平台链接
                            skip_domains = ['github.com', 'stackoverflow.com', 'wikipedia.org']
                            if any(domain in url for domain in skip_domains):
                                continue

                            # 提取域名
                            from urllib.parse import urlparse
                            parsed = urlparse(url)
                            domain = parsed.netloc.replace('www.', '')

                            platforms.append({
                                'name': link_tag.get_text().strip(),
                                'url': url,
                                'domain': domain,
                                'source': 'google_search'
                            })

            except Exception as e:
                print(f"搜索错误: {e}")
                continue

        return platforms

    def discover_from_directories(self) -> List[Dict]:
        """从平台目录发现"""
        directories = [
            {
                'name': 'Product Hunt',
                'url': 'https://www.producthunt.com',
                'search_paths': ['/topics/p creator-tools', '/topics/p monetization']
            },
            {
                'name': 'AlternativeTo',
                'url': 'https://alternativeto.net',
                'search_paths': ['/software/patreon/', '/software/paypal/']
            },
            {
                'name': 'Capterra',
                'url': 'https://www.capterra.com',
                'search_paths': ['/payment-processing/', '/crowdfunding-software/']
            }
        ]

        platforms = []

        for directory in directories:
            try:
                for path in directory['search_paths']:
                    url = directory['url'] + path
                    response = requests.get(url, headers=self.headers, timeout=10)

                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')

                        # 提取平台链接（根据不同网站的HTML结构）
                        links = soup.find_all('a', href=True)

                        for link in links:
                            href = link['href']
                            if href.startswith('http'):
                                platforms.append({
                                    'name': link.get_text().strip(),
                                    'url': href,
                                    'domain': href.split('/')[2].replace('www.', ''),
                                    'source': f"directory_{directory['name'].lower()}"
                                })

            except Exception as e:
                print(f"目录爬取错误 {directory['name']}: {e}")

        return platforms

    def discover_from_crunchbase(self) -> List[Dict]:
        """从Crunchbase发现支付平台"""
        platforms = []

        # 使用搜索API（如果有访问权限）
        search_terms = [
            "payment platform",
            "creator economy",
            "digital payments",
            "fintech startup",
            "stripe connect"
        ]

        for term in search_terms:
            try:
                # 这里可以集成Crunchbase API或其他数据源
                # 暂时使用模拟数据结构
                pass
            except Exception as e:
                print(f"Crunchbase错误: {e}")

        return platforms

    def discover_from_github(self) -> List[Dict]:
        """从GitHub发现支付相关的开源项目"""
        platforms = []

        github_searches = [
            "stripe connect alternatives",
            "payment platform github",
            "creator platform open source",
            "donation platform github"
        ]

        for search in github_searches:
            try:
                url = f"https://github.com/search?q={quote(search)}"
                response = requests.get(url, headers=self.headers, timeout=10)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # 提取项目链接
                    repo_links = soup.find_all('a', {'class': 'v-align-middle'})

                    for link in repo_links:
                        href = link.get('href')
                        if href and href.startswith('/'):
                            full_url = f"https://github.com{href}"

                            platforms.append({
                                'name': link.get_text().strip(),
                                'url': full_url,
                                'domain': 'github.com',
                                'source': 'github_search'
                            })

            except Exception as e:
                print(f"GitHub搜索错误: {e}")

        return platforms

    def validate_domain_exists(self, domain: str) -> bool:
        """检查域名是否存在"""
        try:
            import socket
            socket.gethostbyname(domain)
            return True
        except:
            return False

    def discover_platforms(self, count: int = 50) -> List[Dict]:
        """发现真实平台的主方法"""
        print(f"\n🔍 开始搜索真实平台...")

        all_platforms = []

        # 1. Google搜索
        print("   📊 Google搜索...")
        google_platforms = self.search_google("payment platform for creators", count//3)
        all_platforms.extend(google_platforms)

        # 2. 目录网站
        print("   📚 平台目录...")
        dir_platforms = self.discover_from_directories()
        all_platforms.extend(dir_platforms)

        # 3. GitHub
        print("   💻 GitHub项目...")
        github_platforms = self.discover_from_github()
        all_platforms.extend(github_platforms)

        # 去重
        seen = set()
        unique_platforms = []

        for platform in all_platforms:
            domain = platform.get('domain', '')
            if domain and domain not in seen:
                seen.add(domain)
                unique_platforms.append(platform)

        # 验证域名存在
        valid_platforms = []
        for platform in unique_platforms[:count]:
            if self.validate_domain_exists(platform.get('domain', '')):
                valid_platforms.append(platform)

        print(f"   ✅ 发现 {len(valid_platforms)} 个真实平台")

        return valid_platforms

# 测试
if __name__ == "__main__":
    discovery = RealPlatformDiscovery()
    platforms = discovery.discover_platforms(20)

    print("\n发现的平台:")
    for i, platform in enumerate(platforms[:10]):
        print(f"\n{i+1}. {platform.get('name', 'Unknown')}")
        print(f"   URL: {platform.get('url', '')}")
        print(f"   来源: {platform.get('source', '')}")