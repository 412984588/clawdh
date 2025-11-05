#!/usr/bin/env python3
"""
测试VA和AA的突破能力
"""

import sys
from pathlib import Path

# 添加当前目录到路径
sys.path.append(str(Path(__file__).parent))

def test_va_and_aa_breakthrough():
    """测试VA和AA的突破能力"""
    print("🧪 测试VA和AA的突破能力")
    print("=" * 70)

    try:
        from dialog_5agent_system import DialogVAVerificationExpert, DialogAAAuditAllocator

        # 初始化VA和AA
        va = DialogVAVerificationExpert()
        aa = DialogAAAuditAllocator()

        # 测试之前403的平台
        test_platforms = ["paystack.com", "revolut.com"]

        print(f"\n🎯 测试VA突破能力:")
        va_success_count = 0

        for platform in test_platforms:
            print(f"\n🔍 VA测试: {platform}")
            result = va._real_verify_platform(platform)

            if result:
                print(f"   ✅ VA突破成功! 状态码: {result['status_code']}")
                print(f"   📝 VA访问方法: {result['access_method']}")
                print(f"   🏷️ 页面标题: {result['page_title'][:50]}...")
                va_success_count += 1
            else:
                print(f"   ❌ VA仍然无法访问")

        print(f"\n🎯 测试AA突破能力:")
        aa_success_count = 0

        for platform in test_platforms:
            print(f"\n🔍 AA测试: {platform}")

            # 测试AA的突破访问功能
            content, status_code, access_method, title = aa._aa_breakthrough_access(f"https://{platform}")

            if content:
                print(f"   ✅ AA突破成功! 状态码: {status_code}")
                print(f"   📝 AA访问方法: {access_method}")
                print(f"   🏷️ 页面标题: {title[:50] if title else '无标题'}...")
                aa_success_count += 1
            else:
                print(f"   ❌ AA仍然无法访问")

        print(f"\n📊 突破能力测试结果:")
        print(f"   VA突破成功: {va_success_count}/{len(test_platforms)} ({va_success_count/len(test_platforms)*100:.1f}%)")
        print(f"   AA突破成功: {aa_success_count}/{len(test_platforms)} ({aa_success_count/len(test_platforms)*100:.1f}%)")

        if va_success_count == len(test_platforms) and aa_success_count == len(test_platforms):
            print(f"\n🎉 VA和AA都具备完整的突破能力!")
            print(f"🛡️ 两者都能:")
            print(f"   - 使用13种真实浏览器User-Agent")
            print(f"   - 发送完整的HTTP头部")
            print(f"   - 智能等待安全检查完成")
            print(f"   - 处理403和Cloudflare保护")
            print(f"   - 尝试多种URL格式")
        elif va_success_count == len(test_platforms):
            print(f"\n✅ VA具备完整突破能力")
            print(f"⚠️ AA需要进一步增强")
        elif aa_success_count == len(test_platforms):
            print(f"\n✅ AA具备完整突破能力")
            print(f"⚠️ VA需要进一步增强")
        else:
            print(f"\n⚠️ 两者都需要进一步优化")

        return va_success_count, aa_success_count

    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return 0, 0

def main():
    """主函数"""
    print("🚀 测试VA和AA的突破能力")
    print("验证两个Agent是否都能突破403保护的支付平台")

    va_success, aa_success = test_va_and_aa_breakthrough()

    print(f"\n🎯 最终结论:")
    if va_success > 0 and aa_success > 0:
        print(f"✅ 是的！VA和AA都具备突破这些平台的能力")
        print(f"🚀 现在系统可以:")
        print(f"   - VA: 基础验证阶段的突破")
        print(f"   - AA: 深度分析阶段的突破")
        print(f"   - 双重保障确保平台访问成功")
    elif va_success > 0:
        print(f"✅ VA具备突破能力，AA可以进一步优化")
    elif aa_success > 0:
        print(f"✅ AA具备突破能力，VA已经可以工作")
    else:
        print(f"⚠️ 需要进一步检查突破功能")

if __name__ == "__main__":
    main()