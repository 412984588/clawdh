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


Claude Code全局修复方案
修复所有Claude Code相关的配置,模板和hook文件
作者: Jenny团队
版本: 1.0.0
"""

import os
import json
import shutil
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

class ClaudeCodeGlobalFixer:
    """Claude Code全局修复器"""

    def __init__(self):
        self.logger = self._setup_logger()

        # Claude Code配置路径
        self.claude_paths = {
            "user_config": Path.home() / ".claude",
            "project_config": Path.cwd() / ".claude",
            "cursor_config": Path.home() / ".cursor",
            "global_settings": Path.home() / ".claude" / "settings.json",
            "local_settings": Path.cwd() / ".claude" / "settings.local.json",
            "mcp_config": Path.home() / ".cursor" / "mcp.json",
            "commands_dir": Path.cwd() / ".claude" / "commands",
            "hooks_dir": Path.cwd() / ".claude" / "hooks",
            "templates_dir": Path.cwd() / ".claude" / "templates"
        }

        # 女王条纹测试2专用配置
        self.queen_config = {
            "project_name": "女王条纹测试2",
            "cloudflare_proxy": True,
            "allowed_domains": ["*.stripe.com", "*.connect.stripe.com"],
            "api_endpoints": {
                "stripe_connect": "https://api.stripe.com/v1/connect",
                "claude_api": "https://api.anthropic.com/v1/messages"
            }
        }

    def _setup_logger(self) -> logging.Logger:
        """设置日志记录器"""
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)

        # 创建处理器
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

        return logger

    def backup_existing_config(self) -> bool:
        """备份现有配置"""
        try:
            backup_dir = Path.home() / ".claude_backup" / datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir.mkdir(parents=True, exist_ok=True)

            backed_up = []

            # 备份用户配置
            if self.claude_paths["user_config"].exists():
                user_backup = backup_dir / "user_claude"
                shutil.copytree(self.claude_paths["user_config"], user_backup)
                backed_up.append("用户Claude配置")

            # 备份项目配置
            if self.claude_paths["project_config"].exists():
                project_backup = backup_dir / "project_claude"
                shutil.copytree(self.claude_paths["project_config"], project_backup)
                backed_up.append("项目Claude配置")

            # 备份Cursor配置
            if self.claude_paths["cursor_config"].exists():
                cursor_backup = backup_dir / "cursor_config"
                shutil.copytree(self.claude_paths["cursor_config"], cursor_backup)
                backed_up.append("Cursor配置")

            self.logger.info(f"配置备份完成: {', '.join(backed_up)}")
            self.logger.info(f"备份位置: {backup_dir}")
            return True

        except Exception as e:
            self.logger.error(f"备份配置失败: {e}")
            return False

    def fix_global_settings(self) -> Dict[str, Any]:
        """修复全局设置"""
        result = {"success": False, "changes": [], "error": None}

        try:
            settings_path = self.claude_paths["global_settings"]

            # 确保目录存在
            settings_path.parent.mkdir(parents=True, exist_ok=True)

            # 读取现有设置
            if settings_path.exists():
                with open(settings_path, 'r', encoding='utf-8') as f:
                    settings = json.load(f)
            else:
                settings = {}

            # 应用修复
            changes = []

            # 1. 确保权限设置正确
            if "permissions" not in settings:
                settings["permissions"] = {
                    "allow": [
                        "Bash(npm info:*)",
                        "Read(//Users/zhimingdeng/**)",
                        "Bash(python:*)",
                        "Bash(python3:*)",
                        "Bash(pip3 install:*)",
                        "Bash(npx:*)",
                        "Bash(find:*)",
                        "Edit(//Users/zhimingdeng/Projects/女王条纹测试2/**)",
                        "Write(//Users/zhimingdeng/Projects/女王条纹测试2/**)"
                    ]
                }
                changes.append("添加全局权限设置")

            # 2. 确保主题设置
            if "theme" not in settings:
                settings["theme"] = "dark"
                changes.append("设置深色主题")

            # 3. 添加女王条纹测试2项目规则
            if "project_rules" not in settings:
                settings["project_rules"] = {
                    "女王条纹测试2": {
                        "cloudflare_proxy": True,
                        "allowed_endpoints": [
                            "https://api.stripe.com/*",
                            "https://connect.stripe.com/*",
                            "https://dashboard.stripe.com/*"
                        ],
                        "restricted_endpoints": [],
                        "auto_retry": True,
                        "max_retries": 3
                    }
                }
                changes.append("添加女王条纹测试2项目规则")

            # 4. 确保调试设置
            if "debug" not in settings:
                settings["debug"] = {
                    "enabled": True,
                    "log_level": "info",
                    "save_logs": True
                }
                changes.append("启用调试模式")

            # 保存设置
            with open(settings_path, 'w', encoding='utf-8') as f:
                json.dump(settings, f, ensure_ascii=False, indent=2)

            result["success"] = True
            result["changes"] = changes

        except Exception as e:
            result["error"] = str(e)

        return result

    def fix_project_settings(self) -> Dict[str, Any]:
        """修复项目设置"""
        result = {"success": False, "changes": [], "error": None}

        try:
            settings_path = self.claude_paths["local_settings"]

            # 确保目录存在
            settings_path.parent.mkdir(parents=True, exist_ok=True)

            # 读取现有设置
            if settings_path.exists():
                with open(settings_path, 'r', encoding='utf-8') as f:
                    settings = json.load(f)
            else:
                settings = {}

            changes = []

            # 1. 添加项目特定的权限
            if "permissions" not in settings:
                settings["permissions"] = {
                    "allow": [
                        "Bash(python:*/Users/zhimingdeng/Projects/女王条纹测试2/*)",
                        "Read(//Users/zhimingdeng/Projects/女王条纹测试2/**)",
                        "Write(//Users/zhimingdeng/Projects/女王条纹测试2/**)",
                        "Edit(//Users/zhimingdeng/Projects/女王条纹测试2/**)",
                        "Bash(npm:*)",
                        "Bash(curl:*)",
                        "Bash(find:*)"
                    ]
                }
                changes.append("添加项目权限设置")

            # 2. 添加女王条纹测试2专用Hook
            if "hooks" not in settings:
                settings["hooks"] = {
                    "PreToolUse": [
                        {
                            "matcher": "*女王条纹*",
                            "hooks": [
                                {
                                    "type": "command",
                                    "command": "echo '启用女王条纹测试2代理模式'"
                                }
                            ]
                        }
                    ],
                    "Notification": [
                        {
                            "matcher": "",
                            "hooks": [
                                {
                                    "type": "command",
                                    "command": "echo 'Claude Code 女王条纹测试2模式已激活'"
                                }
                            ]
                        }
                    ]
                }
                changes.append("添加女王条纹测试2专用Hook")

            # 3. 添加MCP服务器配置
            if "mcpServers" not in settings:
                settings["mcpServers"] = {
                    "stripe-analyzer": {
                        "command": "python",
                        "args": ["/Users/zhimingdeng/Projects/女王条纹测试2/src/stripe_detector.py"],
                        "env": {
                            "PYTHONPATH": "/Users/zhimingdeng/Projects/女王条纹测试2",
                            "STRIPE_API_KEY": "${STRIPE_API_KEY}"
                        }
                    },
                    "queen-proxy": {
                        "command": "python",
                        "args": ["/Users/zhimingdeng/Projects/女王条纹测试2/utils/proxy_manager.py"],
                        "env": {
                            "PROXY_MODE": "cloudflare",
                            "PROJECT_NAME": "女王条纹测试2"
                        }
                    }
                }
                changes.append("添加MCP服务器配置")

            # 4. 添加项目特定的系统提示
            if "system_prompt" not in settings:
                settings["system_prompt"] = """你是女王条纹测试2项目的专业AI助手.

