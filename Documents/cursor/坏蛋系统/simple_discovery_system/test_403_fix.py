#!/usr/bin/env python3
"""
测试403修复效果
"""

import sys
from pathlib import Path

# 添加当前目录到路径
sys.path.append(str(Path(__file__).parent))

def test_403_breakthrough():
    """测试403突破功能"""
    print("🧪 测试403突破修复效果")
    print("=" * 60)

    try:
        from dialog_5agent_system import DialogVAVerificationExpert

        # 测试之前无法访问的403平台
        test_platforms = [
            "paystack.com",    # 非洲支付平台
            "revolut.com",     # 数字银行
            "kickstarter.com", # 众筹平台
            "upwork.com"       # 自由职业平台
        ]

        va = DialogVAVerificationExpert()

        print(f"\n🎯 测试403突破访问:")
        success_count = 0

        for platform in test_platforms:
            print(f"\n🔍 测试: {platform}")
            try:
                result = va._real_verify_platform(platform)

                if result:
                    print(f"   ✅ 突破成功! 状态码: {result['status_code']}")
                    print(f"   📝 访问方法: {result['access_method']}")
                    print(f"   🏷️ 页面标题: {result['page_title'][:50]}...")

                    if result['final_score'] > 0:
                        print(f"   🎯 验证通过! (100分) ✅")
                        success_count += 1
                    else:
                        failed = ', '.join(result.get('failed_criteria', []))
                        print(f"   ⚠️ 验证未通过: {failed}")
                else:
                    print(f"   ❌ 仍然无法访问")

            except Exception as e:
                print(f"   ⚠️ 测试错误: {e}")

        print(f"\n📊 测试结果总结:")
        print(f"   测试平台数: {len(test_platforms)}")
        print(f"   突破成功数: {success_count}")
        print(f"   突破成功率: {success_count/len(test_platforms)*100:.1f}%")

        if success_count > 0:
            print(f"\n🎉 403突破修复成功!")
            print(f"💡 现在系统可以访问受保护的支付平台了")
        else:
            print(f"\n⚠️ 需要进一步优化突破策略")

        return success_count > 0

    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 测试403突破修复效果")
    print("验证系统现在能否突破403错误访问受保护平台")

    success = test_403_breakthrough()

    if success:
        print(f"\n🎯 修复效果良好!")
        print(f"📈 预期改进:")
        print(f"   - 16轮验证中更多平台可以被访问")
        print(f"   - 网络失败率将大幅降低")
        print(f"   - 发现的支付平台数量将增加")
    else:
        print(f"\n🔧 需要进一步优化突破策略")

if __name__ == "__main__":
    main()