#!/usr/bin/env python3
"""
🎯 FIND MORE PLATFORMS - 专门寻找更多验证通过的平台
目标：快速验证更多平台，给用户大量验证结果
"""

import json
import time
from datetime import datetime
from pathlib import Path
from no_simulation_system import NoSimulationSystem

# 更多候选平台列表
MORE_PLATFORMS = [
    {"name": "Shopify Payments", "url": "https://www.shopify.com/payments"},
    {"name": "BigCommerce Payments", "url": "https://www.bigcommerce.com/payments"},
    {"name": "WooCommerce Payments", "url": "https://woocommerce.com/payments"},
    {"name": "Magento Payments", "url": "https://magento.com/payment"},
    {"name": "Volusion Payments", "url": "https://www.volusion.com/ecommerce-website-builder/payment-processing"},
    {"name": "3dcart Payments", "url": "https://www.3dcart.com/payment-processing"},
    {"name": "WePay", "url": "https://www.wepay.com"},
    {"name": "PayStand", "url": "https://www.paystand.com"},
    {"name": "Tipalti", "url": "https://www.tipalti.com"},
    {"name": "Hyperwallet", "url": "https://www.hyperwallet.com"},
    {"name": "Paxum", "url": "https://www.paxum.com"},
    {"name": "Payeer", "url": "https://payeer.com"},
    {"name": "Perfect Money", "url": "https://perfectmoney.is"},
    {"name": "Skrill", "url": "https://www.skrill.com"},
    {"name": "Neteller", "url": "https://www.neteller.com"},
    {"name": "WebMoney", "url": "https://www.webmoney.ru"},
    {"name": "Payza", "url": "https://www.payza.com"},
    {"name": "SolidTrustPay", "url": "https://solidtrustpay.com"},
    {"name": "EgoPay", "url": "https://egopay.com"},
    {"name": "OKPay", "url": "https://www.okpay.com"},
    {"name": "Payza", "url": "https://www.payza.com"},
    {"name": "2Checkout", "url": "https://www.2checkout.com"},
    {"name": "Avangate", "url": "https://www.avangate.com"},
    {"name": "BlueSnap", "url": "https://www.bluesnap.com"},
    {"name": "FastSpring", "url": "https://www.fastspring.com"},
    {"name": "CleverBridge", "url": "https://www.cleverbridge.com"},
    {"name": "Digital River", "url": "https://www.digitalriver.com"},
    {"name": "Fastspring", "url": "https://www.fastspring.com"},
    {"name": "ShareASale", "url": "https://www.shareasale.com"},
    {"name": "ClickBank", "url": "https://www.clickbank.com"},
    {"name": "JVZoo", "url": "https://www.jvzoo.com"},
    {"name": "WarriorPlus", "url": "https://www.warriorplus.com"},
    {"name": "PayDotCom", "url": "https://www.paydotcom.com"},
    {"name": "TrialPay", "url": "https://www.trialpay.com"},
    {"name": "Plimus", "url": "https://www.plimus.com"},
    {"name": "BMT Micro", "url": "https://www.bmtmicro.com"},
    {"name": "Kagi", "url": "https://www.kagi.com"},
    {"name": "FastSpring", "url": "https://www.fastspring.com"},
    {"name": "Swreg", "url": "https://www.swreg.org"},
    {"name": "NorthStar", "url": "https://www.northstarpaymentsolutions.com"},
    {"name": "CCBill", "url": "https://www.ccbill.com"},
    {"name": "Zombaio", "url": "https://www.zombaio.com"},
    {"name": "Epoch", "url": "https://www.epoch.com"},
    {"name": "SegPay", "url": "https://www.segpay.com"},
    {"name": "Vendo", "url": "https://www.vendoservices.com"},
    {"name": "Netbilling", "url": "https://www.netbilling.com"},
    {"name": "2000Charge", "url": "https://www.2000charge.com"},
    {"name": "Verotel", "url": "https://www.verotel.com"}
]

def find_more_platforms():
    """快速验证更多平台"""
    system = NoSimulationSystem()
    results_file = Path(__file__).parent / "data" / "more_platforms_results.json"

    print("🚀 快速验证更多支付平台...")
    print(f"📋 待验证平台: {len(MORE_PLATFORMS)} 个")

    verification_results = []
    successful_count = 0

    for i, platform in enumerate(MORE_PLATFORMS, 1):
        print(f"\n🔍 验证 {i}/{len(MORE_PLATFORMS)}: {platform['name']}")

        try:
            # 快速验证
            verification = system.real_http_verify(platform['url'], platform['name'])
            verification.update(platform)
            verification_results.append(verification)

            if verification.get('verification_success', False):
                successful_count += 1
                print(f"✅ {platform['name']} - 验证通过! 得分: {verification.get('success_rate', 0):.1%}")
            else:
                print(f"❌ {platform['name']} - 验证失败: {verification.get('error', 'Unknown')}")

            # 短暂等待避免过于频繁
            time.sleep(2)

        except Exception as e:
            print(f"❌ 验证 {platform['name']} 时出错: {e}")

    # 保存结果
    report = {
        'execution_time': datetime.now().isoformat(),
        'total_tested': len(MORE_PLATFORMS),
        'successful': successful_count,
        'success_rate': successful_count / len(MORE_PLATFORMS),
        'results': verification_results
    }

    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 验证完成!")
    print(f"📊 总验证: {len(MORE_PLATFORMS)} 个")
    print(f"✅ 成功: {successful_count} 个")
    print(f"📈 成功率: {successful_count/len(MORE_PLATFORMS)*100:.1f}%")

    # 显示成功平台
    successful_platforms = [r for r in verification_results if r.get('verification_success', False)]
    if successful_platforms:
        print(f"\n🎯 验证通过的 {len(successful_platforms)} 个平台:")
        for i, platform in enumerate(successful_platforms, 1):
            print(f"  {i:2d}. {platform['platform_name']:<30} - 得分: {platform.get('success_rate', 0):.1%}")

    return report

if __name__ == "__main__":
    find_more_platforms()