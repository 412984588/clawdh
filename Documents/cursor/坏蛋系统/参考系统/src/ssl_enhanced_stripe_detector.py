#!/usr/bin/env python3
"""
SSL增强版Stripe Connect检测器
支持多种SSL配置选项，解决SSL证书问题
作者: Jenny团队
版本: 2.2.0
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

    # 业务评分
    business_score: float
    overall_score: float

class SSLEnhancedStripeDetector:
    """SSL增强版Stripe检测器"""

    def __init__(self, ssl_mode='certifi'):
        """
        初始化检测器

        Args:
            ssl_mode: SSL模式
                - 'certifi': 使用certifi证书包 (推荐)
                - 'skip_verify': 跳过SSL验证 (仅测试用)
                - 'system': 使用系统证书
                - 'default': Python默认SSL
        """
        self.ssl_mode = ssl_mode
        self.ssl_context = self._create_ssl_context(ssl_mode)

        # 设置日志
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # Stripe Connect检测模式
        self.stripe_patterns = {
            'js_patterns': [
                r'js\.stripe\.com',
                r'checkout\.stripe\.com',
                r'js\.stripe\.com/v[0-9]+/',
                r'connect\.stripe\.com',
                r'dashboard\.stripe\.com',
                r'stripe\.com/js',
                r'checkout\.stripe\.com/pay',
            ],
            'api_patterns': [
                r'api\.stripe\.com/v1/',
                r'checkout\.stripe\.com/api',
                r'js\.stripe\.com/v3/',
                r'payment_intent',
                r'setup_intent',
                r'checkout_session',
            ],
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
            'checkout_patterns': [
                r'checkout\.stripe\.com',
                r'pay\.stripe\.com',
                r'checkout\.stripe\.com/pay',
                r'stripe\.com/checkout',
                r'buy\.stripe\.com',
            ],
        }

        # 创建HTTP会话配置
        self.session_config = {
            'timeout': aiohttp.ClientTimeout(total=30),
            'connector': aiohttp.TCPConnector(ssl=self.ssl_context),
            'headers': {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }
        }

    def _create_ssl_context(self, mode):
        """创建SSL上下文"""
        if mode == 'certifi':
            # 使用certifi证书包 - 推荐方案
            return ssl.create_default_context(cafile=certifi.where())
        elif mode == 'skip_verify':
            # 跳过SSL验证 - 仅测试环境使用
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            return context
        elif mode == 'system':
            # 使用系统证书
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            try:
                context.load_default_certs()
                return context
            except Exception as e:
                self.logger.warning(f"系统证书加载失败: {e}")
                return ssl.create_default_context()
        else:
            # Python默认SSL
            return ssl.create_default_context()

    async def create_session(self):
        """创建HTTP会话"""
        return aiohttp.ClientSession(**self.session_config)

    async def analyze_domain(self, domain: str) -> Optional[EnhancedStripeResult]:
        """分析单个域名的Stripe使用情况"""
        self.logger.info(f"开始分析: {domain}")

        url = f"https://{domain}"
        errors = []
        warnings = []

        try:
            async with await self.create_session() as session:
                result = await self._analyze_url(session, url, domain, errors, warnings)
                self.logger.info(f"分析完成: {domain} - Stripe: {result.stripe_connect_detected if result else 'Failed'}")
                return result

        except Exception as e:
            error_msg = f"分析失败: {type(e).__name__}: {str(e)}"
            self.logger.error(error_msg)
            errors.append(error_msg)

            # 返回包含错误信息的结果
            return EnhancedStripeResult(
                domain=domain,
                company_name="Unknown",
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
                detection_methods=["error"],
                evidence_urls=[],
                detection_time=datetime.now().isoformat(),
                errors=errors,
                warnings=warnings,
                business_score=0.0,
                overall_score=0.0
            )

    async def _analyze_url(self, session, url, domain, errors, warnings) -> EnhancedStripeResult:
        """分析具体URL"""
        try:
            async with session.get(url) as response:
                content = await response.text()
                return self._analyze_content(content, url, domain, response.status)
        except asyncio.TimeoutError:
            errors.append("请求超时")
        except aiohttp.ClientConnectorCertificateError as e:
            errors.append(f"SSL证书错误: {str(e)}")
        except aiohttp.ClientError as e:
            errors.append(f"网络错误: {str(e)}")
        except Exception as e:
            errors.append(f"未知错误: {str(e)}")

        return self._create_empty_result(url, domain, errors)

    def _analyze_content(self, content: str, url: str, domain: str, status_code: int) -> EnhancedStripeResult:
        """分析页面内容"""

        # 初始化检测结果
        result = EnhancedStripeResult(
            domain=domain,
            company_name="Unknown",
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
            evidence_urls=[],
            detection_time=datetime.now().isoformat(),
            errors=[],
            warnings=[],
            business_score=0.0,
            overall_score=0.0
        )

        try:
            # 使用BeautifulSoup解析HTML
            soup = BeautifulSoup(content, 'html.parser')

            # 提取公司名称
            title_tag = soup.find('title')
            if title_tag:
                result.company_name = title_tag.get_text().strip()[:50]

            # 检测各种Stripe元素
            self._detect_stripe_js(content, result)
            self._detect_stripe_api(content, result)
            self._detect_stripe_connect(content, result)
            self._detect_stripe_checkout(content, result)
            self._detect_business_indicators(content, result)
            self._detect_payment_indicators(content, result)
            self._detect_technical_indicators(content, result)

            # 计算综合评分
            self._calculate_scores(result)

            # 设置检测方法
            result.detection_methods = ["content_analysis"]
            result.evidence_urls = [url]

        except Exception as e:
            result.errors.append(f"内容分析错误: {str(e)}")

        return result

    def _detect_stripe_js(self, content: str, result: EnhancedStripeResult):
        """检测Stripe JavaScript"""
        for pattern in self.stripe_patterns['js_patterns']:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                result.stripe_js_indicators.extend(matches)

    def _detect_stripe_api(self, content: str, result: EnhancedStripeResult):
        """检测Stripe API调用"""
        for pattern in self.stripe_patterns['api_patterns']:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                result.stripe_api_indicators.extend(matches)

    def _detect_stripe_connect(self, content: str, result: EnhancedStripeResult):
        """检测Stripe Connect"""
        for pattern in self.stripe_patterns['connect_patterns']:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                result.stripe_connect_indicators.extend(matches)
                result.stripe_connect_detected = True

    def _detect_stripe_checkout(self, content: str, result: EnhancedStripeResult):
        """检测Stripe Checkout"""
        for pattern in self.stripe_patterns['checkout_patterns']:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                result.stripe_checkout_indicators.extend(matches)

    def _detect_business_indicators(self, content: str, result: EnhancedStripeResult):
        """检测业务指标"""
        business_keywords = [
            'payment', 'checkout', 'billing', 'invoice', 'subscription',
            'pricing', 'plan', 'trial', 'upgrade', 'downgrade'
        ]

        for keyword in business_keywords:
            if re.search(rf'\b{keyword}\b', content, re.IGNORECASE):
                result.business_indicators.append(keyword)

    def _detect_payment_indicators(self, content: str, result: EnhancedStripeResult):
        """检测支付指标"""
        payment_keywords = [
            'credit card', 'debit card', 'bank transfer', 'paypal',
            'apple pay', 'google pay', 'samsung pay'
        ]

        for keyword in payment_keywords:
            if re.search(rf'{keyword}', content, re.IGNORECASE):
                result.payment_indicators.append(keyword)

    def _detect_technical_indicators(self, content: str, result: EnhancedStripeResult):
        """检测技术指标"""
        tech_indicators = []

        # 检测现代Web技术
        if 'react' in content.lower():
            tech_indicators.append('React')
        if 'vue' in content.lower():
            tech_indicators.append('Vue.js')
        if 'angular' in content.lower():
            tech_indicators.append('Angular')

        result.technical_indicators = tech_indicators

    def _calculate_scores(self, result: EnhancedStripeResult):
        """计算评分"""
        # Stripe检测评分
        stripe_score = 0
        if result.stripe_js_indicators:
            stripe_score += len(result.stripe_js_indicators) * 2
        if result.stripe_api_indicators:
            stripe_score += len(result.stripe_api_indicators) * 3
        if result.stripe_connect_indicators:
            stripe_score += len(result.stripe_connect_indicators) * 4
        if result.stripe_checkout_indicators:
            stripe_score += len(result.stripe_checkout_indicators) * 3

        result.confidence_score = min(stripe_score / 10, 1.0)

        # 业务评分
        business_score = 0
        business_score += len(result.business_indicators) * 2
        business_score += len(result.payment_indicators) * 3
        business_score += len(result.technical_indicators) * 1

        result.business_score = min(business_score / 10, 1.0)

        # 综合评分
        result.overall_score = (result.confidence_score * 0.7 + result.business_score * 0.3)

        # 确定Connect类型
        if result.stripe_connect_detected:
            if 'express' in ' '.join(result.stripe_connect_indicators).lower():
                result.connect_type = "Express"
            elif 'custom' in ' '.join(result.stripe_connect_indicators).lower():
                result.connect_type = "Custom"
            else:
                result.connect_type = "Standard"

    def _create_empty_result(self, url: str, domain: str, errors: List[str]) -> EnhancedStripeResult:
        """创建空结果"""
        return EnhancedStripeResult(
            domain=domain,
            company_name="Unknown",
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
            detection_methods=["failed"],
            evidence_urls=[],
            detection_time=datetime.now().isoformat(),
            errors=errors,
            warnings=[],
            business_score=0.0,
            overall_score=0.0
        )

    async def batch_analyze(self, domains: List[str]) -> List[EnhancedStripeResult]:
        """批量分析域名"""
        self.logger.info(f"开始批量分析 {len(domains)} 个域名")

        tasks = [self.analyze_domain(domain) for domain in domains]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 处理异常结果
        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                self.logger.error(f"域名 {domains[i]} 分析异常: {result}")
                final_results.append(self._create_empty_result(
                    f"https://{domains[i]}", domains[i], [str(result)]
                ))
            else:
                final_results.append(result)

        self.logger.info(f"批量分析完成，成功: {len([r for r in final_results if not r.errors])}，失败: {len([r for r in final_results if r.errors])}")
        return final_results

    def get_ssl_info(self):
        """获取SSL配置信息"""
        return {
            'ssl_mode': self.ssl_mode,
            'ssl_context': str(self.ssl_context),
            'certifi_path': certifi.where() if self.ssl_mode == 'certifi' else None,
        }

# 便捷函数
async def quick_ssl_analysis(domains: List[str], ssl_mode: str = 'certifi') -> List[EnhancedStripeResult]:
    """快速SSL分析"""
    detector = SSLEnhancedStripeDetector(ssl_mode=ssl_mode)
    return await detector.batch_analyze(domains)