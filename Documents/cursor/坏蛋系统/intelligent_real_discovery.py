#!/usr/bin/env python3
"""
智能真实平台发现工具
基于权威数据源和智能爬取策略，只发现真实存在的平台
"""

import requests
import json
import time
import random
import socket
import whois
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional
from datetime import datetime
import re

class IntelligentRealDiscovery:
    """智能真实平台发现系统"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        # 加载已验证平台
        try:
            with open('verified_platforms.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.verified_platforms = data.get('platforms', [])
                self.verified_domains = {p.get('domain', '') for p in self.verified_platforms}
        except:
            self.verified_platforms = []
            self.verified_domains = set()

        # 权威数据源配置
        self.authoritative_sources = [
            {
                'name': 'AlternativeTo',
                'base_url': 'https://alternativeto.net',
                'search_path': '/browse/search/?q={query}',
                'platform_types': ['payment', 'crowdfunding', 'creator', 'donation']
            },
            {
                'name': 'Product Hunt',
                'base_url': 'https://www.producthunt.com',
                'search_path': '/search?q={query}',
                'categories': ['creator-tools', 'monetization', 'payments', 'fintech']
            },
            {
                'name': 'Capterra',
                'base_url': 'https://www.capterra.com',
                'search_path': '/search?q={query}',
                'categories': ['payment-processing', 'fundraising', 'donation-management']
            }
        ]

        # 平台相关关键词
        self.platform_keywords = [
            'payment platform', 'creator platform', 'monetization',
            'crowdfunding', 'donation platform', 'fundraising',
            'creator economy', 'digital payments', 'online payments',
            'subscription platform', 'membership platform', 'tip jar'
        ]

    def verify_domain_exists(self, domain: str) -> Dict:
        """验证域名是否真实存在"""
        try:
            # 1. DNS查询
            socket.gethostbyname(domain)
            dns_ok = True
        except:
            dns_ok = False

        # 2. HTTP访问测试
        http_status = None
        http_ok = False
        try:
            response = self.session.get(f"https://{domain}", timeout=10, allow_redirects=True)
            http_status = response.status_code
            http_ok = response.status_code < 400
        except:
            pass

        # 3. WHOIS查询（简化版，避免频繁请求）
        domain_age = None
        try:
            w = whois.whois(domain)
            if w.creation_date:
                if isinstance(w.creation_date, list):
                    domain_age = (datetime.now() - w.creation_date[0]).days
                else:
                    domain_age = (datetime.now() - w.creation_date).days
        except:
            pass

        return {
            'domain': domain,
            'dns_ok': dns_ok,
            'http_ok': http_ok,
            'http_status': http_status,
            'domain_age_days': domain_age,
            'is_real': dns_ok and http_ok
        }

    def crawl_alternativeto(self, query: str) -> List[Dict]:
        """从AlternativeTo爬取平台"""
        platforms = []
        try:
            search_url = f"https://alternativeto.net/browse/search/?q={query.replace(' ', '%20')}"
            print(f"   🔍 爬取 {search_url}")

            response = self.session.get(search_url, timeout=15)
            if response.status_code != 200:
                return platforms

            soup = BeautifulSoup(response.content, 'html.parser')

            # 查找应用列表项
            app_items = soup.find_all('li', {'class': 'ListItem'})

            for item in app_items[:10]:  # 限制每页最多10个
                try:
                    link = item.find('a', {'class': 'ItemLink'})
                    if link and link.get('href'):
                        name = link.get_text().strip()
                        href = link.get('href')
                        full_url = urljoin('https://alternativeto.net', href)

                        # 提取域名
                        # AlternativeTo通常不直接显示域名，需要访问详情页
                        platforms.append({
                            'name': name,
                            'url': full_url,
                            'domain': '',  # 稍后补充
                            'source': 'alternativeto',
                            'query': query
                        })
                except Exception as e:
                    continue

        except Exception as e:
            print(f"   ❌ AlternativeTo错误: {e}")

        return platforms

    def search_similar_platforms(self, platform_name: str) -> List[Dict]:
        """基于已知平台搜索相似平台"""
        similar_platforms = []

        # 使用搜索引擎查找相似平台
        queries = [
            f"alternatives to {platform_name}",
            f"platforms like {platform_name}",
            f"{platform_name} competitors"
        ]

        for query in queries[:1]:  # 限制查询数量
            try:
                # 使用更可靠的搜索方式
                search_url = f"https://duckduckgo.com/html/?q={query.replace(' ', '+')}"
                response = self.session.get(search_url, timeout=10)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    results = soup.find_all('div', {'class': 'result'})

                    for result in results[:5]:
                        try:
                            link = result.find('a', {'class': 'result__a'})
                            if link and link.get('href'):
                                url = link['href']
                                title = link.get_text().strip()

                                # 解析域名
                                parsed = urlparse(url)
                                domain = parsed.netloc.replace('www.', '')

                                if domain and domain not in self.verified_domains:
                                    similar_platforms.append({
                                        'name': title,
                                        'url': url,
                                        'domain': domain,
                                        'source': 'search_similar',
                                        'query': query
                                    })
                        except:
                            continue

                time.sleep(random.uniform(2, 4))  # 随机延迟

            except Exception as e:
                print(f"   ❌ 搜索错误: {e}")
                continue

        return similar_platforms

    def discover_from_verified_patterns(self) -> List[Dict]:
        """基于已验证平台的模式发现新平台"""
        new_platforms = []

        # 选择一些已验证的平台进行扩展
        sample_platforms = random.sample(self.verified_platforms, min(5, len(self.verified_platforms)))

        for platform in sample_platforms:
            name = platform.get('name', '')
            if not name:
                continue

            print(f"   🎯 基于已验证平台发现: {name}")

            # 搜索相似平台
            similar = self.search_similar_platforms(name)
            new_platforms.extend(similar)

            # 控制节奏
            time.sleep(random.uniform(3, 5))

        return new_platforms

    def enrich_platform_info(self, platform: Dict) -> Dict:
        """丰富平台信息"""
        domain = platform.get('domain', '')
        if not domain:
            return platform

        # 验证域名存在性
        verification = self.verify_domain_exists(domain)
        platform.update(verification)

        # 如果HTTP访问成功，尝试获取更多信息
        if verification.get('http_ok'):
            try:
                response = self.session.get(f"https://{domain}", timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # 提取描述
                    meta_desc = soup.find('meta', attrs={'name': 'description'})
                    if meta_desc:
                        platform['description'] = meta_desc.get('content', '')[:200]

                    # 查找支付相关关键词
                    page_text = soup.get_text().lower()
                    payment_keywords = ['payment', 'stripe', 'paypal', 'donate', 'buy', 'checkout']
                    payment_score = sum(1 for kw in payment_keywords if kw in page_text)
                    platform['payment_relevance_score'] = payment_score
            except:
                pass

        return platform

    def discover_real_platforms(self, target_count: int = 20) -> List[Dict]:
        """发现真实平台的主方法"""
        print(f"\n🎯 开始智能真实平台发现 (目标: {target_count}个)...")

        all_platforms = []

        # 1. 基于已验证平台的模式发现
        print("\n1️⃣ 基于已验证平台模式发现...")
        pattern_platforms = self.discover_from_verified_patterns()
        all_platforms.extend(pattern_platforms)
        print(f"   ✅ 模式发现: {len(pattern_platforms)} 个平台")

        # 2. 从AlternativeTo发现
        print("\n2️⃣ 从AlternativeTo发现...")
        for keyword in ['payment platform', 'creator tools', 'donation platform'][:2]:  # 限制搜索
            at_platforms = self.crawl_alternativeto(keyword)
            all_platforms.extend(at_platforms)
            print(f"   ✅ {keyword}: {len(at_platforms)} 个平台")
            time.sleep(random.uniform(3, 5))

        # 3. 去重
        seen_domains = set()
        unique_platforms = []
        for platform in all_platforms:
            domain = platform.get('domain', '')
            if domain and domain not in seen_domains and domain not in self.verified_domains:
                seen_domains.add(domain)
                unique_platforms.append(platform)

        # 4. 丰富信息并验证真实性
        print("\n3️⃣ 验证平台真实性...")
        verified_platforms = []
        for i, platform in enumerate(unique_platforms):
            if not platform.get('domain'):
                # 尝试从URL提取域名
                url = platform.get('url', '')
                if url:
                    parsed = urlparse(url)
                    platform['domain'] = parsed.netloc.replace('www.', '')

            if platform.get('domain'):
                enriched = self.enrich_platform_info(platform)
                if enriched.get('is_real'):
                    verified_platforms.append(enriched)
                    print(f"   ✅ {enriched['name']} ({enriched['domain']}) - 真实平台")
                else:
                    print(f"   ❌ {platform.get('name', 'Unknown')} - 验证失败")

            # 控制节奏，避免请求过快
            if i < len(unique_platforms) - 1:
                time.sleep(random.uniform(2, 4))

        # 5. 限制数量并保存
        final_platforms = verified_platforms[:target_count]

        print(f"\n🎉 发现完成！找到 {len(final_platforms)} 个真实平台")

        # 保存结果
        self.save_discovery_results(final_platforms)

        return final_platforms

    def save_discovery_results(self, platforms: List[Dict]):
        """保存发现结果"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'method': 'intelligent_real_discovery',
            'total_found': len(platforms),
            'verified_count': len([p for p in platforms if p.get('is_real')]),
            'platforms': platforms
        }

        with open('intelligent_discovery_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"   💾 结果已保存到 intelligent_discovery_results.json")

# 测试运行
if __name__ == "__main__":
    discovery = IntelligentRealDiscovery()
    platforms = discovery.discover_real_platforms(15)

    print("\n📊 发现的真实平台:")
    for i, platform in enumerate(platforms, 1):
        print(f"\n{i}. {platform.get('name', 'Unknown')}")
        print(f"   域名: {platform.get('domain', '')}")
        print(f"   来源: {platform.get('source', '')}")
        if platform.get('description'):
            print(f"   描述: {platform['description'][:100]}...")
        print(f"   可信度: {'✅' if platform.get('is_real') else '❌'}")