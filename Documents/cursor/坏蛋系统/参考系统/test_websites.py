#!/usr/bin/env python3
"""
知名网站测试 - 验证Stripe Connect检测准确性
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from src.enhanced_stripe_detector import EnhancedStripeDetector

def get_test_websites():
    """获取测试网站列表"""
    return [
        # 🎯 肯定使用Stripe的网站
        {
            "url": "https://stripe.com",
            "name": "Stripe官方",
            "expected": True,
            "expected_type": "Express",
            "category": "支付平台"
        },
        {
            "url": "https://shopify.com",
            "name": "Shopify",
            "expected": True,
            "expected_type": "Custom",
            "category": "电商平台"
        },
        {
            "url": "https://substack.com",
            "name": "Substack",
            "expected": True,
            "expected_type": "Express",
            "category": "内容平台"
        },
        {
            "url": "https://slack.com",
            "name": "Slack",
            "expected": True,
            "expected_type": "Custom",
            "category": "SaaS平台"
        },

        # 🎯 可能使用Stripe的网站
        {
            "url": "https://github.com",
            "name": "GitHub",
            "expected": False,
            "expected_type": "Unknown",
            "category": "开发平台"
        },
        {
            "url": "https://medium.com",
            "name": "Medium",
            "expected": True,
            "expected_type": "Express",
            "category": "内容平台"
        },
        {
            "url": "https://wordpress.com",
            "name": "WordPress",
            "expected": True,
            "expected_type": "Custom",
            "category": "CMS平台"
        },
        {
            "url": "https://patreon.com",
            "name": "Patreon",
            "expected": True,
            "expected_type": "Custom",
            "category": "创作者平台"
        },

        # 🎯 可能不使用Stripe的网站
        {
            "url": "https://example.com",
            "name": "Example.com",
            "expected": False,
            "expected_type": "Unknown",
            "category": "测试网站"
        },
        {
            "url": "https://apache.org",
            "name": "Apache",
            "expected": False,
            "expected_type": "Unknown",
            "category": "开源组织"
        },
        {
            "url": "https://python.org",
            "name": "Python",
            "expected": False,
            "expected_type": "Unknown",
            "category": "编程语言"
        },
        {
            "url": "https://wikipedia.org",
            "name": "Wikipedia",
            "expected": False,
            "expected_type": "Unknown",
            "category": "知识平台"
        },

        # 🎯 电商平台
        {
            "url": "https://amazon.com",
            "name": "Amazon",
            "expected": False,
            "expected_type": "Unknown",
            "category": "电商平台"
        },
        {
            "url": "https://ebay.com",
            "name": "eBay",
            "expected": False,
            "expected_type": "Unknown",
            "category": "电商平台"
        },
        {
            "url": "https://etsy.com",
            "name": "Etsy",
            "expected": True,
            "expected_type": "Custom",
            "category": "电商平台"
        },

        # 🎯 SaaS平台
        {
            "url": "https://notion.so",
            "name": "Notion",
            "expected": True,
            "expected_type": "Express",
            "category": "SaaS平台"
        },
        {
            "url": "https://figma.com",
            "name": "Figma",
            "expected": True,
            "expected_type": "Express",
            "category": "设计工具"
        }
    ]

def calculate_metrics(results):
    """计算检测指标"""
    total_tests = len(results)
    correct_detections = 0
    true_positives = 0
    true_negatives = 0
    false_positives = 0
    false_negatives = 0

    for website, result in results:
        expected = website["expected"]
        detected = result.stripe_connect_detected

        if detected == expected:
            correct_detections += 1
            if expected:
                true_positives += 1
            else:
                true_negatives += 1
        else:
            if detected and not expected:
                false_positives += 1
            else:
                false_negatives += 1

    # 计算指标
    accuracy = correct_detections / total_tests if total_tests > 0 else 0
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    return {
        "total_tests": total_tests,
        "correct_detections": correct_detections,
        "true_positives": true_positives,
        "true_negatives": true_negatives,
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score
    }

def generate_detailed_report(websites, results, metrics):
    """生成详细测试报告"""
    report = f"""
# 🎯 Stripe Connect 检测准确性验证报告

**测试时间**: {websites[0].get('test_time', 'Unknown')}
**测试网站数**: {len(websites)}
**检测成功率**: {((len([r for r in results if not r.errors])) / len(results) * 100):.1f}%

## 📊 整体性能指标

| 指标 | 数值 | 说明 |
|------|------|------|
| **准确率 (Accuracy)** | {metrics['accuracy']:.2%} | 正确预测的比例 |
| **精确率 (Precision)** | {metrics['precision']:.2%} | 预测为阳性中实际为阳性的比例 |
| **召回率 (Recall)** | {metrics['recall']:.2%} | 实际阳性中被正确预测的比例 |
| **F1分数** | {metrics['f1_score']:.2%} | 精确率和召回率的调和平均数 |

## 📈 详细指标统计

- **总测试数**: {metrics['total_tests']}
- **正确检测数**: {metrics['correct_detections']}
- **真阳性 (TP)**: {metrics['true_positives']} - 正确检测到Stripe
- **真阴性 (TN)**: {metrics['true_negatives']} - 正确检测到非Stripe
- **假阳性 (FP)**: {metrics['false_positives']} - 错误检测到Stripe
- **假阴性 (FN)**: {metrics['false_negatives']} - 漏检Stripe

