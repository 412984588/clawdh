#!/usr/bin/env python3
"""
OpenClaw 自动恢复引擎
根据故障类型执行恢复策略

恢复策略矩阵：
| 故障类型 | 恢复策略 | 重试次数 |
|---------|----------|---------|
| process_crash | openclaw gateway restart | 2次 |
| api_timeout | 重启 Gateway 服务 | 2次 |
| config_error | 修复配置（需要手动） | 1次 |
| external_api_failure | 切换备用 provider（暂未实现） | 自动 |
"""
import subprocess
import os
from datetime import datetime


class RecoveryEngine:
    """OpenClaw 自动恢复引擎"""

    def __init__(self, openclaw_cli: str):
        """
        初始化恢复引擎

        Args:
            openclaw_cli: OpenClaw CLI 路径
        """
        self.openclaw_cli = openclaw_cli
        self.max_retry = 2  # 最大重试次数
        self.retry_count = {}  # 每种故障类型的重试计数

    def recover(self, failure_type: str) -> bool:
        """
        执行恢复策略，返回是否成功

        Args:
            failure_type: 故障类型标识

        Returns:
            bool: True 如果恢复成功，False 否则
        """
        print(f"\n[{datetime.now()}] 🔧 开始恢复...")

        # 初始化重试计数
        if failure_type not in self.retry_count:
            self.retry_count[failure_type] = 0

        # 检查重试次数
        if self.retry_count[failure_type] >= self.max_retry:
            print(f"  ❌ 恢复失败已达上限 ({self.max_retry}次)")
            print(f"  建议: 通知用户介入处理")
            return False

        self.retry_count[failure_type] += 1
        print(f"  当前重试次数: {self.retry_count[failure_type]}/{self.max_retry}")

        # 根据故障类型执行恢复策略
        success = False
        if failure_type == "process_crash":
            success = self.recover_process_crash()
        elif failure_type == "api_timeout":
            success = self.recover_api_timeout()
        elif failure_type == "config_error":
            success = self.recover_config_error()
        elif failure_type == "external_api_failure":
            success = self.recover_external_api_failure()
        elif failure_type == "log_errors_only":
            success = self.recover_log_errors()
        else:
            print(f"  ⚠️ 未知故障类型: {failure_type}")
            print(f"  建议: 检查是否有未覆盖的故障场景")
            return False

        if success:
            print(f"  ✅ 恢复成功")
            # 重置重试计数
            self.retry_count[failure_type] = 0
        else:
            print(f"  ❌ 恢复失败 ({self.retry_count[failure_type]}/{self.max_retry})")

        return success

    def recover_process_crash(self) -> bool:
        """
        恢复进程崩溃 - 重启 Gateway

        Returns:
            bool: True 如果成功，False 否则
        """
        print("  执行策略: 重启 OpenClaw Gateway")
        print("  命令: openclaw gateway restart")

        try:
            # 先尝试停止
            print("    1. 停止现有服务...")
            stop_result = subprocess.run(
                [self.openclaw_cli, "gateway", "stop"],
                capture_output=True,
                text=True,
                timeout=60,
            )
            print(
                f'    停止结果: {"成功" if stop_result.returncode == 0 else "失败（可能已停止）"}'
            )

            # 再启动
            print("    2. 启动服务...")
            start_result = subprocess.run(
                [self.openclaw_cli, "gateway", "start"],
                capture_output=True,
                text=True,
                timeout=120,
            )

            if start_result.returncode == 0:
                print("    ✅ Gateway 重启成功")
                return True
            else:
                print(f"    ❌ Gateway 重启失败")
                print(f"    错误输出: {start_result.stderr}")
                return False

        except subprocess.TimeoutExpired:
            print(f"    ❌ Gateway 重启超时（>120秒）")
            return False
        except Exception as e:
            print(f"    ❌ Gateway 重启异常: {e}")
            return False

    def recover_api_timeout(self) -> bool:
        """
        恢复 API 超时 - 重启 Gateway 服务

        Returns:
            bool: True 如果成功，False 否则
        """
        print("  执行策略: 重启 Gateway 服务（API 超时）")
        return self.recover_process_crash()

    def recover_config_error(self) -> bool:
        """
        恢复配置错误 - 需要手动修复

        Returns:
            bool: False（配置错误需要手动修复）
        """
        print("  执行策略: 配置错误需要手动修复")
        print("  ❌ 自动修复暂未实现")
        print("  建议:")
        print("    1. 检查 openclaw.json 语法（json validator）")
        print("    2. 检查必需字段是否缺失")
        print("    3. 运行 openclaw doctor 诊断")
        print("    4. 手动修复后重试")
        return False

    def recover_external_api_failure(self) -> bool:
        """
        恢复外部 API 故障 - 切换备用 provider

        Returns:
            bool: True 如果成功，False 否则
        """
        print("  执行策略: 切换备用 API Provider")
        print("  ❌ 自动切换暂未实现")
        print("  建议:")
        print("    1. 检查外部 API 服务状态（GLM, Kimi）")
        print("    2. 考虑切换到备用 provider")
        print("    3. 更新 .env 配置并重启服务")
        return False

    def recover_log_errors(self) -> bool:
        """
        恢复日志错误（但进程和 API 正常）

        Returns:
            bool: True（日志错误不阻塞服务）
        """
        print("  执行策略: 日志错误（服务正常运行）")
        print("  ⚠️  日志有错误但服务正常，建议人工排查")
        print("  建议:")
        print("    1. 运行 openclaw gateway logs --tail 100 查看完整日志")
        print("    2. 分析具体错误信息（可能是应用级错误）")
        print("    3. 考虑调整日志级别或修复应用 bug")
        return True  # 日志错误不算恢复失败
