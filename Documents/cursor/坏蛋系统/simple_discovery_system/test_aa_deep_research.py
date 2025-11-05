#!/usr/bin/env python3
"""
🔍 AA深度调研测试 - payfast.io专项分析
让AA深入研究平台的实际业务，而不仅仅是模式匹配
"""

import sys
import json
from datetime import datetime
from pathlib import Path

# 添加当前目录到路径
sys.path.append(str(Path(__file__).parent))

from dialog_5agent_system import DialogAAAuditAllocator, DialogVAVerificationExpert

def test_aa_deep_research():
    """测试AA对payfast.io的深度调研"""
    print("🚀 启动AA深度调研测试 - payfast.io专项分析")
    print("=" * 80)

    # 初始化AA和VA
    aa = DialogAAAuditAllocator()
    va = DialogVAVerificationExpert()

    # 测试平台
    test_platform = "payfast.io"

    print(f"🎯 测试目标: {test_platform}")
    print(f"📅 测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

    # Step 1: VA先验证payfast.io
    print(f"\n🟡 Step 1: VA验证分析")
    print(f"🔬 VA开始验证 {test_platform}...")

    try:
        va_results = va.verify_platforms_real([test_platform], lambda c, t, d: print(f"   {d}"))

        if va_results:
            va_result = va_results[0]
            print(f"✅ VA验证完成:")
            print(f"   VA分数: {va_result['final_score']}/100")
            print(f"   验证方法: {va_result.get('verification_method', 'N/A')}")
            if va_result['final_score'] == 100:
                print("   ✅ VA认为这是支付平台")
            else:
                print(f"   ❌ VA认为这不是支付平台 - 失败项: {va_result.get('failed_criteria', [])}")
        else:
            print("❌ VA无法验证该平台")
            return

    except Exception as e:
        print(f"❌ VA验证失败: {e}")
        return

    # Step 2: AA深度调研
    print(f"\n🔴 Step 2: AA深度调研分析")
    print(f"🔍 AA开始深入调研 {test_platform} 的实际业务...")

    try:
        # 执行AA深度分析
        aa_analysis = aa._deep_aa_analysis(test_platform, va_result)

        print(f"\n📊 AA调研结果:")
        print(f"   是否误报: {'是' if aa_analysis['is_false_positive'] else '否'}")
        print(f"   置信度: {aa_analysis['confidence']:.1%}")
        print(f"   分析原因: {aa_analysis['reason']}")

        # 显示详细调研结果
        if 'research_details' in aa_analysis:
            details = aa_analysis['research_details']
            print(f"\n🔬 详细调研结果:")
            print(f"   主营业务: {details.get('main_business', 'unknown')}")
            print(f"   确认为支付平台: {'是' if details.get('is_verified_payment_platform') else '否'}")
            print(f"   调研置信度: {details.get('research_confidence', 0):.1%}")
            print(f"   业务描述: {details.get('business_description', 'N/A')}")

            # 显示各模块调研结果
            if details.get('qa_documentation'):
                qa = details['qa_documentation']
                print(f"\n   📚 QA文档调研:")
                print(f"      支付相关问题: {qa.get('payment_related_questions', 0)} 个")
                print(f"      调研页面: {qa.get('evidence_found', [])}")

            if details.get('help_documentation'):
                help_doc = details['help_documentation']
                print(f"\n   📖 帮助文档调研:")
                print(f"      支付主题: {help_doc.get('payment_topics_found', [])}")
                print(f"      集成指南: {help_doc.get('integration_guides', 0)} 个")
                print(f"      调研页面: {help_doc.get('evidence_found', [])}")

            if details.get('about_us_info'):
                about = details['about_us_info']
                print(f"\n   🏢 关于我们调研:")
                print(f"      公司类型: {about.get('company_type', 'N/A')}")
                print(f"      成立年份: {about.get('founded_year', 'N/A')}")
                print(f"      业务重点: {about.get('business_focus', [])}")
                print(f"      调研页面: {about.get('evidence_found', [])}")

            if details.get('pricing_info'):
                pricing = details['pricing_info']
                print(f"\n   💰 定价页面调研:")
                print(f"      费用结构: {pricing.get('payment_fees_structure', 'N/A')}")
                print(f"      交易费用: {pricing.get('transaction_fees', [])}")
                print(f"      调研页面: {pricing.get('evidence_found', [])}")

            if details.get('api_documentation'):
                api_doc = details['api_documentation']
                print(f"\n   🔌 API文档调研:")
                print(f"      支付端点: {api_doc.get('payment_endpoints', [])}")
                print(f"      Webhook支持: {'是' if api_doc.get('webhook_support') else '否'}")
                print(f"      调研页面: {api_doc.get('evidence_found', [])}")

        # Step 3: 最终判断
        print(f"\n🎯 Step 3: 最终判断")
        print("=" * 60)

        # 显示AA的详细分析结果
        if 'aa_recommendation' in aa_analysis:
            recommendation = aa_analysis['aa_recommendation']
            if recommendation == 'RECOMMENDED':
                print("✅ AA最终判断: 强烈推荐的支付平台")
                print("💡 建议: 可以优先考虑该平台")
            elif recommendation == 'CONSIDER':
                print("⚠️ AA最终判断: 建议考虑的候选平台")
                print("💡 建议: 可以纳入考虑范围，需要进一步验证")
            elif recommendation == 'NOT_RECOMMENDED':
                print("❌ AA最终判断: 不推荐的平台")
                print("💡 建议: 暂不推荐该平台")
        else:
            if aa_analysis['is_false_positive']:
                print("❌ AA最终判断: 误报平台")
                print("💡 建议: 不推荐该平台")
            else:
                print("✅ AA最终判断: 真实支付平台")
                print("💡 建议: 可以考虑该平台")

        # 显示AA的详细理由
        print(f"\n📝 AA判断理由:")
        print(f"   {aa_analysis['reason']}")

        # 显示证据摘要
        if 'evidence_summary' in aa_analysis:
            summary = aa_analysis['evidence_summary']
            print(f"\n📊 证据分析:")
            print(f"   证据评分: {summary['evidence_score']}/10")
            print(f"   强证据数量: {summary['strong_evidence_count']}个")
            print(f"   研究置信度: {summary['research_confidence']}")
            if 'risk_indicators' in summary:
                print(f"   风险指示词: {summary['risk_indicators']}个")

        # Step 4: 保存调研结果
        research_report = {
            'test_platform': test_platform,
            'test_timestamp': datetime.now().isoformat(),
            'va_result': va_result,
            'aa_analysis': aa_analysis,
            'final_decision': 'REJECTED' if aa_analysis['is_false_positive'] else 'APPROVED',
            'test_version': 'AA-Deep-Research-v1.0'
        }

        # 保存到文件
        output_dir = Path(__file__).parent / "data" / "deep_research_results"
        output_dir.mkdir(exist_ok=True)

        filename = f"aa_deep_research_{test_platform}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_dir / filename, 'w', encoding='utf-8') as f:
            json.dump(research_report, f, ensure_ascii=False, indent=2)

        print(f"\n💾 调研报告已保存: data/deep_research_results/{filename}")

    except Exception as e:
        print(f"❌ AA深度调研失败: {e}")
        import traceback
        traceback.print_exc()

def main():
    """主函数"""
    print("🔍 AA深度调研测试系统")
    print("📝 专门测试AA对payfast.io的深入业务调研能力")
    print("=" * 80)

    try:
        test_aa_deep_research()
    except KeyboardInterrupt:
        print("\n🛑 测试被用户中断")
    except Exception as e:
        print(f"❌ 测试系统错误: {e}")
        import traceback
        traceback.print_exc()

    print("\n🎉 AA深度调研测试完成！")

if __name__ == "__main__":
    main()