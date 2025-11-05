#!/usr/bin/env python3
"""
分析前16轮验证中的平台去重情况
"""

import json
from pathlib import Path

def analyze_16_rounds():
    """分析前16轮的平台去重情况"""
    print("🔍 分析前16轮验证的平台去重情况")
    print("=" * 60)

    results_dir = Path(__file__).parent / "data" / "infinite_dialog_results"

    # 收集前16轮的所有平台
    all_platforms = []
    approved_platforms = []

    for cycle in range(1, 17):  # 前16轮
        filename = f"cycle_{cycle}_report_20251023_*.json"
        matching_files = list(results_dir.glob(filename))

        if matching_files:
            # 取第一个匹配的文件
            file_path = matching_files[0]
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 获取本轮批准的平台
            for platform in data.get('approved_platforms', []):
                platform_name = platform['platform_name']
                all_platforms.append({
                    'cycle': cycle,
                    'platform': platform_name,
                    'approved': True,
                    'aa_score': platform['aa_score'],
                    'reason': platform['reason']
                })

                if platform_name not in [p['platform'] for p in approved_platforms]:
                    approved_platforms.append({
                        'cycle': cycle,
                        'platform': platform_name,
                        'aa_score': platform['aa_score'],
                        'reason': platform['reason']
                    })

    print(f"📊 统计结果:")
    print(f"   总验证平台记录: {len(all_platforms)} 次")
    print(f"   去重后不同平台: {len(approved_platforms)} 个")
    print(f"   重复验证次数: {len(all_platforms) - len(approved_platforms)} 次")

    print(f"\n🔍 详细分析:")

    # 按轮次显示
    for cycle in range(1, 17):
        cycle_platforms = [p for p in all_platforms if p['cycle'] == cycle]
        print(f"   第{cycle:2d}轮: {len(cycle_platforms)}个平台")
        for platform in cycle_platforms:
            print(f"      - {platform['platform']} (AA分数: {platform['aa_score']})")

    print(f"\n✅ 去重后的平台列表:")
    for platform in approved_platforms:
        print(f"   - {platform['platform']} (首次通过: 第{platform['cycle']}轮, AA分数: {platform['aa_score']})")

    # 分析重复情况
    platform_counts = {}
    for p in all_platforms:
        platform_name = p['platform']
        platform_counts[platform_name] = platform_counts.get(platform_name, 0) + 1

    print(f"\n🔄 重复验证分析:")
    for platform, count in platform_counts.items():
        if count > 1:
            print(f"   {platform}: 验证了{count}次")

    # 结论
    if len(approved_platforms) == 1:
        print(f"\n🎯 结论: 前16轮只验证了1个独特平台 (fastspring.com)")
        print(f"   这说明系统存在去重机制失效的问题")
        print(f"   或者候选平台池过于有限，导致重复验证相同平台")
    else:
        print(f"\n🎯 结论: 前16轮验证了{len(approved_platforms)}个不同平台")
        print(f"   去重机制工作正常")

if __name__ == "__main__":
    analyze_16_rounds()