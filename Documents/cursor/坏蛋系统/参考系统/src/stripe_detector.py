#!/usr/bin/env python3
"""
女王条纹测试2 - 重构版Stripe检测器
提高检测精度、性能和可维护性
"""

import asyncio
import aiohttp
import pandas as pd
import json
import re
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlparse
import time
import logging
from pathlib import Path
import numpy as np
from bs4 import BeautifulSoup
import fake_useragent

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/stripe_detector.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class DetectionResult:
    """检测结果数据类"""
    domain: str
    company_name: str
    website_url: str
    stripe_connect_detected: bool
    stripe_connect_type: str
    stripe_confidence: float
    onboarding_available: bool
    onboarding_url: str
    onboarding_confidence: float
    business_model: str
    business_score: float
    technical_score: float
    overall_score: float
    detection_time: str
    error_message: Optional[str] = None

class ConfigManager:
    """配置管理器"""
    def __init__(self, config_path: str = "config/detection_config.json"):
        self.config_path = Path(config_path)
        self.config = self._load_config()

    def _load_config(self) -> Dict:
        """加载配置文件"""
        default_config = {
            "detection_patterns": {
                "stripe_connect": {
                    "high_confidence": [
                        r'stripe.*connect.*account',
                        r'connect\.stripe\.com',
                        r'stripe.*express.*account',
                        r'stripe.*custom.*account'
                    ],
                    "medium_confidence": [
                        r'stripe\.com/v3/',
                        r'js\.stripe\.com',
                        r'Stripe\(',
                        r'payment_intent',
                        r'setup_intent'
                    ],
                    "low_confidence": [
                        r'stripe',
                        r'payment',
                        r'checkout'
                    ]
                },
                "onboarding": {
                    "high_confidence": [
                        r'become.*partner',
                        r'become.*merchant',
                        r'partner.*signup',
                        r'seller.*application'
                    ],
                    "medium_confidence": [
                        r'signup',
                        r'register',
                        r'apply.*now',
                        r'join.*us'
                    ]
                }
            },
            "scraping": {
                "timeout": 10,
                "max_retries": 3,
                "concurrent_requests": 10,
                "delay_between_requests": 0.5
            },
            "scoring": {
                "stripe_weight": 0.35,
                "onboarding_weight": 0.25,
                "business_weight": 0.25,
                "technical_weight": 0.15
            }
        }

        if self.config_path.exists():
            with open(self.config_path, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                # 合并配置
                for key in user_config:
                    if key in default_config and isinstance(default_config[key], dict):
                        default_config[key].update(user_config[key])
                    else:
                        default_config[key] = user_config[key]
        else:
            # 创建默认配置文件
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=2, ensure_ascii=False)

        return default_config

class WebScrapingManager:
    """网页抓取管理器"""
    def __init__(self, config: Dict):
        self.config = config['scraping']
        self.session = None
        self.ua = fake_useragent.UserAgent()

    async def __aenter__(self):
        connector = aiohttp.TCPConnector(
            limit=self.config['concurrent_requests'],
            limit_per_host=5
        )
        timeout = aiohttp.ClientTimeout(total=self.config['timeout'])
        headers = {'User-Agent': self.ua.random}

        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers=headers
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch_page(self, url: str, retries: int = None) -> Optional[str]:
        """获取网页内容"""
        if retries is None:
            retries = self.config['max_retries']

        for attempt in range(retries + 1):
            try:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        return await response.text()
                    else:
                        logger.warning(f"HTTP {response.status} for {url}")
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < retries:
                    await asyncio.sleep(1 * (attempt + 1))

        return None

class PatternMatcher:
    """模式匹配器"""
    def __init__(self, patterns: Dict):
        self.patterns = {
            category: {
                level: [re.compile(pattern, re.IGNORECASE) for pattern in pattern_list]
                for level, pattern_list in level_patterns.items()
            }
            for category, level_patterns in patterns.items()
        }

    def match_text(self, text: str, category: str) -> Tuple[float, str]:
        """匹配文本并返回置信度和级别"""
        if category not in self.patterns:
            return 0.0, "none"

        for level in ['high_confidence', 'medium_confidence', 'low_confidence']:
            if level not in self.patterns[category]:
                continue

            matches = sum(1 for pattern in self.patterns[category][level] if pattern.search(text))
            if matches > 0:
                confidence_weights = {'high_confidence': 0.9, 'medium_confidence': 0.6, 'low_confidence': 0.3}
                return confidence_weights[level], level

        return 0.0, "none"

