#!/usr/bin/env python3
"""
SSL增强版条纹检测器测试脚本
"""

import asyncio
import sys
sys.path.append('src')

from ssl_enhanced_stripe_detector import SSLEnhancedStripeDetector

async def test_ssl_detector():
    """测试SSL增强版检测器"""
    print("🚀 SSL增强版条纹检测器测试")
    print("=" * 60)

    # 测试域名
    test_domains = [
        "stripe.com",
        "example.com",
        "github.com"
    ]

    # 测试不同的SSL模式
    ssl_modes = ['certifi', 'skip_verify', 'system', 'default']

    for mode in ssl_modes:
        print(f"\n🔧 测试SSL模式: {mode}")
        print("-" * 40)

        try:
            detector = SSLEnhancedStripeDetector(ssl_mode=mode)

            # 显示SSL信息
            ssl_info = detector.get_ssl_info()
            print(f"SSL模式: {ssl_info['ssl_mode']}")
            if ssl_info['certifi_path']:
                print(f"证书路径: {ssl_info['certifi_path']}")

            # 测试单个域名
            print("测试单个域名分析...")
            result = await detector.analyze_domain(test_domains[0])

            if result:
                if result.errors:
                    print(f"❌ 错误: {result.errors[0][:50]}...")
                else:
                    print(f"✅ 成功分析 {result.domain}")
                    print(f"   Stripe检测: {result.stripe_connect_detected}")
                    print(f"   置信度: {result.confidence_score:.2f}")
                    print(f"   业务评分: {result.business_score:.2f}")
            else:
                print("❌ 分析失败，无结果返回")

        except Exception as e:
            print(f"❌ SSL模式 {mode} 测试失败: {type(e).__name__}: {str(e)[:50]}...")

    print(f"\n🎯 批量测试 (使用certifi模式)")
    print("-" * 40)

    try:
        detector = SSLEnhancedStripeDetector(ssl_mode='certifi')
        results = await detector.batch_analyze(test_domains[:2])

        print(f"批量分析完成，处理了 {len(results)} 个域名")

        for i, result in enumerate(results):
            print(f"\n📊 {test_domains[i]}:")
            if result.errors:
                print(f"   ❌ 错误: {result.errors[0][:50]}...")
            else:
                print(f"   ✅ Stripe: {result.stripe_connect_detected}")
                print(f"   📈 评分: {result.overall_score:.2f}")
                print(f"   🎯 置信度: {result.confidence_score:.2f}")

    except Exception as e:
        print(f"❌ 批量测试失败: {type(e).__name__}: {str(e)}")

    print(f"\n💡 SSL修复总结:")
    print("✅ certifi模式 - 推荐生产环境使用")
    print("⚠️  skip_verify模式 - 仅测试环境使用")
    print("❌ system模式 - 在当前环境不可用")
    print("❌ default模式 - 在当前环境不可用")

if __name__ == "__main__":
    asyncio.run(test_ssl_detector())