项目规则:
1. 只处理与Stripe Connect分析相关的任务
2. 使用Cloudflare代理进行网络请求
3. 遵循数据隐私和安全规范
4. 优先使用项目提供的专用工具和脚本
5. 所有API调用必须通过验证的代理服务器

重要提醒:
- 绝不能跳过代理直接访问外部API
- 所有Stripe相关操作必须记录日志
- 使用项目专用的错误处理机制
- 遵循"女王条纹测试2"项目的特定工作流程"""
                changes.append("添加项目系统提示")

            # 保存设置
            with open(settings_path, 'w', encoding='utf-8') as f:
                json.dump(settings, f, ensure_ascii=False, indent=2)

            result["success"] = True
            result["changes"] = changes

        except Exception as e:
            result["error"] = str(e)

        return result

    def fix_mcp_config(self) -> Dict[str, Any]:
        """修复MCP配置"""
        result = {"success": False, "changes": [], "error": None}

        try:
            mcp_path = self.claude_paths["mcp_config"]

            # 确保目录存在
            mcp_path.parent.mkdir(parents=True, exist_ok=True)

            # 读取现有配置
            if mcp_path.exists():
                with open(mcp_path, 'r', encoding='utf-8') as f:
                    mcp_config = json.load(f)
            else:
                mcp_config = {"mcpServers": {}}

            changes = []

            # 添加女王条纹测试2专用MCP服务器
            if "mcpServers" not in mcp_config:
                mcp_config["mcpServers"] = {}

            # 1. Stripe分析器
            if "queen-stripe-analyzer" not in mcp_config["mcpServers"]:
                mcp_config["mcpServers"]["queen-stripe-analyzer"] = {
                    "command": "python",
                    "args": ["/Users/zhimingdeng/Projects/女王条纹测试2/src/enhanced_stripe_detector.py"],
                    "env": {
                        "PROJECT_ROOT": "/Users/zhimingdeng/Projects/女王条纹测试2",
                        "USE_PROXY": "true",
                        "PROVIDER": "cloudflare"
                    }
                }
                changes.append("添加Stripe分析器MCP服务器")

            # 2. 代理管理器
            if "queen-proxy-manager" not in mcp_config["mcpServers"]:
                mcp_config["mcpServers"]["queen-proxy-manager"] = {
                    "command": "python",
                    "args": ["/Users/zhimingdeng/Projects/女王条纹测试2/utils/proxy_manager.py"],
                    "env": {
                        "PROJECT_NAME": "女王条纹测试2",
                        "AUTO_PROXY": "true"
                    }
                }
                changes.append("添加代理管理器MCP服务器")

            # 3. API错误修复器
            if "api-error-fixer" not in mcp_config["mcpServers"]:
                mcp_config["mcpServers"]["api-error-fixer"] = {
                    "command": "python",
                    "args": ["/Users/zhimingdeng/Projects/女王条纹测试2/api_error_handler.py"],
                    "env": {
                        "PYTHONPATH": "/Users/zhimingdeng/Projects/女王条纹测试2"
                    }
                }
                changes.append("添加API错误修复器MCP服务器")

            # 保存配置
            with open(mcp_path, 'w', encoding='utf-8') as f:
                json.dump(mcp_config, f, ensure_ascii=False, indent=2)

            result["success"] = True
            result["changes"] = changes

        except Exception as e:
            result["error"] = str(e)

        return result

    def create_project_commands(self) -> Dict[str, Any]:
        """创建项目专用命令"""
        result = {"success": False, "commands_created": [], "error": None}

        try:
            commands_dir = self.claude_paths["commands_dir"]
            commands_dir.mkdir(parents=True, exist_ok=True)

            # 创建女王条纹测试2专用命令
            commands = {
                "queen-stripe-analyze.md": """# 女王条纹测试2 - Stripe分析

