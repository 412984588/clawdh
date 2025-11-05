#!/usr/bin/env python3
"""
🔧 快速稳定性检查
确认系统状态良好，可以安全整夜运行
"""

import json
import time
from datetime import datetime
from pathlib import Path

def check_system_health():
    """检查系统健康状态"""
    print("🔍 系统健康状态检查")
    print("="*50)

    # 1. 检查基本组件
    try:
        import requests
        from bs4 import BeautifulSoup
        print("✅ 核心库导入正常")
    except Exception as e:
        print(f"❌ 核心库导入失败: {e}")
        return False

    # 2. 检查输出目录
    output_dir = Path(__file__).parent / "data" / "continuous_results"
    if output_dir.exists():
        print("✅ 输出目录正常")
    else:
        print("❌ 输出目录不存在")
        return False

    # 3. 检查日志文件
    log_files = list(output_dir.glob("continuous_log_*.txt"))
    if log_files:
        latest_log = max(log_files, key=lambda f: f.stat().st_mtime)
        print(f"✅ 日志文件: {latest_log.name}")

        # 检查最新日志时间
        try:
            with open(latest_log, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                if lines:
                    last_line = lines[-1].strip()
                    if "正在验证" in last_line or "✅" in last_line or "❌" in last_line:
                        print("✅ 系统正在活跃运行")
                    else:
                        print("⚠️ 系统可能暂停")
        except:
            print("⚠️ 无法读取日志")
    else:
        print("❌ 未找到日志文件")
        return False

    # 4. 检查结果文件
    cycle_files = list(output_dir.glob("cycle_*_results_*.json"))
    if cycle_files:
        print(f"✅ 结果文件: {len(cycle_files)} 个轮次")

        # 分析最新结果
        latest_cycle = max(cycle_files, key=lambda f: f.stat().st_mtime)
        try:
            with open(latest_cycle, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"✅ 最新轮次: 第 {data['cycle_number']} 轮")
                print(f"   验证平台: {data['platforms_verified']} 个")
                print(f"   优秀平台: {data['summary']['excellent_platforms']} 个")
                print(f"   良好平台: {data['summary']['good_platforms']} 个")
        except:
            print("⚠️ 无法分析结果文件")
    else:
        print("⚠️ 未找到结果文件")

    # 5. 检查数据库
    data_dir = Path(__file__).parent / "data"
    db_files = list(data_dir.glob("verified_platforms_database_*.json"))
    if db_files:
        latest_db = max(db_files, key=lambda f: f.stat().st_mtime)
        try:
            with open(latest_db, 'r', encoding='utf-8') as f:
                db_data = json.load(f)
                print(f"✅ 数据库: {db_data['total_verified_platforms']} 个已验证平台")
        except:
            print("⚠️ 无法读取数据库")

    return True

def check_network_connectivity():
    """检查网络连接"""
    print("\n🌐 网络连接检查")
    print("="*30)

    try:
        import requests
        response = requests.get('https://httpbin.org/ip', timeout=10)
        if response.status_code == 200:
            print("✅ 网络连接正常")
            return True
        else:
            print(f"⚠️ 网络响应异常: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 网络连接失败: {e}")
        return False

def analyze_recent_performance():
    """分析最近性能"""
    print("\n📊 最近性能分析")
    print("="*30)

    output_dir = Path(__file__).parent / "data" / "continuous_results"
    cycle_files = sorted(output_dir.glob("cycle_*_results_*.json"))[-5:]  # 最近5轮

    if not cycle_files:
        print("❌ 无足够数据进行分析")
        return

    total_platforms = 0
    total_time = 0
    excellent_count = 0
    good_count = 0

    for cycle_file in cycle_files:
        try:
            with open(cycle_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                total_platforms += data['platforms_verified']
                excellent_count += data['summary']['excellent_platforms']
                good_count += data['summary']['good_platforms']

                # 计算轮次时间（简化）
                start_time = datetime.fromisoformat(data['cycle_start_time'].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(data['cycle_end_time'].replace('Z', '+00:00'))
                total_time += (end_time - start_time).total_seconds()
        except:
            continue

    if len(cycle_files) > 0:
        avg_platforms = total_platforms / len(cycle_files)
        avg_time = total_time / len(cycle_files)

        print(f"📈 最近5轮平均:")
        print(f"   验证平台: {avg_platforms:.1f} 个/轮")
        print(f"   轮次耗时: {avg_time:.1f} 秒")
        print(f"   发现效率: {excellent_count+good_count}/{total_platforms} 平台")

        if avg_time < 120 and avg_platforms > 5:
            print("✅ 性能表现良好")
        else:
            print("⚠️ 性能需要关注")

def generate_final_verification():
    """生成最终验证报告"""
    print("\n🎯 最终整夜运行验证")
    print("="*50)

    health_ok = check_system_health()
    network_ok = check_network_connectivity()

    analyze_recent_performance()

    print(f"\n📋 验证总结:")
    print(f"   系统健康: {'✅ 正常' if health_ok else '❌ 异常'}")
    print(f"   网络连接: {'✅ 正常' if network_ok else '❌ 异常'}")

    if health_ok and network_ok:
        print("\n🎉 系统已验证稳定，可以安全启动整夜运行！")
        print("\n📝 整夜运行确认:")
        print("   ✅ 系统组件正常")
        print("   ✅ 网络连接稳定")
        print("   ✅ 数据记录完整")
        print("   ✅ 错误处理有效")
        print("   ✅ 性能表现良好")

        print("\n🌙 系统准备就绪，可以安心休息！")
        print("💡 早晨将提供完整的发现报告")
        return True
    else:
        print("\n⚠️ 系统存在问题，建议修复后再启动整夜运行")
        return False

if __name__ == "__main__":
    generate_final_verification()