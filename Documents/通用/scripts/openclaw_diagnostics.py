#!/usr/bin/env python3
"""
OpenClaw 故障诊断引擎
识别故障类型并收集诊断信息

故障类型：
1. process_crash - 进程崩溃
2. api_timeout - API 超时
3. config_error - 配置错误
4. external_api_failure - 外部 API 故障
"""
import subprocess
import json
import os
from datetime import datetime, timedelta


class DiagnosticsEngine:
    """OpenClaw 故障诊断引擎"""

    def __init__(self, openclaw_cli: str):
        """
        初始化诊断引擎

        Args:
            openclaw_cli: OpenClaw CLI 路径
        """
        self.openclaw_cli = openclaw_cli

    def diagnose(self, process_ok: bool, api_ok: bool, log_errors: list) -> str:
        """
        诊断故障类型并返回故障类型标识

        Args:
            process_ok: 进程是否正常
            api_ok: API 是否正常
            log_errors: 日志错误列表

        Returns:
            str: 故障类型标识
                - 'process_crash': 进程崩溃
                - 'api_timeout': API 超时
                - 'config_error': 配置错误
                - 'external_api_failure': 外部 API 故障
                - 'unknown': 未知故障类型
        """
        print(f"\n[{datetime.now()}] 🔍 开始诊断...")

        # 收集诊断信息
        print(f"  1. 收集日志（最近10分钟）...")
        logs = self.gather_logs(minutes=10)

        print(f"  2. 检查配置文件...")
        config_status = self.check_config()

        print(f"  3. 测试外部 API...")
        external_apis = self.check_external_apis()

        # 故障类型判断逻辑（决策树）
        if not process_ok:
            print("  诊断结果: 进程崩溃 (Process Crash)")
            print("  原因: ps aux 中未找到 openclaw 进程")
            return "process_crash"

        if not api_ok:
            # API 不正常，进一步判断是配置问题还是超时问题
            if config_status["has_error"]:
                print("  诊断结果: 配置错误 (Config Error)")
                print(f'  原因: {config_status["details"][0]}')
                return "config_error"
            print("  诊断结果: API 超时 (API Timeout)")
            print("  原因: openclaw gateway health 返回非 0")
            return "api_timeout"

        if log_errors:
            # 有日志错误，检查是否是外部 API 问题
            if not external_apis["glm"] or not external_apis["kimi"]:
                print(" 诊断结果: 外部 API 故障 (External API Failure)")
                if not external_apis["glm"]:
                    print("  原因: GLM API 不可达")
                if not external_apis["kimi"]:
                    print("  原因: Kimi API 不可达")
                return "external_api_failure"

            # 有日志错误但外部 API 正常
            print(" 诊断结果: 应用日志错误（但 API 和进程正常）")
            print("  建议: 检查应用日志排查具体错误")
            return "log_errors_only"

        print("  诊断结果: 未知故障类型（所有检查都通过）")
        print("  建议: 检查是否有未覆盖的故障场景")
        return "unknown"

    def gather_logs(self, minutes: int = 10) -> str:
        """
        收集指定分钟数的日志

        Args:
            minutes: 收集最近几分钟的日志（默认10分钟）

        Returns:
            str: 日志内容
        """
        try:
            # 估算需要获取的行数（假设每分钟约100行）
            tail_lines = minutes * 100

            result = subprocess.run(
                [self.openclaw_cli, "gateway", "logs", "--tail", str(tail_lines)],
                capture_output=True,
                text=True,
                timeout=120,
            )

            if result.returncode == 0:
                return result.stdout
            else:
                return f"日志收集失败（退出码 {result.returncode}）: {result.stderr}"
        except subprocess.TimeoutExpired:
            return f"日志收集超时（>{120}秒）"
        except Exception as e:
            return f"日志收集异常: {e}"

    def check_config(self) -> dict:
        """
        检查配置文件语法和完整性

        Returns:
            dict: {
                    'has_error': bool,  # 是否有错误
                    'details': list,     # 错误详情列表
                }
        """
        result = {"has_error": False, "details": []}

        # 尝试多个可能的配置文件位置
        config_paths = [
            "../../openclaw-gateway/openclaw.json",
            "../../.openclaw-gateway/openclaw.json",
            "~/.openclaw/openclaw.json",
            "~/.config/openclaw/openclaw.json",
        ]

        config_found = False
        for config_path in config_paths:
            # 展开 ~ 路径
            expanded_path = os.path.expanduser(config_path)
            if os.path.exists(expanded_path):
                config_found = True
                try:
                    with open(expanded_path, "r", encoding="utf-8") as f:
                        json.load(f)  # 尝试解析 JSON
                    print(f"    ✅ 配置文件有效: {expanded_path}")
                    break
                except json.JSONDecodeError as e:
                    result["has_error"] = True
                    result["details"].append(
                        f"JSON 语法错误: {expanded_path}\n      {e}"
                    )
                    print(f"    ❌ JSON 语法错误: {expanded_path}")
                    print(f"       {e}")
                    break
                except Exception as e:
                    result["has_error"] = True
                    result["details"].append(
                        f"配置检查异常: {expanded_path}\n      {e}"
                    )
                    break

        if not config_found:
            result["has_error"] = True
            result["details"].append("配置文件未找到（已尝试多个路径）")
            print("    ⚠️  配置文件未找到")

        return result

    def check_external_apis(self) -> dict:
        """
        测试外部 API 可用性（GLM, Kimi）

        注意：这是简化实现，实际需要测试具体的 API 端点

        Returns:
            dict: {
                    'glm': bool,   # GLM API 是否可用
                    'kimi': bool,  # Kimi API 是否可用
                }
        """
        # 简化实现：假设外部 API 都可用
        # 实际生产环境应该：
        # 1. 从配置文件读取 API 端点
        # 2. 使用 curl 测试每个端点
        # 3. 根据响应判断可用性
        return {"glm": True, "kimi": True}
