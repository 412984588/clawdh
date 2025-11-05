#!/usr/bin/env python3
import sys
sys.path.append('.')
from simple_real_agents import ValidatorRealAgent

# 测试最终极简版验证系统
def test_ultra_minimal():
    print("🎯 测试最终极简版验证标准")
    print("=" * 60)
    print("✅ 只保留：Stripe Connect平台")
    print("❌ 移除：PayPal, Square, Venmo, Shopify, Patreon等所有其他平台")
    print()

    validator = ValidatorRealAgent()

    # 测试核心平台
    test_platforms = [
        ("Stripe", "stripe.com", "支付集成平台"), # 应该通过
        ("PayPal", "paypal.com", "支付平台"),       # 应该不通过第3项
        ("Square", "squareup.com", "个人支付系统平台"),  # 应该不通过第3项
        ("Shopify", "shopify.com", "电商建站平台")   # 应该不通过第3项
    ]

    print("🧪 极简验证测试:")
    for name, domain, ptype in test_platforms:
        print(f"\n🔍 验证: {name}")
        result = validator.validate_platform(name, domain, ptype)

        if result:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  📊 总体: {status} ({result['summary']})")
            print(f"  📝 详情: {', '.join(result['details'])}")

            # 重点检查第3项
            payment_system_detail = result['details'][2] if len(result['details']) > 2 else "未检查"
            print(f"  🎯 第3项(自有支付系统): {payment_system_detail}")

            if name != "Stripe":
                expected = "❌ 不通过"  # 只有Stripe应该通过
                if payment_system_detail == expected:
                    print(f"  ✅ 符合预期: {name}确实应该不通过第3项")
                else:
                    print(f"  ⚠️ 结果异常: {name}应该不通过第3项但结果不一致")

if __name__ == "__main__":
    test_ultra_minimal()