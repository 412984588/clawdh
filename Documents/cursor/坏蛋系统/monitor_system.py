#!/usr/bin/env python3
"""
系统监控脚本 - 实时显示平台发现状态
"""

import json
import time
from datetime import datetime
from mcp_tools import MCP_TOOLS

def print_status():
    """打印当前状态"""
    print("\n" + "="*60)
    print(f"📊 平台发现系统状态 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    # 加载数据
    verified = MCP_TOOLS['data'].load_verified_platforms()
    rejected = MCP_TOOLS['data'].load_rejected_platforms()

    total = len(verified) + len(rejected)
    success_rate = (len(verified) / total) * 100 if total > 0 else 0

    print(f"\n📈 累计统计:")
    print(f"  - 累计验证: {total:,} 个平台")
    print(f"  - ✅ 已通过: {len(verified):,} 个")
    print(f"  - ❌ 已拒绝: {len(rejected):,} 个")
    print(f"  - 📊 成功率: {success_rate:.1f}%")

    # 分析最近验证
    if rejected:
        print(f"\n📋 最近拒绝的平台 (最新5个):")
        for platform in rejected[-5:]:
            name = platform.get('platform', {}).get('name', 'Unknown')
            reason = platform.get('rejection_reason', '未提供原因')
            print(f"  - {name}: {reason}")

    # 显示系统文件大小
    import os
    verified_size = os.path.getsize('verified_platforms.json') if os.path.exists('verified_platforms.json') else 0
    rejected_size = os.path.getsize('rejected_platforms.json') if os.path.exists('rejected_platforms.json') else 0

    print(f"\n💾 数据文件:")
    print(f"  - verified_platforms.json: {verified_size:,} 字节")
    print(f"  - rejected_platforms.json: {rejected_size:,} 字节")

def main():
    """主函数"""
    print("🔍 系统监控已启动，按 Ctrl+C 退出")

    try:
        while True:
            print_status()
            time.sleep(30)  # 每30秒更新一次
    except KeyboardInterrupt:
        print("\n\n👋 监控已停止")

if __name__ == "__main__":
    main()