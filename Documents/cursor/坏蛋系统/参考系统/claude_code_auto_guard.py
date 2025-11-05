#!/usr/bin/env python3
"""

def create_robust_api_request(endpoint: str, data: Dict, headers: Dict = None) -> Dict:
    """创建健壮的API请求结构"""
    # 默认请求头
    default_headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Claude-Code-Fixer/2.0.0"
    }

    if headers:
        default_headers.update(headers)

    # 验证请求数据
    is_valid, errors = validate_request_data(data)
    if not is_valid:
        raise ValueError(f"请求数据验证失败: {', '.join(errors)}")

    return {
        "url": endpoint,
        "method": "POST",
        "headers": default_headers,
        "json": data,
        "timeout": 30,
        "max_retries": 3
    }



import asyncio
import time

async def retry_with_backoff(func, *args, max_retries=3, backoff_factor=2, **kwargs):
    """带退避算法的重试机制"""
    for attempt in range(max_retries):
        try:
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)

            # 检查422错误
            if isinstance(result, dict) and result.get("status_code") == 422:
                if attempt < max_retries - 1:
                    wait_time = backoff_factor ** attempt
                    logger.warning(f"422错误,{wait_time}秒后重试 (尝试 {attempt + 1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                    continue

            return result

        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = backoff_factor ** attempt
                logger.warning(f"请求失败,{wait_time}秒后重试: {e}")
                await asyncio.sleep(wait_time)
                continue
            else:
                raise e

    raise Exception(f"重试{max_retries}次后仍然失败")



def handle_422_error(response_data: Dict, original_request: Dict) -> Dict:
    """处理422 Unprocessable Entity错误"""
    if response_data.get("status_code") == 422:
        errors = response_data.get("errors", {})

        # 分析错误原因
        error_details = []
        for field, messages in errors.items():
            if isinstance(messages, list):
                error_details.append(f"{field}: {', '.join(messages)}")
            else:
                error_details.append(f"{field}: {messages}")

        # 生成修复建议
        return {
            "success": False,
            "error_type": "validation_error",
            "error_details": error_details,
            "fix_suggestions": [
                "检查请求数据格式",
                "验证必填字段",
                "确认字段类型正确",
                "检查字段长度限制"
            ],
            "recovery_request": create_recovery_request(original_request, error_details)
        }

    return {"success": True}

def create_recovery_request(original_request: Dict, errors: List[str]) -> Dict:
    """创建恢复请求"""
    return {
        "user_message": f"""之前的请求遇到验证错误,需要修复:

错误详情:
{chr(10).join(errors)}

请根据错误信息修正请求并重新执行.
""",
        "context": {**original_request.get("context", {}), "error_recovery": True},
        "retry_after": 2
    }



def validate_request_data(data: Dict, rules: Dict = None) -> Tuple[bool, List[str]]:
    """验证请求数据,防止422错误"""
    errors = []

    if rules is None:
        rules = {
            "required": ["user_message", "session_id"],
            "string_fields": ["user_message"],
            "max_length": {"user_message": 10000}
        }

    # 检查必填字段
    for field in rules.get("required", []):
        if field not in data or not data[field]:
            errors.append(f"必填字段缺失: {field}")

    # 检查字符串字段
    for field in rules.get("string_fields", []):
        if field in data and not isinstance(data[field], str):
            errors.append(f"字段类型错误: {field} 应为字符串")

    # 检查长度限制
    for field, max_len in rules.get("max_length", {}).items():
        if field in data and len(str(data[field])) > max_len:
            errors.append(f"字段长度超限: {field} 超过 {max_len} 字符")

    return len(errors) == 0, errors



class ClaudeErrorHandling:
    """Claude错误处理类"""

    @staticmethod
    def handle_no_response(session_id: str) -> str:
        """处理No response requested情况"""
        return f"""系统检测到响应不完整.请重新分析当前任务:

会话ID: {session_id}
时间: {time.strftime('%Y-%m-%d %H:%M:%S')}

请提供:
1. 当前执行状态
2. 具体结果数据
3. 下一步行动建议
4. 遇到的问题

确保回复包含详细内容."""



def validate_claude_response(response: str) -> Tuple[bool, str]:
    """验证Claude响应,过滤No response requested"""
    if not response or len(response.strip()) < 10:
        return False, "响应过短,需要重新请求"

    if "no response requested" in response.lower():
        return False, "检测到No response requested,需要重新构建请求"

    return True, response



def optimize_claude_request(user_input: str, context: Dict = None) -> Dict:
    """优化Claude请求结构,防止No response requested"""
    if not user_input or user_input.strip() == "":
        user_input = "请继续执行当前任务并提供详细结果"

    # 确保有明确的指令
    if len(user_input.strip()) < 10:
        user_input = f"请详细执行: {user_input}\n\n请提供具体步骤,结果和建议."

    return {
        "messages": [{"role": "user", "content": user_input}],
        "max_tokens": 4000,
        "temperature": 0.7,
        "response_format": {"type": "text"},
        "context": context or {}
    }


Claude Code自动化守护程序
实时监控和预防API问题
作者: Jenny团队
版本: 2.0.0
"""

