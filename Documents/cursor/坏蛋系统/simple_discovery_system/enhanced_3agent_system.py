#!/usr/bin/env python3
"""
增强版4-Agent系统架构
重新设计的智能化资金中转平台发现系统

Agent角色重新定义：
- DA (Discovery Agent) - 主动发现专家
- VA (Validation Agent) - 深度验证专家
- AA (Analysis Agent) - 智能分析专家
- CA (Coordination Agent) - 协调智能专家
"""

import json
import time
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import requests
from urllib.parse import urljoin
import re
from bs4 import BeautifulSoup

@dataclass
class PlatformProfile:
    """平台档案"""
    domain: str
    title: str
    description: str
    url: str
    discovered_by: str
    confidence_score: float
    tags: List[str]
    metadata: Dict[str, Any]
    validation_status: str = "pending"  # pending, validated, rejected
    analysis_status: str = "pending"     # pending, approved, rejected

class SharedKnowledgeBase:
    """共享知识库"""
    def __init__(self):
        self.discovered_platforms = []
        self.validation_patterns = {}
        self.analysis_criteria = {}
        self.success_patterns = []
        self.failure_patterns = []

    def add_platform(self, platform: PlatformProfile):
        self.discovered_platforms.append(platform)

    def get_platform(self, domain: str) -> Optional[PlatformProfile]:
        for platform in self.discovered_platforms:
            if platform.domain == domain:
                return platform
        return None

    def is_known_platform(self, domain: str) -> bool:
        return self.get_platform(domain) is not None

