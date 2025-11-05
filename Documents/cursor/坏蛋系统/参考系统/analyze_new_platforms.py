#!/usr/bin/env python3
"""
分析用户提供的6个新平台
使用持续学习系统处理新案例
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import json
import logging
from datetime import datetime
from continuous_learning_system import ContinuousLearningSystem
from enhanced_detector_v4 import EnhancedStripeDetectorV4

async def analyze_new_platforms():
    """分析新平台"""
    logging.basicConfig(level=logging.INFO)

    print("🎯 开始分析用户提供的6个新平台...")
    print("="*80)

    # 新平台案例
    new_platforms = [
        {"url": "https://www.thinkific.com/", "name": "Thinkific", "expected": True, "category": "教育平台"},
        {"url": "https://kajabi.com/", "name": "Kajabi", "expected": True, "category": "知识付费"},
        {"url": "https://www.podia.com/", "name": "Podia", "expected": True, "category": "数字产品"},
        {"url": "https://www.lemonsqueezy.com/", "name": "Lemon Squeezy", "expected": True, "category": "数字产品销售"},
        {"url": "https://givebutter.com/", "name": "Givebutter", "expected": True, "category": "捐款平台"},
        {"url": "https://www.whatnot.com/", "name": "Whatnot", "expected": True, "category": "直播拍卖"},
    ]

    # 创建持续学习系统
    learning_system = ContinuousLearningSystem()

    # 加载现有学习数据
    print("📚 加载现有学习数据...")
    existing_cases = learning_system.learning_data.get('cases', [])
    print(f"   现有案例数: {len(existing_cases)}")

    # 分析新平台
    print(f"\n🔍 开始分析 {len(new_platforms)} 个新平台...")

    detector = EnhancedStripeDetectorV4()

    results = []
    for platform in new_platforms:
        try:
            print(f"\n🎯 检测: {platform['name']} ({platform['category']})")

            # 运行检测
            result = await detector.detect_stripe_enhanced(
                platform['url'],
                platform['name']
            )

            # 保存结果
            results.append({
                'platform': platform,
                'result': result
            })

            # 显示初步结果
            status = "✅ 检测到" if result.stripe_connect_detected else "❌ 未检测到"
            print(f"   {status} Stripe Connect")
            print(f"   类型: {result.connect_type}")
            print(f"   置信度: {result.overall_confidence:.2f}")
            print(f"   自注册: {'✅' if result.self_registration_detected else '❌'}")
            print(f"   收款能力: {'✅' if result.payment_capability_detected else '❌'}")

            # 显示关键指标
            if result.stripe_js_indicators:
                print(f"   JS指标: {len(result.stripe_js_indicators)}个")
            if result.stripe_connect_indicators:
                print(f"   Connect指标: {len(result.stripe_connect_indicators)}个")
            if result.registration_indicators:
                print(f"   注册指标: {len(result.registration_indicators)}个")
            if result.payment_capability_indicators:
                print(f"   收款指标: {len(result.payment_capability_indicators)}个")

            # 显示错误
            if result.errors:
                print(f"   ⚠️ 错误: {result.errors}")

        except Exception as e:
            print(f"   ❌ 检测失败: {str(e)}")
            results.append({
                'platform': platform,
                'result': None,
                'error': str(e)
            })

    # 统计结果
    successful_results = [r for r in results if r.get('result') and not r.get('error')]
    detected_count = sum(1 for r in successful_results if r['result'].stripe_connect_detected)
    self_reg_count = sum(1 for r in successful_results if r['result'].self_registration_detected)
    payment_count = sum(1 for r in successful_results if r['result'].payment_capability_detected)

    print(f"\n📊 新平台检测统计:")
    print(f"   总平台数: {len(new_platforms)}")
    print(f"   成功检测: {len(successful_results)}")
    print(f"   Stripe检测: {detected_count}/{len(successful_results)} ({detected_count/len(successful_results)*100:.1f}%)")
    print(f"   自注册能力: {self_reg_count}/{len(successful_results)} ({self_reg_count/len(successful_results)*100:.1f}%)")
    print(f"   收款能力: {payment_count}/{len(successful_results)} ({payment_count/len(successful_results)*100:.1f}%)")

    # 使用持续学习系统学习新案例
    print(f"\n🎓 使用持续学习系统处理新案例...")

    # 转换为学习格式
    learning_cases = [
        {
            "url": p['url'],
            "name": p['name'],
            "expected": p['expected']
        }
        for p in new_platforms
    ]

    # 批量学习
    learning_results = await learning_system.learn_from_batch(learning_cases)

    # 生成详细报告
    detailed_report = {
        'timestamp': datetime.now().isoformat(),
        'new_platforms_analysis': {
            'total_platforms': len(new_platforms),
            'successful_detections': len(successful_results),
            'stripe_detection_rate': detected_count/len(successful_results)*100 if successful_results else 0,
            'self_registration_rate': self_reg_count/len(successful_results)*100 if successful_results else 0,
            'payment_capability_rate': payment_count/len(successful_results)*100 if successful_results else 0,
            'platform_categories': list(set(p['category'] for p in new_platforms))
        },
        'detailed_results': [],
        'learning_outcome': learning_system.generate_learning_report()
    }

    # 添加详细结果
    for item in results:
        if item.get('result') and not item.get('error'):
            platform = item['platform']
            result = item['result']

            detailed_report['detailed_results'].append({
                'platform': platform['name'],
                'url': platform['url'],
                'category': platform['category'],
                'expected': platform['expected'],
                'detected': result.stripe_connect_detected,
                'confidence': result.overall_confidence,
                'connect_type': result.connect_type,
                'self_registration': result.self_registration_detected,
                'payment_capability': result.payment_capability_detected,
                'js_indicators_count': len(result.stripe_js_indicators),
                'connect_indicators_count': len(result.stripe_connect_indicators),
                'registration_indicators_count': len(result.registration_indicators),
                'payment_indicators_count': len(result.payment_capability_indicators),
                'script_sources_count': len(result.script_sources),
                'errors': result.errors,
                'warnings': result.warnings,
                'key_features': {
                    'has_js_indicators': bool(result.stripe_js_indicators),
                    'has_connect_indicators': bool(result.stripe_connect_indicators),
                    'has_config_indicators': bool(result.script_sources),
                    'has_form_elements': bool(result.form_elements),
                    'has_meta_tags': bool(result.meta_tags)
                }
            })

    # 保存详细报告
    with open("new_platforms_analysis_report.json", "w", encoding="utf-8") as f:
        json.dump(detailed_report, f, ensure_ascii=False, indent=2)

    print(f"\n📄 详细分析报告已保存到: new_platforms_analysis_report.json")

    # 显示关键发现
    print(f"\n🔍 关键发现:")

    # 按类型统计
    types = {}
    for item in successful_results:
        connect_type = item['result'].connect_type
        types[connect_type] = types.get(connect_type, 0) + 1

    print(f"   Connect类型分布: {dict(types)}")

    # 找出高置信度检测
    high_confidence = [r for r in successful_results if r['result'].overall_confidence > 0.7]
    print(f"   高置信度检测: {len(high_confidence)}个平台")

    # 找出需要改进的案例
    low_confidence = [r for r in successful_results if r['result'].overall_confidence < 0.3]
    print(f"   低置信度检测: {len(low_confidence)}个平台")

    # 更新的学习系统指标
    updated_metrics = learning_system.learning_data['performance_metrics']
    print(f"\n📈 学习系统更新后指标:")
    print(f"   总案例数: {updated_metrics['total_cases']}")
    print(f"   准确率: {updated_metrics['accuracy']:.1%}")
    print(f"   召回率: {updated_metrics['recall']:.1%}")
    print(f"   精确率: {updated_metrics['precision']:.1%}")

    return detailed_report

if __name__ == "__main__":
    asyncio.run(analyze_new_platforms())