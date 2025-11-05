#!/usr/bin/env python3
"""
🔧 测试去重修复是否有效
"""

import sys
from pathlib import Path

# 添加当前目录到路径
sys.path.append(str(Path(__file__).parent))

from dialog_5agent_system import DialogDADataDiscoveryExpert, DialogVAVerificationExpert, DialogAAAuditAllocator

def test_deduplication_fix():
    """测试去重修复是否有效"""
    print("🔧 测试去重修复功能")
    print("=" * 60)

    # 初始化 agents
    da = DialogDADataDiscoveryExpert()
    va = DialogVAVerificationExpert()
    aa = DialogAAAuditAllocator()

    print(f"📚 当前去重数据库包含 {len(da.verified_platforms_database)} 个已知平台")

    # 测试搜索新平台
    print("\n🔍 测试 DA 搜索新平台...")
    new_platforms = da.search_new_payment_platforms()

    print(f"📊 DA 发现 {len(new_platforms)} 个新平台:")
    for i, platform in enumerate(new_platforms, 1):
        print(f"   {i}. {platform}")

    # 模拟 fastspring.com 被批准后标记为已验证
    print(f"\n✅ 模拟 fastspring.com 被 AA 批准...")
    da._mark_platform_as_verified("fastspring.com")

    # 再次测试搜索新平台
    print(f"\n🔍 测试 fastspring.com 被标记后再次搜索...")
    new_platforms_after = da.search_new_payment_platforms()

    print(f"📊 标记后 DA 发现 {len(new_platforms_after)} 个新平台:")
    for i, platform in enumerate(new_platforms_after, 1):
        print(f"   {i}. {platform}")

    # 检查 fastspring.com 是否还在新平台列表中
    if "fastspring.com" in new_platforms_after:
        print("❌ 去重修复失败：fastspring.com 仍然出现在新平台列表中")
        return False
    else:
        print("✅ 去重修复成功：fastspring.com 已被正确排除")

        # 检查是否有新平台被发现
        if new_platforms_after != new_platforms:
            print("✅ 新平台发现机制工作正常：发现了不同的平台列表")
        else:
            print("⚠️ 候选平台池可能有限，建议扩展候选平台列表")

        return True

if __name__ == "__main__":
    success = test_deduplication_fix()
    if success:
        print("\n🎉 去重修复测试通过！")
    else:
        print("\n❌ 去重修复测试失败！")