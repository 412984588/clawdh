#!/usr/bin/env python3
"""
🖥️ 5-Agent AA架构实时可视化监控面板
让用户实时看到5-Agent系统的工作状态，彻底告别后台运行
"""

import json
import time
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import threading
import subprocess

class Visual5AgentMonitor:
    """5-Agent实时可视化监控面板"""

    def __init__(self):
        self.is_running = True
        self.current_cycle = 0
        self.agent_status = {
            'DA': {'status': '待命中', 'color': '🟢', 'progress': 0},
            'VA': {'status': '待命中', 'color': '🟡', 'progress': 0},
            'AA': {'status': '待命中', 'color': '🔴', 'progress': 0},
            'CA': {'status': '待命中', 'color': '🔵', 'progress': 0},
            'PA': {'status': '待命中', 'color': '🟣', 'progress': 0}
        }
        self.system_stats = {
            'total_discovered': 0,
            'va_verified': 0,
            'aa_approved': 0,
            'current_platform': '无',
            'last_update': datetime.now().strftime('%H:%M:%S')
        }
        self.recent_results = []

    def clear_screen(self):
        """清屏"""
        os.system('clear' if os.name == 'posix' else 'cls')

    def draw_header(self):
        """绘制标题头部"""
        print("🖥️" + "="*118)
        print("🚀 5-Agent AA架构实时可视化监控面板 - 用户洞察设计")
        print("🏆 基于您的AA洞察：审计分配器作为质量最后防线")
        print("🔍 彻底告别后台运行 - 每个Agent工作状态实时可见")
        print("🖥️" + "="*118)
        print()

    def draw_agent_status(self):
        """绘制Agent状态面板"""
        print("🤖 5-Agent实时工作状态:")
        print("-" * 120)

        # 5个Agent状态并排显示
        agent_display = []
        for agent_name, agent_info in self.agent_status.items():
            status_block = f"""
{agent_info['color']} {agent_name}-Agent
   状态: {agent_info['status']}
   进度: {agent_info['progress']}%
   {'█' * (agent_info['progress']//5)}{'░' * (20 - agent_info['progress']//5)}"""
            agent_display.append(status_block)

        # 并排显示5个Agent
        for i in range(0, len(agent_display), 2):
            if i + 1 < len(agent_display):
                print(agent_display[i].rstrip() + "  " + agent_display[i+1].lstrip())
            else:
                print(agent_display[i])
        print("-" * 120)
        print()

    def draw_system_stats(self):
        """绘制系统统计"""
        print("📊 系统实时统计:")
        print("-" * 120)
        print(f"🔄 当前轮次: {self.current_cycle}")
        print(f"🔍 DA发现平台: {self.system_stats['total_discovered']} 个")
        print(f"🔬 VA验证通过: {self.system_stats['va_verified']} 个")
        print(f"🛡️ AA最终批准: {self.system_stats['aa_approved']} 个")
        print(f"🎯 当前处理: {self.system_stats['current_platform']}")
        print(f"⏰ 最后更新: {self.system_stats['last_update']}")

        # 质量控制指标
        if self.system_stats['va_verified'] > 0:
            approval_rate = (self.system_stats['aa_approved'] / self.system_stats['va_verified']) * 100
            print(f"📈 AA通过率: {approval_rate:.1f}%")
        print("-" * 120)
        print()

    def draw_recent_results(self):
        """绘制最近结果"""
        print("📋 最近验证结果 (实时更新):")
        print("-" * 120)
        if self.recent_results:
            for result in self.recent_results[-10:]:  # 显示最近10个结果
                platform = result.get('platform', '未知平台')
                status = result.get('status', '未知')
                score = result.get('score', 0)
                reason = result.get('reason', '')
                timestamp = result.get('time', '')

                status_icon = "✅" if status == "通过" else "❌" if status == "拒绝" else "⏳"
                print(f"{status_icon} {platform:<20} | {score:>3}/100 | {status:<6} | {reason:<30} | {timestamp}")
        else:
            print("🔄 等待验证结果...")
        print("-" * 120)
        print()

    def draw_workflow_diagram(self):
        """绘制工作流程图"""
        print("🔄 5-Agent AA架构工作流程:")
        print("-" * 120)

        workflow = """
🟢 DA数据发现 → 🟡 VA网络验证 → 🔴 AA质量审计 → 🔵 CA结果汇总 → 🟣 PA报告生成
     ↓              ↓              ↓              ↓              ↓
  搜索支付平台    真实网站访问    独立质量检查    数据整合汇总    生成可视化报告
        \n🏆 您的AA洞察: AA审计分配器作为质量控制的最后防线，确保零误报！"""

        print(workflow)
        print("-" * 120)
        print()

    def draw_footer(self):
        """绘制底部信息"""
        print("🎯 实时监控说明:")
        print("  • 每个Agent的工作状态实时更新")
        print("  • AA审计确保只有真正的支付平台通过验证")
        print("  • 完全真实网络验证，拒绝任何模拟")
        print("  • 按Ctrl+C停止监控")
        print("🖥️" + "="*118)

    def update_agent_status(self, agent_name: str, status: str, progress: int):
        """更新Agent状态"""
        if agent_name in self.agent_status:
            self.agent_status[agent_name]['status'] = status
            self.agent_status[agent_name]['progress'] = progress
            self.system_stats['last_update'] = datetime.now().strftime('%H:%M:%S')

    def add_result(self, platform: str, status: str, score: int, reason: str):
        """添加验证结果"""
        result = {
            'platform': platform,
            'status': status,
            'score': score,
            'reason': reason,
            'time': datetime.now().strftime('%H:%M:%S')
        }
        self.recent_results.append(result)
        if len(self.recent_results) > 20:  # 只保留最近20个结果
            self.recent_results.pop(0)

    def refresh_display(self):
        """刷新显示"""
        self.clear_screen()
        self.draw_header()
        self.draw_agent_status()
        self.draw_system_stats()
        self.draw_recent_results()
        self.draw_workflow_diagram()
        self.draw_footer()

    def monitor_file_changes(self):
        """监控文件变化"""
        data_dir = Path(__file__).parent / "data" / "true_aa_results"
        data_dir.mkdir(exist_ok=True)

        latest_report = None

        while self.is_running:
            try:
                # 查找最新的报告文件
                report_files = list(data_dir.glob("true_aa_cycle_*_report_*.json"))
                if report_files:
                    latest_file = max(report_files, key=lambda x: x.stat().st_mtime)

                    if latest_file != latest_report:
                        latest_report = latest_file

                        # 读取报告并更新状态
                        with open(latest_file, 'r', encoding='utf-8') as f:
                            report = json.load(f)

                        cycle_data = report.get('cycle_data', {})
                        self.current_cycle = cycle_data.get('cycle_number', 0)
                        self.system_stats['aa_approved'] = cycle_data.get('total_approved', 0)

                        # 更新Agent状态
                        self.agent_status['DA']['status'] = '✅ 完成'
                        self.agent_status['DA']['progress'] = 100
                        self.agent_status['VA']['status'] = '✅ 完成'
                        self.agent_status['VA']['progress'] = 100
                        self.agent_status['AA']['status'] = '✅ 完成'
                        self.agent_status['AA']['progress'] = 100
                        self.agent_status['CA']['status'] = '✅ 完成'
                        self.agent_status['CA']['progress'] = 100
                        self.agent_status['PA']['status'] = '✅ 完成'
                        self.agent_status['PA']['progress'] = 100

                        # 处理平台结果
                        approved_platforms = cycle_data.get('final_approved_platforms', [])
                        for platform in approved_platforms:
                            self.add_result(
                                platform['platform_name'],
                                '通过',
                                platform['aa_score'],
                                platform['reason']
                            )

            except Exception as e:
                print(f"监控错误: {e}")

            time.sleep(2)  # 每2秒检查一次

    def start_5agent_system_visible(self):
        """启动5-Agent系统并可视化"""
        print("🚀 正在启动5-Agent AA架构系统...")

        # 在新线程中启动5-Agent系统
        def run_system():
            try:
                system_path = Path(__file__).parent / "true_aa_five_agent_system.py"
                process = subprocess.Popen(
                    ['python3', str(system_path)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True,
                    cwd=str(Path(__file__).parent)
                )

                # 实时读取输出并更新状态
                for line in process.stdout:
                    if not self.is_running:
                        process.terminate()
                        break

                    line = line.strip()
                    if "Phase 1:" in line:
                        self.update_agent_status('DA', '🔍 发现中', 20)
                    elif "DA发现" in line:
                        self.update_agent_status('DA', '✅ 完成', 100)
                    elif "Phase 2:" in line:
                        self.update_agent_status('VA', '🔬 验证中', 40)
                    elif "验证进度:" in line:
                        # 提取平台名
                        if "-" in line:
                            platform = line.split("-")[-1].strip()
                            self.system_stats['current_platform'] = platform
                        self.update_agent_status('VA', '🔬 验证中', 60)
                    elif "VA完成验证" in line:
                        self.update_agent_status('VA', '✅ 完成', 100)
                    elif "Phase 3:" in line:
                        self.update_agent_status('AA', '🛡️ 审计中', 60)
                    elif "AA审计:" in line:
                        self.update_agent_status('AA', '🛡️ 审计中', 80)
                    elif "AA审计完成" in line:
                        self.update_agent_status('AA', '✅ 完成', 100)
                    elif "Phase 4:" in line:
                        self.update_agent_status('CA', '⚙️ 汇总中', 70)
                    elif "CA汇总完成" in line:
                        self.update_agent_status('CA', '✅ 完成', 100)
                    elif "Phase 5:" in line:
                        self.update_agent_status('PA', '📊 生成中', 80)
                    elif "PA报告生成完成" in line:
                        self.update_agent_status('PA', '✅ 完成', 100)

            except Exception as e:
                print(f"系统启动错误: {e}")

        # 启动系统线程
        system_thread = threading.Thread(target=run_system)
        system_thread.daemon = True
        system_thread.start()

        # 启动文件监控线程
        monitor_thread = threading.Thread(target=self.monitor_file_changes)
        monitor_thread.daemon = True
        monitor_thread.start()

    def run(self):
        """运行可视化监控"""
        self.start_5agent_system_visible()

        try:
            while self.is_running:
                self.refresh_display()
                time.sleep(3)  # 每3秒刷新一次

        except KeyboardInterrupt:
            print("\n\n🛑 用户停止监控")
            self.is_running = False
            print("✅ 5-Agent系统已停止")

def main():
    """主函数"""
    monitor = Visual5AgentMonitor()
    print("🖥️ 启动5-Agent AA架构实时可视化监控...")
    print("🔍 您将看到每个Agent的实时工作状态")
    print("⚠️ 按Ctrl+C可以随时停止监控")
    time.sleep(3)

    monitor.run()

if __name__ == "__main__":
    main()