class BusinessModelClassifier:
    """业务模式分类器"""
    def __init__(self):
        self.business_patterns = {
            'marketplace': [
                'marketplace', 'platform', 'multi-vendor', 'aggregator',
                'directory', 'listing', 'booking'
            ],
            'service_platform': [
                'service marketplace', 'freelance platform', 'consulting',
                'professional services', 'expert network', 'talent platform'
            ],
            'creator_economy': [
                'creator platform', 'content monetization', 'digital products',
                'online courses', 'subscription platform'
            ],
            'saas_platform': [
                'saas marketplace', 'software marketplace', 'app marketplace',
                'integration platform', 'api marketplace'
            ]
        }

    def classify(self, text: str, url: str) -> Tuple[str, float]:
        """分类业务模式并返回评分"""
        text_lower = text.lower()
        url_lower = url.lower()
        combined_text = f"{text_lower} {url_lower}"

        scores = {}
        for model, keywords in self.business_patterns.items():
            score = sum(1 for keyword in keywords if keyword in combined_text)
            scores[model] = score / len(keywords)

        if not scores or max(scores.values()) == 0:
            return "unknown", 0.0

        best_model = max(scores, key=scores.get)
        return best_model, scores[best_model]

class EnhancedStripeDetector:
    """增强版Stripe检测器"""
    def __init__(self, config_path: str = "config/detection_config.json"):
        self.config_manager = ConfigManager(config_path)
        self.config = self.config_manager.config

        # 初始化组件
        self.pattern_matcher = PatternMatcher(self.config['detection_patterns'])
        self.business_classifier = BusinessModelClassifier()

        # 确保目录存在
        Path("logs").mkdir(exist_ok=True)
        Path("results").mkdir(exist_ok=True)

    async def analyze_domain(self, domain: str) -> DetectionResult:
        """分析单个域名"""
        start_time = time.time()

        # 构造URL
        if not domain.startswith(('http://', 'https://')):
            url = f"https://{domain}"
        else:
            url = domain

        logger.info(f"开始分析: {url}")

        try:
            async with WebScrapingManager(self.config) as scraper:
                page_content = await scraper.fetch_page(url)

                if not page_content:
                    return DetectionResult(
                        domain=domain,
                        company_name="",
                        website_url=url,
                        stripe_connect_detected=False,
                        stripe_connect_type="",
                        stripe_confidence=0.0,
                        onboarding_available=False,
                        onboarding_url="",
                        onboarding_confidence=0.0,
                        business_model="unknown",
                        business_score=0.0,
                        technical_score=0.0,
                        overall_score=0.0,
                        detection_time=time.strftime("%Y-%m-%d %H:%M:%S"),
                        error_message="无法访问网页"
                    )

                # 解析页面内容
                soup = BeautifulSoup(page_content, 'html.parser')
                text_content = soup.get_text()

                # 提取公司名称
                company_name = self._extract_company_name(soup)

                # Stripe Connect检测
                stripe_confidence, stripe_level = self.pattern_matcher.match_text(
                    page_content, 'stripe_connect'
                )

                # 入驻检测
                onboarding_confidence, onboarding_level = self.pattern_matcher.match_text(
                    page_content, 'onboarding'
                )

                # 业务模式分类
                business_model, business_score = self.business_classifier.classify(
                    text_content, url
                )

                # 技术评分
                technical_score = self._calculate_technical_score(page_content)

                # 计算总体评分
                overall_score = self._calculate_overall_score(
                    stripe_confidence, onboarding_confidence,
                    business_score, technical_score
                )

                # 提取入驻URL
                onboarding_url = self._extract_onboarding_url(soup, url) if onboarding_confidence > 0 else ""

                detection_time = time.strftime("%Y-%m-%d %H:%M:%S")

                result = DetectionResult(
                    domain=domain,
                    company_name=company_name,
                    website_url=url,
                    stripe_connect_detected=stripe_confidence > 0.3,
                    stripe_connect_type=stripe_level,
                    stripe_confidence=stripe_confidence,
                    onboarding_available=onboarding_confidence > 0.2,
                    onboarding_url=onboarding_url,
                    onboarding_confidence=onboarding_confidence,
                    business_model=business_model,
                    business_score=business_score,
                    technical_score=technical_score,
                    overall_score=overall_score,
                    detection_time=detection_time
                )

                logger.info(f"完成分析: {domain} - 总评分: {overall_score:.2f}")
                return result

        except Exception as e:
            logger.error(f"分析 {domain} 时出错: {e}")
            return DetectionResult(
                domain=domain,
                company_name="",
                website_url=url,
                stripe_connect_detected=False,
                stripe_connect_type="",
                stripe_confidence=0.0,
                onboarding_available=False,
                onboarding_url="",
                onboarding_confidence=0.0,
                business_model="unknown",
                business_score=0.0,
                technical_score=0.0,
                overall_score=0.0,
                detection_time=time.strftime("%Y-%m-%d %H:%M:%S"),
                error_message=str(e)
            )

    def _extract_company_name(self, soup: BeautifulSoup) -> str:
        """提取公司名称"""
        # 尝试从title标签提取
        title = soup.find('title')
        if title:
            title_text = title.get_text().strip()
            # 移除常见的后缀
            for suffix in [' - Home', ' | Homepage', ' - Official Site', ' - Website']:
                if suffix in title_text:
                    title_text = title_text.replace(suffix, '')
            return title_text

        # 尝试从h1标签提取
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()

        # 尝试从meta标签提取
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title.get('content').strip()

        return ""

    def _extract_onboarding_url(self, soup: BeautifulSoup, base_url: str) -> str:
        """提取入驻URL"""
        onboarding_keywords = [
            'signup', 'register', 'apply', 'partner', 'merchant',
            'seller', 'vendor', 'join', 'become'
        ]

        for link in soup.find_all('a', href=True):
            href = link.get('href').lower()
            text = link.get_text().lower()

            for keyword in onboarding_keywords:
                if keyword in href or keyword in text:
                    full_url = urljoin(base_url, link['href'])
                    return full_url

        return ""

    def _calculate_technical_score(self, content: str) -> float:
        """计算技术评分"""
        technical_indicators = [
            'api', 'webhook', 'integration', 'sdk', 'javascript',
            'react', 'node.js', 'angular', 'vue.js', 'modern'
        ]

        content_lower = content.lower()
        matches = sum(1 for indicator in technical_indicators if indicator in content_lower)
        return min(matches / len(technical_indicators), 1.0)

    def _calculate_overall_score(self, stripe_score: float, onboarding_score: float,
                                business_score: float, technical_score: float) -> float:
        """计算总体评分"""
        weights = self.config['scoring']
        overall = (
            stripe_score * weights['stripe_weight'] +
            onboarding_score * weights['onboarding_weight'] +
            business_score * weights['business_weight'] +
            technical_score * weights['technical_weight']
        )
        return round(overall, 3)

    async def batch_analyze(self, domains: List[str]) -> List[DetectionResult]:
        """批量分析域名"""
        logger.info(f"开始批量分析 {len(domains)} 个域名")

        # 控制并发数量
        semaphore = asyncio.Semaphore(self.config['scraping']['concurrent_requests'])

        async def analyze_with_semaphore(domain: str) -> DetectionResult:
            async with semaphore:
                await asyncio.sleep(self.config['scraping']['delay_between_requests'])
                return await self.analyze_domain(domain)

        results = await asyncio.gather(
            *[analyze_with_semaphore(domain) for domain in domains],
            return_exceptions=True
        )

        # 过滤异常结果
        valid_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"域名 {domains[i]} 分析失败: {result}")
            else:
                valid_results.append(result)

        logger.info(f"批量分析完成，成功: {len(valid_results)}, 失败: {len(domains) - len(valid_results)}")
        return valid_results

    def save_results(self, results: List[DetectionResult], output_format: str = "both"):
        """保存结果"""
        timestamp = time.strftime("%Y%m%d_%H%M%S")

        # 转换为字典列表
        results_dict = [asdict(result) for result in results]

        if output_format in ["json", "both"]:
            json_path = f"results/detection_results_{timestamp}.json"
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(results_dict, f, indent=2, ensure_ascii=False)
            logger.info(f"JSON结果已保存: {json_path}")

        if output_format in ["excel", "both"]:
            excel_path = f"results/detection_results_{timestamp}.xlsx"
            df = pd.DataFrame(results_dict)
            df.to_excel(excel_path, index=False)
            logger.info(f"Excel结果已保存: {excel_path}")

    def generate_summary_report(self, results: List[DetectionResult]) -> Dict:
        """生成摘要报告"""
        total_count = len(results)
        stripe_detected = sum(1 for r in results if r.stripe_connect_detected)
        onboarding_available = sum(1 for r in results if r.onboarding_available)

        # 按业务模式分组
        business_models = {}
        for result in results:
            model = result.business_model
            if model not in business_models:
                business_models[model] = 0
            business_models[model] += 1

        # 按评分分组
        score_ranges = {
            "高 (0.7+)" : sum(1 for r in results if r.overall_score >= 0.7),
            "中 (0.4-0.7)" : sum(1 for r in results if 0.4 <= r.overall_score < 0.7),
            "低 (<0.4)" : sum(1 for r in results if r.overall_score < 0.4)
        }

        summary = {
            "总平台数量": total_count,
            "检测到Stripe": stripe_detected,
            "Stripe检测率": f"{stripe_detected/total_count*100:.1f}%" if total_count > 0 else "0%",
            "提供在线入驻": onboarding_available,
            "入驻功能可用率": f"{onboarding_available/total_count*100:.1f}%" if total_count > 0 else "0%",
            "业务模式分布": business_models,
            "评分分布": score_ranges,
            "平均评分": f"{np.mean([r.overall_score for r in results]):.3f}" if results else "0",
            "生成时间": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        return summary

async def main():
    """主函数"""
    # 示例用法
    detector = EnhancedStripeDetector()

    # 测试域名列表
    test_domains = [
        "stripe.com",
        "shopify.com",
        "mediabistro.com",
        "skillmil.com"
    ]

    # 批量分析
    results = await detector.batch_analyze(test_domains)

    # 保存结果
    detector.save_results(results)

    # 生成摘要报告
    summary = detector.generate_summary_report(results)

    # 保存摘要报告
    with open("results/summary_report.json", 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("检测完成！")
    print(json.dumps(summary, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())