#!/usr/bin/env python3
"""
增强版网络爬虫 - 修复选择器并实现智能反爬虫机制
"""

import requests
import json
import time
import random
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional
from datetime import datetime

class EnhancedWebScraper:
    """增强版网络爬虫"""

    def __init__(self):
        # 初始化多个User-Agent
        self.user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]

        # 创建session
        self.session = requests.Session()
        self.rotate_user_agent()

        # 加载已验证平台
        try:
            with open('verified_platforms.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.verified_platforms = data.get('platforms', [])
        except:
            self.verified_platforms = []

        # 数据源配置
        self.data_sources = {
            'crunchbase': {
                'search_url': 'https://www.crunchbase.com/search/organizations/field/organizations/funding_total/top50',
                'selectors': {
                    'company_card': 'div[data-test="component-cell-container"]',
                    'company_link': 'a[data-test="company-name-link"]',
                    'company_name': 'span[data-test="company-name"]'
                }
            },
            'producthunt': {
                'search_url': 'https://www.producthunt.com/search?q={query}',
                'selectors': {
                    'product_item': 'li[data-test="post-item"]',
                    'product_link': 'a[data-test="post-url"]',
                    'product_name': 'h3[data-test="post-name"]'
                }
            },
            'alternativeto': {
                'search_url': 'https://alternativeto.net/browse/search/?q={query}',
                'selectors': {
                    'app_item': 'li[data-component="ListItem"]',
                    'app_link': 'a[data-component="ItemLink"]',
                    'app_name': 'span[data-component="ItemName"]'
                }
            }
        }

    def rotate_user_agent(self):
        """轮换User-Agent"""
        ua = random.choice(self.user_agents)
        self.session.headers.update({'User-Agent': ua})

    def smart_delay(self, min_seconds: float = 2, max_seconds: float = 5):
        """智能延迟"""
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)

    def make_request(self, url: str, retries: int = 3) -> Optional[requests.Response]:
        """智能请求，包含重试机制"""
        for attempt in range(retries):
            try:
                # 轮换User-Agent
                self.rotate_user_agent()

                # 添加随机延迟
                if attempt > 0:
                    self.smart_delay(3, 6)

                response = self.session.get(url, timeout=15)

                # 检查状态码
                if response.status_code == 200:
                    return response
                elif response.status_code == 403:
                    print(f"   ⚠️ 访问被禁止 (403)，可能需要等待更长时间...")
                    self.smart_delay(10, 20)
                elif response.status_code == 429:
                    print(f"   ⚠️ 请求过多 (429)，等待中...")
                    self.smart_delay(30, 60)

            except Exception as e:
                print(f"   ❌ 请求错误 (尝试 {attempt + 1}/{retries}): {e}")
                if attempt < retries - 1:
                    self.smart_delay(5, 10)

        return None

    def scrape_crunchbase(self) -> List[Dict]:
        """爬取Crunchbase"""
        platforms = []

        # 使用搜索页面
        search_terms = ['fintech', 'payments', 'creator economy', 'fundraising']

        for term in search_terms[:2]:  # 限制搜索数量
            print(f"   🔍 Crunchbase搜索: {term}")

            # 构建搜索URL
            search_url = f"https://www.crunchbase.com/search/organizations/field/organizations/funding_total/top50/organization_types/{term.replace(' ', '%20')}"

            response = self.make_request(search_url)
            if not response:
                continue

            soup = BeautifulSoup(response.content, 'html.parser')

            # 尝试多个可能的选择器
            selectors_to_try = [
                'div[class*="cell"]',
                'div[data-test*="cell"]',
                'a[href*="/organization/"]',
                'li[class*="ListItem"]'
            ]

            for selector in selectors_to_try:
                items = soup.select(selector)
                if items:
                    print(f"   ✅ 使用选择器: {selector}, 找到 {len(items)} 个结果")
                    break

            for item in items[:10]:  # 限制每个搜索最多10个
                try:
                    # 尝试多种方式提取链接
                    link = None
                    name = None

                    # 方式1: 直接查找链接
                    link_elem = item.find('a', href=True)
                    if link_elem and '/organization/' in link_elem.get('href', ''):
                        link = urljoin('https://www.crunchbase.com', link_elem['href'])
                        name = link_elem.get_text().strip()

                    # 方式2: 查找特定属性的链接
                    if not link:
                        link_elem = item.find('a', {'data-test': 'company-name-link'})
                        if link_elem:
                            link = urljoin('https://www.crunchbase.com', link_elem.get('href', ''))
                            name = link_elem.get_text().strip()

                    if link and name:
                        platforms.append({
                            'name': name,
                            'url': link,
                            'domain': 'crunchbase.com',
                            'source': 'crunchbase',
                            'term': term
                        })

                except Exception as e:
                    continue

            self.smart_delay()

        return platforms

    def scrape_product_hunt(self) -> List[Dict]:
        """爬取Product Hunt"""
        platforms = []

        categories = ['fintech', 'payments', 'creator-tools', 'monetization']

        for category in categories[:2]:  # 限制类别数量
            print(f"   🚀 Product Hunt分类: {category}")

            url = f"https://www.producthunt.com/topics/{category}"

            response = self.make_request(url)
            if not response:
                continue

            soup = BeautifulSoup(response.content, 'html.parser')

            # Product Hunt经常改变布局，尝试多种选择器
            selectors_to_try = [
                'a[href*="/posts/"]',
                'li[data-test*="post"]',
                'div[class*="PostItem"]',
                'article'
            ]

            items = []
            for selector in selectors_to_try:
                items = soup.select(selector)
                if items:
                    print(f"   ✅ 使用选择器: {selector}")
                    break

            for item in items[:10]:  # 限制每个分类最多10个
                try:
                    link_elem = item.find('a', href=True)
                    if link_elem and '/posts/' in link_elem.get('href', ''):
                        link = urljoin('https://www.producthunt.com', link_elem['href'])
                        name = link_elem.get_text().strip()

                        # 尝试获取更多信息
                        desc_elem = item.find('p') or item.find('div', {'class': 'tagline'})
                        description = desc_elem.get_text().strip() if desc_elem else ''

                        platforms.append({
                            'name': name,
                            'url': link,
                            'domain': 'producthunt.com',
                            'source': 'product_hunt',
                            'category': category,
                            'description': description[:100]
                        })

                except Exception as e:
                    continue

            self.smart_delay(3, 6)

        return platforms

    def discover_via_duckduckgo(self, query: str) -> List[Dict]:
        """使用DuckDuckGo发现平台"""
        platforms = []

        print(f"   🔍 DuckDuckGo搜索: {query}")

        # 使用HTML版本
        search_url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"

        response = self.make_request(search_url)
        if not response:
            return platforms

        soup = BeautifulSoup(response.content, 'html.parser')

        # 查找搜索结果
        results = soup.find_all('div', class_='result')

        for result in results[:5]:  # 限制最多5个结果
            try:
                link_elem = result.find('a', class_='result__a')
                if link_elem and link_elem.get('href'):
                    url = link_elem['href']
                    title = link_elem.get_text().strip()

                    # 跳过明显的非平台链接
                    skip_domains = ['wikipedia', 'stackoverflow', 'github', 'youtube']
                    parsed = urlparse(url)
                    if any(skip in parsed.netloc for skip in skip_domains):
                        continue

                    # 提取域名
                    domain = parsed.netloc.replace('www.', '')

                    if domain:
                        platforms.append({
                            'name': title,
                            'url': url,
                            'domain': domain,
                            'source': 'duckduckgo_search',
                            'query': query
                        })

            except Exception as e:
                continue

        return platforms

    def discover_platforms(self, target_count: int = 30) -> List[Dict]:
        """主发现方法"""
        print(f"\n🕷️ 开始增强版网络爬虫 (目标: {target_count}个)...")

        all_platforms = []

        # 1. 基于已验证平台搜索相似平台
        if self.verified_platforms:
            print("\n1️⃣ 基于已验证平台搜索相似平台...")
            sample_platforms = self.verified_platforms[:3]  # 只取前3个

            for platform in sample_platforms:
                name = platform.get('name', '')
                if name:
                    query = f"alternatives to {name}"
                    similar = self.discover_via_duckduckgo(query)
                    all_platforms.extend(similar)
                    print(f"   ✅ {name}: 发现 {len(similar)} 个相关平台")

        # 2. 直接搜索关键词
        print("\n2️⃣ 搜索平台关键词...")
        search_terms = [
            'creator platform for payments',
            'online fundraising platform',
            'monetization platform for creators',
            'digital payment solutions'
        ]

        for term in search_terms[:2]:  # 限制搜索数量
            platforms = self.discover_via_duckduckgo(term)
            all_platforms.extend(platforms)
            self.smart_delay(5, 8)

        # 3. 尝试爬取专业网站（可选，因为反爬虫较严）
        # print("\n3️⃣ 尝试爬取专业网站...")
        # cb_platforms = self.scrape_crunchbase()
        # all_platforms.extend(cb_platforms)

        # ph_platforms = self.scrape_product_hunt()
        # all_platforms.extend(ph_platforms)

        # 4. 去重
        seen_domains = set()
        unique_platforms = []

        for platform in all_platforms:
            domain = platform.get('domain', '')
            if domain and domain not in seen_domains:
                seen_domains.add(domain)
                unique_platforms.append(platform)

        # 5. 限制数量
        result_platforms = unique_platforms[:target_count]

        print(f"\n🎉 爬虫完成！发现 {len(result_platforms)} 个平台")

        # 保存结果
        self.save_results(result_platforms)

        return result_platforms

    def save_results(self, platforms: List[Dict]):
        """保存结果"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'method': 'enhanced_web_scraping',
            'total_found': len(platforms),
            'platforms': platforms
        }

        with open('enhanced_scraper_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"   💾 结果已保存到 enhanced_scraper_results.json")

# 测试
if __name__ == "__main__":
    scraper = EnhancedWebScraper()
    platforms = scraper.discover_platforms(20)

    print("\n📊 发现的平台:")
    for i, platform in enumerate(platforms, 1):
        print(f"\n{i}. {platform.get('name', 'Unknown')}")
        print(f"   URL: {platform.get('url', '')}")
        print(f"   域名: {platform.get('domain', '')}")
        print(f"   来源: {platform.get('source', '')}")
        if platform.get('description'):
            print(f"   描述: {platform['description'][:80]}...")