import os
import sys
import json
import time
import asyncio
import logging
import threading
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import psutil
import subprocess

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/zhimingdeng/claude_guard.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class MonitoringConfig:
    """监控配置"""
    watch_directories: List[str]
    file_patterns: List[str]
    check_interval: int = 60
    auto_fix: bool = True
    backup_before_fix: bool = True
    notify_on_fix: bool = True

class ClaudeCodeGuard(FileSystemEventHandler):
    """Claude Code守护程序

    实时监控文件变化并自动修复API问题
    """

    def __init__(self, config: MonitoringConfig):
        self.config = config
        self.home_dir = Path("/Users/zhimingdeng")
        self.observer = Observer()
        self.running = False
        self.fix_count = 0
        self.last_check = time.time()

        # 导入修复工具
        sys.path.append(str(self.home_dir / "Projects/女王条纹测试2"))
        try:
            from claude_code_global_fixer import ClaudeCodeGlobalFixer
            self.fixer = ClaudeCodeGlobalFixer()
        except ImportError as e:
            logger.error(f"无法导入修复工具: {e}")
            self.fixer = None

    def start_monitoring(self):
        """开始监控"""
        logger.info("🛡️ 启动Claude Code守护程序...")

        # 设置监控目录
        for directory in self.config.watch_directories:
            if Path(directory).exists():
                self.observer.schedule(self, directory, recursive=True)
                logger.info(f"监控目录: {directory}")
            else:
                logger.warning(f"目录不存在: {directory}")

        # 启动监控
        self.observer.start()
        self.running = True

        # 启动定期检查线程
        check_thread = threading.Thread(target=self._periodic_check, daemon=True)
        check_thread.start()

        logger.info("✅ 守护程序已启动,正在监控Claude Code项目...")

        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop_monitoring()

    def stop_monitoring(self):
        """停止监控"""
        logger.info("🛑 停止Claude Code守护程序...")
        self.running = False
        self.observer.stop()
        self.observer.join()
        logger.info(f"📊 守护程序已停止,共修复 {self.fix_count} 个问题")

    def on_modified(self, event):
        """文件修改事件"""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        # 检查文件类型
        if not self._should_monitor_file(file_path):
            return

        logger.info(f"📝 检测到文件修改: {file_path}")

        # 延迟检查,避免文件写入未完成
        threading.Timer(2.0, self._check_and_fix_file, args=[file_path]).start()

    def _should_monitor_file(self, file_path: Path) -> bool:
        """判断是否应该监控文件"""
        # 检查文件扩展名
        if file_path.suffix != '.py':
            return False

        # 检查文件名模式
        for pattern in self.config.file_patterns:
            if pattern.lower() in file_path.name.lower():
                return True

        # 检查文件内容
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            return any(keyword in content.lower() for keyword in ['claude', 'anthropic'])
        except Exception:
            return False

    def _check_and_fix_file(self, file_path: Path):
        """检查并修复文件"""
        if not file_path.exists():
            return

        try:
            # 读取文件内容
            content = file_path.read_text(encoding='utf-8', errors='ignore')

            # 检查问题
            issues = self._detect_issues(content)

            if issues:
                logger.info(f"🔍 在 {file_path} 中发现 {len(issues)} 个问题: {issues}")

                if self.config.auto_fix and self.fixer:
                    # 自动修复
                    self._auto_fix_file(file_path, issues)
                else:
                    logger.warning(f"⚠️  发现问题但未启用自动修复: {file_path}")

        except Exception as e:
            logger.error(f"检查文件失败 {file_path}: {e}")

    def _detect_issues(self, content: str) -> List[str]:
        """检测文件中的问题"""
        issues = []

        # No response requested问题
        if "no response requested" in content.lower():
            issues.append("No response requested")

        # 缺少max_tokens
        if ("messages.create(" in content or "claude." in content) and "max_tokens" not in content:
            issues.append("缺少max_tokens参数")

        # 缺少数据验证
        if "post(" in content and "validation" not in content.lower():
            issues.append("缺少数据验证")

        # 缺少错误处理
        if "try:" not in content and "except" not in content and ("api" in content.lower() or "request" in content.lower()):
            issues.append("缺少错误处理")

        # 422错误风险
        if "422" in content or "validation" in content.lower():
            issues.append("422错误风险")

        return issues

    def _auto_fix_file(self, file_path: Path, issues: List[str]):
        """自动修复文件"""
        logger.info(f"🔧 开始自动修复 {file_path}...")

        try:
            if self.config.backup_before_fix:
                self.fixer._backup_file(file_path)

            # 应用修复
            from claude_code_global_fixer import FixType

            if "No response requested" in issues or "缺少max_tokens参数" in issues:
                result = self.fixer.create_no_response_fix(file_path)
                if result.success:
                    logger.info(f"✅ 成功修复No response requested问题: {file_path}")
                    self.fix_count += 1

            if "缺少数据验证" in issues or "422错误风险" in issues:
                result = self.fixer.create_422_error_fix(file_path)
                if result.success:
                    logger.info(f"✅ 成功修复422错误风险: {file_path}")
                    self.fix_count += 1

        except Exception as e:
            logger.error(f"自动修复失败 {file_path}: {e}")

    def _periodic_check(self):
        """定期检查"""
        while self.running:
            try:
                current_time = time.time()
                if current_time - self.last_check >= self.config.check_interval:
                    logger.info("🔍 执行定期检查...")
                    self._full_scan_check()
                    self.last_check = current_time

                time.sleep(10)  # 每10秒检查一次是否需要执行定期检查

            except Exception as e:
                logger.error(f"定期检查失败: {e}")

    def _full_scan_check(self):
        """全面扫描检查"""
        try:
            claude_files = self.fixer.scan_claude_projects() if self.fixer else []
            logger.info(f"📁 全面扫描 {len(claude_files)} 个Claude相关文件")

            issues_found = 0
            for file_path in claude_files:
                if not file_path.is_file() or file_path.suffix != '.py':
                    continue

                try:
                    content = file_path.read_text(encoding='utf-8', errors='ignore')
                    issues = self._detect_issues(content)

                    if issues:
                        issues_found += 1
                        logger.debug(f"发现问题 {file_path}: {issues}")

                        if self.config.auto_fix:
                            self._auto_fix_file(file_path, issues)

                except Exception as e:
                    logger.warning(f"扫描文件失败 {file_path}: {e}")

            if issues_found == 0:
                logger.info("✅ 定期检查完成,未发现问题")
            else:
                logger.info(f"🔧 定期检查完成,处理了 {issues_found} 个问题文件")

        except Exception as e:
            logger.error(f"全面扫描失败: {e}")

    def get_status(self) -> Dict[str, Any]:
        """获取守护程序状态"""
        return {
            "running": self.running,
            "fix_count": self.fix_count,
            "last_check": self.last_check,
            "uptime": time.time() - self.last_check if self.running else 0,
            "monitored_directories": self.config.watch_directories
        }