class EnhancedDiscoveryAgent:
    """增强版发现Agent - 主动发现专家"""

    def __init__(self, knowledge_base: SharedKnowledgeBase):
        self.kb = knowledge_base
        self.discovery_strategies = {
            'search_engines': self._search_engine_discovery,
            'marketplace_scan': self._marketplace_scan,
            'competitor_analysis': self._competitor_analysis,
            'social_media_scan': self._social_media_scan,
            'api_directory': self._api_directory_scan
        }

        # 关键词库
        self.payment_keywords = [
            'payment gateway', 'accept payments', 'get paid', 'receive money',
            'checkout', 'billing', 'invoice', 'subscription', 'e-commerce',
            'merchant account', 'payment processor', 'online payment'
        ]

        self.us_market_keywords = [
            'USA', 'United States', 'US', 'American', 'ACH', 'direct deposit',
            'bank transfer', 'USD', 'dollar'
        ]

        self.self_registration_keywords = [
            'sign up', 'get started', 'register', 'create account', 'join',
            'become a merchant', 'start selling', 'setup account'
        ]

    def discover_platforms(self, strategy: str = 'all', limit: int = 20) -> List[PlatformProfile]:
        """主动发现新平台"""
        print(f"🔍 DA开始主动发现平台 (策略: {strategy})")

        new_platforms = []

        if strategy == 'all':
            strategies = list(self.discovery_strategies.keys())
        else:
            strategies = [strategy]

        for strat in strategies:
            if strat in self.discovery_strategies:
                print(f"   📡 执行发现策略: {strat}")
                platforms = self.discovery_strategies[strat](limit // len(strategies))
                for platform in platforms:
                    if not self.kb.is_known_platform(platform.domain):
                        platform.discovered_by = f"DA-{strat}"
                        self.kb.add_platform(platform)
                        new_platforms.append(platform)
                        print(f"      ✅ 发现: {platform.domain}")

        print(f"🎉 DA发现完成! 找到 {len(new_platforms)} 个新平台")
        return new_platforms

    def _search_engine_discovery(self, limit: int) -> List[PlatformProfile]:
        """搜索引擎发现"""
        platforms = []

        # 模拟搜索引擎发现的实际支付平台
        search_queries = [
            "payment gateway for small business USA",
            "online payment processor ACH transfer",
            "e-commerce payment solutions United States",
            "merchant services for creators",
            "subscription payment platforms"
        ]

        # 已知高质量支付平台（基于实际调研）
        high_quality_platforms = [
            {
                'domain': 'squareup.com',
                'title': 'Square - Commerce Platform',
                'description': 'Complete commerce platform with payment processing',
                'tags': ['payment', 'ecommerce', 'POS', 'small_business']
            },
            {
                'domain': 'shopify.com',
                'title': 'Shopify - E-commerce Platform',
                'description': 'All-in-one commerce platform to start, run, and grow a business',
                'tags': ['ecommerce', 'payment', 'online_store']
            },
            {
                'domain': 'woocommerce.com',
                'title': 'WooCommerce - WordPress E-commerce',
                'description': 'Open-source e-commerce platform for WordPress',
                'tags': ['wordpress', 'ecommerce', 'open_source']
            },
            {
                'domain': 'bigcommerce.com',
                'title': 'BigCommerce - E-commerce Platform',
                'description': 'Enterprise e-commerce platform with built-in payments',
                'tags': ['ecommerce', 'enterprise', 'payment']
            },
            {
                'domain': 'authorizenet.com',
                'title': 'Authorize.Net - Payment Gateway',
                'description': 'Payment gateway for merchants of all sizes',
                'tags': ['payment_gateway', 'merchant_services']
            }
        ]

        for platform_data in high_quality_platforms[:limit]:
            if not self.kb.is_known_platform(platform_data['domain']):
                platform = PlatformProfile(
                    domain=platform_data['domain'],
                    title=platform_data['title'],
                    description=platform_data['description'],
                    url=f"https://{platform_data['domain']}",
                    discovered_by="DA-search_engines",
                    confidence_score=0.8,
                    tags=platform_data['tags'],
                    metadata={'source': 'researched', 'quality': 'high'}
                )
                platforms.append(platform)

        return platforms

    def _marketplace_scan(self, limit: int) -> List[PlatformProfile]:
        """市场平台扫描"""
        # 模拟从应用市场和平台目录发现
        return []

    def _competitor_analysis(self, limit: int) -> List[PlatformProfile]:
        """竞争对手分析"""
        return []

    def _social_media_scan(self, limit: int) -> List[PlatformProfile]:
        """社交媒体扫描"""
        return []

    def _api_directory_scan(self, limit: int) -> List[PlatformProfile]:
        """API目录扫描"""
        return []

class EnhancedValidationAgent:
    """增强版验证Agent - 深度验证专家"""

    def __init__(self, knowledge_base: SharedKnowledgeBase):
        self.kb = knowledge_base
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]

        # 关键词库 - 修复AttributeError
        self.payment_keywords = [
            'payment gateway', 'accept payments', 'get paid', 'receive money',
            'checkout', 'billing', 'invoice', 'subscription', 'e-commerce',
            'merchant account', 'payment processor', 'online payment'
        ]

        self.us_market_keywords = [
            'USA', 'United States', 'US', 'American', 'ACH', 'direct deposit',
            'bank transfer', 'USD', 'dollar'
        ]

        self.self_registration_keywords = [
            'sign up', 'get started', 'register', 'create account', 'join',
            'become a merchant', 'start selling', 'setup account'
        ]

        self.validation_criteria = {
            'accessibility': 0.3,      # 可访问性 (能否访问)
            'us_market_focus': 0.25,   # 美国市场专注度
            'self_registration': 0.2,   # 自注册能力
            'payment_functionality': 0.25  # 支付功能完整性
        }

    def validate_platforms(self, platforms: List[PlatformProfile]) -> List[PlatformProfile]:
        """深度验证平台列表"""
        print(f"🔍 VA开始深度验证 {len(platforms)} 个平台")

        validated_platforms = []

        for i, platform in enumerate(platforms, 1):
            print(f"   [{i}/{len(platforms)}] 验证: {platform.domain}")

            # 执行多维度验证
            validation_result = self._comprehensive_validation(platform)

            # 更新平台档案
            platform.validation_status = validation_result['status']
            platform.confidence_score = validation_result['score']
            platform.metadata.update(validation_result['metadata'])

            if validation_result['status'] == 'validated':
                validated_platforms.append(platform)
                print(f"      ✅ 验证成功 (分数: {validation_result['score']:.2f})")
            else:
                print(f"      ❌ 验证失败 (原因: {validation_result['reason']})")

        print(f"🎉 VA验证完成! {len(validated_platforms)} 个平台通过验证")
        return validated_platforms

    def _comprehensive_validation(self, platform: PlatformProfile) -> Dict[str, Any]:
        """综合验证单个平台"""
        result = {
            'status': 'rejected',
            'score': 0.0,
            'reason': '',
            'metadata': {}
        }

        try:
            # 模拟HTTP请求验证
            response_status = self._simulate_platform_access(platform.url)

            if response_status in [200, 403]:  # 403也算可访问（有保护）
                result['metadata']['accessibility'] = True
                result['metadata']['response_status'] = response_status

                # 基于域名和描述的内容分析
                content_score = self._analyze_platform_content(platform)

                # 综合评分
                accessibility_score = self.validation_criteria['accessibility'] if response_status in [200, 403] else 0
                us_market_score = self._check_us_market_focus(platform) * self.validation_criteria['us_market_focus']
                self_reg_score = self._check_self_registration(platform) * self.validation_criteria['self_registration']
                payment_score = self._check_payment_functionality(platform) * self.validation_criteria['payment_functionality']

                total_score = accessibility_score + us_market_score + self_reg_score + payment_score
                result['score'] = total_score

                # 更新元数据
                result['metadata'].update({
                    'us_market_score': us_market_score / self.validation_criteria['us_market_focus'],
                    'self_reg_score': self_reg_score / self.validation_criteria['self_registration'],
                    'payment_score': payment_score / self.validation_criteria['payment_functionality'],
                    'content_analysis': content_score
                })

                # 验证通过标准
                if total_score >= 0.6:  # 60分以上通过
                    result['status'] = 'validated'
                    result['reason'] = 'Comprehensive validation passed'
                else:
                    result['reason'] = f'Score too low: {total_score:.2f}'
            else:
                result['reason'] = f'Platform inaccessible (HTTP {response_status})'

        except Exception as e:
            result['reason'] = f'Validation error: {str(e)}'

        return result

    def _simulate_platform_access(self, url: str) -> int:
        """模拟平台访问"""
        # 模拟不同的响应状态
        import random

        # 基于域名特征模拟更真实的响应
        domain_patterns = {
            'paypal.com': 200,
            'stripe.com': 200,
            'squareup.com': 200,
            'shopify.com': 200,
            'woocommerce.com': 200,
            'bigcommerce.com': 200,
            'authorizenet.com': 200
        }

        if url in domain_patterns:
            return domain_patterns[url]
        elif any(pattern in url for pattern in ['payment', 'pay', 'checkout', 'billing']):
            # 支付相关网站通常有保护，返回403是正常的
            return random.choice([200, 403, 404])
        else:
            return random.choice([200, 404, 500])

    def _analyze_platform_content(self, platform: PlatformProfile) -> float:
        """分析平台内容相关性"""
        score = 0.0

        # 基于标签分析
        payment_tags = ['payment', 'checkout', 'billing', 'invoice', 'ecommerce', 'merchant']
        for tag in platform.tags:
            if tag in payment_tags:
                score += 0.2

        # 基于描述分析
        description_lower = platform.description.lower()
        for keyword in self.payment_keywords:
            if keyword in description_lower:
                score += 0.1

        return min(score, 1.0)

    def _check_us_market_focus(self, platform: PlatformProfile) -> float:
        """检查美国市场专注度"""
        score = 0.0

        domain_lower = platform.domain.lower()
        description_lower = platform.description.lower()

        for keyword in self.us_market_keywords:
            if keyword in domain_lower or keyword in description_lower:
                score += 0.3

        return min(score, 1.0)

    def _check_self_registration(self, platform: PlatformProfile) -> float:
        """检查自注册能力"""
        score = 0.0

        description_lower = platform.description.lower()

        for keyword in self.self_registration_keywords:
            if keyword in description_lower:
                score += 0.3

        return min(score, 1.0)

    def _check_payment_functionality(self, platform: PlatformProfile) -> float:
        """检查支付功能完整性"""
        score = 0.0

        # 基于域名模式判断
        payment_patterns = ['pay', 'payment', 'checkout', 'billing', 'invoice']
        domain_lower = platform.domain.lower()

        for pattern in payment_patterns:
            if pattern in domain_lower:
                score += 0.3
                break

        # 基于标签判断
        payment_tags = ['payment', 'ecommerce', 'gateway', 'processor']
        for tag in platform.tags:
            if tag in payment_tags:
                score += 0.3

        return min(score, 1.0)

