#!/usr/bin/env python3
"""
分析用户已确认的Stripe Connect平台
提取成功案例技术特征模式
作者: Jenny团队
版本: 1.0.0
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

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from optimized_stripe_detector import OptimizedStripeDetector, OptimizedStripeResult

@dataclass
class PlatformAnalysis:
    """平台分析结果"""
    url: str
    domain: str
    company_name: str

    # 检测结果
    stripe_detected: bool
    confidence_score: float
    connect_type: str

    # 详细技术证据
    js_evidence: List[str]
    api_evidence: List[str]
    connect_evidence: List[str]
    checkout_evidence: List[str]
    business_evidence: List[str]

    # 自注册能力指标
    self_registration_indicators: List[str]
    payment_capability_indicators: List[str]

    # 独特特征
    unique_patterns: List[str]
    implementation_details: List[str]

class ConfirmedPlatformAnalyzer:
    """已确认平台分析器"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.detector = OptimizedStripeDetector(verify_ssl=False, timeout=45)

        # 自注册能力检测模式
        self.self_registration_patterns = {
            # 注册相关关键词
            'registration_patterns': [
                r'sign.*up',
                r'register',
                r'create.*account',
                r'get.*started',
                r'join.*now',
                r'start.*selling',
                r'become.*seller',
                r'seller.*registration',
                r'merchant.*signup',
                r'accept.*payments',
                r'setup.*payments',
            ],

            # 收款能力指标
            'payment_capability_patterns': [
                r'receive.*payments',
                r'accept.*payments',
                r'collect.*payments',
                r'payment.*processing',
                r'sell.*products',
                r'sell.*services',
                r'monetize.*content',
                r'creator.*economy',
                r'digital.*sales',
                r'online.*store',
            ],

            # Stripe Connect集成指标
            'connect_integration_patterns': [
                r'connect\.stripe\.com',
                r'stripe.*connect',
                r'stripe.*express',
                r'stripe.*custom',
                r'account.*links',
                r'oauth.*stripe',
                r'stripe.*dashboard',
                r'connect.*account',
            ],

            # 平台特征模式
            'platform_patterns': {
                'hype.co': [r'hype', r'creator', r'influencer', r'monetize'],
                'winningbidder.com': [r'bid', r'auction', r'winning', r'bidding'],
                'trustap.com': [r'trust', r'escrow', r'secure', r'payment'],
                'collctiv.com': [r'collect', r'group', r'payment', r'fund'],
                'rsvpify.com': [r'rsvp', r'event', r'invitation', r'booking'],
                'gumroad.com': [r'gumroad', r'digital.*product', r'creator', r'sell']
            }
        }

    async def analyze_self_registration_capability(self, content: str, url: str, domain: str) -> Dict[str, List[str]]:
        """分析自注册收款能力"""
        indicators = {
            'registration_indicators': [],
            'payment_capability_indicators': [],
            'connect_integration_indicators': [],
            'platform_specific_indicators': []
        }

        content_lower = content.lower()

        # 检测注册相关指标
        for pattern in self.self_registration_patterns['registration_patterns']:
            if re.search(pattern, content_lower, re.IGNORECASE):
                indicators['registration_indicators'].append(pattern)

        # 检测收款能力指标
        for pattern in self.self_registration_patterns['payment_capability_patterns']:
            if re.search(pattern, content_lower, re.IGNORECASE):
                indicators['payment_capability_indicators'].append(pattern)

        # 检测Connect集成指标
        for pattern in self.self_registration_patterns['connect_integration_patterns']:
            if re.search(pattern, content_lower, re.IGNORECASE):
                indicators['connect_integration_indicators'].append(pattern)

        # 检测平台特定特征
        for platform_domain, patterns in self.self_registration_patterns['platform_patterns'].items():
            if platform_domain in domain:
                for pattern in patterns:
                    if re.search(pattern, content_lower, re.IGNORECASE):
                        indicators['platform_specific_indicators'].append(f"{platform_domain}:{pattern}")

        # HTML解析检测注册功能
        try:
            soup = BeautifulSoup(content, 'html.parser')

            # 检测注册按钮/链接
            signup_elements = soup.find_all(['a', 'button'], text=re.compile(r'sign.*up|register|get.*started', re.IGNORECASE))
            if signup_elements:
                indicators['registration_indicators'].append("signup_button_found")

            # 检测表单元素
            forms = soup.find_all('form')
            for form in forms:
                action = form.get('action', '').lower()
                if any(keyword in action for keyword in ['signup', 'register', 'create', 'join']):
                    indicators['registration_indicators'].append("registration_form_found")

            # 检测Stripe相关表单
            stripe_forms = soup.find_all('form', attrs={'data-stripe': True})
            if stripe_forms:
                indicators['connect_integration_indicators'].append("stripe_form_found")

            # 检测账户类型选择
            account_elements = soup.find_all(text=re.compile(r'account.*type|seller.*account|creator.*account', re.IGNORECASE))
            if account_elements:
                indicators['registration_indicators'].append("account_type_selection_found")

        except Exception as e:
            self.logger.warning(f"HTML解析失败: {str(e)}")

        return indicators

    def extract_unique_patterns(self, content: str, domain: str) -> List[str]:
        """提取独特的实现模式"""
        unique_patterns = []

        # 检测独特的JavaScript实现
        content_lower = content.lower()

        # Stripe初始化模式
        stripe_init_patterns = [
            r'stripe\(',
            r'stripe\.confirm',
            r'stripe\.create',
            r'stripe\.handle',
            r'elements\.create',
            r'stripeelements',
        ]

        for pattern in stripe_init_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                unique_patterns.append(f"stripe_implementation:{pattern}")

        # 检测独特的配置模式
        config_patterns = [
            r'publishable_key',
            r'stripe_key',
            r'stripe_publishable',
            r'pk_live_',
            r'pk_test_',
        ]

        for pattern in config_patterns:
            if re.search(pattern, content_lower, re.IGNORECASE):
                unique_patterns.append(f"config_pattern:{pattern}")

        # 检测独特的业务流程
        business_patterns = {
            'hype.co': [r'creator.*fund', r'influencer.*payment', r'commission'],
            'winningbidder.com': [r'bid.*payment', r'auction.*fee', r'winner.*payment'],
            'trustap.com': [r'escrow', r'trust.*payment', r'secure.*transaction'],
            'collctiv.com': [r'group.*payment', r'collect.*fund', r'money.*pool'],
            'rsvpify.com': [r'event.*payment', r'ticket.*sale', r'booking.*fee'],
            'gumroad.com': [r'digital.*download', r'product.*sale', r'creator.*economy']
        }

        for platform_domain, patterns in business_patterns.items():
            if platform_domain in domain:
                for pattern in patterns:
                    if re.search(pattern, content_lower, re.IGNORECASE):
                        unique_patterns.append(f"business_flow:{pattern}")

        return unique_patterns

    async def analyze_single_platform(self, url: str, company_name: str = "") -> PlatformAnalysis:
        """分析单个平台"""
        print(f"🔍 正在分析: {url}")

        # 基础Stripe检测
        stripe_result = await self.detector.detect_stripe_comprehensive(url, company_name)

        # 获取详细内容用于深度分析
        async with aiohttp.ClientSession(
            connector=aiohttp.TCPConnector(ssl=False),
            timeout=aiohttp.ClientTimeout(total=45)
        ) as session:
            try:
                async with session.get(url) as response:
                    content = await response.text()
            except Exception as e:
                self.logger.error(f"获取内容失败 {url}: {str(e)}")
                content = ""

        domain = urlparse(url).netloc

        # 自注册能力分析
        self_reg_analysis = await self.analyze_self_registration_capability(content, url, domain)

        # 提取独特模式
        unique_patterns = self.extract_unique_patterns(content, domain)

        # 生成实现细节
        implementation_details = []

        if stripe_result.stripe_connect_detected:
            implementation_details.append(f"Connect类型: {stripe_result.connect_type}")
            implementation_details.append(f"置信度: {stripe_result.overall_confidence:.2f}")

            if stripe_result.stripe_connect_indicators:
                implementation_details.append(f"Connect指标: {len(stripe_result.stripe_connect_indicators)}个")

            if stripe_result.stripe_js_indicators:
                implementation_details.append(f"JS指标: {len(stripe_result.stripe_js_indicators)}个")

        if self_reg_analysis['registration_indicators']:
            implementation_details.append("发现注册功能")

        if self_reg_analysis['payment_capability_indicators']:
            implementation_details.append("发现收款功能")

        # 构建分析结果
        analysis = PlatformAnalysis(
            url=url,
            domain=domain,
            company_name=company_name,
            stripe_detected=stripe_result.stripe_connect_detected,
            confidence_score=stripe_result.overall_confidence,
            connect_type=stripe_result.connect_type,
            js_evidence=stripe_result.stripe_js_indicators,
            api_evidence=stripe_result.stripe_api_indicators,
            connect_evidence=stripe_result.stripe_connect_indicators,
            checkout_evidence=stripe_result.stripe_checkout_indicators,
            business_evidence=stripe_result.business_indicators,
            self_registration_indicators=self_reg_analysis['registration_indicators'],
            payment_capability_indicators=self_reg_analysis['payment_capability_indicators'],
            unique_patterns=unique_patterns,
            implementation_details=implementation_details
        )

        return analysis

    async def analyze_confirmed_platforms(self, platforms: List[Dict[str, str]]) -> List[PlatformAnalysis]:
        """分析已确认的平台列表"""
        print(f"🎯 开始分析 {len(platforms)} 个已确认平台...")

        tasks = []
        for platform in platforms:
            task = self.analyze_single_platform(
                platform['url'],
                platform.get('name', platform['url'])
            )
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 过滤异常结果
        valid_results = []
        for result in results:
            if isinstance(result, PlatformAnalysis):
                valid_results.append(result)
            else:
                self.logger.error(f"分析失败: {str(result)}")

        return valid_results

    def generate_success_patterns_report(self, analyses: List[PlatformAnalysis]) -> Dict[str, Any]:
        """生成成功模式报告"""
        report = {
            'summary': {
                'total_platforms': len(analyses),
                'detected_stripe': sum(1 for a in analyses if a.stripe_detected),
                'high_confidence': sum(1 for a in analyses if a.confidence_score > 0.7),
                'self_registration_capable': sum(1 for a in analyses if a.self_registration_indicators),
                'payment_capable': sum(1 for a in analyses if a.payment_capability_indicators)
            },
            'common_patterns': {
                'js_patterns': {},
                'api_patterns': {},
                'connect_patterns': {},
                'business_patterns': {},
                'registration_patterns': {},
                'payment_patterns': {}
            },
            'platform_specific_insights': {},
            'recommendations': []
        }

        # 统计常见模式
        all_js_patterns = []
        all_api_patterns = []
        all_connect_patterns = []
        all_business_patterns = []
        all_reg_patterns = []
        all_payment_patterns = []

        for analysis in analyses:
            all_js_patterns.extend(analysis.js_evidence)
            all_api_patterns.extend(analysis.api_evidence)
            all_connect_patterns.extend(analysis.connect_evidence)
            all_business_patterns.extend(analysis.business_evidence)
            all_reg_patterns.extend(analysis.self_registration_indicators)
            all_payment_patterns.extend(analysis.payment_capability_indicators)

        # 计算模式频率
        def count_patterns(patterns):
            pattern_counts = {}
            for pattern in patterns:
                pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1
            return dict(sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[:10])

        report['common_patterns']['js_patterns'] = count_patterns(all_js_patterns)
        report['common_patterns']['api_patterns'] = count_patterns(all_api_patterns)
        report['common_patterns']['connect_patterns'] = count_patterns(all_connect_patterns)
        report['common_patterns']['business_patterns'] = count_patterns(all_business_patterns)
        report['common_patterns']['registration_patterns'] = count_patterns(all_reg_patterns)
        report['common_patterns']['payment_patterns'] = count_patterns(all_payment_patterns)

        # 平台特定洞察
        for analysis in analyses:
            report['platform_specific_insights'][analysis.domain] = {
                'connect_type': analysis.connect_type,
                'confidence': analysis.confidence_score,
                'unique_features': analysis.unique_patterns,
                'self_registration_features': len(analysis.self_registration_indicators),
                'payment_features': len(analysis.payment_capability_indicators),
                'implementation_notes': analysis.implementation_details
            }

        # 生成优化建议
        if report['summary']['detected_stripe'] == len(analyses):
            report['recommendations'].append("✅ 所有平台都成功检测到Stripe Connect")

        if report['summary']['self_registration_capable'] > 0:
            report['recommendations'].append(f"🎯 {report['summary']['self_registration_capable']}个平台具有自注册功能")

        # 提取最有效的检测模式
        top_js_patterns = list(report['common_patterns']['js_patterns'].keys())[:3]
        top_connect_patterns = list(report['common_patterns']['connect_patterns'].keys())[:3]

        report['recommendations'].append(f"🔍 重点关注JS模式: {', '.join(top_js_patterns)}")
        report['recommendations'].append(f"🔍 重点关注Connect模式: {', '.join(top_connect_patterns)}")

        return report

