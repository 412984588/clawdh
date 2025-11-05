#!/usr/bin/env python3
"""
增强版Stripe Connect检测器
修复SSL问题，优化检测算法，增强错误处理
作者: Jenny团队
版本: 2.1.0
"""

import asyncio
import aiohttp
import ssl
import json
import re
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
from urllib.parse import urljoin, urlparse
import certifi
from bs4 import BeautifulSoup

@dataclass
class EnhancedStripeResult:
    """增强版Stripe检测结果"""
    domain: str
    company_name: str
    website_url: str

    # Stripe Connect检测结果
    stripe_connect_detected: bool
    connect_type: str  # Express, Custom, Standard
    confidence_score: float

    # 检测到的Stripe元素
    stripe_js_indicators: List[str]
    stripe_api_indicators: List[str]
    stripe_connect_indicators: List[str]
    stripe_checkout_indicators: List[str]

    # 上下文信息
    business_indicators: List[str]
    payment_indicators: List[str]
    technical_indicators: List[str]

    # 元数据
    detection_methods: List[str]
    evidence_urls: List[str]
    detection_time: str

    # 错误处理
    errors: List[str]
    warnings: List[str]

    # 综合评分
    business_confidence: float
    technical_confidence: float
    overall_confidence: float

class EnhancedStripeDetector:
    """增强版Stripe Connect检测器"""

    def __init__(self, timeout: int = 30, verify_ssl: bool = False):
        """
        初始化检测器

        Args:
            timeout: 请求超时时间（秒）
            verify_ssl: 是否验证SSL证书（测试环境建议False）
        """
        self.timeout = timeout
        self.verify_ssl = verify_ssl

        # 配置SSL上下文
        self.ssl_context = ssl.create_default_context()
        if not verify_ssl:
            self.ssl_context.check_hostname = False
            self.ssl_context.verify_mode = ssl.CERT_NONE
        else:
            self.ssl_context = certifi.create_default_context()

        # 设置日志
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # Stripe Connect检测模式
        self.stripe_patterns = {
            # JavaScript文件
            'js_patterns': [
                r'js\.stripe\.com',
                r'checkout\.stripe\.com',
                r'js\.stripe\.com/v[0-9]+/',
                r'connect\.stripe\.com',
                r'dashboard\.stripe\.com',
                r'stripe\.com/js',
                r'checkout\.stripe\.com/pay',
            ],

            # API端点
            'api_patterns': [
                r'api\.stripe\.com/v1/',
                r'checkout\.stripe\.com/api',
                r'js\.stripe\.com/v3/',
                r'payment_intent',
                r'setup_intent',
                r'checkout_session',
            ],

            # Connect特有模式
            'connect_patterns': [
                r'connect\.stripe\.com',
                r'stripe\.com/connect',
                r'stripe\.com/connect/account',
                r'express\.stripe\.com',
                r'checkout\.stripe\.com/pay',
                r'stripe\.com/docs/connect',
                r'account_links',
                r'oauth\.stripe\.com',
            ],

            # 结账页面模式
            'checkout_patterns': [
                r'checkout\.stripe\.com',
                r'pay\.stripe\.com',
                r'checkout\.stripe\.com/pay',
                r'stripe\.com/checkout',
                r'buy\.stripe\.com',
            ],

            # 业务模式模式
            'business_patterns': [
                r'accept.*payments',
                r'online.*payments',
                r'payment.*processing',
                r'merchant.*account',
                r'sell.*online',
                r'ecommerce.*platform',
                r'marketplace.*payments',
            ],

            # HTML meta标签
            'meta_patterns': [
                r'stripe',
                r'payment',
                r'checkout',
                r'merchant',
            ]
        }

        # HTTP Headers
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }

    async def fetch_content(self, session: aiohttp.ClientSession, url: str) -> Tuple[Optional[str], Optional[str]]:
        """
        安全获取网页内容

        Returns:
            Tuple[content, error]
        """
        try:
            timeout = aiohttp.ClientTimeout(total=self.timeout)

            async with session.get(
                url,
                headers=self.headers,
                timeout=timeout,
                ssl=self.ssl_context
            ) as response:
                content = await response.text()
                return content, None

        except asyncio.TimeoutError:
            error_msg = f"请求超时: {url}"
            self.logger.warning(error_msg)
            return None, error_msg
        except ssl.SSLCertVerificationError as e:
            error_msg = f"SSL证书验证失败: {url} - {str(e)}"
            self.logger.warning(error_msg)
            return None, error_msg
        except aiohttp.ClientError as e:
            error_msg = f"网络请求错误: {url} - {str(e)}"
            self.logger.warning(error_msg)
            return None, error_msg
        except Exception as e:
            error_msg = f"未知错误: {url} - {str(e)}"
            self.logger.error(error_msg)
            return None, error_msg

    def extract_stripe_indicators(self, content: str, url: str) -> Dict[str, List[str]]:
        """从网页内容中提取Stripe相关指标"""
        indicators = {
            'js_indicators': [],
            'api_indicators': [],
            'connect_indicators': [],
            'checkout_indicators': [],
            'business_indicators': [],
            'payment_indicators': [],
            'technical_indicators': [],
        }

        # 转换为小写进行匹配
        content_lower = content.lower()

        # 检测各种模式
        for category, patterns in self.stripe_patterns.items():
            if category == 'js_patterns':
                for pattern in patterns:
                    matches = re.findall(pattern, content_lower, re.IGNORECASE)
                    if matches:
                        indicators['js_indicators'].extend(matches)

            elif category == 'api_patterns':
                for pattern in patterns:
                    matches = re.findall(pattern, content_lower, re.IGNORECASE)
                    if matches:
                        indicators['api_indicators'].extend(matches)

            elif category == 'connect_patterns':
                for pattern in patterns:
                    matches = re.findall(pattern, content_lower, re.IGNORECASE)
                    if matches:
                        indicators['connect_indicators'].extend(matches)

            elif category == 'checkout_patterns':
                for pattern in patterns:
                    matches = re.findall(pattern, content_lower, re.IGNORECASE)
                    if matches:
                        indicators['checkout_indicators'].extend(matches)

            elif category == 'business_patterns':
                for pattern in patterns:
                    matches = re.findall(pattern, content_lower, re.IGNORECASE)
                    if matches:
                        indicators['business_indicators'].extend(matches)

        # 检测技术指标
        technical_patterns = [
            r'react',
            r'vue',
            r'angular',
            r'jquery',
            r'bootstrap',
            r'shopify',
            r'woocommerce',
            r'magento',
            r'wordpress',
            r'django',
            r'flask',
            r'rails',
        ]

        for pattern in technical_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                indicators['technical_indicators'].append(pattern)

        # 检测支付指标
        payment_patterns = [
            r'payment',
            r'checkout',
            r'buy.*now',
            r'add.*to.*cart',
            r'shopping.*cart',
            r'price',
            r'dollar',
            r'currency',
        ]

        for pattern in payment_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                indicators['payment_indicators'].append(pattern)

        # 去重并排序
        for key in indicators:
            indicators[key] = sorted(list(set(indicators[key])))

        return indicators

    def analyze_stripe_connect_type(self, indicators: Dict[str, List[str]]) -> str:
        """分析Stripe Connect类型"""
        connect_indicators = indicators['connect_indicators']

        # Express模式特征
        express_indicators = [
            'express.stripe.com',
            'connect.stripe.com/express',
            'stripe.com/express',
        ]

        # Custom模式特征
        custom_indicators = [
            'connect.stripe.com/custom',
            'stripe.com/connect/custom',
            'account_links',
        ]

        # Standard模式特征
        standard_indicators = [
            'checkout.stripe.com',
            'stripe.com/checkout',
        ]

        # 检测优先级
        for express_pattern in express_indicators:
            if any(express_pattern in indicator for indicator in connect_indicators):
                return "Express"

        for custom_pattern in custom_indicators:
            if any(custom_pattern in indicator for indicator in connect_indicators):
                return "Custom"

        for standard_pattern in standard_indicators:
            if any(standard_pattern in indicator for indicator in indicators['checkout_indicators']):
                return "Standard"

        # 基于其他指标推断
        if connect_indicators:
            return "Connect"
        elif indicators['checkout_indicators']:
            return "Standard"
        elif indicators['payment_indicators']:
            return "Payment"
        else:
            return "Unknown"

    def calculate_confidence_scores(self, indicators: Dict[str, List[str]], url: str) -> Tuple[float, float, float]:
        """计算置信度评分"""

        # Stripe检测置信度
        stripe_score = 0.0
        if indicators['connect_indicators']:
            stripe_score += 0.4
        if indicators['checkout_indicators']:
            stripe_score += 0.3
        if indicators['js_indicators']:
            stripe_score += 0.2
        if indicators['api_indicators']:
            stripe_score += 0.1

        # 业务置信度
        business_score = 0.0
        if indicators['business_indicators']:
            business_score += 0.4
        if indicators['payment_indicators']:
            business_score += 0.3
        if indicators['technical_indicators']:
            business_score += 0.2
        if '.com' in url:
            business_score += 0.1

        # 技术置信度
        technical_score = 0.0
        if indicators['js_indicators']:
            technical_score += 0.3
        if indicators['api_indicators']:
            technical_score += 0.3
        if indicators['technical_indicators']:
            technical_score += 0.2
        if len(indicators['js_indicators']) > 3:
            technical_score += 0.1
        if len(indicators['api_indicators']) > 2:
            technical_score += 0.1

        # 限制在0-1范围内
        stripe_score = min(stripe_score, 1.0)
        business_score = min(business_score, 1.0)
        technical_score = min(technical_score, 1.0)

        return stripe_score, business_score, technical_score

    async def detect_stripe_connect(self, url: str, company_name: str = "") -> EnhancedStripeResult:
        """
        检测Stripe Connect

        Args:
            url: 目标网站URL
            company_name: 公司名称（可选）

        Returns:
            EnhancedStripeResult: 检测结果
        """
        start_time = datetime.now()
        domain = urlparse(url).netloc

        # 初始化结果
        result = EnhancedStripeResult(
            domain=domain,
            company_name=company_name,
            website_url=url,
            stripe_connect_detected=False,
            connect_type="Unknown",
            confidence_score=0.0,
            stripe_js_indicators=[],
            stripe_api_indicators=[],
            stripe_connect_indicators=[],
            stripe_checkout_indicators=[],
            business_indicators=[],
            payment_indicators=[],
            technical_indicators=[],
            detection_methods=[],
            evidence_urls=[url],
            detection_time=start_time.isoformat(),
            errors=[],
            warnings=[],
            business_confidence=0.0,
            technical_confidence=0.0,
            overall_confidence=0.0
        )

        # 创建HTTP会话
        connector = aiohttp.TCPConnector(ssl=self.ssl_context)
        timeout = aiohttp.ClientTimeout(total=self.timeout)

        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            # 获取主页内容
            content, error = await self.fetch_content(session, url)

            if error:
                result.errors.append(error)
                result.warnings.append(f"无法获取主页内容: {error}")
                return result

            if not content:
                result.errors.append("获取的内容为空")
                return result

            # 提取指标
            indicators = self.extract_stripe_indicators(content, url)

            # 分析结果
            stripe_detected = bool(
                indicators['connect_indicators'] or
                indicators['checkout_indicators'] or
                indicators['js_indicators']
            )

            if stripe_detected:
                result.detection_methods.append("content_analysis")
                result.evidence_urls.append(url)

            # 填充结果
            result.stripe_js_indicators = indicators['js_indicators']
            result.stripe_api_indicators = indicators['api_indicators']
            result.stripe_connect_indicators = indicators['connect_indicators']
            result.stripe_checkout_indicators = indicators['checkout_indicators']
            result.business_indicators = indicators['business_indicators']
            result.payment_indicators = indicators['payment_indicators']
            result.technical_indicators = indicators['technical_indicators']

            # 分析Connect类型
            result.connect_type = self.analyze_stripe_connect_type(indicators)

            # 计算置信度
            stripe_conf, business_conf, technical_conf = self.calculate_confidence_scores(indicators, url)
            result.confidence_score = stripe_conf
            result.business_confidence = business_conf
            result.technical_confidence = technical_conf

            # 综合评分
            result.overall_confidence = (stripe_conf * 0.5 + business_conf * 0.3 + technical_conf * 0.2)

            # 最终判定
            result.stripe_connect_detected = stripe_conf > 0.3

            # 添加警告
            if result.stripe_connect_detected and result.overall_confidence < 0.6:
                result.warnings.append("检测到Stripe但置信度较低，建议人工验证")

            if not result.stripe_connect_detected and stripe_conf > 0.1:
                result.warnings.append("可能存在Stripe功能，但检测证据不足")

        return result

    async def batch_detect(self, urls: List[str], company_names: List[str] = None) -> List[EnhancedStripeResult]:
        """批量检测"""
        if not company_names:
            company_names = [""] * len(urls)

        results = []

        # 限制并发数
        semaphore = asyncio.Semaphore(5)

        async def detect_with_semaphore(url: str, company_name: str) -> EnhancedStripeResult:
            async with semaphore:
                return await self.detect_stripe_connect(url, company_name)

        tasks = [
            detect_with_semaphore(url, company_name)
            for url, company_name in zip(urls, company_names)
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 处理异常
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                error_result = EnhancedStripeResult(
                    domain=urlparse(urls[i]).netloc,
                    company_name=company_names[i],
                    website_url=urls[i],
                    stripe_connect_detected=False,
                    connect_type="Unknown",
                    confidence_score=0.0,
                    stripe_js_indicators=[],
                    stripe_api_indicators=[],
                    stripe_connect_indicators=[],
                    stripe_checkout_indicators=[],
                    business_indicators=[],
                    payment_indicators=[],
                    technical_indicators=[],
                    detection_methods=[],
                    evidence_urls=[],
                    detection_time=datetime.now().isoformat(),
                    errors=[str(result)],
                    warnings=[],
                    business_confidence=0.0,
                    technical_confidence=0.0,
                    overall_confidence=0.0
                )
                processed_results.append(error_result)
            else:
                processed_results.append(result)

        return processed_results

    def generate_report(self, results: List[EnhancedStripeResult]) -> str:
        """生成检测报告"""
        total_sites = len(results)
        stripe_detected = sum(1 for r in results if r.stripe_connect_detected)

        report = f"""
# 🎯 Stripe Connect 检测报告

**检测时间**: {datetime.now().isoformat()}
**检测网站数**: {total_sites}
**发现Stripe网站数**: {stripe_detected}
**检测成功率**: {((total_sites - len([r for r in results if r.errors])) / total_sites * 100):.1f}%

## 📊 检测统计

### Stripe Connect 类型分布
"""

        # 统计Connect类型
        type_counts = {}
        for result in results:
            if result.stripe_connect_detected:
                connect_type = result.connect_type
                type_counts[connect_type] = type_counts.get(connect_type, 0) + 1

        for connect_type, count in sorted(type_counts.items()):
            report += f"- **{connect_type}**: {count} 个网站\n"

        report += "\n## 🔍 详细检测结果\n\n"

        for result in results:
            status = "✅ 检测到" if result.stripe_connect_detected else "❌ 未检测到"
            report += f"""
### {result.domain} {status}

- **URL**: {result.website_url}
- **Connect类型**: {result.connect_type}
- **置信度**: {result.confidence_score:.2f}
- **综合评分**: {result.overall_confidence:.2f}
- **检测方法**: {', '.join(result.detection_methods)}

**检测到的指标**:
- JS指标: {len(result.stripe_js_indicators)} 个
- API指标: {len(result.stripe_api_indicators)} 个
- Connect指标: {len(result.stripe_connect_indicators)} 个
- 结账指标: {len(result.stripe_checkout_indicators)} 个

"""

            if result.errors:
                report += f"**错误**: {', '.join(result.errors)}\n"

            if result.warnings:
                report += f"**警告**: {', '.join(result.warnings)}\n"

            report += "---\n"

        return report

async def main():
    """测试函数"""
    detector = EnhancedStripeDetector(verify_ssl=False)  # 测试环境不验证SSL

    # 测试网站
    test_urls = [
        "https://stripe.com",
        "https://shopify.com",
        "https://github.com",
        "https://example.com"
    ]

    print("🚀 开始Stripe Connect检测...")
    results = await detector.batch_detect(test_urls)

    # 生成报告
    report = detector.generate_report(results)
    print(report)

    # 保存结果
    with open("stripe_detection_report.md", "w", encoding="utf-8") as f:
        f.write(report)

    print("📊 报告已保存到 stripe_detection_report.md")

if __name__ == "__main__":
    asyncio.run(main())