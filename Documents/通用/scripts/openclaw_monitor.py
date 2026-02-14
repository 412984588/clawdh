#!/usr/bin/env python3
"""
OpenClaw 自主服务监控代理 - 主监控脚本
每5分钟监控 OpenClaw 服务健康状况

功能：
- 检查进程状态
- 检查 API 健康
- 监控日志错误（ERROR/CRITICAL）
- 自动诊断和恢复故障
- 学习优化（记录事故、生成建议）
"""
import subprocess
import sys
import os
from datetime import datetime
from openclaw_diagnostics import DiagnosticsEngine
from openclaw_recovery import RecoveryEngine
from openclaw_learning import LearningEngine


class OpenClawMonitor:
    """OpenClaw 服务监控代理主类"""

    def __init__(self):
        """初始化监控代理"""
        self.openclaw_cli = (
            "../../moltbot/extensions/memory-lancedb/node_modules/.bin/openclaw"
        )
        self.diagnostics = DiagnosticsEngine(self.openclaw_cli)
        self.recovery = RecoveryEngine(self.openclaw_cli)
        self.learning = LearningEngine()
        self.check_interval = 300  # 5分钟 = 300秒

        # 确保日志目录存在
        os.makedirs("logs", exist_ok=True)

    def check_process_status(self) -> bool:
        """
        检查 OpenClaw 进程是否运行

        Returns:
            bool: True 如果进程运行，False 否则
        """
        try:
            result = subprocess.run(
                ["ps", "aux"], capture_output=True, text=True, timeout=30
            )
            # 过滤出包含 'openclaw' 的进程，排除 grep 自身
            openclaw_processes = [
                line
                for line in result.stdout.split("\n")
                if "openclaw" in line.lower() and "grep" not in line.lower()
            ]
            return len(openclaw_processes) > 0
        except subprocess.TimeoutExpired:
            print(f"[{datetime.now()}] ⏱️  进程检查超时")
            return False
        except Exception as e:
            print(f"[{datetime.now()}] ❌ 进程检查失败: {e}")
            return False

    def check_api_health(self) -> bool:
        """
        检查 Gateway API 健康状态

        Returns:
            bool: True 如果 API 健康，False 否则
        """
        try:
            result = subprocess.run(
                [self.openclaw_cli, "gateway", "health"],
                capture_output=True,
                text=True,
                timeout=60,
            )
            # openclaw gateway health 返回 0 表示健康
            return result.returncode == 0
        except subprocess.TimeoutExpired:
            print(f"[{datetime.now()}] ⏱️  API 健康检查超时")
            return False
        except Exception as e:
            print(f"[{datetime.now()}] ❌ API 健康检查失败: {e}")
            return False

    def check_logs(self) -> list:
        """
        检查日志中的 ERROR 和 CRITICAL 消息

        Returns:
            list: 错误日志行列表
        """
        try:
            result = subprocess.run(
                [self.openclaw_cli, "gateway", "logs", "--tail", "50"],
                capture_output=True,
                text=True,
                timeout=60,
            )
            errors = []
            for line in result.stdout.split("\n"):
                if "ERROR" in line or "CRITICAL" in line:
                    errors.append(line.strip())
            return errors
        except subprocess.TimeoutExpired:
            print(f"[{datetime.now()}] ⏱️  日志检查超时")
            return []
        except Exception as e:
            print(f"[{datetime.now()}] ❌ 日志检查失败: {e}")
            return []

    def monitoring_loop(self):
        """主监控循环 - 每5分钟执行一次"""
        print(f'\n{"="*60}')
        print(f"[{datetime.now()}] 🚀 OpenClaw 监控代理启动")
        print(f"监控周期: {self.check_interval}秒 ({self.check_interval // 60}分钟)")
        print(f'{"="*60}\n')

        while True:
            try:
                # ========== MONITORING PHASE ==========
                print(f"[{datetime.now()}] 🔍 开始监控检查...")

                # 1. 检查进程状态
                process_ok = self.check_process_status()
                print(f'  进程状态: {"✅ 正常" if process_ok else "❌ 异常"}')

                # 2. 检查 API 健康
                api_ok = self.check_api_health()
                print(f'  API 状态: {"✅ 正常" if api_ok else "❌ 异常"}')

                # 3. 检查日志错误
                log_errors = self.check_logs()
                print(f"  日志错误: {len(log_errors)} 条")

                # 判断是否所有检查都通过
                all_ok = process_ok and api_ok and len(log_errors) == 0

                if not all_ok:
                    print(f"\n[{datetime.now()}] ⚠️  检测到服务异常")

                    # ========== DIAGNOSIS PHASE ==========
                    failure_type = self.diagnostics.diagnose(
                        process_ok, api_ok, log_errors
                    )
                    print(f"  诊断结果: {failure_type}")

                    # ========== RECOVERY PHASE ==========
                    recovery_success = self.recovery.recover(failure_type)

                    # ========== LEARNING PHASE ==========
                    self.learning.log_incident(failure_type, recovery_success)
                else:
                    print(f"[{datetime.now()}] ✅ 所有检查通过\n")

                # 等待下一个监控周期
                print(
                    f"[{datetime.now()}] ⏰ 等待 {self.check_interval} 秒后进行下次检查...\n"
                )
                time.sleep(self.check_interval)

            except KeyboardInterrupt:
                print(f"\n[{datetime.now()}] 🛑 监控代理已停止（用户中断）")
                break
            except Exception as e:
                print(f"\n[{datetime.now()}] ❌ 监控循环异常: {e}")
                print(f"将在 60 秒后继续...")
                time.sleep(60)  # 异常后等待1分钟再继续


if __name__ == "__main__":
    monitor = OpenClawMonitor()
    monitor.monitoring_loop()