## 🔍 逐个网站检测结果

"""

    # 按类别分组
    categories = {}
    for i, website in enumerate(websites):
        category = website["category"]
        if category not in categories:
            categories[category] = []
        categories[category].append((website, results[i]))

    for category, items in categories.items():
        report += f"\n### 🏷️ {category}\n\n"

        for website, result in items:
            expected = "✅ 是" if website["expected"] else "❌ 否"
            detected = "✅ 是" if result.stripe_connect_detected else "❌ 否"
            status = "✅ 正确" if result.stripe_connect_detected == website["expected"] else "❌ 错误"

            report += f"""
**{website['name']}** {status}

- **URL**: {website['url']}
- **预期结果**: {expected} ({website['expected_type']})
- **检测结果**: {detected} ({result.connect_type})
- **置信度**: {result.confidence_score:.2f}
- **综合评分**: {result.overall_confidence:.2f}

**检测到的指标**:
- JS指示器: {len(result.stripe_js_indicators)} 个
- API指示器: {len(result.stripe_api_indicators)} 个
- Connect指示器: {len(result.stripe_connect_indicators)} 个
- 结账指示器: {len(result.stripe_checkout_indicators)} 个
- 业务指示器: {len(result.business_indicators)} 个

"""

            # 显示关键指标
            if result.stripe_connect_indicators:
                report += f"**Connect指标**: {', '.join(result.stripe_connect_indicators[:3])}\n"

            if result.stripe_js_indicators:
                report += f"**JS指标**: {', '.join(result.stripe_js_indicators[:3])}\n"

            if result.errors:
                report += f"**错误**: {', '.join(result.errors)}\n"

            if result.warnings:
                report += f"**警告**: {', '.join(result.warnings)}\n"

            report += "---\n"

    # 结论和建议
    report += """
## 🎯 结论和建议

### 检测性能分析
"""

    if metrics['accuracy'] >= 0.9:
        report += "✅ **检测准确性优秀** (>90%)\n"
    elif metrics['accuracy'] >= 0.8:
        report += "⚠️ **检测准确性良好** (80-90%)\n"
    else:
        report += "❌ **检测准确性需要改进** (<80%)\n"

    if metrics['precision'] >= 0.85:
        report += "✅ **误报率低** (>85%精确率)\n"
    else:
        report += "⚠️ **误报率较高** (<85%精确率)\n"

    if metrics['recall'] >= 0.85:
        report += "✅ **漏报率低** (>85%召回率)\n"
    else:
        report += "⚠️ **漏报率较高** (<85%召回率)\n"

    report += """
### 优化建议

1. **提升召回率**: 增加更多检测模式,特别是针对Connect的深度识别
2. **降低误报率**: 优化置信度阈值,增加验证机制
3. **改进类型识别**: 提升Express/Custom/Standard的区分精度
4. **增强错误处理**: 改进网络连接和内容解析的稳定性

### 下一步行动

1. 扩大测试样本,覆盖更多行业和网站类型
2. 针对错误案例进行专门优化
3. 实现机器学习模型提升检测精度
4. 建立持续监控和反馈机制

---

*报告生成时间: {datetime.now().isoformat()}*
*执行团队: Jenny团队*
"""

    return report

async def run_accuracy_test():
    """运行准确性测试"""
    print("🚀 开始Stripe Connect检测准确性验证...")
    print(f"📋 准备测试 {len(get_test_websites())} 个知名网站")

    # 初始化检测器
    detector = EnhancedStripeDetector(verify_ssl=False, timeout=30)

    # 获取测试网站
    websites = get_test_websites()
    urls = [w["url"] for w in websites]
    names = [w["name"] for w in websites]

    print("🔍 开始检测...")
    results = await detector.batch_detect(urls, names)

    # 计算指标
    metrics = calculate_metrics(list(zip(websites, results)))

    # 生成报告
    report = generate_detailed_report(websites, results, metrics)

    # 保存报告
    report_file = "stripe_detection_accuracy_report.md"
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\n📊 检测完成!")
    print(f"✅ 准确率: {metrics['accuracy']:.1%}")
    print(f"✅ 精确率: {metrics['precision']:.1%}")
    print(f"✅ 召回率: {metrics['recall']:.1%}")
    print(f"✅ F1分数: {metrics['f1_score']:.1%}")
    print(f"\n📄 详细报告已保存到: {report_file}")

    return results, metrics

async def main():
    """主函数"""
    print("=" * 80)
    print("🎯 女王条纹测试2 - Stripe Connect检测准确性验证")
    print("=" * 80)

    try:
        results, metrics = await run_accuracy_test()

        print("\n🎊 测试完成!")
        print("=" * 80)

        # 如果准确率较低,给出建议
        if metrics['accuracy'] < 0.8:
            print("⚠️ 检测准确率低于80%,建议:")
            print("   1. 优化检测算法")
            print("   2. 增加更多测试样本")
            print("   3. 调整置信度阈值")
        else:
            print("✅ 检测准确率达到预期标准!")

    except Exception as e:
        print(f"❌ 测试过程中发生错误: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())