#!/usr/bin/env python3
"""
快速分析8个平台的失败原因
"""

import socket
from datetime import datetime
from pathlib import Path
import json

def quick_platform_analysis():
    """快速平台分析"""
    print("🔍 快速分析8个失败平台")
    print("=" * 60)

    # 8个失败平台
    platforms = {
        "network_failures": [
            "payfast.co",
            "quickpay.com",
            "quickpay.io",
            "easypay.com",
            "paypro.io"
        ],
        "criteria_failures": [
            "fast.com",
            "easypay.io",
            "paypro.com"
        ]
    }

    analysis_results = {
        'analysis_time': datetime.now().isoformat(),
        'total_platforms': 8,
        'findings': {},
        'solutions': []
    }

    print("\n🌐 网络失败平台分析:")
    for platform in platforms["network_failures"]:
        print(f"\n🔍 分析: {platform}")

        # DNS检查
        try:
            ip = socket.gethostbyname(platform)
            print(f"   ✅ DNS解析成功: {ip}")

            # 简单的分类
            if 'payfast' in platform:
                platform_type = "支付平台类"
                issue = "域名解析正常但Web服务不可用"
                solution = "检查服务状态或寻找替代域名"
            elif 'quickpay' in platform:
                platform_type = "快速支付类"
                issue = "域名解析正常但Web服务不可用"
                solution = "验证平台是否仍在运营"
            elif 'easypay' in platform:
                platform_type = "简易支付类"
                issue = "域名解析正常但Web服务不可用"
                solution = "确认平台状态或替换为类似平台"
            elif 'paypro' in platform:
                platform_type = "专业支付类"
                issue = "域名解析正常但Web服务不可用"
                solution = "检查专业支付平台替代方案"
            else:
                platform_type = "未知类型"
                issue = "DNS解析正常但访问失败"
                solution = "需要进一步调查"

            analysis_results['findings'][platform] = {
                'type': 'network_failure',
                'dns_status': 'success',
                'ip_address': ip,
                'platform_type': platform_type,
                'issue': issue,
                'solution': solution
            }

            print(f"   类型: {platform_type}")
            print(f"   问题: {issue}")
            print(f"   建议: {solution}")

        except socket.gaierror:
            print(f"   ❌ DNS解析失败 - 域名不存在")

            analysis_results['findings'][platform] = {
                'type': 'network_failure',
                'dns_status': 'failed',
                'issue': '域名不存在或已过期',
                'solution': '从候选列表中移除'
            }

            print(f"   建议: 从候选列表中移除")

    print("\n📋 验证标准失败平台分析:")
    for platform in platforms["criteria_failures"]:
        print(f"\n🔍 分析: {platform}")

        # DNS检查
        try:
            ip = socket.gethostbyname(platform)
            print(f"   ✅ DNS解析成功: {ip}")

            # 基于平台名称的分析
            if platform == "fast.com":
                platform_type = "CDN/网络服务"
                issue = "不是支付平台，是Verizon的CDN服务"
                solution = "从候选列表中移除，不是目标平台"

            elif platform == "easypay.io":
                platform_type = "简易支付服务"
                issue = "可能不符合美国市场或其他验证标准"
                solution = "深入验证平台性质或寻找替代平台"

            elif platform == "paypro.com":
                platform_type = "专业支付服务"
                issue = "可能不符合美国市场服务要求"
                solution = "验证其美国市场业务或替换"

            analysis_results['findings'][platform] = {
                'type': 'criteria_failure',
                'dns_status': 'success',
                'ip_address': ip,
                'platform_type': platform_type,
                'issue': issue,
                'solution': solution
            }

            print(f"   类型: {platform_type}")
            print(f"   问题: {issue}")
            print(f"   建议: {solution}")

        except socket.gaierror:
            print(f"   ❌ DNS解析失败 - 域名不存在")

            analysis_results['findings'][platform] = {
                'type': 'criteria_failure',
                'dns_status': 'failed',
                'issue': '域名不存在',
                'solution': '从候选列表中移除'
            }

            print(f"   建议: 从候选列表中移除")

    # 生成解决方案
    print("\n💡 解决方案总结:")
    print("=" * 60)

    immediate_actions = []
    system_improvements = []
    platform_updates = []

    # 分析立即行动
    print("\n🚀 立即行动建议:")
    for platform, info in analysis_results['findings'].items():
        if info['dns_status'] == 'failed':
            immediate_actions.append(f"移除无效域名: {platform}")
            print(f"   - 移除无效域名: {platform}")
        elif 'not a payment platform' in info['issue'].lower():
            immediate_actions.append(f"移除非支付平台: {platform}")
            print(f"   - 移除非支付平台: {platform}")

    # 系统改进建议
    print("\n🔧 系统改进建议:")
    system_improvements = [
        "添加域名存在性预检查机制",
        "改进平台类型识别算法",
        "建立平台分类系统",
        "添加备用验证策略"
    ]

    for improvement in system_improvements:
        print(f"   - {improvement}")

    # 平台更新建议
    print("\n📝 平台列表更新建议:")
    platform_updates = [
        "清理候选平台列表中的无效域名",
        "添加更多经过验证的真实支付平台",
        "建立动态平台候选池",
        "按平台类型分类管理"
    ]

    for update in platform_updates:
        print(f"   - {update}")

    analysis_results['solutions'] = {
        'immediate_actions': immediate_actions,
        'system_improvements': system_improvements,
        'platform_updates': platform_updates
    }

    # 保存分析报告
    report_path = Path(__file__).parent / "data" / f"quick_8_platforms_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report_path.parent.mkdir(exist_ok=True)

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=2)

    print(f"\n💾 分析报告已保存: {report_path}")

    # 根本原因分析
    print("\n🎯 根本原因分析:")
    print("=" * 60)

    dns_failure_count = sum(1 for info in analysis_results['findings'].values() if info['dns_status'] == 'failed')
    total_platforms = len(analysis_results['findings'])

    print(f"   总平台数: {total_platforms}")
    print(f"   DNS失败数: {dns_failure_count}")
    print(f"   DNS失败率: {dns_failure_count/total_platforms*100:.1f}%")

    if dns_failure_count > total_platforms * 0.5:
        print("   ⚠️ 主要问题: 候选平台列表质量差，大量域名无效")
        print("   💡 建议: 彻底清理和重建候选平台列表")
    else:
        print("   ✅ 主要问题: 平台类型不匹配或验证标准需要优化")
        print("   💡 建议: 改进平台识别和验证逻辑")

    print("\n🎉 快速分析完成！")
    return analysis_results

if __name__ == "__main__":
    quick_platform_analysis()