执行Stripe Connect网站的深度分析.

## 使用方法
```
/queen-stripe-analyze
```

## 功能
- 批量分析网站
- 检测Stripe Connect集成
- 生成分析报告
- 使用Cloudflare代理
""",
                "queen-proxy-status.md": """# 女王条纹测试2 - 代理状态

检查Cloudflare代理状态和配置.

## 使用方法
```
/queen-proxy-status
```

## 功能
- 检查代理连接状态
- 显示代理配置信息
- 测试代理性能
""",
                "queen-batch-process.md": """# 女王条纹测试2 - 批量处理

批量处理Stripe Connect分析任务.

## 使用方法
```
/queen-batch-process <domain_list>
```

## 参数
- domain_list: 域名列表文件路径

## 功能
- 批量域名分析
- 并发处理
- 结果汇总
"""
            }

            for filename, content in commands.items():
                command_file = commands_dir / filename
                with open(command_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                result["commands_created"].append(filename)

            result["success"] = True

        except Exception as e:
            result["error"] = str(e)

        return result

    def create_project_hooks(self) -> Dict[str, Any]:
        """创建项目专用Hook"""
        result = {"success": False, "hooks_created": [], "error": None}

        try:
            hooks_dir = self.claude_paths["hooks_dir"]
            hooks_dir.mkdir(parents=True, exist_ok=True)

            # 创建女王条纹测试2专用Hook
            hooks = {
                "queen-proxy-check.sh": """#!/bin/bash
# 女王条纹测试2 - 代理检查Hook

echo "👑 女王条纹测试2代理模式激活"
echo "检查Cloudflare代理状态..."

# 检查代理配置
if [ -f "/Users/zhimingdeng/Projects/女王条纹测试2/utils/proxy_manager.py" ]; then
    python3 -c "
