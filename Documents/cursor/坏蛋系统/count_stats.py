#!/usr/bin/env python3
import json
import os

def count_platforms():
    """统计平台数据"""

    # 读取已验证平台
    try:
        with open('verified_platforms.json', 'r', encoding='utf-8') as f:
            verified_data = json.load(f)
            verified_count = len(verified_data.get('platforms', []))
    except:
        verified_count = 0

    # 读取被拒绝平台
    try:
        with open('rejected_platforms.json', 'r', encoding='utf-8') as f:
            rejected_data = json.load(f)
            rejected_count = len(rejected_data.get('platforms', []))
    except:
        rejected_count = 0

    # 读取工作流统计
    try:
        with open('workflow_stats.json', 'r', encoding='utf-8') as f:
            stats = json.load(f)
            last_updated = stats.get('last_updated', '未知')
            infinite_loop = stats.get('workflow_config', {}).get('infinite_loop', False)
            total_discovered = stats.get('workflow_stats', {}).get('total_discovered', 0)
    except:
        last_updated = '未知'
        infinite_loop = False
        total_discovered = 0

    total_validated = verified_count + rejected_count
    pass_rate = (verified_count / total_validated * 100) if total_validated > 0 else 0

    print(f"""
📊 当前数据统计总览
├── ✅ 已验证通过: {verified_count} 个平台
├── ❌ 验证失败: {rejected_count} 个平台
├── 📈 总计验证: {total_validated} 个平台
├── 🎯 通过率: {pass_rate:.1f}%
├── 🔍 平台发现: {total_discovered} 个
└── 🔄 运行模式: {'无限循环' if infinite_loop else '单次运行'}

最近更新: {last_updated}
""")

if __name__ == "__main__":
    count_platforms()