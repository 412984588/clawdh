#!/usr/bin/env python3
"""
🔍 自动状态检查脚本
每分钟检查连续发现系统的运行状态
"""

import json
import time
from datetime import datetime
from pathlib import Path

def check_system_status():
    """检查系统状态"""
    output_dir = Path(__file__).parent / "data" / "continuous_results"

    print("🔍 连续发现系统状态检查")
    print("="*50)
    print(f"🕐 检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # 检查日志文件
    log_files = list(output_dir.glob("continuous_log_*.txt"))
    if not log_files:
        print("❌ 未找到日志文件")
        return

    latest_log = max(log_files, key=lambda f: f.stat().st_mtime)
    print(f"📝 最新日志: {latest_log.name}")

    # 读取日志最后几行
    try:
        with open(latest_log, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            if len(lines) > 0:
                print(f"📊 系统状态: {'运行中' if '正在' in lines[-1] else '可能已停止'}")

                # 显示最近5条日志
                print("\n📋 最近日志:")
                for line in lines[-5:]:
                    print(f"   {line.strip()}")
    except:
        print("❌ 无法读取日志文件")

    # 检查结果文件
    cycle_files = list(output_dir.glob("cycle_*_results_*.json"))
    print(f"\n📊 轮次结果文件: {len(cycle_files)} 个")

    if cycle_files:
        latest_cycle = max(cycle_files, key=lambda f: f.stat().st_mtime)
        try:
            with open(latest_cycle, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"🔄 最新轮次: 第 {data['cycle_number']} 轮")
                print(f"✅ 本轮验证: {data['platforms_verified']} 个平台")
                print(f"🌟 完美平台: {data['summary']['perfect_platforms']} 个")
        except:
            print("❌ 无法读取轮次结果")

    # 检查最终报告
    final_files = list(output_dir.glob("final_report_*.json"))
    print(f"📋 最终报告文件: {len(final_files)} 个")

    # 检查数据库文件
    data_dir = Path(__file__).parent / "data"
    db_files = list(data_dir.glob("verified_platforms_database_*.json"))
    latest_db = max(db_files, key=lambda f: f.stat().st_mtime) if db_files else None

    if latest_db:
        try:
            with open(latest_db, 'r', encoding='utf-8') as f:
                db_data = json.load(f)
                print(f"💾 最新数据库: {latest_db.name}")
                print(f"📊 已验证平台: {db_data['total_verified_platforms']} 个")
        except:
            print("❌ 无法读取数据库")

    print("="*50)

def main():
    """主函数"""
    print("🔄 启动自动状态检查器")
    print("💡 将每分钟检查一次系统状态")
    print("🛑 使用 Ctrl+C 停止检查")
    print("="*50)

    try:
        while True:
            check_system_status()
            print("⏳ 等待60秒后再次检查...")
            time.sleep(60)
    except KeyboardInterrupt:
        print("\n👋 状态检查已停止")

if __name__ == "__main__":
    main()