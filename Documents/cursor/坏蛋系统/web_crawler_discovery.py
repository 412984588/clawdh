#!/usr/bin/env python3
"""
真实网络爬虫 - 基于现有平台列表爬取和发现新平台
"""

import requests
import json
import re
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Set
import concurrent.futures
from datetime import datetime

class WebCrawlerDiscovery:
    """基于网络爬虫的平台发现工具"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

        # 加载已验证平台作为起点
        try:
            with open('verified_platforms.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.verified_platforms = data.get('platforms', [])
        except:
            self.verified_platforms = []

        # 平台发现的关键词
        self.discovery_keywords = [
            'alternatives', 'similar sites', 'like', 'vs', 'competitors',
            'platforms like', 'tools for creators', 'monetization',
            'payment solutions', 'crowdfunding platforms', 'creator economy'
        ]

        # 需要跳过的域名
        self.skip_domains = {
            'google.com', 'facebook.com', 'twitter.com', 'linkedin.com',
            'youtube.com', 'instagram.com', 'tiktok.com', 'reddit.com',
            'wikipedia.org', 'stackoverflow.com', 'github.com'
        }

    def crawl_platform_page(self, url: str) -> Dict:
        """爬取单个平台页面"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # 提取标题
            title = soup.find('title')
            title_text = title.get_text().strip() if title else ''

            # 提取描述
            description = ''
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                description = meta_desc.get('content', '')

            # 查找相关链接
            links = soup.find_all('a', href=True)
            discovered_links = []

            for link in links:
                href = link.get('href', '')
                text = link.get_text().strip().lower()

                # 检查是否包含平台相关关键词
                if any(keyword in text for keyword in self.discovery_keywords):
                    full_url = urljoin(url, href)
                    parsed = urlparse(full_url)
                    domain = parsed.netloc.replace('www.', '')

                    if domain and domain not in self.skip_domains:
                        discovered_links.append({
                            'url': full_url,
                            'domain': domain,
                            'text': text[:100],
                            'source': 'page_crawl'
                        })

            return {
                'url': url,
                'title': title_text,
                'description': description,
                'discovered_links': discovered_links[:10],  # 限制数量
                'status': 'success'
            }

        except Exception as e:
            return {
                'url': url,
                'error': str(e),
                'status': 'error'
            }

    def search_google_alternatives(self, platform_name: str) -> List[Dict]:
        """使用Google搜索平台的替代品"""
        alternatives = []

        # 构建搜索查询
        queries = [
            f"{platform_name} alternatives",
            f"platforms like {platform_name}",
            f"{platform_name} competitors",
            f"similar to {platform_name}"
        ]

        for query in queries[:2]:  # 限制查询数量
            try:
                # 使用DuckDuckGo进行搜索
                search_url = f"https://duckduckgo.com/html/?q={query.replace(' ', '+')}"
                response = self.session.get(search_url, timeout=10)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    results = soup.find_all('div', class_='result')

                    for result in results[:5]:  # 取前5个结果
                        link_tag = result.find('a', class_='result__a')
                        if link_tag and link_tag.get('href'):
                            url = link_tag['href']
                            text = link_tag.get_text().strip()

                            # 解析域名
                            parsed = urlparse(url)
                            domain = parsed.netloc.replace('www.', '')

                            if domain and domain not in self.skip_domains:
                                alternatives.append({
                                    'name': text,
                                    'url': url,
                                    'domain': domain,
                                    'source': 'search_alternatives',
                                    'query': query
                                })

                time.sleep(1)  # 避免请求过快

            except Exception as e:
                print(f"搜索错误: {e}")
                continue

        return alternatives

    def discover_from_crunchbase(self) -> List[Dict]:
        """从Crunchbase发现公司"""
        platforms = []

        # 搜索关键词组合
        search_terms = [
            'creator economy',
            'payment platform',
            'crowdfunding',
            'monetization',
            'creator tools',
            'digital payments'
        ]

        for term in search_terms[:3]:  # 限制搜索数量
            try:
                # 尝试访问Crunchbase搜索页面
                search_url = f"https://www.crunchbase.com/search/organizations/field/organizations/funding_total/top80/organization_types/{term.replace(' ', '%20')}"

                response = self.session.get(search_url, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # 提取公司信息
                    company_links = soup.find_all('a', {'class': 'cb-link'})

                    for link in company_links[:5]:
                        href = link.get('href', '')
                        if href and '/organization/' in href:
                            full_url = urljoin('https://www.crunchbase.com', href)
                            name = link.get_text().strip()

                            platforms.append({
                                'name': name,
                                'url': full_url,
                                'domain': 'crunchbase.com',
                                'source': 'crunchbase_search',
                                'term': term
                            })

            except Exception as e:
                print(f"Crunchbase搜索错误: {e}")
                continue

        return platforms

    def discover_from_product_hunt(self) -> List[Dict]:
        """从Product Hunt发现产品"""
        platforms = []

        categories = [
            'creator-tools',
            'monetization',
            'payments',
            'crowdfunding'
        ]

        for category in categories[:2]:  # 限制类别数量
            try:
                url = f"https://www.producthunt.com/topics/{category}"
                response = self.session.get(url, timeout=10)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # 查找产品链接
                    product_links = soup.find_all('a', href=True)

                    for link in product_links[:10]:
                        href = link.get('href', '')
                        if '/posts/' in href:
                            full_url = urljoin('https://www.producthunt.com', href)
                            name = link.get_text().strip()

                            platforms.append({
                                'name': name,
                                'url': full_url,
                                'domain': 'producthunt.com',
                                'source': 'product_hunt',
                                'category': category
                            })

            except Exception as e:
                print(f"Product Hunt错误: {e}")
                continue

        return platforms

    def discover_platforms(self, count: int = 50) -> List[Dict]:
        """主发现方法"""
        print(f"\n🕷️ 开始网络爬虫发现 (目标: {count}个)...")

        all_platforms = []

        # 1. 基于已验证平台搜索替代品
        if self.verified_platforms:
            print("   🔍 搜索已验证平台的替代品...")
            sample_platforms = self.verified_platforms[:5]  # 取前5个平台

            for platform in sample_platforms:
                name = platform.get('name', '')
                if name:
                    alternatives = self.search_google_alternatives(name)
                    all_platforms.extend(alternatives)
                    print(f"      ✅ {name}: 发现 {len(alternatives)} 个替代品")

        # 2. 从Crunchbase发现
        print("   💼 从Crunchbase发现...")
        crunchbase_platforms = self.discover_from_crunchbase()
        all_platforms.extend(crunchbase_platforms)
        print(f"      ✅ Crunchbase: {len(crunchbase_platforms)} 个")

        # 3. 从Product Hunt发现
        print("   🚀 从Product Hunt发现...")
        ph_platforms = self.discover_from_product_hunt()
        all_platforms.extend(ph_platforms)
        print(f"      ✅ Product Hunt: {len(ph_platforms)} 个")

        # 4. 并行爬取一些平台页面以发现更多链接
        print("   🕷️ 深度爬取平台页面...")
        if all_platforms:
            # 选择一些平台进行深度爬取
            platforms_to_crawl = [p for p in all_platforms if p.get('url', '').startswith('http')][:5]

            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                future_to_url = {
                    executor.submit(self.crawl_platform_page, p['url']): p
                    for p in platforms_to_crawl
                }

                for future in concurrent.futures.as_completed(future_to_url):
                    result = future.result()
                    if result.get('status') == 'success':
                        discovered_links = result.get('discovered_links', [])
                        all_platforms.extend(discovered_links)

        # 去重
        seen_domains = set()
        unique_platforms = []

        for platform in all_platforms:
            domain = platform.get('domain', '')
            if domain and domain not in seen_domains and domain not in self.skip_domains:
                seen_domains.add(domain)
                unique_platforms.append(platform)

        # 限制数量并返回
        result_platforms = unique_platforms[:count]

        print(f"   🎉 网络爬虫完成: 发现 {len(result_platforms)} 个真实平台")

        # 保存发现的平台
        self.save_discovered_platforms(result_platforms)

        return result_platforms

    def save_discovered_platforms(self, platforms: List[Dict]):
        """保存发现的平台"""
        data = {
            'timestamp': datetime.now().isoformat(),
            'method': 'web_crawling',
            'count': len(platforms),
            'platforms': platforms
        }

        with open('crawled_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"   💾 爬取结果已保存到 crawled_platforms.json")

# 测试
if __name__ == "__main__":
    crawler = WebCrawlerDiscovery()
    platforms = crawler.discover_platforms(20)

    print("\n🕷️ 发现的真实平台:")
    for i, platform in enumerate(platforms[:10]):
        print(f"\n{i+1}. {platform.get('name', 'Unknown')}")
        print(f"   URL: {platform.get('url', '')}")
        print(f"   来源: {platform.get('source', '')}")