#!/usr/bin/env python3
"""
Stripe Connect分析器
专门用于检测和分析网站的Stripe Connect集成情况
作者: 女王条纹测试2团队
版本: 1.0.0
"""

import asyncio
import aiohttp
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
import re

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class StripeAnalysisResult:
    """Stripe分析结果"""
    url: str
    has_stripe_connect: bool
    integration_type: Optional[str]
    stripe_elements: List[str]
    confidence_score: float
    analysis_details: Dict[str, Any]

class StripeConnectAnalyzer:
    """Stripe Connect集成分析器"""

    def __init__(self, use_proxy: bool = True):
        self.use_proxy = use_proxy
        self.stripe_indicators = [
            'js.stripe.com',
            'checkout.stripe.com',
            'stripe.com',
            'stripe',
            'data-stripe',
            'stripe-element',
            'stripe-connect',
            'connect.stripe.com'
        ]

    async def analyze_website(self, url: str) -> StripeAnalysisResult:
        """分析单个网站的Stripe Connect集成"""
        try:
            logger.info(f"🔍 分析网站: {url}")

            # 获取网页内容
            html_content = await self._fetch_website(url)
            if not html_content:
                return StripeAnalysisResult(
                    url=url,
                    has_stripe_connect=False,
                    integration_type=None,
                    stripe_elements=[],
                    confidence_score=0.0,
                    analysis_details={"error": "无法访问网站"}
                )

            # 分析Stripe集成
            stripe_elements = self._find_stripe_elements(html_content)
            integration_type = self._determine_integration_type(stripe_elements)
            confidence_score = self._calculate_confidence_score(stripe_elements, integration_type)

            return StripeAnalysisResult(
                url=url,
                has_stripe_connect=len(stripe_elements) > 0,
                integration_type=integration_type,
                stripe_elements=stripe_elements,
                confidence_score=confidence_score,
                analysis_details={
                    "element_count": len(stripe_elements),
                    "content_length": len(html_content),
                    "analysis_time": datetime.now().isoformat()
                }
            )

        except Exception as e:
            logger.error(f"❌ 分析网站失败 {url}: {e}")
            return StripeAnalysisResult(
                url=url,
                has_stripe_connect=False,
                integration_type=None,
                stripe_elements=[],
                confidence_score=0.0,
                analysis_details={"error": str(e)}
            )

    async def _fetch_website(self, url: str) -> Optional[str]:
        """获取网站内容"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }

            timeout = aiohttp.ClientTimeout(total=30)

            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        return await response.text()
                    else:
                        logger.warning(f"⚠️ HTTP {response.status}: {url}")
                        return None

        except Exception as e:
            logger.error(f"❌ 获取网站失败 {url}: {e}")
            return None

    def _find_stripe_elements(self, html_content: str) -> List[str]:
        """在HTML内容中查找Stripe相关元素"""
        found_elements = []

        for indicator in self.stripe_indicators:
            if indicator.lower() in html_content.lower():
                found_elements.append(indicator)

        # 使用正则表达式查找更多Stripe模式
        patterns = [
            r'https://js\.stripe\.com/v[0-9]+/',
            r'data-stripe-[a-zA-Z-]+',
            r'stripe\.[a-zA-Z]+\(',
            r'checkout\.stripe\.com/pay',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            found_elements.extend(matches)

        return list(set(found_elements))  # 去重

    def _determine_integration_type(self, stripe_elements: List[str]) -> Optional[str]:
        """确定Stripe集成类型"""
        if not stripe_elements:
            return None

        # 检查不同的集成类型
        if any('connect' in element.lower() for element in stripe_elements):
            return 'Stripe Connect'
        elif any('checkout' in element.lower() for element in stripe_elements):
            return 'Stripe Checkout'
        elif any('elements' in element.lower() for element in stripe_elements):
            return 'Stripe Elements'
        else:
            return 'Basic Stripe'

    def _calculate_confidence_score(self, stripe_elements: List[str], integration_type: Optional[str]) -> float:
        """计算集成置信度分数"""
        if not stripe_elements:
            return 0.0

        base_score = len(stripe_elements) * 0.1

        # 根据集成类型调整分数
        type_multiplier = {
            'Stripe Connect': 1.0,
            'Stripe Checkout': 0.8,
            'Stripe Elements': 0.6,
            'Basic Stripe': 0.4
        }

        multiplier = type_multiplier.get(integration_type, 0.3)
        score = base_score * multiplier

        return min(score, 1.0)  # 最大值为1.0

async def batch_analyze_websites(urls: List[str], use_proxy: bool = True) -> List[StripeAnalysisResult]:
    """批量分析网站"""
    analyzer = StripeConnectAnalyzer(use_proxy=use_proxy)

    tasks = [analyzer.analyze_website(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 过滤异常结果
    valid_results = []
    for result in results:
        if isinstance(result, StripeAnalysisResult):
            valid_results.append(result)
        else:
            logger.error(f"❌ 分析异常: {result}")

    return valid_results

def generate_analysis_report(results: List[StripeAnalysisResult]) -> Dict[str, Any]:
    """生成分析报告"""
    total_sites = len(results)
    stripe_sites = sum(1 for r in results if r.has_stripe_connect)

    integration_types = {}
    confidence_scores = []

    for result in results:
        if result.integration_type:
            integration_types[result.integration_type] = integration_types.get(result.integration_type, 0) + 1
        confidence_scores.append(result.confidence_score)

    report = {
        "summary": {
            "total_sites_analyzed": total_sites,
            "sites_with_stripe": stripe_sites,
            "stripe_adoption_rate": stripe_sites / total_sites if total_sites > 0 else 0,
            "average_confidence_score": sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        },
        "integration_types": integration_types,
        "detailed_results": [
            {
                "url": result.url,
                "has_stripe_connect": result.has_stripe_connect,
                "integration_type": result.integration_type,
                "confidence_score": result.confidence_score,
                "stripe_elements_count": len(result.stripe_elements)
            }
            for result in results
        ],
        "generated_at": datetime.now().isoformat()
    }

    return report

# 示例使用
async def main():
    """主函数示例"""
    test_urls = [
        "https://example.com",
        "https://stripe.com",
        "https://checkout.stripe.com"
    ]

    logger.info("🚀 开始Stripe Connect批量分析...")
    results = await batch_analyze_websites(test_urls)
    report = generate_analysis_report(results)

    print(f"✅ 分析完成: {len(results)} 个网站")
    print(f"📊 发现Stripe集成: {report['summary']['sites_with_stripe']} 个网站")

    return report

if __name__ == "__main__":
    asyncio.run(main())