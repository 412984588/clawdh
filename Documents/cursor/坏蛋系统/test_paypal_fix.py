#!/usr/bin/env python3
import sys
sys.path.append('.')
from simple_real_agents import ValidatorRealAgent

# 简单测试PayPal修复
def test_paypal_fix():
    print("🔧 PayPal修复测试")
    print("=" * 50)

    validator = ValidatorRealAgent()

    print("🧪 只测试PayPal:")
    name, domain, ptype = "PayPal", "paypal.com", "支付平台"

    print(f"\n🔍 验证: {name}")
    result = validator.validate_platform(name, domain, ptype)

    if result:
        status = "✅ 通过" if result['overall'] else "❌ 不通过"
        print(f"  📊 总体: {status} ({result['summary']})")
        print(f"  📝 详情: {', '.join(result['details'])}")

        # 重点检查第3项
        payment_detail = result['details'][2] if len(result['details']) > 2 else "未检查"
        print(f"  🎯 第3项(自有支付系统): {payment_detail}")

        expected = "✅ 通过"  # PayPal现在应该通过第3项
        if "✅" in payment_detail:
            print(f"    ✅ 修复成功: PayPal正确通过第3项")
        else:
            print(f"    ❌ 修复失败: PayPal仍不通过第3项")
    else:
        print("    ❌ 验证失败")

if __name__ == "__main__":
    test_paypal_fix()