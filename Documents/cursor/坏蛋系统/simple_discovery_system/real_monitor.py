#!/usr/bin/env python3
"""
🔍 REAL MONITOR - 真正的实时监控系统
解决后台脚本卡住和模拟执行问题

核心特性：
1. 真实超时检测 - 超过5分钟自动重启
2. 实时心跳监控 - 每分钟检查进程状态
3. 强制重启机制 - 卡住进程自动杀死重启
4. 真实执行验证 - 使用官方技能而非模拟
5. 实时状态报告 - 每分钟输出系统状态
"""

import json
import time
import subprocess
import os
import signal
import psutil
from datetime import datetime
from pathlib import Path

class RealMonitor:
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.pid_file = self.script_dir / "real_monitor.pid"
        self.log_file = self.script_dir / "real_monitor.log"
        self.status_file = self.script_dir / "data" / "system_status.json"
        self.max_stale_time = 300  # 5分钟无心跳就重启
        self.check_interval = 60   # 每分钟检查一次

    def log_message(self, message):
        """记录实时日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)

        # 写入日志文件
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry + '\n')
        except Exception as e:
            print(f"❌ 写入日志失败: {e}")

    def is_process_alive(self, pid):
        """检查进程是否真正存活"""
        try:
            # 使用psutil检查进程状态
            process = psutil.Process(pid)
            return process.is_running() and process.status() != psutil.STATUS_ZOMBIE
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return False

    def get_process_cpu_memory(self, pid):
        """获取进程CPU和内存使用情况"""
        try:
            process = psutil.Process(pid)
            cpu_percent = process.cpu_percent(interval=1)
            memory_info = process.memory_info()
            memory_mb = memory_info.rss / 1024 / 1024
            return cpu_percent, memory_mb
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return None, None

    def check_heartbeat(self):
        """检查系统心跳"""
        try:
            with open(self.status_file, 'r', encoding='utf-8') as f:
                status = json.load(f)

            last_heartbeat = status.get("system", {}).get("last_heartbeat")
            if not last_heartbeat:
                return False, "无心跳记录"

            heartbeat_time = datetime.fromisoformat(last_heartbeat.replace('Z', '+00:00'))
            time_diff = (datetime.now() - heartbeat_time).total_seconds()

            if time_diff > self.max_stale_time:
                return False, f"心跳超时 {time_diff:.0f} 秒"

            return True, f"心跳正常 ({time_diff:.0f} 秒前)"

        except Exception as e:
            return False, f"检查心跳失败: {e}"

    def kill_stale_process(self, pid):
        """强制杀死卡住的进程"""
        try:
            self.log_message(f"🔪 强制杀死卡住进程 PID: {pid}")

            # 先尝试优雅停止
            os.kill(pid, signal.SIGTERM)
            time.sleep(5)

            # 如果还在运行，强制杀死
            if self.is_process_alive(pid):
                self.log_message(f"💀 强制杀死进程 PID: {pid}")
                os.kill(pid, signal.SIGKILL)
                time.sleep(2)

            # 确认进程已死
            if not self.is_process_alive(pid):
                self.log_message(f"✅ 进程已成功杀死")
                return True
            else:
                self.log_message(f"❌ 进程仍然存活")
                return False

        except ProcessLookupError:
            self.log_message(f"✅ 进程已不存在")
            return True
        except Exception as e:
            self.log_message(f"❌ 杀死进程失败: {e}")
            return False

    def start_fresh_system(self):
        """启动全新的系统实例"""
        try:
            self.log_message("🚀 启动全新的系统实例...")

            # 启动主控制器
            process = subprocess.Popen(
                ["python3", "master_controller.py", "start"],
                cwd=self.script_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )

            # 等待启动
            time.sleep(3)

            if process.poll() is None:
                self.log_message(f"✅ 新系统实例启动成功，PID: {process.pid}")

                # 更新PID文件
                with open(self.pid_file, 'w') as f:
                    f.write(str(process.pid))

                return process.pid
            else:
                self.log_message("❌ 新系统实例启动失败")
                return None

        except Exception as e:
            self.log_message(f"❌ 启动新实例失败: {e}")
            return None

    def check_and_fix_system(self):
        """检查并修复系统问题"""
        self.log_message("🔍 检查系统状态...")

        # 检查PID文件
        if not self.pid_file.exists():
            self.log_message("⚠️ PID文件不存在，启动新系统")
            new_pid = self.start_fresh_system()
            return new_pid is not None

        # 读取PID
        try:
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())
        except:
            self.log_message("❌ PID文件损坏，重新启动")
            if self.pid_file.exists():
                os.remove(self.pid_file)
            new_pid = self.start_fresh_system()
            return new_pid is not None

        # 检查进程是否存活
        if not self.is_process_alive(pid):
            self.log_message(f"❌ 进程 PID: {pid} 已死亡，重新启动")
            new_pid = self.start_fresh_system()
            return new_pid is not None

        # 检查心跳
        heartbeat_ok, heartbeat_msg = self.check_heartbeat()
        if not heartbeat_ok:
            self.log_message(f"⚠️ {heartbeat_msg}，重启系统")

            # 杀死卡住的进程
            if self.kill_stale_process(pid):
                # 启动新系统
                new_pid = self.start_fresh_system()
                return new_pid is not None
            else:
                self.log_message("❌ 无法杀死卡住的进程")
                return False

        # 获取进程资源使用情况
        cpu, memory = self.get_process_cpu_memory(pid)
        if cpu is not None:
            self.log_message(f"📊 PID: {pid} - CPU: {cpu:.1f}%, 内存: {memory:.1f}MB")

        self.log_message(f"✅ 系统状态正常 - {heartbeat_msg}")
        return True

    def run_real_monitor(self):
        """运行真正的实时监控"""
        self.log_message("🚀 启动REAL MONITOR实时监控系统")
        self.log_message(f"📊 检查间隔: {self.check_interval} 秒")
        self.log_message(f"⏰ 超时阈值: {self.max_stale_time} 秒")

        # 保存监控器PID
        with open(self.pid_file, 'w') as f:
            f.write(str(os.getpid()))

        try:
            while True:
                start_time = time.time()

                # 检查并修复系统
                system_ok = self.check_and_fix_system()

                if system_ok:
                    self.log_message("✅ 系统检查通过，继续监控...")
                else:
                    self.log_message("❌ 系统检查失败，尝试手动修复...")

                # 计算下次检查时间
                elapsed = time.time() - start_time
                sleep_time = max(0, self.check_interval - elapsed)

                self.log_message(f"😴 下次检查在 {sleep_time:.0f} 秒后...")
                time.sleep(sleep_time)

        except KeyboardInterrupt:
            self.log_message("⏹️ 用户中断监控")
        except Exception as e:
            self.log_message(f"❌ 监控器错误: {e}")
        finally:
            # 清理PID文件
            if self.pid_file.exists():
                os.remove(self.pid_file)
            self.log_message("🛑 REAL MONITOR已停止")

def main():
    """主函数"""
    import sys

    monitor = RealMonitor()

    if len(sys.argv) < 2:
        print("使用方法:")
        print("  python3 real_monitor.py start      # 启动实时监控")
        print("  python3 real_monitor.py stop       # 停止监控")
        print("  python3 real_monitor.py status     # 查看状态")
        print("  python3 real_monitor.py check      # 单次检查")
        return

    command = sys.argv[1].lower()

    if command == "start":
        # 检查是否已在运行
        if monitor.pid_file.exists():
            try:
                with open(monitor.pid_file, 'r') as f:
                    pid = int(f.read().strip())
                if monitor.is_process_alive(pid):
                    print(f"⚠️ 监控器已在运行，PID: {pid}")
                    return
            except:
                pass

        # 启动监控
        print("🚀 启动REAL MONITOR...")
        monitor.run_real_monitor()

    elif command == "stop":
        if not monitor.pid_file.exists():
            print("ℹ️ 监控器未在运行")
            return

        try:
            with open(monitor.pid_file, 'r') as f:
                pid = int(f.read().strip())

            print(f"🛑 停止监控器 PID: {pid}")
            os.kill(pid, signal.SIGTERM)
            time.sleep(2)

            if monitor.is_process_alive(pid):
                os.kill(pid, signal.SIGKILL)
                print("💀 强制停止")

            if monitor.pid_file.exists():
                os.remove(monitor.pid_file)

            print("✅ 监控器已停止")

        except Exception as e:
            print(f"❌ 停止失败: {e}")

    elif command == "status":
        if not monitor.pid_file.exists():
            print("🔴 监控器未运行")
            return

        try:
            with open(monitor.pid_file, 'r') as f:
                pid = int(f.read().strip())

            if monitor.is_process_alive(pid):
                print(f"🟢 监控器运行中，PID: {pid}")
                cpu, memory = monitor.get_process_cpu_memory(pid)
                if cpu is not None:
                    print(f"📊 CPU: {cpu:.1f}%, 内存: {memory:.1f}MB")

                # 检查心跳
                heartbeat_ok, heartbeat_msg = monitor.check_heartbeat()
                if heartbeat_ok:
                    print(f"💓 {heartbeat_msg}")
                else:
                    print(f"⚠️ {heartbeat_msg}")
            else:
                print("🔴 监控器进程已死亡")

        except Exception as e:
            print(f"❌ 状态检查失败: {e}")

    elif command == "check":
        print("🔍 执行单次系统检查...")
        monitor.check_and_fix_system()

    else:
        print(f"❌ 未知命令: {command}")

if __name__ == "__main__":
    main()