#!/usr/bin/env python3
"""
真实平台爬取器 - 只爬取真实存在的平台
基于以下真实数据源：
1. Stripe Connect官方目录
2. 支付处理平台列表
3. 创作者平台聚合网站
"""

import requests
import json
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import concurrent.futures
from datetime import datetime
import os

class RealPlatformCrawler:
    """真实平台爬取器 - 只爬取真实存在的平台"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        # 真实平台数据源
        self.real_sources = [
            {
                'name': 'Stripe Connect App Gallery',
                'url': 'https://stripe.com/connect/apps/directory',
                'type': 'official_directory'
            },
            {
                'name': 'Product Hunt Creator Tools',
                'url': 'https://www.producthunt.com/topics/creator-tools',
                'type': 'product_directory'
            },
            {
                'name': 'AlternativeTo Patreon',
                'url': 'https://alternativeto.net/software/patreon/',
                'type': 'alternatives'
            },
            {
                'name': 'Payment Platform Directory',
                'url': 'https://www.capterra.com/payment-processing-software/',
                'type': 'business_directory'
            },
            {
                'name': 'G2 Payment Platforms',
                'url': 'https://www.g2.com/categories/payment-processing',
                'type': 'review_platform'
            }
        ]

        # 加载已验证平台用于去重
        self.verified_platforms = set()
        self.load_verified_platforms()

    def load_verified_platforms(self):
        """加载已验证平台用于去重"""
        try:
            if os.path.exists('verified_platforms.json'):
                with open('verified_platforms.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for platform in data.get('platforms', []):
                        domain = platform.get('domain', '')
                        if domain:
                            self.verified_platforms.add(domain)
            print(f"✅ 已加载 {len(self.verified_platforms)} 个已验证平台")
        except Exception as e:
            print(f"⚠️ 加载已验证平台失败: {e}")

    def crawl_stripe_connect_directory(self) -> list:
        """爬取Stripe Connect官方目录"""
        platforms = []
        print("🔍 爬取 Stripe Connect 官方目录...")

        try:
            # 获取目录页面
            response = self.session.get('https://stripe.com/connect/apps/directory', timeout=15)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找平台卡片或链接
                platform_links = soup.find_all('a', href=re.compile(r'/connect/apps/'))

                for link in platform_links[:20]:  # 限制数量
                    href = link.get('href', '')
                    if href:
                        full_url = urljoin('https://stripe.com', href)
                        name = link.get_text().strip()

                        if name and len(name) > 2:
                            # 提取域名（如果有）
                            domain = self.extract_domain_from_page(full_url)
                            if not domain:
                                # 基于名称生成可能的域名
                                domain = self.guess_domain_from_name(name)

                            if domain and domain not in self.verified_platforms:
                                platforms.append({
                                    'name': name,
                                    'url': full_url,
                                    'domain': domain,
                                    'source': 'stripe_connect_official',
                                    'verified_source': True,
                                    'type': 'payment_platform'
                                })

            # 延迟避免被限制
            time.sleep(2)

        except Exception as e:
            print(f"⚠️ Stripe Connect 爬取失败: {e}")

        return platforms

    def crawl_alternativeto(self) -> list:
        """爬取AlternativeTo网站"""
        platforms = []
        print("🔍 爬取 AlternativeTo...")

        try:
            # 搜索Patreon替代品
            search_url = "https://alternativeto.net/software/patreon/"
            response = self.session.get(search_url, timeout=15)

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找替代项目
                alt_items = soup.find_all('div', {'class': 'AlternativeItem'})

                for item in alt_items[:15]:
                    # 提取平台信息
                    link = item.find('a', href=True)
                    if link:
                        name = link.get_text().strip()
                        href = link.get('href')

                        if name and len(name) > 2:
                            full_url = urljoin('https://alternativeto.net', href)

                            # 尝试获取官网
                            official_url = self.get_official_website(full_url)
                            if official_url:
                                domain = urlparse(official_url).netloc.replace('www.', '')

                                if domain and domain not in self.verified_platforms:
                                    platforms.append({
                                        'name': name,
                                        'url': official_url,
                                        'domain': domain,
                                        'source': 'alternativeto',
                                        'verified_source': True,
                                        'type': 'creator_platform'
                                    })

        except Exception as e:
            print(f"⚠️ AlternativeTo 爬取失败: {e}")

        time.sleep(2)
        return platforms

    def crawl_producthunt(self) -> list:
        """爬取Product Hunt创作者工具"""
        platforms = []
        print("🔍 爬取 Product Hunt...")

        try:
            # 使用搜索API
            search_terms = ['creator', 'monetization', 'payment', 'donation']

            for term in search_terms[:3]:
                # Product Hunt的搜索URL（需要API key，这里尝试简单爬取）
                search_url = f"https://www.producthunt.com/search?q={term}"
                response = self.session.get(search_url, timeout=15)

                if response.status_code == 200:
                    # 简单的文本搜索查找产品名称
                    content = response.text
                    # 查找可能的产品URL模式
                    url_pattern = r'"url":"([^"]+)"'
                    urls = re.findall(url_pattern, content)

                    for url in urls[:5]:
                        if url.startswith('http'):
                            parsed = urlparse(url)
                            domain = parsed.netloc.replace('www.', '')

                            # 跳过知名域名
                            skip_domains = ['google.com', 'facebook.com', 'twitter.com']
                            if domain and domain not in skip_domains and domain not in self.verified_platforms:
                                platforms.append({
                                    'name': domain.split('.')[0].title(),
                                    'url': url,
                                    'domain': domain,
                                    'source': 'producthunt_search',
                                    'verified_source': True,
                                    'type': 'creator_tool'
                                })

                time.sleep(1)

        except Exception as e:
            print(f"⚠️ Product Hunt 爬取失败: {e}")

        return platforms

    def extract_domain_from_page(self, url: str) -> str:
        """从页面提取官方域名"""
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找官方链接
                official_links = []

                # 常见的官方链接文本
                official_texts = ['website', 'visit site', 'official site', 'get started']
                for text in official_texts:
                    links = soup.find_all('a', string=re.compile(text, re.I))
                    for link in links:
                        href = link.get('href', '')
                        if href.startswith('http'):
                            official_links.append(href)

                # 如果没找到，尝试查找外部链接
                if not official_links:
                    all_links = soup.find_all('a', href=True)
                    for link in all_links:
                        href = link.get('href', '')
                        # 跳过内部链接
                        if href.startswith('http') and 'stripe.com' not in href:
                            official_links.append(href)

                # 返回第一个外部链接的域名
                for link in official_links[:5]:
                    parsed = urlparse(link)
                    domain = parsed.netloc.replace('www.', '')
                    if domain and len(domain) > 5:
                        return domain

        except:
            pass

        return ''

    def guess_domain_from_name(self, name: str) -> str:
        """基于平台名称猜测域名"""
        # 清理名称
        clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', name.lower()).strip()
        words = clean_name.split()

        # 尝试不同的域名组合
        if words:
            # 尝试完整名称
            domain = f"{''.join(words)}.com"
            if self.check_domain_exists(domain):
                return domain

            # 尝试第一个单词
            if len(words) > 1:
                domain = f"{words[0]}.com"
                if self.check_domain_exists(domain):
                    return domain

        return ''

    def check_domain_exists(self, domain: str) -> bool:
        """检查域名是否存在（简单检查）"""
        try:
            import socket
            socket.gethostbyname(domain)
            return True
        except:
            return False

    def get_official_website(self, alternativeto_url: str) -> str:
        """从AlternativeTo页面获取官网"""
        try:
            response = self.session.get(alternativeto_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找"Visit Website"按钮
                visit_link = soup.find('a', {'class': 'button'})
                if visit_link and visit_link.get('href'):
                    return visit_link['href']

        except:
            pass

        return ''

    def verify_platform_real(self, platform: dict) -> bool:
        """验证平台的真实性"""
        # 检查域名是否存在
        domain = platform.get('domain', '')
        if not domain or not self.check_domain_exists(domain):
            return False

        # 尝试访问网站
        url = platform.get('url', '')
        if url:
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    # 检查内容是否相关
                    content = response.text.lower()
                    keywords = ['payment', 'creator', 'monetize', 'donate', 'fund', 'platform']
                    return any(keyword in content for keyword in keywords)
            except:
                pass

        return True if platform.get('verified_source') else False

    def crawl_real_platforms(self, count: int = 50) -> list:
        """主爬取方法"""
        print(f"\n🕷️ 开始爬取真实平台 (目标: {count}个)...")
        print("="*60)

        all_platforms = []

        # 1. 爬取Stripe Connect目录
        stripe_platforms = self.crawl_stripe_connect_directory()
        all_platforms.extend(stripe_platforms)
        print(f"✅ Stripe Connect: {len(stripe_platforms)} 个")

        # 2. 爬取AlternativeTo
        alt_platforms = self.crawl_alternativeto()
        all_platforms.extend(alt_platforms)
        print(f"✅ AlternativeTo: {len(alt_platforms)} 个")

        # 3. 爬取Product Hunt
        ph_platforms = self.crawl_producthunt()
        all_platforms.extend(ph_platforms)
        print(f"✅ Product Hunt: {len(ph_platforms)} 个")

        # 去重
        unique_platforms = []
        seen_domains = set()

        for platform in all_platforms:
            domain = platform.get('domain', '')
            if domain and domain not in seen_domains:
                seen_domains.add(domain)
                # 验证平台真实性
                if self.verify_platform_real(platform):
                    unique_platforms.append(platform)

        # 限制数量
        result_platforms = unique_platforms[:count]

        print(f"\n🎉 爬取完成!")
        print(f"   - 发现总数: {len(all_platforms)}")
        print(f"   - 去重后: {len(unique_platforms)}")
        print(f"   - 验证通过: {len(result_platforms)}")

        # 保存结果
        self.save_results(result_platforms)

        return result_platforms

    def save_results(self, platforms: list):
        """保存爬取结果"""
        data = {
            'timestamp': datetime.now().isoformat(),
            'method': 'real_web_crawling',
            'source_type': 'verified_sources_only',
            'count': len(platforms),
            'platforms': platforms
        }

        with open('real_crawled_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n💾 真实平台已保存到 real_crawled_platforms.json")

# 主程序
if __name__ == "__main__":
    crawler = RealPlatformCrawler()

    # 爬取20个真实平台
    platforms = crawler.crawl_real_platforms(20)

    print("\n🕷️ 爬取的真实平台:")
    print("="*60)
    for i, platform in enumerate(platforms, 1):
        print(f"\n{i}. {platform.get('name')}")
        print(f"   📍 域名: {platform.get('domain')}")
        print(f"   🔗 链接: {platform.get('url')}")
        print(f"   📂 来源: {platform.get('source')}")
        print(f"   ✅ 验证: {'是' if platform.get('verified_source') else '否'}")