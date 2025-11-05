#!/usr/bin/env python3
"""
🌙 睡眠监控脚本 - 为用户准备早晨报告
监控连续发现系统，准备完整的结果汇总
"""

import json
import time
from datetime import datetime, timedelta
from pathlib import Path

class SleepMonitor:
    def __init__(self):
        self.output_dir = Path(__file__).parent / "data" / "continuous_results"
        self.start_time = datetime.now()

    def monitor_all_night(self):
        """整夜监控"""
        print("🌙 启动整夜监控模式")
        print("="*60)
        print(f"🕐 监控开始: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("💡 目标: 在您休息期间持续发现并验证新平台")
        print("📊 早晨将提供完整报告")
        print("="*60)

        while True:
            current_time = datetime.now()
            elapsed = current_time - self.start_time

            # 检查是否有新的轮次结果
            cycle_files = list(self.output_dir.glob("cycle_*_results_*.json"))
            if cycle_files:
                latest_cycle = max(cycle_files, key=lambda f: f.stat().st_mtime)
                try:
                    with open(latest_cycle, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                    print(f"\n🔄 {current_time.strftime('%H:%M:%S')} - 第{data['cycle_number']}轮完成")
                    print(f"   📊 验证平台: {data['platforms_verified']} 个")
                    print(f"   🌟 完美平台: {data['summary']['perfect_platforms']} 个")
                    print(f"   ⭐ 优秀平台: {data['summary']['excellent_platforms']} 个")
                    print(f"   ✅ 良好平台: {data['summary']['good_platforms']} 个")
                    print(f"   ⏱️  已运行: {elapsed.total_seconds()/60:.1f} 分钟")

                    # 如果发现完美平台，特别标注
                    if data['summary']['perfect_platforms'] > 0:
                        print("   🎉 发现完美平台！！！")

                except:
                    pass

            # 检查最终报告
            final_files = list(self.output_dir.glob("final_report_*.json"))
            if final_files:
                print("\n🌅 最终报告已生成！")
                self.generate_morning_report()
                break

            # 每30分钟报告一次状态
            if elapsed.total_seconds() % 1800 < 60:  # 每30分钟
                print(f"\n⏰ {current_time.strftime('%H:%M:%S')} - 系统运行正常")
                print(f"   ⏱️  已运行: {elapsed.total_seconds()/60:.0f} 分钟")

            time.sleep(60)  # 每分钟检查一次

    def generate_morning_report(self):
        """生成早晨报告"""
        print("\n" + "="*80)
        print("🌅 早安！整夜发现验证完成！")
        print("="*80)

        # 收集所有轮次结果
        cycle_files = sorted(self.output_dir.glob("cycle_*_results_*.json"))

        total_cycles = len(cycle_files)
        total_platforms = 0
        perfect_platforms = []
        excellent_platforms = []
        good_platforms = []

        for cycle_file in cycle_files:
            try:
                with open(cycle_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    total_platforms += data['platforms_verified']

                    for platform in data['verified_platforms']:
                        if platform['final_score'] == 100:
                            perfect_platforms.append(platform['platform_name'])
                        elif platform['final_score'] >= 80:
                            excellent_platforms.append(platform['platform_name'])
                        elif platform['final_score'] >= 50:
                            good_platforms.append(platform['platform_name'])
            except:
                pass

        print(f"📊 整夜运行统计:")
        print(f"   🔄 总轮次数: {total_cycles}")
        print(f"   📈 总验证平台: {total_platforms}")
        print(f"   🌟 发现完美平台: {len(perfect_platforms)}")
        print(f"   ⭐ 发现优秀平台: {len(excellent_platforms)}")
        print(f"   ✅ 发现良好平台: {len(good_platforms)}")

        if perfect_platforms:
            print(f"\n🎉 完美平台发现:")
            for platform in perfect_platforms:
                print(f"   🌟 {platform}")

        if excellent_platforms:
            print(f"\n⭐ 优秀平台发现:")
            for platform in excellent_platforms:
                print(f"   ⭐ {platform}")

        if good_platforms:
            print(f"\n✅ 良好平台发现:")
            for platform in good_platforms[:10]:  # 只显示前10个
                print(f"   ✅ {platform}")
            if len(good_platforms) > 10:
                print(f"   ... 还有 {len(good_platforms)-10} 个良好平台")

        # 检查最终报告
        final_files = list(self.output_dir.glob("final_report_*.json"))
        if final_files:
            latest_final = max(final_files, key=lambda f: f.stat().st_mtime)
            try:
                with open(latest_final, 'r', encoding='utf-8') as f:
                    final_data = json.load(f)

                print(f"\n📋 最终报告摘要:")
                print(f"   🕐 总运行时间: {final_data['total_duration_minutes']:.1f} 分钟")
                print(f"   🎯 发现效率: {final_data['discovery_efficiency']:.1f}%")
                print(f"   🏆 最佳平台: {final_data.get('top_performer', 'N/A')}")

            except:
                pass

        print("\n" + "="*80)
        print("💡 建议下一步:")
        print("   1. 详细分析发现的完美平台")
        print("   2. 对优秀平台进行深度验证")
        print("   3. 更新验证算法基于新发现")
        print("   4. 准备下一轮批量验证")
        print("="*80)

def main():
    monitor = SleepMonitor()

    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--morning-report":
        monitor.generate_morning_report()
    else:
        monitor.monitor_all_night()

if __name__ == "__main__":
    main()