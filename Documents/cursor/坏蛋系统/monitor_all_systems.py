#!/usr/bin/env python3
"""
监控所有运行中的系统
"""

import json
import time
import os
from datetime import datetime

def get_file_stats():
    """获取数据文件统计"""
    stats = {}

    # 获取已验证平台
    if os.path.exists('verified_platforms.json'):
        with open('verified_platforms.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            stats['verified'] = len(data.get('platforms', []))
    else:
        stats['verified'] = 0

    # 获取已拒绝平台
    if os.path.exists('rejected_platforms.json'):
        with open('rejected_platforms.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            stats['rejected'] = len(data.get('platforms', []))
    else:
        stats['rejected'] = 0

    # 计算成功率
    total = stats['verified'] + stats['rejected']
    stats['success_rate'] = (stats['verified'] / total * 100) if total > 0 else 0

    return stats

def monitor_systems():
    """监控系统状态"""
    print("\n" + "="*60)
    print(f"📊 系统监控面板 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    # 显示数据统计
    stats = get_file_stats()
    print(f"\n📈 平台数据统计:")
    print(f"  - ✅ 已验证: {stats['verified']:,} 个")
    print(f"  - ❌ 已拒绝: {stats['rejected']:,} 个")
    print(f"  - 📊 成功率: {stats['success_rate']:.1f}%")

    # 显示文件大小
    files = [
        ('verified_platforms.json', '已验证平台'),
        ('rejected_platforms.json', '已拒绝平台'),
        ('analysis_report.json', '分析报告'),
        ('workflow_stats.json', '工作流统计'),
    ]

    print(f"\n💾 数据文件大小:")
    for filename, desc in files:
        if os.path.exists(filename):
            size = os.path.getsize(filename) / 1024  # KB
            print(f"  - {desc}: {size:.1f} KB")
        else:
            print(f"  - {desc}: 文件不存在")

    # 检查日志文件
    print(f"\n📋 最新日志:")
    log_files = [
        ('claude_auto_workflow.log', '自动工作流'),
        ('enhanced_crewai.log', 'CrewAI系统'),
        ('smart_crawler.log', '智能爬虫'),
    ]

    for filename, desc in log_files:
        if os.path.exists(filename):
            mod_time = datetime.fromtimestamp(os.path.getmtime(filename))
            print(f"  - {desc}: {mod_time.strftime('%H:%M:%S')}")

    print("\n" + "="*60)

def main():
    """主函数"""
    print("🔍 系统监控已启动，按 Ctrl+C 退出")

    try:
        while True:
            monitor_systems()
            time.sleep(30)  # 每30秒更新一次
    except KeyboardInterrupt:
        print("\n\n👋 监控已停止")

if __name__ == "__main__":
    main()