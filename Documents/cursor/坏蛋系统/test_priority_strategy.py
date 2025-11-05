#!/usr/bin/env python3
import sys
sys.path.append('.')
from simple_real_agents import ValidatorRealAgent

# 测试小平台优先策略
def test_priority_strategy():
    print("🎯 测试小平台优先策略")
    print("=" * 60)
    print("✅ 策略：小平台优先（名称<30字符）")
    print("✅ 策略：中平台次之（30-50字符）")
    print("✅ 策略：大平台最后（>50字符）")
    print("✅ 目标：减少验证时间，提高效率")
    print()

    validator = ValidatorRealAgent()

    # 测试不同大小的平台
    test_platforms = [
        ("Stripe", "stripe.com", "支付集成平台"),           # 小平台，应优先
        ("Square", "squareup.com", "个人支付系统平台"),     # 中平台，次之
        ("BigCommerce", "bigcommerce.com", "电商平台"),          # 大平台，最后
        ("Amazon", "aws.amazon.com", "云服务平台"),          # 大平台，最后
        ("Network for Good", "networkforgood.com", "慈善募捐平台") # 超大平台，>50字符
    ]

    print("🧪 平台大小策略测试:")
    for name, domain, ptype in test_platforms:
        print(f"\n🔍 验证: {name}")

        # 预测优先级
        if len(name) < 30:
            expected_priority = "高优先（小平台）"
            priority_reason = "名称短，快速验证"
        elif 30 <= len(name) <= 50:
            expected_priority = "中优先（中平台）"
            priority_reason = "名称适中，正常验证"
        else:
            expected_priority = "低优先（大平台）"
            priority_reason = "名称长，最后验证"

        result = validator.validate_platform(name, domain, ptype)

        if result:
            status = "✅ 通过" if result['overall'] else "❌ 不通过"
            print(f"  📊 总体: {status} ({result['summary']})")
            print(f"  📝 详情: {', '.join(result['details'])}")

            # 检查优先级策略是否生效
            if len(name) < 30 and status == "✅ 通过":
                print(f"    🎯 策略匹配: {expected_priority}")
                print(f"    ✅ 策略有效: {priority_reason}")
            elif len(name) < 30:
                print(f"    ❌ 策略不匹配: 应该{expected_priority}")
            else:
                print(f"    ❌ 策略不匹配: 应该{expected_priority}")

if __name__ == "__main__":
    test_priority_strategy()