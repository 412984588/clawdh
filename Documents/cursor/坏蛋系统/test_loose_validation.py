#!/usr/bin/env python3
import sys
sys.path.append('.')
from simple_real_agents import ValidatorRealAgent

# 测试放宽后的验证标准
def test_loose_validation():
    print("🎯 测试放宽后的验证标准")
    print("=" * 60)
    print("✅ 第3项放宽：支持所有支付系统")
    print("✅ 新增：主流数字银行平台")
    print()

    validator = ValidatorRealAgent()

    # 测试关键平台 - 专门调试PayPal问题
    test_platforms = [
        ("PayPal", "paypal.com", "支付平台"),           # 调试为什么不通
    ]

    print("🧪 PayPal专项调试:")
    for name, domain, ptype in test_platforms:
        print(f"\n🔍 调试: {name}")
        result = validator.validate_platform(name, domain, ptype)

        if result:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  📊 总体: {status} ({result['summary']})")
            print(f"  📝 详情: {', '.join(result['details'])}")

            # 检查PayPal页面内容
            if name == "PayPal":
                print(f"    🔍 调试PayPal页面内容:")
                # 尝试访问PayPal主页
                response = validator.session.get("https://paypal.com")
                if response.status_code == 200:
                    content = response.text.lower()
                    print(f"    📄 页面实际内容: {len(content)} 字符")

                    # 检查支付系统关键词
                    payment_indicators = ['payment system', 'payment processor', 'payments infrastructure']
                    found_indicators = [ind for ind in payment_indicators if ind in content]
                    print(f"    💳 支付系统指标: {found_indicators}")

                    # 检查PayPal特有服务
                    paypal_services = ['business account', 'merchant services', 'payment solutions']
                    found_services = [svc for svc in paypal_services if svc in content]
                    print(f"    🏢 PayPal服务: {found_services}")

if __name__ == "__main__":
    test_loose_validation()

    print("🧪 放宽验证测试:")
    for name, domain, ptype in test_platforms:
        print(f"\n🔍 验证: {name}")
        result = validator.validate_platform(name, domain, ptype)

        if result:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  📊 总体: {status} ({result['summary']})")
            print(f"  📝 详情: {', '.join(result['details'])}")

            # 重点检查第3项
            payment_detail = result['details'][2] if len(result['details']) > 2 else "未检查"
            print(f"  💳 第3项: {payment_detail}")

            expected = "✅ 通过"  # 现在所有平台都应该通过
            if "✅" in payment_detail:
                print(f"    ✅ 符合预期: {name}现在正确通过第3项")
            else:
                print(f"    ⚠️ 结果异常: {name}应该通过第3项但结果不一致")

if __name__ == "__main__":
    test_loose_validation()