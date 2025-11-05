#!/usr/bin/env python3
"""
测试8平台失败解决方案
"""

import sys
from pathlib import Path

# 添加当前目录到路径
sys.path.append(str(Path(__file__).parent))

from dialog_5agent_system import DialogDADataDiscoveryExpert

def test_solution():
    """测试解决方案效果"""
    print("🧪 测试8平台失败解决方案")
    print("=" * 60)

    # 初始化DA
    da = DialogDADataDiscoveryExpert()

    print(f"\n📊 当前候选平台数量: {len(da.new_payment_platform_candidates)}")

    # 检查是否还包含问题平台
    problem_platforms = [
        "payfast.co", "quickpay.io", "easypay.com", "paypro.io", "fast.com"
    ]

    print(f"\n🔍 检查问题平台是否已移除:")
    still_problematic = []
    for platform in problem_platforms:
        if platform in da.new_payment_platform_candidates:
            still_problematic.append(platform)
            print(f"   ❌ 仍存在: {platform}")
        else:
            print(f"   ✅ 已移除: {platform}")

    if still_problematic:
        print(f"\n⚠️ 仍有 {len(still_problematic)} 个问题平台需要手动处理")
    else:
        print(f"\n✅ 所有问题平台已成功移除！")

    # 测试搜索新平台
    print(f"\n🔍 测试DA搜索新平台功能:")
    new_platforms = da.search_new_payment_platforms()

    print(f"\n📊 测试结果:")
    print(f"   发现新平台数: {len(new_platforms)}")
    print(f"   去重数据库大小: {len(da.verified_platforms_database)}")

    if new_platforms:
        print(f"\n🆕 新平台列表 (前5个):")
        for i, platform in enumerate(new_platforms[:5], 1):
            print(f"   {i}. {platform}")

    # 检查是否包含优质平台
    quality_platforms = [
        "paddle.com", "lemonsqueezy.com", "gumroad.com", "kajabi.com",
        "patreon.com", "memberful.com", "stripe.com", "paypal.com"
    ]

    print(f"\n🎯 检查优质平台候选:")
    found_quality = []
    for platform in quality_platforms:
        if platform in da.new_payment_platform_candidates:
            found_quality.append(platform)
            print(f"   ✅ 包含: {platform}")

    print(f"\n📈 优质平台覆盖率: {len(found_quality)}/{len(quality_platforms)} ({len(found_quality)/len(quality_platforms)*100:.1f}%)")

    # 测试去重功能
    print(f"\n🔄 测试去重功能:")
    if "fastspring.com" in da.verified_platforms_database:
        print(f"   ✅ fastspring.com 已在去重数据库中")
    else:
        print(f"   ⚠️ fastspring.com 不在去重数据库中")

    # 总结
    print(f"\n🎉 解决方案测试总结:")
    print("=" * 60)

    improvements = []
    if not still_problematic:
        improvements.append("✅ 问题平台清理完成")
    if len(new_platforms) > 0:
        improvements.append("✅ 新平台发现功能正常")
    if len(found_quality) >= 6:
        improvements.append("✅ 优质平台候选充足")
    if len(da.verified_platforms_database) > 0:
        improvements.append("✅ 去重机制正常工作")

    for improvement in improvements:
        print(improvement)

    success_rate = len(improvements) / 4 * 100
    print(f"\n📊 解决方案成功率: {success_rate:.0f}%")

    if success_rate >= 75:
        print("🎯 解决方案实施成功！")
    elif success_rate >= 50:
        print("⚠️ 解决方案部分成功，需要进一步优化")
    else:
        print("❌ 解决方案需要重新检查")

    return {
        'problem_platforms_removed': len(problem_platforms) - len(still_problematic),
        'new_platforms_found': len(new_platforms),
        'quality_platforms_found': len(found_quality),
        'deduplication_working': len(da.verified_platforms_database) > 0,
        'success_rate': success_rate
    }

if __name__ == "__main__":
    result = test_solution()

    print(f"\n💾 测试结果已保存到内存")
    print(f"   问题平台移除: {result['problem_platforms_removed']} 个")
    print(f"   新平台发现: {result['new_platforms_found']} 个")
    print(f"   优质平台候选: {result['quality_platforms_found']} 个")
    print(f"   去重功能: {'正常' if result['deduplication_working'] else '异常'}")
    print(f"   总体成功率: {result['success_rate']:.0f}%")