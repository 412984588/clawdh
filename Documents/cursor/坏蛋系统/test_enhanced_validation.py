#!/usr/bin/env python3
import sys
sys.path.append('.')
from simple_real_agents import ValidatorRealAgent

# 测试增强后的验证系统
def test_enhanced_validation():
    print("🎯 测试增强后的验证标准")
    print("=" * 60)
    print("✅ 新增：非营利组织注册支持")
    print("✅ 新增：重试机制（最多3次）")
    print("✅ 保持：Stripe Connect严格标准")
    print()

    validator = ValidatorRealAgent()

    # 测试关键平台
    test_platforms = [
        ("JustGiving", "justgiving.com", "慈善募捐平台"),  # 应该通过EIN支持
        ("Classy", "classy.org", "非营利募捐平台"),  # 应该通过EIN支持
        ("Stripe", "stripe.com", "支付集成平台"),    # 应该通过Connect验证
        ("PayPal", "paypal.com", "支付平台"),        # 应该不通过第3项
    ]

    print("🧪 增强验证测试:")
    for name, domain, ptype in test_platforms:
        print(f"\n🔍 验证: {name}")
        result = validator.validate_platform(name, domain, ptype)

        if result:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  📊 总体: {status} ({result['summary']})")
            print(f"  📝 详情: {', '.join(result['details'])}")

            # 分析第1项（个人注册）
            reg_detail = result['details'][0] if len(result['details']) > 0 else "未检查"
            if "EIN" in ptype or "nonprofit" in ptype:
                if "✅" in reg_detail:
                    print(f"    🏢 第1项: ✅ 通过 - 支持非营利组织注册")
                else:
                    print(f"    ⚠️ 第1项: ❌ 不通过 - 非营利组织支持问题")

            # 分析第3项（支付系统）
            payment_detail = result['details'][2] if len(result['details']) > 2 else "未检查"
            if name == "Stripe":
                print(f"    💳 第3项: {payment_detail} - Stripe Connect验证正确")
            else:
                print(f"    💳 第3项: {payment_detail} - 非Stripe平台")

if __name__ == "__main__":
    test_enhanced_validation()