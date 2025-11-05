#!/usr/bin/env python3
"""
🚀 Simple Platform Discovery System - 持续运行脚本
极简但稳定的4-Agent平台发现系统 - 持续运行

这个脚本会启动一个后台进程，持续运行系统，实现24小时不间断的平台发现和验证。

使用方法：
python3 run_continuous.py [start|stop|status|restart]
"""

import json
import time
import os
import signal
import subprocess
import sys
from datetime import datetime
from pathlib import Path

class ContinuousRunner:
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.pid_file = self.script_dir / "continuous_runner.pid"
        self.log_file = self.script_dir / "continuous_runner.log"
        self.config_file = self.script_dir / "config" / "system_config.json"

    def log_message(self, message):
        """记录日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)

        # 写入日志文件
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry + '\n')
        except Exception as e:
            print(f"❌ 写入日志失败: {e}")

    def load_config(self):
        """加载配置"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            self.log_message("❌ 配置文件未找到")
            return None

    def start_continuous_system(self):
        """启动持续系统"""
        self.log_message("🚀 启动持续运行系统...")

        # 检查是否已经在运行
        if self.is_running():
            self.log_message("⚠️ 系统已在运行中")
            return False

        # 启动主控制器
        try:
            # 使用后台模式启动主控制器
            process = subprocess.Popen(
                [sys.executable, "master_controller.py", "start"],
                cwd=self.script_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # 保存PID
            with open(self.pid_file, 'w') as f:
                f.write(str(process.pid))

            self.log_message(f"✅ 主控制器已启动，PID: {process.pid}")

            # 等待一下确保启动成功
            time.sleep(2)

            if process.poll() is None:  # 进程仍在运行
                self.log_message("✅ 持续系统启动成功!")
                self.log_message("📊 系统将在后台持续运行")
                self.log_message("📋 使用 'python3 run_continuous.py status' 查看状态")
                self.log_message("🛑 使用 'python3 run_continuous.py stop' 停止系统")
                return True
            else:
                self.log_message("❌ 主控制器启动失败")
                return False

        except Exception as e:
            self.log_message(f"❌ 启动失败: {e}")
            return False

    def stop_continuous_system(self):
        """停止持续系统"""
        self.log_message("🛑 停止持续运行系统...")

        if not self.is_running():
            self.log_message("ℹ️ 系统未在运行")
            return True

        try:
            # 读取PID
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())

            self.log_message(f"📋 找到运行进程 PID: {pid}")

            # 尝试优雅停止
            self.log_message("🔄 发送停止信号...")
            os.kill(pid, signal.SIGTERM)

            # 等待进程停止
            for i in range(10):
                try:
                    os.kill(pid, 0)  # 检查进程是否存在
                    time.sleep(1)
                except OSError:
                    self.log_message("✅ 进程已停止")
                    break
            else:
                # 强制停止
                self.log_message("⚠️ 强制停止进程...")
                os.kill(pid, signal.SIGKILL)
                self.log_message("✅ 进程已强制停止")

            # 清理PID文件
            if self.pid_file.exists():
                os.remove(self.pid_file)

            self.log_message("✅ 持续系统已停止")
            return True

        except FileNotFoundError:
            self.log_message("⚠️ PID文件不存在")
            return True
        except Exception as e:
            self.log_message(f"❌ 停止失败: {e}")
            return False

    def restart_continuous_system(self):
        """重启持续系统"""
        self.log_message("🔄 重启持续运行系统...")
        self.stop_continuous_system()
        time.sleep(2)
        return self.start_continuous_system()

    def is_running(self):
        """检查系统是否在运行"""
        if not self.pid_file.exists():
            return False

        try:
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())

            # 检查进程是否存在
            os.kill(pid, 0)
            return True

        except (FileNotFoundError, OSError):
            # PID文件存在但进程不存在，清理PID文件
            if self.pid_file.exists():
                try:
                    os.remove(self.pid_file)
                except:
                    pass
            return False

    def show_status(self):
        """显示系统状态"""
        print("\n📊 持续运行系统状态")
        print("=" * 50)

        if self.is_running():
            print("🟢 系统状态: 运行中")

            # 读取PID
            try:
                with open(self.pid_file, 'r') as f:
                    pid = int(f.read().strip())
                print(f"📋 进程PID: {pid}")

                # 显示进程信息
                try:
                    result = subprocess.run(
                        ["ps", "-p", str(pid), "-o", "etime,pcpu,pmem,comm"],
                        capture_output=True,
                        text=True
                    )
                    if result.returncode == 0:
                        lines = result.stdout.strip().split('\n')
                        if len(lines) > 1:
                            info = lines[1].split()
                            print(f"⏱️ 运行时间: {info[0]}")
                            print(f"💻 CPU使用: {info[1]}%")
                            print(f"🧠 内存使用: {info[2]}%")
                            print(f"🔧 进程名: {info[3]}")
                except:
                    print("📋 无法获取进程详细信息")
            except:
                print("📋 无法读取PID信息")

            # 显示最近的日志
            if self.log_file.exists():
                print("\n📝 最近日志 (最后10行):")
                try:
                    with open(self.log_file, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        for line in lines[-10:]:
                            print(f"  {line.strip()}")
                except Exception as e:
                    print(f"❌ 读取日志失败: {e}")
        else:
            print("🔴 系统状态: 未运行")
            print("💡 使用 'python3 run_continuous.py start' 启动系统")

        # 检查配置文件
        if self.config_file.exists():
            print(f"✅ 配置文件: {self.config_file}")
            config = self.load_config()
            if config:
                print(f"📊 已知平台: {config['agents']['deduplication_agent']['platforms_known']}")
        else:
            print("❌ 配置文件未找到")

        # 显示数据文件状态
        data_files = [
            "data/known_platforms.json",
            "data/discovery_queue.json",
            "data/verification_results.json",
            "data/system_status.json"
        ]

        print("\n📁 数据文件状态:")
        for file_path in data_files:
            full_path = self.script_dir / file_path
            if full_path.exists():
                size = full_path.stat().st_size
                print(f"  ✅ {file_path:<35} ({size:,} bytes)")
            else:
                print(f"  ❌ {file_path:<35} (不存在)")

    def monitor_system(self):
        """监控系统状态"""
        self.log_message("🔍 开始监控系统状态...")

        try:
            while self.is_running():
                # 检查系统响应
                try:
                    # 检查主控制器状态
                    status_file = self.script_dir / "data" / "system_status.json"
                    if status_file.exists():
                        with open(status_file, 'r') as f:
                            status = json.load(f)

                        system_status = status.get("system", {})
                        if system_status.get("status") != "running":
                            self.log_message("⚠️ 检测到主控制器状态异常，尝试重启...")
                            self.restart_continuous_system()
                            break

                        # 检查心跳
                        last_heartbeat = system_status.get("last_heartbeat")
                        if last_heartbeat:
                            heartbeat_time = datetime.fromisoformat(last_heartbeat.replace('Z', '+00:00'))
                            time_diff = (datetime.now() - heartbeat_time).total_seconds()

                            if time_diff > 300:  # 5分钟无心跳
                                self.log_message("⚠️ 检测到心跳超时，尝试重启...")
                                self.restart_continuous_system()
                                break

                    # 每分钟检查一次
                    time.sleep(60)

                except Exception as e:
                    self.log_message(f"❌ 监控检查失败: {e}")
                    time.sleep(30)

        except KeyboardInterrupt:
            self.log_message("⏹️ 用户中断监控")
        except Exception as e:
            self.log_message(f"❌ 监控错误: {e}")

    def setup_autostart(self):
        """设置开机自启动（简化版本）"""
        self.log_message("🔧 设置开机自启动...")

        # 创建启动脚本
        startup_script = self.script_dir / "startup.sh"
        startup_content = f"""#!/bin/bash
# Simple Platform Discovery System 启动脚本
# 生成时间: {datetime.now().isoformat()}

cd "{self.script_dir}"
echo "$(date): 启动 Simple Platform Discovery System..."
python3 run_continuous.py start

# 等待系统稳定
sleep 10

# 检查状态
python3 run_continuous.py status
"""

        try:
            with open(startup_script, 'w', encoding='utf-8') as f:
                f.write(startup_content)

            # 添加执行权限
            os.chmod(startup_script, 0o755)

            self.log_message(f"✅ 启动脚本已创建: {startup_script}")
            self.log_message("💡 要实现开机自启动，请将此脚本添加到系统的启动项中")

        except Exception as e:
            self.log_message(f"❌ 创建启动脚本失败: {e}")

def main():
    """主函数"""
    runner = ContinuousRunner()

    import sys
    if len(sys.argv) < 2:
        runner.show_status()
        print("\n使用方法:")
        print("  python3 run_continuous.py start               # 启动持续运行")
        print("  python3 run_continuous.py stop                # 停止持续运行")
        print("  python3 run_continuous.py restart             # 重启持续运行")
        print("  python3 run_continuous.py status              # 查看系统状态")
        print("  python3 run_continuous.py monitor             # 监控系统状态")
        print("  python3 run_continuous.py setup               # 设置自启动")
        return

    command = sys.argv[1].lower()

    if command == "start":
        runner.start_continuous_system()

    elif command == "stop":
        runner.stop_continuous_system()

    elif command == "restart":
        runner.restart_continuous_system()

    elif command == "status":
        runner.show_status()

    elif command == "monitor":
        runner.monitor_system()

    elif command == "setup":
        runner.setup_autostart()

    else:
        print(f"❌ 未知命令: {command}")
        print("可用命令: start, stop, restart, status, monitor, setup")

if __name__ == "__main__":
    main()