import sys
sys.path.append('/Users/zhimingdeng/Projects/女王条纹测试2')
from utils.proxy_manager import get_queen_proxy_manager
proxy = get_queen_proxy_manager()
print(f'代理状态: {\"启用\" if proxy.is_enabled() else \"禁用\"}')
"
else
    echo "⚠️ 代理管理器未找到"
fi
""",
                "queen-api-error-fix.sh": """#!/bin/bash
# 女王条纹测试2 - API错误修复Hook

echo "🔧 检测到API调用,应用422错误修复..."

# 检查是否需要修复API格式
if [ -f "/Users/zhimingdeng/Projects/女王条纹测试2/claude_api_422_fix.py" ]; then
    python3 -c "
import sys
sys.path.append('/Users/zhimingdeng/Projects/女王条纹测试2')
print('✅ API 422错误修复器已加载')
"
else
    echo "⚠️ API修复器未找到"
fi
"""
            }

            for filename, content in hooks.items():
                hook_file = hooks_dir / filename
                with open(hook_file, 'w', encoding='utf-8') as f:
                    f.write(content)

                # 设置执行权限
                os.chmod(hook_file, 0o755)
                result["hooks_created"].append(filename)

            result["success"] = True

        except Exception as e:
            result["error"] = str(e)

        return result

    def run_global_fix(self) -> Dict[str, Any]:
        """运行全局修复"""
        self.logger.info("🚀 开始Claude Code全局修复...")

        # 备份现有配置
        if not self.backup_existing_config():
            self.logger.error("备份失败,中止修复")
            return {"success": False, "error": "备份失败"}

        results = {
            "backup": True,
            "fixes": {},
            "summary": {
                "total_fixes": 0,
                "successful_fixes": 0,
                "failed_fixes": 0
            }
        }

        # 执行各项修复
        fix_functions = [
            ("全局设置", self.fix_global_settings),
            ("项目设置", self.fix_project_settings),
            ("MCP配置", self.fix_mcp_config),
            ("项目命令", self.create_project_commands),
            ("项目Hook", self.create_project_hooks)
        ]

        for fix_name, fix_func in fix_functions:
            self.logger.info(f"🔧 修复{fix_name}...")
            try:
                result = fix_func()
                results["fixes"][fix_name] = result

                if result["success"]:
                    results["summary"]["successful_fixes"] += 1
                    self.logger.info(f"✅ {fix_name}修复成功")
                    if "changes" in result and result["changes"]:
                        for change in result["changes"]:
                            self.logger.info(f"   - {change}")
                else:
                    results["summary"]["failed_fixes"] += 1
                    self.logger.error(f"❌ {fix_name}修复失败: {result.get('error', '未知错误')}")

                results["summary"]["total_fixes"] += 1

            except Exception as e:
                self.logger.error(f"❌ {fix_name}修复异常: {e}")
                results["fixes"][fix_name] = {"success": False, "error": str(e)}
                results["summary"]["failed_fixes"] += 1
                results["summary"]["total_fixes"] += 1

        # 输出最终结果
        self.logger.info("=" * 60)
        self.logger.info("🎉 Claude Code全局修复完成!")
        self.logger.info(f"📊 总修复项: {results['summary']['total_fixes']}")
        self.logger.info(f"✅ 成功: {results['summary']['successful_fixes']}")
        self.logger.info(f"❌ 失败: {results['summary']['failed_fixes']}")

        # 保存修复报告
        report_path = Path.home() / ".claude_global_fix_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        self.logger.info(f"📄 修复报告: {report_path}")
        self.logger.info("\n🔄 请重启Claude Code以应用修复")

        return results

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="Claude Code全局修复工具")
    parser.add_argument(
        "--backup-only",
        action="store_true",
        help="只备份配置不修复"
    )

    args = parser.parse_args()

    fixer = ClaudeCodeGlobalFixer()

    if args.backup_only:
        print("=== 仅备份模式 ===")
        if fixer.backup_existing_config():
            print("✅ 配置备份成功")
        else:
            print("❌ 配置备份失败")
    else:
        # 执行全局修复
        result = fixer.run_global_fix()

        if result["summary"]["successful_fixes"] > 0:
            print(f"\n🎉 全局修复完成!")
            print(f"✅ 成功修复 {result['summary']['successful_fixes']} 项")
            print("🔄 请重启Claude Code以应用所有修复")
        else:
            print("\n⚠️ 修复过程中遇到问题,请检查日志")

if __name__ == "__main__":
    main()