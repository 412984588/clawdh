#!/usr/bin/env python3
"""
平台扩展爬虫 - 基于已验证平台发现新平台
使用智能方法发现和验证真实平台
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from datetime import datetime
import random
import os

class PlatformExpansionCrawler:
    """基于已验证平台的扩展爬虫"""

    def __init__(self):
        self.session = requests.Session()

        # 使用多个User-Agent避免被限制
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]

        # 加载已验证平台
        self.verified_platforms = []
        self.platform_domains = set()
        self.load_verified_platforms()

        # 创作者平台关键词
        self.creator_keywords = [
            'creator platform', 'monetize', 'patreon alternative', 'ko-fi alternative',
            'creator tools', 'content monetization', 'creator economy', 'support creators',
            'tip jar', 'donation platform', 'membership platform', 'subscription platform'
        ]

        # 支付平台关键词
        self.payment_keywords = [
            'payment platform', 'stripe connect', 'payment solution', 'online payments',
            'payment gateway', 'merchant services', 'accept payments', 'payment processor'
        ]

    def load_verified_platforms(self):
        """加载已验证平台"""
        try:
            with open('verified_platforms.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.verified_platforms = data.get('platforms', [])
                for p in self.verified_platforms:
                    domain = p.get('domain', '')
                    if domain:
                        self.platform_domains.add(domain)
            print(f"✅ 已加载 {len(self.verified_platforms)} 个已验证平台")
        except Exception as e:
            print(f"⚠️ 加载失败: {e}")

    def get_random_user_agent(self):
        """获取随机User-Agent"""
        return random.choice(self.user_agents)

    def search_google_for_alternatives(self, platform_name: str) -> list:
        """搜索平台的替代品"""
        alternatives = []
        print(f"   🔍 搜索 {platform_name} 的替代品...")

        # 构建搜索查询
        queries = [
            f"{platform_name} alternatives",
            f"platforms like {platform_name}",
            f"similar to {platform_name}",
            f"{platform_name} competitors"
        ]

        for query in queries[:2]:  # 限制查询数量
            try:
                # 使用DuckDuckGo进行搜索
                self.session.headers.update({
                    'User-Agent': self.get_random_user_agent()
                })

                search_url = f"https://duckduckgo.com/html/?q={query.replace(' ', '+')}"
                response = self.session.get(search_url, timeout=10)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    results = soup.find_all('div', class_='result')

                    for result in results[:3]:  # 每个查询取前3个结果
                        link_tag = result.find('a', class_='result__a')
                        if link_tag and link_tag.get('href'):
                            url = link_tag['href']
                            title = link_tag.get_text().strip()

                            # 解析域名
                            parsed = urlparse(url)
                            domain = parsed.netloc.replace('www.', '')

                            # 跳过已知域名
                            skip_domains = ['google.com', 'facebook.com', 'twitter', 'wikipedia.org']
                            if domain and domain not in skip_domains and domain not in self.platform_domains:
                                alternatives.append({
                                    'name': title,
                                    'url': url,
                                    'domain': domain,
                                    'source': f'{platform_name}_alternatives',
                                    'type': 'alternative'
                                })

                # 延迟避免被限制
                time.sleep(random.uniform(2, 4))

            except Exception as e:
                print(f"      ⚠️ 搜索错误: {e}")
                continue

        return alternatives

    def discover_from_crunchbase_search(self) -> list:
        """从Crunchbase搜索发现公司"""
        platforms = []
        print("🔍 从 Crunchbase 搜索...")

        search_terms = ['creator economy', 'payment platform', 'fintech']

        for term in search_terms[:2]:
            try:
                # 使用搜索URL（简化版）
                search_url = f"https://www.crunchbase.com/search/organizations/field/organizations/funding_total/top80/organization_types/{term.replace(' ', '%20')}"

                self.session.headers.update({
                    'User-Agent': self.get_random_user_agent()
                })

                response = self.session.get(search_url, timeout=10)

                if response.status_code == 200:
                    # 简单提取公司名称
                    content = response.text
                    # 查找组织链接模式
                    org_pattern = r'href="/organization/([^"]+)"'
                    orgs = re.findall(org_pattern, content)

                    for org in orgs[:5]:
                        name = org.replace('-', ' ').title()
                        domain = f"{org}.com"

                        if domain not in self.platform_domains:
                            platforms.append({
                                'name': name,
                                'url': f"https://www.crunchbase.com/organization/{org}",
                                'domain': domain,
                                'source': 'crunchbase_search',
                                'type': 'startup'
                            })

                time.sleep(3)

            except Exception as e:
                print(f"   ⚠️ Crunchbase搜索失败: {e}")

        return platforms

    def discover_from_github(self) -> list:
        """从GitHub发现开源项目"""
        platforms = []
        print("🔍 从 GitHub 搜索...")

        search_queries = [
            'stripe connect alternatives',
            'creator platform',
            'payment system',
            'donation platform'
        ]

        for query in search_queries[:2]:
            try:
                search_url = f"https://github.com/search?q={query.replace(' ', '+')}&type=repositories"

                self.session.headers.update({
                    'User-Agent': self.get_random_user_agent()
                })

                response = self.session.get(search_url, timeout=10)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # 查找仓库链接
                    repo_links = soup.find_all('a', {'data-hydro-click': True})

                    for link in repo_links[:3]:
                        href = link.get('href', '')
                        if href.startswith('/'):
                            full_url = f"https://github.com{href}"
                            name = link.get_text().strip()

                            # 尝试获取项目网站
                            website = self.get_project_website(full_url)
                            if website:
                                parsed = urlparse(website)
                                domain = parsed.netloc.replace('www.', '')

                                if domain not in self.platform_domains:
                                    platforms.append({
                                        'name': name,
                                        'url': website,
                                        'domain': domain,
                                        'source': 'github_project',
                                        'type': 'opensource'
                                    })

                time.sleep(3)

            except Exception as e:
                print(f"   ⚠️ GitHub搜索失败: {e}")

        return platforms

    def get_project_website(self, github_url: str) -> str:
        """获取GitHub项目的官方网站"""
        try:
            response = self.session.get(github_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找网站链接
                website_link = soup.find('a', {'data-repository-hovercards-enabled': True})
                if website_link:
                    href = website_link.get('href', '')
                    if href.startswith('http'):
                        return href

        except:
            pass

        return ''

    def verify_platform_reality(self, platform: dict) -> bool:
        """验证平台的真实性"""
        domain = platform.get('domain', '')
        if not domain:
            return False

        # 检查是否已在验证列表中
        if domain in self.platform_domains:
            return False

        # 尝试访问网站
        url = platform.get('url', '')
        if not url:
            url = f"https://{domain}"

        try:
            response = self.session.get(url, timeout=10, allow_redirects=True)
            if response.status_code == 200:
                # 检查内容相关性
                content = response.text.lower()
                relevant_keywords = ['payment', 'creator', 'monetize', 'donate', 'fund', 'platform', 'stripe', 'paypal']
                score = sum(1 for kw in relevant_keywords if kw in content)

                # 如果找到至少2个相关关键词，认为是真实的
                if score >= 2:
                    return True

        except Exception as e:
            print(f"   ❌ {domain}: {e}")
            return False

        return False

    def expand_platforms(self, count: int = 30) -> list:
        """主扩展方法"""
        print(f"\n🚀 开始平台扩展发现 (目标: {count}个)...")
        print("="*60)

        all_platforms = []

        # 1. 从已验证平台搜索替代品
        print("\n1️⃣ 搜索已验证平台的替代品...")
        sample_platforms = random.sample(self.verified_platforms, min(10, len(self.verified_platforms)))

        for platform in sample_platforms:
            name = platform.get('name', '')
            if name:
                alternatives = self.search_google_for_alternatives(name)
                all_platforms.extend(alternatives)

        # 2. 从Crunchbase搜索
        print("\n2️⃣ 从 Crunchbase 搜索...")
        crunchbase_platforms = self.discover_from_crunchbase_search()
        all_platforms.extend(crunchbase_platforms)

        # 3. 从GitHub搜索
        print("\n3️⃣ 从 GitHub 搜索...")
        github_platforms = self.discover_from_github()
        all_platforms.extend(github_platforms)

        # 去重
        unique_platforms = []
        seen_domains = set()

        for platform in all_platforms:
            domain = platform.get('domain', '')
            if domain and domain not in seen_domains:
                seen_domains.add(domain)

                # 验证平台真实性
                print(f"\n🔍 验证平台: {platform.get('name')} ({domain})")
                if self.verify_platform_reality(platform):
                    unique_platforms.append(platform)
                    print(f"   ✅ 通过验证")
                else:
                    print(f"   ❌ 未通过验证")

        # 限制数量
        result_platforms = unique_platforms[:count]

        print(f"\n📊 扩展完成!")
        print(f"   - 发现总数: {len(all_platforms)}")
        print(f"   - 去重后: {len(unique_platforms)}")
        print(f"   - 验证通过: {len(result_platforms)}")

        # 保存结果
        self.save_results(result_platforms)

        return result_platforms

    def save_results(self, platforms: list):
        """保存结果"""
        data = {
            'timestamp': datetime.now().isoformat(),
            'method': 'expansion_crawling',
            'based_on_verified': len(self.verified_platforms),
            'count': len(platforms),
            'platforms': platforms
        }

        with open('expanded_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n💾 扩展平台已保存到 expanded_platforms.json")

# 主程序
if __name__ == "__main__":
    crawler = PlatformExpansionCrawler()

    # 扩展发现20个平台
    platforms = crawler.expand_platforms(20)

    print("\n🎯 扩展发现的平台:")
    print("="*60)
    for i, platform in enumerate(platforms, 1):
        print(f"\n{i}. {platform.get('name')}")
        print(f"   🌐 网站: https://{platform.get('domain')}")
        print(f"   🔗 来源: {platform.get('source')}")
        print(f"   📝 类型: {platform.get('type')}")
        print(f"   ✅ 状态: 已验证")