#!/usr/bin/env python3
import sys
sys.path.append('.')
from simple_real_agents import ValidatorRealAgent

# 测试精简后的核心验证系统
def test_core_validation():
    print("🎯 测试精简后的核心验证标准")
    print("=" * 60)
    print("✅ 只保留：Stripe Connect/Custom + PayPal + Square + Venmo")
    print("❌ 移除：Apple Pay, Google Pay, 电商支付等")
    print()

    validator = ValidatorRealAgent()

    # 测试核心平台
    core_platforms = [
        ("Stripe", "stripe.com", "支付集成平台"),
        ("PayPal", "paypal.com", "支付平台"),
        ("Square", "squareup.com", "个人支付系统平台"),
        ("Venmo", "venmo.com", "个人支付平台"),
        ("Shopify", "shopify.com", "电商建站平台") # 应该不通过第3项
    ]

    print("🧪 核心验证测试:")
    for name, domain, ptype in core_platforms:
        print(f"\n🔍 验证: {name}")
        result = validator.validate_platform(name, domain, ptype)

        if result:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  📊 总体: {status} ({result['summary']})")
            print(f"  📝 详情: {', '.join(result['details'])}")

            # 重点检查第3项
            payment_system_detail = result['details'][2] if len(result['details']) > 2 else "未检查"
            print(f"  🎯 第3项(自有支付系统): {payment_system_detail}")

            if name == "Shopify":
                print("  💡 Shopify应该不通过第3项(无核心支付品牌)")

if __name__ == "__main__":
    test_core_validation()