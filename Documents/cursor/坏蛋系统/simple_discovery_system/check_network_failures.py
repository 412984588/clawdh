#!/usr/bin/env python3
"""
检查16轮中80个网络失败平台的真实情况
"""

import socket
import requests
from datetime import datetime
import json
from pathlib import Path

def check_network_failed_platforms():
    """检查网络失败平台的真实情况"""
    print("🔍 检查16轮中网络失败平台的真实情况")
    print("=" * 70)

    # 从日志中提取的"无法访问"平台
    failed_platforms = [
        "globalpaymentsinc.com", "mrr.io", "quickbooks.intuit.com", "paysera.com",
        "chime.com", "upwork.com", "dlcart.com", "paystack.com", "kickstarter.com",
        "revolut.com", "udemy.com", "stripeatlas.com", "cashapp.me", "indiegogo.com",
        "skillshare.com"
    ]

    print(f"\n📊 检查平台列表 ({len(failed_platforms)}个):")

    results = {
        'check_time': datetime.now().isoformat(),
        'total_platforms': len(failed_platforms),
        'dns_success': 0,
        'dns_failed': 0,
        'web_accessible': 0,
        'web_failed': 0,
        'platform_details': []
    }

    for platform in failed_platforms:
        print(f"\n🔍 检查: {platform}")
        print("-" * 40)

        platform_info = {
            'name': platform,
            'dns_status': None,
            'ip_address': None,
            'web_status': None,
            'http_status': None,
            'platform_type': 'unknown',
            'notes': ''
        }

        # DNS检查
        try:
            ip = socket.gethostbyname(platform)
            platform_info['dns_status'] = 'success'
            platform_info['ip_address'] = ip
            results['dns_success'] += 1
            print(f"   ✅ DNS: {ip}")
        except socket.gaierror:
            platform_info['dns_status'] = 'failed'
            results['dns_failed'] += 1
            print(f"   ❌ DNS: 域名不存在")
            platform_info['notes'] = '域名不存在'
            results['platform_details'].append(platform_info)
            continue

        # Web访问检查
        urls_to_try = [
            f"https://{platform}",
            f"http://{platform}",
            f"https://www.{platform}"
        ]

        web_accessible = False
        for url in urls_to_try:
            try:
                response = requests.get(url, timeout=10, allow_redirects=True)
                if response.status_code == 200:
                    platform_info['web_status'] = 'accessible'
                    platform_info['http_status'] = response.status_code
                    platform_info['accessible_url'] = url
                    results['web_accessible'] += 1
                    web_accessible = True

                    # 分析平台类型
                    platform_info['platform_type'] = classify_platform_type(platform)

                    print(f"   ✅ Web: {response.status_code} ({platform_info['platform_type']})")
                    break
                else:
                    print(f"   ⚠️ Web: {response.status_code} - {url}")
            except requests.exceptions.Timeout:
                print(f"   ⏱️ Web: 超时 - {url}")
            except requests.exceptions.ConnectionError:
                print(f"   🔌 Web: 连接错误 - {url}")
            except Exception as e:
                print(f"   ❌ Web: {type(e).__name__} - {url}")

        if not web_accessible:
            platform_info['web_status'] = 'failed'
            results['web_failed'] += 1
            print(f"   ❌ Web: 无法访问")
            platform_info['notes'] = 'Web服务不可用'

        results['platform_details'].append(platform_info)

    # 生成分析报告
    print(f"\n" + "="*70)
    print(f"📊 检查结果总结:")
    print(f"   总平台数: {results['total_platforms']}")
    print(f"   DNS成功: {results['dns_success']} ({results['dns_success']/results['total_platforms']*100:.1f}%)")
    print(f"   DNS失败: {results['dns_failed']} ({results['dns_failed']/results['total_platforms']*100:.1f}%)")
    print(f"   Web可访问: {results['web_accessible']} ({results['web_accessible']/results['total_platforms']*100:.1f}%)")
    print(f"   Web不可访问: {results['web_failed']} ({results['web_failed']/results['total_platforms']*100:.1f}%)")

    # 分析平台类型分布
    platform_types = {}
    for info in results['platform_details']:
        ptype = info['platform_type']
        if ptype not in platform_types:
            platform_types[ptype] = 0
        platform_types[ptype] += 1

    print(f"\n🏷️ 平台类型分布:")
    for ptype, count in platform_types.items():
        print(f"   {ptype}: {count}个")

    # 分析真正失败的原因
    print(f"\n🔍 真正无法访问的平台:")
    truly_failed = [info for info in results['platform_details']
                   if info['dns_status'] == 'failed' or info['web_status'] == 'failed']

    print(f"   数量: {len(truly_failed)}个")
    for platform in truly_failed:
        reason = platform['notes']
        print(f"   - {platform['name']}: {reason}")

    # 保存检查结果
    report_path = Path(__file__).parent / "data" / f"network_failure_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report_path.parent.mkdir(exist_ok=True)

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n💾 检查报告已保存: {report_path}")

    return results

def classify_platform_type(platform: str) -> str:
    """分类平台类型"""
    platform_lower = platform.lower()

    if any(keyword in platform_lower for keyword in ['payment', 'pay', 'checkout', 'billing']):
        return 'payment_platform'
    elif any(keyword in platform_lower for keyword in ['quickbooks', 'intuit']):
        return 'accounting_software'
    elif any(keyword in platform_lower for keyword in ['upwork', 'fiverr', 'kickstarter', 'indiegogo']):
        return 'freelance_marketplace'
    elif any(keyword in platform_lower for keyword in ['udemy', 'skillshare']):
        return 'education_platform'
    elif any(keyword in platform_lower for keyword in ['revolut', 'chime', 'cashapp']):
        return 'fintech_service'
    elif any(keyword in platform_lower for keyword in ['stripe']):
        return 'payment_infrastructure'
    else:
        return 'business_platform'

def main():
    """主函数"""
    print("🔍 分析16轮中80个网络失败平台的真实情况")
    print("目的: 确定这些平台是真的无法访问还是其他原因")

    results = check_network_failed_platforms()

    print(f"\n🎯 关键发现:")
    dns_success_rate = results['dns_success'] / results['total_platforms'] * 100
    web_success_rate = results['web_accessible'] / results['total_platforms'] * 100

    if dns_success_rate > 80:
        print(f"   ✅ 大部分平台 ({dns_success_rate:.1f}%) DNS正常，域名存在")
    else:
        print(f"   ⚠️ 很多平台 ({100-dns_success_rate:.1f}%) DNS失败，域名可能不存在")

    if web_success_rate > 60:
        print(f"   ✅ 大部分平台 ({web_success_rate:.1f}%) 可以Web访问")
        print(f"   💡 网络失败可能是临时的网络问题或访问限制")
    else:
        print(f"   ⚠️ 很多平台 ({100-web_success_rate:.1f}%) Web无法访问")
        print(f"   💡 可能是服务器问题、地理位置限制或防火墙")

    print(f"\n📝 结论:")
    print(f"   这些'网络失败'的平台大多是真实存在的知名平台")
    print(f"   失败原因可能是:")
    print(f"   1. 临时网络连接问题")
    print(f"   2. 地理位置访问限制")
    print(f"   3. 反爬虫或防火墙保护")
    print(f"   4. 服务器临时维护")
    print(f"   5. 需要特殊的访问方式或认证")

if __name__ == "__main__":
    main()