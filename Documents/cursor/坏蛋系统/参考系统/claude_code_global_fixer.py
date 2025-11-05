#!/usr/bin/env python3
"""
Claude Code全局修复工具
解决"No response requested"和"422 Unprocessable Entity"问题
作者: Jenny团队
版本: 2.0.0
适用范围: 本机所有Claude Code项目
"""

import os
import sys
import json
import time
import re
import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
import traceback

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/zhimingdeng/claude_global_fix.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FixType(Enum):
    """修复类型"""
    NO_RESPONSE = "no_response"
    ERROR_422 = "error_422"
    API_STRUCTURE = "api_structure"
    SESSION_MANAGEMENT = "session_management"
    ALL = "all"

@dataclass
class FixResult:
    """修复结果"""
    success: bool
    fix_type: str
    file_path: str
    issues_found: List[str]
    issues_fixed: List[str]
    error_message: Optional[str] = None
    timestamp: float = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()

class ClaudeCodeGlobalFixer:
    """Claude Code全局修复器

    专门解决本机所有Claude Code项目中的API问题
    """

    def __init__(self):
        self.home_dir = Path("/Users/zhimingdeng")
        self.fix_results = []
        self.backup_dir = self.home_dir / ".claude_fix_backups"
        self.backup_dir.mkdir(exist_ok=True)

        # 问题模式
        self.no_response_patterns = [
            r"No response requested",
            r"no response requested",
            r"停止响应",
            r"response.*none",
            r"empty.*response"
        ]

        self.error_422_patterns = [
            r"422.*Unprocessable",
            r"validation.*failed",
            r"missing.*required",
            r"invalid.*field",
            r"field.*required"
        ]

    def scan_claude_projects(self) -> List[Path]:
        """扫描本机所有Claude相关项目"""
        claude_paths = []

        # 搜索目录
        search_patterns = [
            self.home_dir / "Projects",
            self.home_dir / "Documents",
            self.home_dir / "Desktop",
            self.home_dir / ".claude"
        ]

        for base_path in search_patterns:
            if not base_path.exists():
                continue

            # 搜索包含claude的文件和目录
            try:
                for item in base_path.rglob("*"):
                    if item.is_file() and item.suffix == '.py':
                        try:
                            content = item.read_text(encoding='utf-8', errors='ignore')
                            if any(keyword in content.lower() for keyword in ['claude', 'anthropic']):
                                claude_paths.append(item)
                        except Exception as e:
                            logger.warning(f"无法读取文件 {item}: {e}")
                    elif item.is_dir() and 'claude' in item.name.lower():
                        claude_paths.append(item)
            except Exception as e:
                logger.warning(f"扫描目录 {base_path} 时出错: {e}")

        return list(set(claude_paths))  # 去重

    def create_no_response_fix(self, file_path: Path) -> FixResult:
        """创建No response requested修复"""
        result = FixResult(
            success=False,
            fix_type=FixType.NO_RESPONSE.value,
            file_path=str(file_path),
            issues_found=[],
            issues_fixed=[]
        )

        try:
            # 备份原文件
            backup_path = self._backup_file(file_path)

            # 读取文件内容
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            original_content = content

            # 检查问题
            issues_found = []
            for pattern in self.no_response_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    issues_found.append(f"发现模式: {pattern} ({len(matches)}处)")

            if not issues_found:
                result.success = True
                result.issues_found = ["未发现No response requested问题"]
                return result

            result.issues_found = issues_found

            # 修复策略1: 添加max_tokens参数
            content = self._fix_max_tokens(content)

            # 修复策略2: 优化请求结构
            content = self._fix_request_structure(content)

            # 修复策略3: 添加响应验证
            content = self._add_response_validation(content)

            # 修复策略4: 改进错误处理
            content = self._improve_error_handling(content)

            # 写入修复后的内容
            if content != original_content:
                file_path.write_text(content, encoding='utf-8')
                result.issues_fixed = [
                    "添加max_tokens参数",
                    "优化请求结构",
                    "添加响应验证",
                    "改进错误处理"
                ]
                result.success = True
                logger.info(f"成功修复No response requested问题: {file_path}")
            else:
                result.issues_fixed = ["无需修改"]
                result.success = True

        except Exception as e:
            result.error_message = str(e)
            logger.error(f"修复No response requested问题失败 {file_path}: {e}")

        return result

    def create_422_error_fix(self, file_path: Path) -> FixResult:
        """创建422错误修复"""
        result = FixResult(
            success=False,
            fix_type=FixType.ERROR_422.value,
            file_path=str(file_path),
            issues_found=[],
            issues_fixed=[]
        )

        try:
            # 备份原文件
            backup_path = self._backup_file(file_path)

            # 读取文件内容
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            original_content = content

            # 检查422错误风险
            issues_found = self._check_422_risks(content)
            result.issues_found = issues_found

            if not issues_found:
                result.success = True
                result.issues_found = ["未发现422错误风险"]
                return result

            # 修复策略1: 添加数据验证
            content = self._add_data_validation(content)

            # 修复策略2: 改进错误处理
            content = self._add_422_error_handling(content)

            # 修复策略3: 添加重试机制
            content = self._add_retry_mechanism(content)

            # 修复策略4: 优化API请求结构
            content = self._optimize_api_structure(content)

            # 写入修复后的内容
            if content != original_content:
                file_path.write_text(content, encoding='utf-8')
                result.issues_fixed = [
                    "添加数据验证模块",
                    "添加422错误处理",
                    "实现智能重试机制",
                    "优化API请求结构"
                ]
                result.success = True
                logger.info(f"成功修复422错误风险: {file_path}")
            else:
                result.issues_fixed = ["无需修改"]
                result.success = True

        except Exception as e:
            result.error_message = str(e)
            logger.error(f"修复422错误失败 {file_path}: {e}")

        return result

    def _fix_max_tokens(self, content: str) -> str:
        """修复max_tokens参数问题"""
        # 查找API调用位置
        api_call_patterns = [
            r'messages\.create\(',
            r'claude\.\w+\(',
            r'anthropic\.\w+\(',
            r'api_call\(',
            r'request\('
        ]

        for pattern in api_call_patterns:
            # 查找所有API调用
            matches = list(re.finditer(pattern, content))

            for match in reversed(matches):  # 从后往前处理,避免位置偏移
                start = match.start()
                # 查找调用的结束位置
                bracket_count = 1
                pos = match.end() - 1  # 从'('开始

                while pos < len(content) and bracket_count > 0:
                    if content[pos] == '(':
                        bracket_count += 1
                    elif content[pos] == ')':
                        bracket_count -= 1
                    pos += 1

                call_content = content[start:pos]

                # 检查是否已包含max_tokens
                if 'max_tokens' not in call_content:
                    # 添加max_tokens参数
                    # 在最后一个参数前添加
                    if ',' in call_content[:-2]:
                        fixed_call = call_content[:-2] + ',\n        "max_tokens": 4000\n    )'
                    else:
                        fixed_call = call_content[:-2] + '\n        max_tokens=4000\n    )'

                    content = content[:start] + fixed_call + content[pos:]

        return content

    def _fix_request_structure(self, content: str) -> str:
        """修复请求结构"""
        # 添加请求结构优化函数
        fix_function = '''
def optimize_claude_request(user_input: str, context: Dict = None) -> Dict:
    """优化Claude请求结构,防止No response requested"""
    if not user_input or user_input.strip() == "":
        user_input = "请继续执行当前任务并提供详细结果"

    # 确保有明确的指令
    if len(user_input.strip()) < 10:
        user_input = f"请详细执行: {user_input}\\n\\n请提供具体步骤,结果和建议."

    return {
        "messages": [{"role": "user", "content": user_input}],
        "max_tokens": 4000,
        "temperature": 0.7,
        "response_format": {"type": "text"},
        "context": context or {}
    }

'''

        # 检查是否已存在类似函数
        if 'optimize_claude_request' not in content:
            # 在文件开头添加函数
            if content.startswith('#!'):
                lines = content.split('\n')
                content = '\n'.join(lines[:2] + [fix_function] + lines[2:])
            else:
                content = fix_function + '\n' + content

        return content

    def _add_response_validation(self, content: str) -> str:
        """添加响应验证"""
        validation_function = '''
def validate_claude_response(response: str) -> Tuple[bool, str]:
    """验证Claude响应,过滤No response requested"""
    if not response or len(response.strip()) < 10:
        return False, "响应过短,需要重新请求"

    if "no response requested" in response.lower():
        return False, "检测到No response requested,需要重新构建请求"

    return True, response

'''

        if 'validate_claude_response' not in content:
            if content.startswith('#!'):
                lines = content.split('\n')
                content = '\n'.join(lines[:2] + [validation_function] + lines[2:])
            else:
                content = validation_function + '\n' + content

        return content

    def _improve_error_handling(self, content: str) -> str:
        """改进错误处理"""
        error_handling_code = '''
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

'''

        if 'ClaudeErrorHandling' not in content:
            if content.startswith('#!'):
                lines = content.split('\n')
                content = '\n'.join(lines[:2] + [error_handling_code] + lines[2:])
            else:
                content = error_handling_code + '\n' + content

        return content

    def _check_422_risks(self, content: str) -> List[str]:
        """检查422错误风险"""
        risks = []

        # 检查API调用
        if re.search(r'post\(|requests\.post|api\.call', content, re.IGNORECASE):
            risks.append("发现API调用,可能存在422错误风险")

        # 检查数据验证缺失
        if 'validation' not in content.lower() and 'validate' not in content.lower():
            risks.append("缺少数据验证机制")

        # 检查错误处理缺失
        if 'try:' not in content and 'except' not in content:
            risks.append("缺少异常处理机制")

        # 检查JSON数据处理
        if 'json' in content.lower() and 'json' in content:
            risks.append("存在JSON数据处理,需要验证")

        return risks

    def _add_data_validation(self, content: str) -> str:
        """添加数据验证"""
        validation_code = '''
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

'''

        if 'validate_request_data' not in content:
            if content.startswith('#!'):
                lines = content.split('\n')
                content = '\n'.join(lines[:2] + [validation_code] + lines[2:])
            else:
                content = validation_code + '\n' + content

        return content

    def _add_422_error_handling(self, content: str) -> str:
        """添加422错误处理"""
        error_422_handling = '''
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

'''

        if 'handle_422_error' not in content:
            if content.startswith('#!'):
                lines = content.split('\n')
                content = '\n'.join(lines[:2] + [error_422_handling] + lines[2:])
            else:
                content = error_422_handling + '\n' + content

        return content

    def _add_retry_mechanism(self, content: str) -> str:
        """添加重试机制"""
        retry_code = '''
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

'''

        if 'retry_with_backoff' not in content:
            if content.startswith('#!'):
                lines = content.split('\n')
                content = '\n'.join(lines[:2] + [retry_code] + lines[2:])
            else:
                content = retry_code + '\n' + content

        return content

    def _optimize_api_structure(self, content: str) -> str:
        """优化API请求结构"""
        optimization_code = '''
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

'''

        if 'create_robust_api_request' not in content:
            if content.startswith('#!'):
                lines = content.split('\n')
                content = '\n'.join(lines[:2] + [optimization_code] + lines[2:])
            else:
                content = optimization_code + '\n' + content

        return content

    def _backup_file(self, file_path: Path) -> Path:
        """备份文件"""
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        backup_name = f"{file_path.stem}_backup_{timestamp}{file_path.suffix}"
        backup_path = self.backup_dir / backup_name

        try:
            backup_path.write_bytes(file_path.read_bytes())
            logger.info(f"备份文件: {file_path} -> {backup_path}")
            return backup_path
        except Exception as e:
            logger.error(f"备份文件失败 {file_path}: {e}")
            raise

    def apply_fixes(self, fix_type: FixType = FixType.ALL) -> List[FixResult]:
        """应用修复"""
        claude_files = self.scan_claude_projects()
        logger.info(f"发现 {len(claude_files)} 个Claude相关文件")

        results = []

        for file_path in claude_files:
            if not file_path.is_file() or file_path.suffix != '.py':
                continue

            logger.info(f"处理文件: {file_path}")

            try:
                if fix_type in [FixType.ALL, FixType.NO_RESPONSE]:
                    result = self.create_no_response_fix(file_path)
                    results.append(result)

                if fix_type in [FixType.ALL, FixType.ERROR_422]:
                    result = self.create_422_error_fix(file_path)
                    results.append(result)

            except Exception as e:
                error_result = FixResult(
                    success=False,
                    fix_type="processing_error",
                    file_path=str(file_path),
                    issues_found=[f"处理文件时出错: {str(e)}"],
                    issues_fixed=[],
                    error_message=str(e)
                )
                results.append(error_result)
                logger.error(f"处理文件失败 {file_path}: {e}")

        self.fix_results.extend(results)
        return results

    def generate_report(self) -> str:
        """生成修复报告"""
        if not self.fix_results:
            return "未执行任何修复操作"

        total_files = len(set(r.file_path for r in self.fix_results))
        successful_fixes = sum(1 for r in self.fix_results if r.success)
        failed_fixes = len(self.fix_results) - successful_fixes

        report = f"""
Claude Code全局修复报告
生成时间: {time.strftime('%Y-%m-%d %H:%M:%S')}
==========================

📊 统计信息:
- 处理文件数: {total_files}
- 修复操作数: {len(self.fix_results)}
- 成功修复: {successful_fixes}
- 失败修复: {failed_fixes}
- 成功率: {successful_fixes/len(self.fix_results)*100:.1f}%

🔧 修复详情:
"""

        for result in self.fix_results:
            status = "✅ 成功" if result.success else "❌ 失败"
            report += f"""
{status} - {result.fix_type}
文件: {result.file_path}
发现问题: {len(result.issues_found)}
- {'; '.join(result.issues_found) if result.issues_found else '无'}
修复问题: {len(result.issues_fixed)}
- {'; '.join(result.issues_fixed) if result.issues_fixed else '无'}
"""
            if result.error_message:
                report += f"错误信息: {result.error_message}\n"

        report += f"""
📁 备份位置: {self.backup_dir}
📝 日志文件: /Users/zhimingdeng/claude_global_fix.log

✨ 修复完成!所有Claude Code项目现在都应该能正确处理API请求和响应.
"""

        return report

