#!/usr/bin/env python3
import sys
sys.path.append('.')
from simple_real_agents import ValidatorRealAgent

# 测试更新后的验证系统
def test_updated_validation():
    print("🎯 测试更新后的4项验证标准")
    print("=" * 60)

    validator = ValidatorRealAgent()

    # 测试关键平台
    test_platforms = [
        ("Stripe", "stripe.com", "支付集成平台"),
        ("Shopify", "shopify.com", "电商建站平台"),
        ("Patreon", "patreon.com", "创作者订阅平台"),
        ("PayPal", "paypal.com", "支付平台"),
        ("Square", "squareup.com", "个人支付系统平台")
    ]

    print("🧪 重点测试Stripe Connect验证逻辑:")
    for name, domain, ptype in test_platforms:
        print(f"\n🔍 验证: {name}")
        result = validator.validate_platform(name, domain, ptype)

        if result:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  📊 总体: {status} ({result['summary']})")
            print(f"  📝 详情: {', '.join(result['details'])}")

            # 特别标注第3项结果
            if "自有支付系统" in result['details']:
                if "✅" in result['details'][2]:  # 第3项是自有支付系统
                    print(f"  🎯 第3项: ✅ 通过 - 符合支付集成要求")
                else:
                    print(f"  ⚠️ 第3项: ❌ 不通过 - 不符合支付集成要求")
        else:
            print("  ❌ 验证失败")

if __name__ == "__main__":
    test_updated_validation()