class EnhancedAnalysisAgent:
    """增强版分析Agent - 智能分析专家"""

    def __init__(self, knowledge_base: SharedKnowledgeBase):
        self.kb = knowledge_base
        self.approval_criteria = {
            'business_model': 0.3,      # 商业模式
            'technical_capability': 0.25, # 技术能力
            'market_position': 0.2,      # 市场地位
            'compliance': 0.25            # 合规性
        }

        # 成功模式库
        self.success_patterns = [
            '清晰的支付网关定位',
            '支持美国银行转账',
            '提供API集成',
            '有清晰的定价结构',
            '良好的安全性保障'
        ]

        # 风险信号
        self.risk_signals = [
            '业务模式不清晰',
            '缺乏支付功能描述',
            '合规信息不足',
            '技术文档不完整'
        ]

    def analyze_platforms(self, platforms: List[PlatformProfile]) -> List[PlatformProfile]:
        """智能分析平台"""
        print(f"🔍 AA开始智能分析 {len(platforms)} 个平台")

        approved_platforms = []

        for i, platform in enumerate(platforms, 1):
            print(f"   [{i}/{len(platforms)}] 分析: {platform.domain}")

            # 执行深度分析
            analysis_result = self._deep_analysis(platform)

            # 更新平台档案
            platform.analysis_status = analysis_result['status']
            platform.confidence_score = analysis_result['score']
            platform.metadata.update(analysis_result['metadata'])

            if analysis_result['status'] == 'approved':
                approved_platforms.append(platform)
                print(f"      🏆 分析通过! AA分数: {analysis_result['score']:.2f}")
                print(f"         💡 核心优势: {', '.join(analysis_result['strengths'][:3])}")
            else:
                print(f"      ❌ 分析未通过 (原因: {analysis_result['reason']})")

        print(f"🎉 AA分析完成! {len(approved_platforms)} 个平台获得批准")
        return approved_platforms

    def _deep_analysis(self, platform: PlatformProfile) -> Dict[str, Any]:
        """深度分析单个平台"""
        result = {
            'status': 'rejected',
            'score': 0.0,
            'reason': '',
            'strengths': [],
            'weaknesses': [],
            'metadata': {}
        }

        try:
            # 业务模式分析
            business_score = self._analyze_business_model(platform)

            # 技术能力分析
            tech_score = self._analyze_technical_capability(platform)

            # 市场地位分析
            market_score = self._analyze_market_position(platform)

            # 合规性分析
            compliance_score = self._analyze_compliance(platform)

            # 综合评分
            total_score = (
                business_score * self.approval_criteria['business_model'] +
                tech_score * self.approval_criteria['technical_capability'] +
                market_score * self.approval_criteria['market_position'] +
                compliance_score * self.approval_criteria['compliance']
            )

            result['score'] = total_score
            result['metadata'].update({
                'business_score': business_score,
                'tech_score': tech_score,
                'market_score': market_score,
                'compliance_score': compliance_score
            })

            # 识别优势和弱点
            result['strengths'] = self._identify_strengths(platform, business_score, tech_score, market_score, compliance_score)
            result['weaknesses'] = self._identify_weaknesses(platform, business_score, tech_score, market_score, compliance_score)

            # 风险评估
            risk_assessment = self._risk_assessment(platform, result['weaknesses'])

            # 审批决策
            if total_score >= 0.7 and risk_assessment['risk_level'] == 'low':
                result['status'] = 'approved'
                result['reason'] = 'High-quality platform with low risk'
            elif total_score >= 0.6 and risk_assessment['risk_level'] == 'medium':
                result['status'] = 'pending'
                result['reason'] = 'Promising platform requires further review'
            else:
                result['status'] = 'rejected'
                result['reason'] = risk_assessment['primary_risk']

        except Exception as e:
            result['reason'] = f'Analysis error: {str(e)}'

        return result

    def _analyze_business_model(self, platform: PlatformProfile) -> float:
        """分析商业模式"""
        score = 0.0

        # 检查是否为支付相关业务
        payment_indicators = ['payment', 'gateway', 'processor', 'ecommerce', 'billing']
        description_lower = platform.description.lower()

        for indicator in payment_indicators:
            if indicator in description_lower:
                score += 0.3
                break

        # 检查B2B或B2C模式
        b2b_indicators = ['business', 'enterprise', 'merchant', 'professional']
        b2c_indicators = ['consumer', 'customer', 'individual', 'personal']

        for indicator in b2b_indicators:
            if indicator in description_lower:
                score += 0.2

        for indicator in b2c_indicators:
            if indicator in description_lower:
                score += 0.2

        return min(score, 1.0)

    def _analyze_technical_capability(self, platform: PlatformProfile) -> float:
        """分析技术能力"""
        score = 0.0

        # 基于域名判断技术成熟度
        if any(tld in platform.domain for tld in ['.com', '.net', '.org']):
            score += 0.3

        # 基于标签判断技术能力
        tech_indicators = ['api', 'integration', 'sdk', 'documentation']
        for indicator in tech_indicators:
            if indicator in platform.tags:
                score += 0.2
                break

        return min(score, 1.0)

    def _analyze_market_position(self, platform: PlatformProfile) -> float:
        """分析市场地位"""
        score = 0.0

        # 基于已知品牌评估
        well_known_brands = {
            'paypal.com': 1.0,
            'stripe.com': 1.0,
            'squareup.com': 0.9,
            'shopify.com': 0.9,
            'authorizenet.com': 0.8
        }

        if platform.domain in well_known_brands:
            score = well_known_brands[platform.domain]
        else:
            # 对于未知品牌，基于描述评估
            if 'leading' in platform.description.lower() or 'established' in platform.description.lower():
                score = 0.6
            elif 'startup' in platform.description.lower() or 'new' in platform.description.lower():
                score = 0.3

        return min(score, 1.0)

    def _analyze_compliance(self, platform: PlatformProfile) -> float:
        """分析合规性"""
        score = 0.0

        # 基于描述中的合规关键词
        compliance_keywords = ['secure', 'compliant', 'regulated', 'pci', 'encryption']
        description_lower = platform.description.lower()

        for keyword in compliance_keywords:
            if keyword in description_lower:
                score += 0.3

        # 基于域名评估可信度
        if platform.domain.count('.') <= 2:  # 简洁域名通常更可信
            score += 0.2

        return min(score, 1.0)

    def _identify_strengths(self, platform: PlatformProfile, *scores) -> List[str]:
        """识别平台优势"""
        strengths = []

        if scores[0] >= 0.7:  # business_score
            strengths.append("清晰的商业模式")

        if scores[1] >= 0.7:  # tech_score
            strengths.append("技术能力突出")

        if scores[2] >= 0.7:  # market_score
            strengths.append("市场地位稳固")

        if scores[3] >= 0.7:  # compliance_score
            strengths.append("合规性良好")

        return strengths

    def _identify_weaknesses(self, platform: PlatformProfile, *scores) -> List[str]:
        """识别平台弱点"""
        weaknesses = []

        if scores[0] < 0.4:  # business_score
            weaknesses.append("商业模式不清晰")

        if scores[1] < 0.4:  # tech_score
            weaknesses.append("技术能力不足")

        if scores[2] < 0.4:  # market_score
            weaknesses.append("市场地位不明")

        if scores[3] < 0.4:  # compliance_score
            weaknesses.append("合规性担忧")

        return weaknesses

    def _risk_assessment(self, platform: PlatformProfile, weaknesses: List[str]) -> Dict[str, Any]:
        """风险评估"""
        risk_level = 'low'
        primary_risk = ''

        high_risk_patterns = [
            '商业模式不清晰',
            '技术能力不足',
            '合规性担忧'
        ]

        medium_risk_patterns = [
            '市场地位不明'
        ]

        for weakness in weaknesses:
            if weakness in high_risk_patterns:
                risk_level = 'high'
                primary_risk = weakness
                break
            elif weakness in medium_risk_patterns and risk_level != 'high':
                risk_level = 'medium'
                primary_risk = weakness

        return {
            'risk_level': risk_level,
            'primary_risk': primary_risk,
            'risk_factors': weaknesses
        }

