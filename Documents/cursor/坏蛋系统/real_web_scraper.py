#!/usr/bin/env python3
"""
真实网站爬取器 - 爬取真实的支付和创作者平台数据
"""

import asyncio
import json
import random
import time
from datetime import datetime
from typing import List, Dict, Optional
from playwright.async_api import async_playwright
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('real_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RealWebScraper:
    def __init__(self):
        # 真实的平台目录网站
        self.target_sites = [
            {
                "name": "G2",
                "url": "https://www.g2.com/categories/payments",
                "platform_selector": ".paper-paper",
                "platform_fields": {
                    "name": ".paper-title",
                    "description": ".paper-description",
                    "link": "a"
                }
            },
            {
                "name": "Capterra",
                "url": "https://www.capterra.com/payment-processing-software/",
                "platform_selector": ".srp-list-item",
                "platform_fields": {
                    "name": ".srp-product-name",
                    "description": ".short-description",
                    "link": "a"
                }
            },
            {
                "name": "GetApp",
                "url": "https://www.getapp.com/payment-processing-software/",
                "platform_selector": ".ListItem",
                "platform_fields": {
                    "name": ".Card__title",
                    "description": ".Card__description",
                    "link": "a"
                }
            },
            {
                "name": "SoftwareWorld",
                "url": "https://www.softwareworld.co/payment-processing-software/",
                "platform_selector": ".product-listing",
                "platform_fields": {
                    "name": ".product-title",
                    "description": ".product-description",
                    "link": "a"
                }
            },
            {
                "name": "SourceForge",
                "url": "https://sourceforge.net/business/payment-processing/",
                "platform_selector": ".product-card",
                "platform_fields": {
                    "name": ".product-title",
                    "description": ".product-description",
                    "link": "a"
                }
            }
        ]

        # 支付平台相关的搜索词
        self.search_terms = [
            "payment processing software",
            "online payment platforms",
            "creator monetization tools",
            "donation platforms",
            "crowdfunding software",
            "subscription management",
            "e-commerce payment solutions",
            "merchant services",
            "digital wallet platforms",
            "peer-to-peer payment"
        ]

        # 已爬取的域名（去重）
        self.scraped_domains = set()
        self.load_existing_domains()

    def load_existing_domains(self):
        """加载已知的域名"""
        try:
            with open("verified_platforms.json", "r") as f:
                data = json.load(f)
                for p in data.get("platforms", []):
                    domain = p.get("platform_domain", p.get("domain", ""))
                    if domain:
                        self.scraped_domains.add(domain.lower())
        except:
            pass

    async def scrape_site(self, site: Dict, browser) -> List[Dict]:
        """爬取单个网站"""
        logger.info(f"🌐 正在爬取 {site['name']}: {site['url']}")

        page = await browser.new_page()
        platforms = []

        try:
            # 设置随机用户代理
            await page.set_user_agent(random.choice([
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
            ]))

            # 访问页面
            await page.goto(site["url"], wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)  # 等待页面加载

            # 查找平台元素
            platform_elements = await page.query_selector_all(site["platform_selector"])
            logger.info(f"  📋 找到 {len(platform_elements)} 个平台")

            for element in platform_elements[:50]:  # 限制每个网站最多50个
                try:
                    platform_info = {}

                    # 获取名称
                    name_elem = await element.query_selector(site["platform_fields"]["name"])
                    if name_elem:
                        platform_info["name"] = await name_elem.inner_text()

                    # 获取描述
                    desc_elem = await element.query_selector(site["platform_fields"]["description"])
                    if desc_elem:
                        platform_info["description"] = await desc_elem.inner_text()

                    # 获取链接
                    link_elem = await element.query_selector(site["platform_fields"]["link"])
                    if link_elem:
                        href = await link_elem.get_attribute("href")
                        if href:
                            # 处理相对URL
                            if href.startswith("/"):
                                href = site["url"].split("/")[0] + "//" + site["url"].split("/")[2] + href
                            platform_info["url"] = href

                            # 提取域名
                            from urllib.parse import urlparse
                            parsed = urlparse(href)
                            domain = parsed.netloc
                            if domain.startswith("www."):
                                domain = domain[4:]
                            platform_info["domain"] = domain

                    # 添加来源信息
                    platform_info["source"] = site["name"]
                    platform_info["scraped_date"] = datetime.now().isoformat()

                    if platform_info.get("domain") and platform_info["domain"] not in self.scraped_domains:
                        platforms.append(platform_info)
                        self.scraped_domains.add(platform_info["domain"])

                except Exception as e:
                    logger.debug(f"    ⚠️ 处理平台时出错: {e}")
                    continue

            logger.info(f"  ✅ 成功爬取 {len(platforms)} 个新平台")

        except Exception as e:
            logger.error(f"  ❌ 爬取失败: {str(e)}")
        finally:
            await page.close()

        return platforms

    async def search_google_alternatives(self, browser, term: str, max_results: int = 20) -> List[Dict]:
        """使用替代搜索引擎搜索"""
        logger.info(f"🔍 搜索: {term}")

        page = await browser.new_page()
        platforms = []

        try:
            # 使用 DuckDuckGo（不需要API密钥）
            await page.goto("https://duckduckgo.com/")

            # 输入搜索词
            await page.fill("#searchbox_input", term)
            await page.press("#searchbox_input", "Enter")
            await page.wait_for_timeout(2000)

            # 获取搜索结果
            results = await page.query_selector_all(".result")

            for result in results[:max_results]:
                try:
                    # 获取标题和链接
                    title_elem = await result.query_selector(".result__title a")
                    if title_elem:
                        title = await title_elem.inner_text()
                        url = await title_elem.get_attribute("href")

                        if url:
                            # 提取域名
                            from urllib.parse import urlparse
                            parsed = urlparse(url)
                            domain = parsed.netloc
                            if domain.startswith("www."):
                                domain = domain[4:]

                            # 过滤掉已知的非平台网站
                            skip_domains = ["google.com", "facebook.com", "linkedin.com", "youtube.com",
                                          "wikipedia.org", "github.com", "stackoverflow.com"]

                            if domain not in skip_domains and domain not in self.scraped_domains:
                                platforms.append({
                                    "name": title,
                                    "domain": domain,
                                    "url": url,
                                    "source": "duckduckgo_search",
                                    "search_term": term,
                                    "scraped_date": datetime.now().isoformat()
                                })
                                self.scraped_domains.add(domain)

                except Exception as e:
                    continue

            logger.info(f"  ✅ 找到 {len(platforms)} 个新平台")

        except Exception as e:
            logger.error(f"  ❌ 搜索失败: {str(e)}")
        finally:
            await page.close()

        return platforms

    async def run_scraping_session(self, max_pages: int = 10) -> List[Dict]:
        """运行爬取会话"""
        all_platforms = []

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            # 1. 爬取目录网站
            logger.info("\n📚 开始爬取目录网站...")
            for site in self.target_sites:
                platforms = await self.scrape_site(site, browser)
                all_platforms.extend(platforms)

                # 随机延迟，避免被封锁
                await asyncio.sleep(random.uniform(2, 5))

                if len(all_platforms) >= max_pages:
                    break

            # 2. 搜索特定类型的平台
            logger.info("\n🔍 开始搜索特定平台...")
            for term in self.search_terms[:5]:  # 限制搜索词数量
                if len(all_platforms) >= max_pages:
                    break

                platforms = await self.search_google_alternatives(browser, term, max_results=10)
                all_platforms.extend(platforms)

                # 随机延迟
                await asyncio.sleep(random.uniform(3, 6))

            await browser.close()

        # 去重
        unique_platforms = {}
        for p in all_platforms:
            domain = p.get("domain", "")
            if domain and domain not in unique_platforms:
                unique_platforms[domain] = p

        return list(unique_platforms.values())

    def save_platforms(self, platforms: List[Dict]):
        """保存爬取的平台数据"""
        # 加载现有的pending数据
        try:
            with open("pending_platforms.json", "r") as f:
                pending_data = json.load(f)
        except:
            pending_data = {"platforms": []}

        # 添加新平台
        for p in platforms:
            # 转换格式以匹配现有结构
            platform = {
                "platform_name": p.get("name", ""),
                "platform_domain": p.get("domain", ""),
                "platform_url": p.get("url", ""),
                "platform_description": p.get("description", ""),
                "platform_type": ["payment", "creator"],  # 默认类型
                "source": p.get("source", "unknown"),
                "discovered_date": p.get("scraped_date", datetime.now().isoformat()),
                "verification_status": "pending"
            }
            pending_data["platforms"].append(platform)

        # 保存
        with open("pending_platforms.json", "w") as f:
            json.dump(pending_data, f, indent=2, ensure_ascii=False)

        logger.info(f"\n💾 已保存 {len(platforms)} 个平台到 pending_platforms.json")

async def main():
    scraper = RealWebScraper()

    logger.info("🚀 启动真实网站爬取器")
    logger.info("注意：这是真实的网站爬取，需要网络连接")

    # 运行爬取
    platforms = await scraper.run_scraping_session(max_pages=100)

    if platforms:
        scraper.save_platforms(platforms)

        # 显示统计
        logger.info("\n📊 爬取统计:")
        logger.info(f"  - 新发现平台: {len(platforms)}")
        logger.info(f"  - 来源分布:")
        sources = {}
        for p in platforms:
            source = p.get("source", "unknown")
            sources[source] = sources.get(source, 0) + 1
        for source, count in sources.items():
            logger.info(f"    - {source}: {count}")

if __name__ == "__main__":
    asyncio.run(main())