class ClaudeCodeProcessMonitor:
    """Claude Code进程监控器"""

    def __init__(self):
        self.claude_processes = []
        self.monitoring = False

    def start_monitoring(self):
        """开始监控Claude进程"""
        self.monitoring = True
        logger.info("🖥️  启动Claude进程监控...")

        while self.monitoring:
            try:
                self._check_claude_processes()
                time.sleep(30)  # 每30秒检查一次
            except Exception as e:
                logger.error(f"进程监控错误: {e}")

    def stop_monitoring(self):
        """停止监控"""
        self.monitoring = False

    def _check_claude_processes(self):
        """检查Claude进程"""
        current_processes = []

        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmdline = proc.info.get('cmdline', [])
                if cmdline and any('claude' in str(arg).lower() for arg in cmdline):
                    current_processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cmdline': ' '.join(cmdline)
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        if current_processes != self.claude_processes:
            if len(current_processes) > len(self.claude_processes):
                logger.info(f"🚀 检测到新的Claude进程启动: {len(current_processes)}")
            elif len(current_processes) < len(self.claude_processes):
                logger.info(f"🛑 检测到Claude进程退出: {len(current_processes)}")

            self.claude_processes = current_processes

def create_monitoring_config() -> MonitoringConfig:
    """创建监控配置"""
    home_dir = "/Users/zhimingdeng"

    return MonitoringConfig(
        watch_directories=[
            f"{home_dir}/Projects",
            f"{home_dir}/Documents",
            f"{home_dir}/Desktop",
            f"{home_dir}/.claude"
        ],
        file_patterns=[
            "claude", "anthropic", "api", "request", "fix"
        ],
        check_interval=300,  # 5分钟
        auto_fix=True,
        backup_before_fix=True,
        notify_on_fix=True
    )

def main():
    """主函数"""
    print("🛡️  Claude Code自动化守护程序")
    print("=" * 50)

    # 创建配置
    config = create_monitoring_config()

    # 创建守护程序
    guard = ClaudeCodeGuard(config)

    # 创建进程监控器
    process_monitor = ClaudeCodeProcessMonitor()

    print(f"📁 监控目录: {', '.join(config.watch_directories)}")
    print(f"🔍 检查间隔: {config.check_interval} 秒")
    print(f"🔧 自动修复: {'启用' if config.auto_fix else '禁用'}")
    print(f"💾 自动备份: {'启用' if config.backup_before_fix else '禁用'}")

    # 启动进程监控线程
    process_thread = threading.Thread(target=process_monitor.start_monitoring, daemon=True)
    process_thread.start()

    try:
        # 启动文件监控
        guard.start_monitoring()
    except KeyboardInterrupt:
        print("\n\n👋 正在关闭守护程序...")
        guard.stop_monitoring()
        process_monitor.stop_monitoring()
        print("✅ 守护程序已关闭")

if __name__ == "__main__":
    main()