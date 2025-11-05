#!/usr/bin/env python3
import sys
sys.path.append('.')
from simple_real_agents import ValidatorRealAgent

# 测试最终极简版：只有Stripe Connect
def test_stripe_only():
    print("🎯 测试最终极简版验证标准")
    print("=" * 60)
    print("✅ 只接受：Stripe Connect Express/Custom平台")
    print("❌ 排除：PayPal、Square、Venmo、数字银行等所有其他平台")
    print()

    validator = ValidatorRealAgent()

    # 测试关键平台
    test_platforms = [
        ("Stripe", "stripe.com", "支付集成平台"),    # 应该通过
        ("PayPal", "paypal.com", "支付平台"),         # 应该不通过
        ("Square", "squareup.com", "个人支付系统平台"),   # 应该不通过
        ("Wise", "wise.com", "数字银行平台"),     # 应该不通过
    ]

    print("🧪 Stripe专属测试:")
    for name, domain, ptype in test_platforms:
        print(f"\n🔍 验证: {name}")
        result = validator.validate_platform(name, domain, ptype)

        if result:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  📊 总体: {status} ({result['summary']})")
            print(f"  📝 详情: {', '.join(result['details'])}")

            # 检查第3项
            payment_detail = result['details'][2] if len(result['details']) > 2 else "未检查"
            print(f"  💳 第3项: {payment_detail}")

            expected = "✅ 通过" if name == "Stripe" else "❌ 不通过"
            if "✅" in payment_detail:
                print(f"    ✅ 符合预期: {name}正确通过第3项")
            else:
                print(f"    ❌ 结果异常: {name}验证结果不符合预期")

if __name__ == "__main__":
    test_stripe_only()