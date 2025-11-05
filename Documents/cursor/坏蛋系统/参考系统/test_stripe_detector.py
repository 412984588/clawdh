#!/usr/bin/env python3
"""
条纹检测器功能测试
"""

import asyncio
import sys
sys.path.append('src')

from ssl_enhanced_stripe_detector import SSLEnhancedStripeDetector

async def test_stripe_detector():
    """测试条纹检测器功能"""
    print("🧪 开始测试SSL修复版条纹检测器...")

    # 创建SSL修复版检测器
    detector = SSLEnhancedStripeDetector(ssl_mode='certifi')
    print("✅ 检测器创建成功")
    
    # 测试域名列表
    test_domains = [
        "stripe.com",
        "example.com", 
        "github.com"
    ]
    
    print(f"\n🎯 测试域名: {test_domains}")
    
    # 测试单个域名分析
    print("\n📋 测试单个域名分析...")
    try:
        for domain in test_domains[:2]:  # 测试前两个
            print(f"   检测: {domain}")
            result = await detector.analyze_domain(domain)
            
            if result:
                print(f"   ✅ 检测成功")
                print(f"      Stripe检测: {result.stripe_connect_detected}")
                print(f"      置信度: {result.confidence_score:.2f}")
                print(f"      业务评分: {result.business_score:.2f}")
            else:
                print(f"   ⚠️  未检测到结果")
                
    except Exception as e:
        print(f"   ❌ 单个域名分析失败: {e}")
    
    # 测试批量分析
    print("\n📋 测试批量分析...")
    try:
        results = await detector.batch_analyze(test_domains[:2])
        print(f"   ✅ 批量分析完成，处理了 {len(results)} 个域名")
        
        for i, result in enumerate(results):
            if result and not result.errors:
                print(f"   {test_domains[i]}: Stripe={result.stripe_connect_detected}, 评分={result.overall_score:.2f}")
            else:
                print(f"   {test_domains[i]}: 有错误或无结果")
                
    except Exception as e:
        print(f"   ❌ 批量分析失败: {e}")
    
    # 测试SSL配置
    print("\n📋 测试SSL配置...")
    try:
        ssl_info = detector.get_ssl_info()
        print("   ✅ SSL配置访问成功")
        print(f"   SSL模式: {ssl_info['ssl_mode']}")
        if ssl_info['certifi_path']:
            print(f"   证书路径: {ssl_info['certifi_path']}")

    except Exception as e:
        print(f"   ❌ SSL配置测试失败: {e}")
    
    print("\n🎉 条纹检测器测试完成！")

async def main():
    """主测试函数"""
    print("🚀 女王条纹检测系统 - 核心功能测试")
    print("=" * 60)
    
    try:
        await test_stripe_detector()
        print("\n✅ 所有测试完成")
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
