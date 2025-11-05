#!/usr/bin/env python3
"""
🎯 Simple Platform Discovery System - Master Controller
极简但稳定的4-Agent平台发现系统 - 主控制器

职责：
1. 协调各个Agent的工作
2. 管理系统状态
3. 处理任务队列
4. 监控系统健康

使用方法：
python3 master_controller.py [start|status|stop]
"""

import json
import time
import os
from datetime import datetime
from pathlib import Path

class MasterController:
    def __init__(self):
        self.config_path = Path(__file__).parent / "config" / "system_config.json"
        self.data_path = Path(__file__).parent / "data"
        self.status_file = self.data_path / "system_status.json"

        # 确保数据目录存在
        self.data_path.mkdir(exist_ok=True)

        # 加载配置
        self.config = self.load_config()
        self.status = self.load_status()

    def load_config(self):
        """加载系统配置"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ 配置文件未找到: {self.config_path}")
            return None

    def load_status(self):
        """加载系统状态"""
        if self.status_file.exists():
            try:
                with open(self.status_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ 状态文件损坏，重新创建: {e}")

        # 创建默认状态
        return {
            "system": {
                "status": "stopped",
                "start_time": None,
                "last_heartbeat": None,
                "total_runtime_seconds": 0
            },
            "agents": {
                "master_controller": {"status": "idle", "last_check": None},
                "discovery_agent": {"status": "idle", "last_run": None, "discoveries_count": 0},
                "deduplication_agent": {"status": "idle", "last_check": None, "platforms_known": 13},
                "verification_agent": {"status": "idle", "last_run": None, "verifications_count": 0}
            },
            "queues": {
                "discovery_queue": [],
                "verification_queue": [],
                "completed_queue": []
            },
            "statistics": {
                "total_discoveries": 0,
                "total_verifications": 0,
                "successful_verifications": 0,
                "failed_verifications": 0,
                "success_rate": 0.0
            }
        }

    def save_status(self):
        """保存系统状态"""
        self.status["system"]["last_heartbeat"] = datetime.now().isoformat()
        try:
            with open(self.status_file, 'w', encoding='utf-8') as f:
                json.dump(self.status, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ 保存状态失败: {e}")

    def start_system(self):
        """启动系统"""
        print("🚀 启动Simple Platform Discovery System...")

        # 更新系统状态
        self.status["system"]["status"] = "running"
        self.status["system"]["start_time"] = datetime.now().isoformat()
        self.status["agents"]["master_controller"]["status"] = "active"
        self.status["agents"]["master_controller"]["last_check"] = datetime.now().isoformat()

        self.save_status()

        print("✅ 系统启动成功!")
        print(f"📊 已知平台数量: {self.status['agents']['deduplication_agent']['platforms_known']}")
        print(f"🔄 系统状态: {self.status['system']['status']}")

        # 启动主循环
        self.run_main_loop()

    def run_main_loop(self):
        """主循环 - 协调各个Agent"""
        print("\n🔄 启动主循环...")

        try:
            while self.status["system"]["status"] == "running":
                # 更新心跳
                self.status["agents"]["master_controller"]["last_check"] = datetime.now().isoformat()

                # 1. 检查Discovery Agent
                self.check_discovery_agent()

                # 2. 检查Deduplication Agent
                self.check_deduplication_agent()

                # 3. 检查Verification Agent
                self.check_verification_agent()

                # 4. 更新统计信息
                self.update_statistics()

                # 5. 保存状态
                self.save_status()

                # 6. 等待下一个循环
                print(f"💓 心跳更新 - {datetime.now().strftime('%H:%M:%S')}")
                time.sleep(60)  # 每分钟检查一次

        except KeyboardInterrupt:
            print("\n⏹️ 用户中断，正在安全停止系统...")
            self.stop_system()
        except Exception as e:
            print(f"❌ 系统错误: {e}")
            self.status["system"]["status"] = "error"
            self.save_status()

    def check_discovery_agent(self):
        """检查并触发Discovery Agent"""
        last_run = self.status["agents"]["discovery_agent"]["last_run"]
        interval_hours = self.config["schedule"]["discovery_interval_hours"]

        if not last_run or self.should_run_again(last_run, interval_hours):
            print("🔍 启动Discovery Agent - 发现新平台...")
            # 这里应该调用Discovery Agent
            # 简化版本：直接记录状态
            self.status["agents"]["discovery_agent"]["status"] = "running"
            self.status["agents"]["discovery_agent"]["last_run"] = datetime.now().isoformat()

            # 模拟发现过程
            self.simulate_discovery()

            self.status["agents"]["discovery_agent"]["status"] = "idle"

    def check_deduplication_agent(self):
        """检查并触发Deduplication Agent"""
        last_check = self.status["agents"]["deduplication_agent"]["last_check"]
        interval_minutes = self.config["schedule"]["deduplication_check_interval_minutes"]

        if not last_check or self.should_run_again(last_check, interval_minutes):
            print("🔍 启动Deduplication Agent - 去重检查...")
            self.status["agents"]["deduplication_agent"]["status"] = "running"
            self.status["agents"]["deduplication_agent"]["last_check"] = datetime.now().isoformat()

            # 更新已知平台数量
            known_platforms_file = self.data_path / "known_platforms.json"
            if known_platforms_file.exists():
                with open(known_platforms_file, 'r') as f:
                    known_platforms = json.load(f)
                    self.status["agents"]["deduplication_agent"]["platforms_known"] = len(known_platforms["platforms"])

            self.status["agents"]["deduplication_agent"]["status"] = "idle"

    def check_verification_agent(self):
        """检查并触发Verification Agent"""
        last_run = self.status["agents"]["verification_agent"]["last_run"]
        interval_hours = self.config["schedule"]["verification_interval_hours"]

        if not last_run or self.should_run_again(last_run, interval_hours):
            # 检查是否有待验证的平台
            if len(self.status["queues"]["verification_queue"]) > 0:
                print("🔍 启动Verification Agent - 验证平台...")
                self.status["agents"]["verification_agent"]["status"] = "running"
                self.status["agents"]["verification_agent"]["last_run"] = datetime.now().isoformat()

                # 模拟验证过程
                self.simulate_verification()

                self.status["agents"]["verification_agent"]["status"] = "idle"

    def simulate_discovery(self):
        """模拟发现过程 - 简化版本"""
        # 在实际实现中，这里会调用搜索工具
        print("  🔍 搜索新平台...")
        time.sleep(2)  # 模拟搜索时间

        # 模拟发现结果
        new_platforms = [
            {"name": "NewPlatform1", "domain": "newplatform1.com", "url": "https://newplatform1.com"},
            {"name": "NewPlatform2", "domain": "newplatform2.com", "url": "https://newplatform2.com"}
        ]

        # 添加到验证队列
        for platform in new_platforms:
            self.status["queues"]["verification_queue"].append(platform)
            self.status["statistics"]["total_discoveries"] += 1

        print(f"  ✅ 发现 {len(new_platforms)} 个新平台，添加到验证队列")

    def simulate_verification(self):
        """模拟验证过程 - 简化版本"""
        if len(self.status["queues"]["verification_queue"]) == 0:
            return

        # 取出一个平台进行验证
        platform = self.status["queues"]["verification_queue"].pop(0)

        print(f"  🔍 验证平台: {platform['name']} ({platform['domain']})")
        time.sleep(3)  # 模拟验证时间

        # 模拟验证结果 (70%成功率)
        import random
        success = random.random() < 0.7

        if success:
            print(f"  ✅ {platform['name']} 验证通过!")
            self.status["queues"]["completed_queue"].append({
                **platform,
                "status": "verified",
                "verification_time": datetime.now().isoformat()
            })
            self.status["statistics"]["successful_verifications"] += 1
        else:
            print(f"  ❌ {platform['name']} 验证失败")
            self.status["statistics"]["failed_verifications"] += 1

        self.status["statistics"]["total_verifications"] += 1
        self.status["agents"]["verification_agent"]["verifications_count"] += 1

    def update_statistics(self):
        """更新统计信息"""
        total = self.status["statistics"]["total_verifications"]
        successful = self.status["statistics"]["successful_verifications"]

        if total > 0:
            self.status["statistics"]["success_rate"] = (successful / total) * 100

        # 更新成功率
        if self.config and "agents" in self.config:
            self.status["agents"]["verification_agent"]["success_rate"] = self.status["statistics"]["success_rate"]

    def should_run_again(self, last_run_time, interval):
        """检查是否应该再次运行"""
        if not last_run_time:
            return True

        try:
            last_run = datetime.fromisoformat(last_run_time.replace('Z', '+00:00'))
            now = datetime.now()

            if isinstance(interval, int) and interval < 24:  # 分钟
                delta_minutes = (now - last_run).total_seconds() / 60
                return delta_minutes >= interval
            else:  # 小时
                delta_hours = (now - last_run).total_seconds() / 3600
                return delta_hours >= interval

        except Exception as e:
            print(f"⚠️ 时间解析错误: {e}")
            return True

    def stop_system(self):
        """停止系统"""
        print("⏹️ 正在停止系统...")

        self.status["system"]["status"] = "stopped"
        self.status["agents"]["master_controller"]["status"] = "stopped"

        # 计算总运行时间
        if self.status["system"]["start_time"]:
            start_time = datetime.fromisoformat(self.status["system"]["start_time"].replace('Z', '+00:00'))
            runtime_seconds = (datetime.now() - start_time).total_seconds()
            self.status["system"]["total_runtime_seconds"] = runtime_seconds

            hours = int(runtime_seconds // 3600)
            minutes = int((runtime_seconds % 3600) // 60)
            print(f"📊 总运行时间: {hours}小时 {minutes}分钟")

        self.save_status()
        print("✅ 系统已安全停止")

    def show_status(self):
        """显示系统状态"""
        print("\n📊 Simple Platform Discovery System 状态")
        print("=" * 50)

        print(f"🔄 系统状态: {self.status['system']['status']}")
        if self.status['system']['start_time']:
            start_time = datetime.fromisoformat(self.status['system']['start_time'].replace('Z', '+00:00'))
            print(f"⏰ 启动时间: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")

        print(f"\n🤖 Agent状态:")
        for agent_name, agent_status in self.status['agents'].items():
            print(f"  • {agent_name}: {agent_status['status']}")

        print(f"\n📈 统计信息:")
        print(f"  • 总发现: {self.status['statistics']['total_discoveries']}")
        print(f"  • 总验证: {self.status['statistics']['total_verifications']}")
        print(f"  • 成功验证: {self.status['statistics']['successful_verifications']}")
        print(f"  • 成功率: {self.status['statistics']['success_rate']:.1f}%")

        print(f"\n📋 队列状态:")
        print(f"  • 发现队列: {len(self.status['queues']['discovery_queue'])}")
        print(f"  • 验证队列: {len(self.status['queues']['verification_queue'])}")
        print(f"  • 完成队列: {len(self.status['queues']['completed_queue'])}")

def main():
    """主函数"""
    controller = MasterController()

    import sys
    if len(sys.argv) < 2:
        controller.show_status()
        print("\n使用方法:")
        print("  python3 master_controller.py start   # 启动系统")
        print("  python3 master_controller.py status  # 查看状态")
        print("  python3 master_controller.py stop    # 停止系统")
        return

    command = sys.argv[1].lower()

    if command == "start":
        controller.start_system()
    elif command == "status":
        controller.show_status()
    elif command == "stop":
        controller.stop_system()
    else:
        print(f"❌ 未知命令: {command}")
        print("可用命令: start, status, stop")

if __name__ == "__main__":
    main()