class Enhanced3AgentSystem:
    """增强版3-Agent系统"""

    def __init__(self):
        self.kb = SharedKnowledgeBase()
        self.da = EnhancedDiscoveryAgent(self.kb)
        self.va = EnhancedValidationAgent(self.kb)
        self.aa = EnhancedAnalysisAgent(self.kb)

        self.session_stats = {
            'discovered': 0,
            'validated': 0,
            'approved': 0,
            'cycles': 0
        }

    async def run_discovery_cycle(self, discovery_strategy: str = 'all', platform_limit: int = 20) -> Dict[str, Any]:
        """运行发现周期"""
        print(f"🚀 启动增强版3-Agent发现周期")
        print(f"📊 策略: {discovery_strategy}, 平台限制: {platform_limit}")
        print("="*80)

        cycle_start = datetime.now()

        # Phase 1: DA主动发现
        print(f"\n🟢 Phase 1: DA主动发现")
        print("-" * 50)
        discovered_platforms = self.da.discover_platforms(discovery_strategy, platform_limit)
        self.session_stats['discovered'] += len(discovered_platforms)

        if not discovered_platforms:
            print("❌ 未发现新平台，周期结束")
            return self._generate_cycle_report(cycle_start, [], [])

        # Phase 2: VA深度验证
        print(f"\n🟡 Phase 2: VA深度验证")
        print("-" * 50)
        validated_platforms = self.va.validate_platforms(discovered_platforms)
        self.session_stats['validated'] += len(validated_platforms)

        if not validated_platforms:
            print("⚠️ 无平台通过验证，周期结束")
            return self._generate_cycle_report(cycle_start, discovered_platforms, [])

        # Phase 3: AA智能分析
        print(f"\n🔴 Phase 3: AA智能分析")
        print("-" * 50)
        approved_platforms = self.aa.analyze_platforms(validated_platforms)
        self.session_stats['approved'] += len(approved_platforms)
        self.session_stats['cycles'] += 1

        # 生成报告
        return self._generate_cycle_report(cycle_start, discovered_platforms, approved_platforms)

    def _generate_cycle_report(self, cycle_start: datetime, discovered: List[PlatformProfile], approved: List[PlatformProfile]) -> Dict[str, Any]:
        """生成周期报告"""
        cycle_end = datetime.now()
        duration = (cycle_end - cycle_start).total_seconds()

        report = {
            'cycle_timestamp': cycle_start.isoformat(),
            'duration_seconds': duration,
            'discovered_count': len(discovered),
            'validated_count': len([p for p in discovered if p.validation_status == 'validated']),
            'approved_count': len(approved),
            'approval_rate': len(approved) / len(discovered) * 100 if discovered else 0,
            'discovered_platforms': [
                {
                    'domain': p.domain,
                    'title': p.title,
                    'discovered_by': p.discovered_by,
                    'confidence_score': p.confidence_score,
                    'validation_status': p.validation_status,
                    'analysis_status': p.analysis_status
                }
                for p in discovered
            ],
            'approved_platforms': [
                {
                    'domain': p.domain,
                    'title': p.title,
                    'confidence_score': p.confidence_score,
                    'strengths': p.metadata.get('strengths', []),
                    'aa_score': p.metadata.get('aa_score', p.confidence_score)
                }
                for p in approved
            ],
            'session_stats': self.session_stats.copy()
        }

        # 保存报告
        self._save_report(report)

        # 显示摘要
        print(f"\n📊 周期报告摘要:")
        print("=" * 50)
        print(f"⏰ 执行时间: {duration:.1f}秒")
        print(f"🔍 发现平台: {len(discovered)}个")
        print(f"✅ 验证通过: {report['validated_count']}个")
        print(f"🏆 分析批准: {len(approved)}个")
        print(f"📈 批准率: {report['approval_rate']:.1f}%")

        if approved:
            print(f"\n🎉 批准平台详情:")
            for platform in approved:
                print(f"   🏆 {platform.domain} - AA分数: {platform.confidence_score:.2f}")

        return report

    def _save_report(self, report: Dict[str, Any]):
        """保存报告"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = Path(__file__).parent / "data" / f"enhanced_3agent_report_{timestamp}.json"
        report_file.parent.mkdir(exist_ok=True)

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)

        print(f"💾 报告已保存: {report_file}")

    def get_system_stats(self) -> Dict[str, Any]:
        """获取系统统计"""
        return {
            'total_discovered': len(self.kb.discovered_platforms),
            'total_validated': len([p for p in self.kb.discovered_platforms if p.validation_status == 'validated']),
            'total_approved': len([p for p in self.kb.discovered_platforms if p.analysis_status == 'approved']),
            'session_stats': self.session_stats
        }

async def main():
    """主函数 - 演示增强版3-Agent系统"""
    print("🚀 增强版3-Agent资金中转平台发现系统")
    print("="*80)

    # 初始化系统
    system = Enhanced3AgentSystem()

    # 运行发现周期
    report = await system.run_discovery_cycle('search_engines', 10)

    # 显示最终统计
    print(f"\n📊 系统最终统计:")
    stats = system.get_system_stats()
    print(f"   总发现平台: {stats['total_discovered']}")
    print(f"   总验证平台: {stats['total_validated']}")
    print(f"   总批准平台: {stats['total_approved']}")
    print(f"   批准率: {stats['total_approved']/stats['total_discovered']*100 if stats['total_discovered'] > 0 else 0:.1f}%")

if __name__ == "__main__":
    asyncio.run(main())