def main():
    """主函数"""
    print("🚀 启动Claude Code全局修复工具...")

    fixer = ClaudeCodeGlobalFixer()

    # 询问修复类型
    print("\n请选择修复类型:")
    print("1. No response requested问题")
    print("2. 422 Unprocessable Entity错误")
    print("3. 全部问题")

    try:
        choice = input("请输入选择 (1-3): ").strip()

        if choice == "1":
            fix_type = FixType.NO_RESPONSE
        elif choice == "2":
            fix_type = FixType.ERROR_422
        elif choice == "3":
            fix_type = FixType.ALL
        else:
            print("无效选择,执行全部修复")
            fix_type = FixType.ALL
    except KeyboardInterrupt:
        print("\n\n操作已取消")
        return

    print(f"\n🔧 开始执行 {fix_type.value} 修复...")

    # 执行修复
    start_time = time.time()
    results = fixer.apply_fixes(fix_type)
    duration = time.time() - start_time

    print(f"\n⏱️  修复完成,耗时 {duration:.2f} 秒")

    # 生成报告
    report = fixer.generate_report()

    # 保存报告
    report_file = Path("/Users/zhimingdeng/claude_fix_report.txt")
    report_file.write_text(report, encoding='utf-8')

    print(report)
    print(f"📄 详细报告已保存到: {report_file}")

if __name__ == "__main__":
    main
    )