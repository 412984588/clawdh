#!/usr/bin/env python3
"""
持续学习系统 - 基于错误案例优化检测算法
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
import re

from enhanced_detector_v4 import EnhancedStripeDetectorV4, EnhancedStripeResult

@dataclass
class LearningCase:
    """学习案例"""
    url: str
    expected_result: bool
    actual_result: bool
    confidence_score: float
    connect_type: str
    self_registration: bool
    payment_capability: bool

    # 案例分类
    case_type: str  # 'true_positive', 'false_negative', 'false_positive', 'true_negative'

    # 技术证据
    js_indicators: List[str]
    connect_indicators: List[str]
    config_indicators: List[str]
    registration_indicators: List[str]
    payment_capability_indicators: List[str]

    # 学习要点
    missing_patterns: List[str]
    false_positive_patterns: List[str]
    correct_patterns: List[str]

    # 元数据
    timestamp: str
    analysis_notes: str

class ContinuousLearningSystem:
    """持续学习系统"""

    def __init__(self, learning_data_path: str = "learning_data.json"):
        self.learning_data_path = learning_data_path
        self.detector = EnhancedStripeDetectorV4()
        self.logger = logging.getLogger(__name__)

        # 初始化学习数据
        self.learning_data = self.load_learning_data()

        # 模式权重管理
        self.pattern_weights = self.learning_data.get('pattern_weights', {})
        self.threshold_settings = self.learning_data.get('threshold_settings', {
            'detection_threshold': 0.15,
            'high_confidence_threshold': 0.7,
            'registration_weight': 0.25
        })

    def load_learning_data(self) -> Dict[str, Any]:
        """加载学习数据"""
        try:
            if Path(self.learning_data_path).exists():
                with open(self.learning_data_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            self.logger.warning(f"加载学习数据失败: {str(e)}")

        # 默认学习数据结构
        return {
            'cases': [],
            'pattern_weights': {},
            'threshold_settings': {
                'detection_threshold': 0.15,
                'high_confidence_threshold': 0.7,
                'registration_weight': 0.25
            },
            'performance_metrics': {
                'total_cases': 0,
                'accuracy': 0.0,
                'recall': 0.0,
                'precision': 0.0
            },
            'last_updated': datetime.now().isoformat()
        }

    def save_learning_data(self):
        """保存学习数据"""
        self.learning_data['last_updated'] = datetime.now().isoformat()

        try:
            with open(self.learning_data_path, 'w', encoding='utf-8') as f:
                json.dump(self.learning_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            self.logger.error(f"保存学习数据失败: {str(e)}")

    def classify_case(self, expected: bool, actual: bool, confidence: float) -> str:
        """分类案例类型"""
        if expected and actual:
            if confidence > 0.7:
                return 'true_positive_high'
            else:
                return 'true_positive_low'
        elif expected and not actual:
            return 'false_negative'
        elif not expected and actual:
            return 'false_positive'
        else:
            return 'true_negative'

    def analyze_false_negative(self, case: LearningCase) -> List[str]:
        """分析假阴性案例,找出缺失的模式"""
        insights = []

        # 分析业务模式
        if not case.registration_indicators and case.expected_result:
            insights.append("需要增强注册功能检测模式")

        if not case.payment_capability_indicators and case.expected_result:
            insights.append("需要增强收款能力检测模式")

        if not case.js_indicators and not case.connect_indicators and case.expected_result:
            insights.append("需要增强技术指标检测,可能使用了隐藏的Stripe集成")

        # 分析置信度
        if case.confidence_score < 0.1 and case.expected_result:
            insights.append("检测阈值可能过高,需要调整检测逻辑")

        return insights

    def analyze_false_positive(self, case: LearningCase) -> List[str]:
        """分析假阳性案例,找出误判模式"""
        insights = []

        # 分析误判原因
        if case.js_indicators and not case.expected_result:
            insights.append(f"JS指标误判: {case.js_indicators}")

        if case.connect_indicators and not case.expected_result:
            insights.append(f"Connect指标误判: {case.connect_indicators}")

        if case.confidence_score > 0.5 and not case.expected_result:
            insights.append("高置信度误判,需要调整检测权重")

        return insights

    def extract_missing_patterns(self, url: str, case_type: str, indicators: Dict[str, List[str]]) -> List[str]:
        """提取缺失的模式"""
        missing_patterns = []

        if case_type == 'false_negative':
            # 对于假阴性,分析可能的缺失模式
            domain = url.split('//')[-1].split('/')[0].lower()

            # 基于域名推断可能的模式
            if 'creator' in domain or 'influencer' in domain:
                missing_patterns.extend([r'creator.*economy', r'influencer.*payment', r'monetize'])

            if 'auction' in domain or 'bid' in domain:
                missing_patterns.extend([r'auction.*payment', r'bid.*processing', r'winning.*bid'])

            if 'trust' in domain or 'secure' in domain:
                missing_patterns.extend([r'trust.*payment', r'secure.*transaction', r'escrow'])

            if 'group' in domain or 'collect' in domain:
                missing_patterns.extend([r'group.*payment', r'collect.*fund', r'money.*pool'])

        return missing_patterns

    def update_pattern_weights(self, case: LearningCase):
        """更新模式权重"""
        # 假阴性:提升相关模式权重
        if case.case_type in ['false_negative']:
            for pattern in case.missing_patterns:
                self.pattern_weights[pattern] = self.pattern_weights.get(pattern, 1.0) * 1.2

        # 假阳性:降低相关模式权重
        elif case.case_type == 'false_positive':
            for pattern in case.false_positive_patterns:
                self.pattern_weights[pattern] = self.pattern_weights.get(pattern, 1.0) * 0.8

        # 真阳性:确认模式有效性
        elif case.case_type.startswith('true_positive'):
            for pattern in case.correct_patterns:
                self.pattern_weights[pattern] = self.pattern_weights.get(pattern, 1.0) * 1.1

    def adjust_thresholds(self, recent_cases: List[LearningCase]):
        """基于最近案例调整阈值"""
        if len(recent_cases) < 5:
            return

        false_negatives = [c for c in recent_cases if c.case_type == 'false_negative']
        false_positives = [c for c in recent_cases if c.case_type == 'false_positive']

        # 假阴性过多,降低阈值
        if len(false_negatives) > len(false_positives) * 2:
            self.threshold_settings['detection_threshold'] *= 0.95
            self.logger.info("降低检测阈值以减少假阴性")

        # 假阳性过多,提高阈值
        elif len(false_positives) > len(false_negatives) * 2:
            self.threshold_settings['detection_threshold'] *= 1.05
            self.logger.info("提高检测阈值以减少假阳性")

    def learn_from_case(self, case: LearningCase):
        """从单个案例中学习"""
        self.learning_data['cases'].append(asdict(case))

        # 更新模式权重
        self.update_pattern_weights(case)

        # 分析洞察
        if case.case_type == 'false_negative':
            insights = self.analyze_false_negative(case)
            case.missing_patterns.extend(insights)

        elif case.case_type == 'false_positive':
            insights = self.analyze_false_positive(case)
            case.false_positive_patterns.extend(insights)

        # 保存学习数据
        self.save_learning_data()

    async def learn_from_batch(self, test_cases: List[Dict[str, Any]]) -> List[LearningCase]:
        """从批量案例中学习"""
        learning_cases = []

        print(f"🎓 开始从 {len(test_cases)} 个案例中学习...")

        for case_data in test_cases:
            try:
                # 运行检测
                result = await self.detector.detect_stripe_enhanced(
                    case_data['url'],
                    case_data.get('name', '')
                )

                # 分类案例
                case_type = self.classify_case(
                    case_data['expected'],
                    result.stripe_connect_detected,
                    result.overall_confidence
                )

                # 提取缺失模式
                missing_patterns = self.extract_missing_patterns(
                    case_data['url'],
                    case_type,
                    {
                        'js_indicators': result.stripe_js_indicators,
                        'connect_indicators': result.stripe_connect_indicators,
                        'config_indicators': result.script_sources,
                        'registration_indicators': result.registration_indicators,
                        'payment_indicators': result.payment_capability_indicators
                    }
                )

                # 创建学习案例
                learning_case = LearningCase(
                    url=case_data['url'],
                    expected_result=case_data['expected'],
                    actual_result=result.stripe_connect_detected,
                    confidence_score=result.overall_confidence,
                    connect_type=result.connect_type,
                    self_registration=result.self_registration_detected,
                    payment_capability=result.payment_capability_detected,
                    case_type=case_type,
                    js_indicators=result.stripe_js_indicators,
                    connect_indicators=result.stripe_connect_indicators,
                    config_indicators=result.script_sources,
                    registration_indicators=result.registration_indicators,
                    payment_capability_indicators=result.payment_capability_indicators,
                    missing_patterns=missing_patterns,
                    false_positive_patterns=[],
                    correct_patterns=result.stripe_js_indicators + result.stripe_connect_indicators,
                    timestamp=datetime.now().isoformat(),
                    analysis_notes=""
                )

                # 学习
                self.learn_from_case(learning_case)
                learning_cases.append(learning_case)

                # 显示进度
                status_icon = "✅" if case_data['expected'] == result.stripe_connect_detected else "❌"
                print(f"{status_icon} {case_data.get('name', case_data['url'])}: "
                      f"{case_type} (置信度: {result.overall_confidence:.2f})")

            except Exception as e:
                self.logger.error(f"处理案例失败 {case_data['url']}: {str(e)}")

        # 调整阈值
        self.adjust_thresholds(learning_cases)

        # 更新性能指标
        self.update_performance_metrics()

        return learning_cases

    def update_performance_metrics(self):
        """更新性能指标"""
        cases = self.learning_data['cases']
        if not cases:
            return

        total = len(cases)
        correct = sum(1 for c in cases if c['expected_result'] == c['actual_result'])
        true_positives = sum(1 for c in cases if c['expected_result'] and c['actual_result'])
        false_positives = sum(1 for c in cases if not c['expected_result'] and c['actual_result'])

        self.learning_data['performance_metrics'] = {
            'total_cases': total,
            'accuracy': correct / total if total > 0 else 0,
            'recall': true_positives / sum(1 for c in cases if c['expected_result']) if any(c['expected_result'] for c in cases) else 0,
            'precision': true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
        }

    def generate_learning_report(self) -> Dict[str, Any]:
        """生成学习报告"""
        cases = self.learning_data['cases']

        if not cases:
            return {"error": "暂无学习案例"}

        # 案例统计
        case_types = {}
        for case in cases:
            case_type = case['case_type']
            case_types[case_type] = case_types.get(case_type, 0) + 1

        # 模式效果分析
        effective_patterns = {}
        for case in cases:
            if case['case_type'].startswith('true_positive'):
                for pattern in case['correct_patterns']:
                    effective_patterns[pattern] = effective_patterns.get(pattern, 0) + 1

        # 问题模式分析
        problematic_patterns = {}
        for case in cases:
            if case['case_type'] == 'false_positive':
                for pattern in case['false_positive_patterns']:
                    problematic_patterns[pattern] = problematic_patterns.get(pattern, 0) + 1

        # 学习建议
        recommendations = []

        false_negatives = case_types.get('false_negative', 0)
        false_positives = case_types.get('false_positive', 0)

        if false_negatives > false_positives:
            recommendations.append("建议降低检测阈值或增加更多检测模式")

        if false_positives > false_negatives:
            recommendations.append("建议提高检测阈值或优化现有模式")

        if not effective_patterns:
            recommendations.append("需要收集更多成功的检测案例")

        return {
            'summary': {
                'total_cases': len(cases),
                'case_distribution': case_types,
                'performance_metrics': self.learning_data['performance_metrics']
            },
            'pattern_analysis': {
                'most_effective_patterns': sorted(effective_patterns.items(), key=lambda x: x[1], reverse=True)[:10],
                'problematic_patterns': sorted(problematic_patterns.items(), key=lambda x: x[1], reverse=True)[:5]
            },
            'threshold_settings': self.threshold_settings,
            'pattern_weights': dict(sorted(self.pattern_weights.items(), key=lambda x: x[1], reverse=True)[:20]),
            'recommendations': recommendations,
            'last_updated': self.learning_data['last_updated']
        }

async def main():
    """主函数 - 演示持续学习"""
    logging.basicConfig(level=logging.INFO)

    # 创建学习系统
    learning_system = ContinuousLearningSystem()

    # 使用用户提供的6个已确认平台作为学习案例
    learning_cases = [
        {"url": "https://hype.co/", "name": "Hype", "expected": True},
        {"url": "https://winningbidder.com/", "name": "Winning Bidder", "expected": True},
        {"url": "https://www.trustap.com/", "name": "Trustap", "expected": True},
        {"url": "https://www.collctiv.com/", "name": "Collctiv", "expected": True},
        {"url": "https://rsvpify.com/", "name": "RSVPify", "expected": True},  # 用于学习漏检案例
        {"url": "https://gumroad.com/", "name": "Gumroad", "expected": True},
    ]

    # 添加一些已知的非Stripe平台用于对比学习
    negative_cases = [
        {"url": "https://github.com", "name": "GitHub", "expected": False},
        {"url": "https://stackoverflow.com", "name": "Stack Overflow", "expected": False},
        {"url": "https://wikipedia.org", "name": "Wikipedia", "expected": False},
    ]

    all_cases = learning_cases + negative_cases

    # 批量学习
    learning_results = await learning_system.learn_from_batch(all_cases)

    # 生成学习报告
    report = learning_system.generate_learning_report()

    # 显示报告
    print("\n" + "="*80)
    print("🎓 持续学习系统报告")
    print("="*80)

    print(f"\n📊 学习概况:")
    print(f"   总案例数: {report['summary']['total_cases']}")
    print(f"   案例分布: {report['summary']['case_distribution']}")

    metrics = report['summary']['performance_metrics']
    print(f"   当前准确率: {metrics['accuracy']:.1%}")
    print(f"   当前召回率: {metrics['recall']:.1%}")
    print(f"   当前精确率: {metrics['precision']:.1%}")

    if report['pattern_analysis']['most_effective_patterns']:
        print(f"\n🎯 最有效检测模式 (前5):")
        for pattern, count in report['pattern_analysis']['most_effective_patterns'][:5]:
            print(f"   {pattern}: {count}次成功检测")

    if report['pattern_analysis']['problematic_patterns']:
        print(f"\n⚠️  问题模式 (前3):")
        for pattern, count in report['pattern_analysis']['problematic_patterns'][:3]:
            print(f"   {pattern}: {count}次误判")

    print(f"\n💡 学习建议:")
    for rec in report['recommendations']:
        print(f"   {rec}")

    # 保存学习报告
    with open("continuous_learning_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n📄 学习报告已保存到: continuous_learning_report.json")
    print(f"📄 学习数据已保存到: {learning_system.learning_data_path}")

if __name__ == "__main__":
    asyncio.run(main())