async def main():
    """主函数"""
    # 用户提供的已确认平台
    confirmed_platforms = [
        {"url": "https://hype.co/", "name": "Hype"},
        {"url": "https://winningbidder.com/", "name": "Winning Bidder"},
        {"url": "https://www.trustap.com/", "name": "Trustap"},
        {"url": "https://www.collctiv.com/", "name": "Collctiv"},
        {"url": "https://rsvpify.com/", "name": "RSVPify"},
        {"url": "https://gumroad.com/", "name": "Gumroad"}
    ]

    # 创建分析器
    analyzer = ConfirmedPlatformAnalyzer()

    # 分析平台
    analyses = await analyzer.analyze_confirmed_platforms(confirmed_platforms)

    # 生成报告
    report = analyzer.generate_success_patterns_report(analyses)

    # 显示结果
    print("\n" + "="*80)
    print("🎯 已确认平台分析报告")
    print("="*80)

    print(f"\n📊 总体概况:")
    print(f"   总平台数: {report['summary']['total_platforms']}")
    print(f"   检测到Stripe: {report['summary']['detected_stripe']}")
    print(f"   高置信度检测: {report['summary']['high_confidence']}")
    print(f"   具自注册能力: {report['summary']['self_registration_capable']}")
    print(f"   具收款能力: {report['summary']['payment_capable']}")

    print(f"\n🔍 常见检测模式:")
    print(f"   JS模式 (前3): {list(report['common_patterns']['js_patterns'].keys())[:3]}")
    print(f"   Connect模式 (前3): {list(report['common_patterns']['connect_patterns'].keys())[:3]}")
    print(f"   业务模式 (前3): {list(report['common_patterns']['business_patterns'].keys())[:3]}")

    print(f"\n💡 优化建议:")
    for rec in report['recommendations']:
        print(f"   {rec}")

    # 保存详细报告
    detailed_report = {
        'timestamp': datetime.now().isoformat(),
        'summary': report['summary'],
        'common_patterns': report['common_patterns'],
        'platform_analyses': [
            {
                'platform': analysis.domain,
                'url': analysis.url,
                'stripe_detected': analysis.stripe_detected,
                'confidence': analysis.confidence_score,
                'connect_type': analysis.connect_type,
                'js_evidence_count': len(analysis.js_evidence),
                'connect_evidence_count': len(analysis.connect_evidence),
                'self_registration_features': len(analysis.self_registration_indicators),
                'payment_features': len(analysis.payment_capability_indicators),
                'unique_patterns': analysis.unique_patterns,
                'implementation_details': analysis.implementation_details
            }
            for analysis in analyses
        ],
        'recommendations': report['recommendations']
    }

    # 保存到文件
    with open("confirmed_platforms_analysis_report.json", "w", encoding="utf-8") as f:
        json.dump(detailed_report, f, ensure_ascii=False, indent=2)

    print(f"\n📄 详细报告已保存到: confirmed_platforms_analysis_report.json")

    return detailed_report

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())