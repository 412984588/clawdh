#!/usr/bin/env python3
import requests
import json

# 测试新的Stripe Connect验证逻辑
def test_stripe_connect_validation():
    print("🧪 测试Stripe Connect验证逻辑")
    print("=" * 50)

    # 测试平台
    test_platforms = [
        ("Stripe", "stripe.com"),
        ("Stripe Connect", "connect.stripe.com"),
        ("Shopify", "shopify.com"),
        ("Patreon", "patreon.com")
    ]

    for name, domain in test_platforms:
        print(f"\n🔍 测试: {name} ({domain})")

        try:
            response = requests.get(f"https://{domain}", timeout=10)
            content = response.text.lower()
            print(f"    📄 页面内容长度: {len(content)} 字符")

            # 应用新的验证逻辑
            if 'stripe' in domain.lower():
                # 验证是否为Stripe Connect Express/Custom
                connect_indicators = [
                    'stripe connect', 'connect express', 'connect custom',
                    'platform payments', 'marketplace payments', 'software payments'
                ]
                standard_indicators = [
                    'stripe standard', 'standard account', 'individual account'
                ]

                has_connect = any(indicator in content for indicator in connect_indicators)
                has_standard = any(indicator in content for indicator in standard_indicators)

                print(f"    🔍 Connect指标: {has_connect}")
                print(f"    ⚠️ Standard指标: {has_standard}")

                # 优先检查Connect，如果没有明确标识则假设为Connect
                result = has_connect or not has_standard
                print(f"    ✅ 验证结果: {'通过' if result else '不通过'}")

                if result:
                    print("    💡 判定为Stripe Connect Express/Custom - 符合第3项标准")
                else:
                    print("    ❌ 判定为Stripe Standard - 不符合第3项标准")
            else:
                # 其他支付平台检查
                payment_brands = [
                    'paypal', 'square', 'venmo', 'apple pay', 'google pay',
                    'shopify payments', 'bigcommerce payments', 'woocommerce payments'
                ]

                saas_keywords = [
                    'subscription', 'recurring', 'membership', 'tier',
                    'payment system', 'payment gateway', 'payment processor'
                ]

                has_payment_brand = any(brand in content for brand in payment_brands)
                has_saas_features = any(keyword in content for keyword in saas_keywords)

                result = has_payment_brand or has_saas_features
                print(f"    ✅ 验证结果: {'通过' if result else '不通过'}")

                if has_payment_brand:
                    found_brands = [brand for brand in payment_brands if brand in content]
                    print(f"    💳 发现支付品牌: {', '.join(found_brands)}")

                if has_saas_features:
                    print("    🔧 发现SaaS支付特征")

        except Exception as e:
            print(f"    ❌ 访问失败: {e}")

if __name__ == "__main__":
    test_stripe_connect_validation()