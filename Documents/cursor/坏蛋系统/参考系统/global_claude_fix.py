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


全局Claude API修复脚本
自动修复项目中所有存在422错误风险的API调用
作者: Jenny团队
版本: 1.0.0
"""

import os
import re
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

# 导入我们的修复器
from claude_api_422_fix import get_claude_422_fix, create_claude_request, fix_claude_api_request

class GlobalClaudeFixer:
    """全局Claude修复器"""

    def __init__(self, project_root: str = None):
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.logger = self._setup_logger()
        self.fixer = get_claude_422_fix()

        # 需要检查的文件模式
        self.file_patterns = [
            "*.py",
            "*.js",
            "*.ts",
            "*.json"
        ]

        # 需要修复的API调用模式
        self.api_call_patterns = [
            r'anthropic\.messages\.create',
            r'claude.*api.*call',
            r'messages.*content.*todos',
            r'"content":\s*\[.*"todos"',
            r'"content":\s*\{.*"todos".*\}',
            r'content.*todos.*data'
        ]

        # 排除的目录
        self.exclude_dirs = {
            '__pycache__',
            'node_modules',
            '.git',
            'venv',
            'env',
            '.venv'
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

    def find_problem_files(self) -> List[Path]:
        """查找可能存在问题的文件"""
        problem_files = []

        self.logger.info(f"开始在项目目录中搜索问题文件: {self.project_root}")

        for pattern in self.file_patterns:
            for file_path in self.project_root.rglob(pattern):
                # 跳过排除的目录
                if any(exclude_dir in file_path.parts for exclude_dir in self.exclude_dirs):
                    continue

                # 检查文件内容是否包含问题模式
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        for api_pattern in self.api_call_patterns:
                            if re.search(api_pattern, content, re.IGNORECASE):
                                problem_files.append(file_path)
                                self.logger.info(f"发现潜在问题文件: {file_path}")
                                break
                except (UnicodeDecodeError, PermissionError):
                    continue

        return problem_files

    def analyze_file_issues(self, file_path: Path) -> Dict[str, Any]:
        """分析文件中的具体问题"""
        issues = {
            "file": str(file_path),
            "api_calls": [],
            "message_format_issues": [],
            "todos_format_issues": [],
            "needs_fix": False
        }

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')

            # 查找API调用
            for i, line in enumerate(lines, 1):
                # 检查Claude API调用
                if re.search(r'anthropic\.messages\.create|claude.*api', line, re.IGNORECASE):
                    issues["api_calls"].append({
                        "line_number": i,
                        "content": line.strip(),
                        "type": "api_call"
                    })

                # 检查消息格式问题
                if '"content"' in line and ('todos' in line or 'TodoWrite' in line):
                    issues["todos_format_issues"].append({
                        "line_number": i,
                        "content": line.strip(),
                        "type": "todos_content"
                    })
                    issues["needs_fix"] = True

                # 检查错误的内容格式
                if re.search(r'"content":\s*\[.*"todos"', line):
                    issues["message_format_issues"].append({
                        "line_number": i,
                        "content": line.strip(),
                        "type": "invalid_content_structure",
                        "description": "内容块结构错误,应该是文本类型而不是直接传递todos数据"
                    })
                    issues["needs_fix"] = True

        except Exception as e:
            self.logger.error(f"分析文件失败 {file_path}: {e}")

        return issues

    def fix_file(self, file_path: Path, backup: bool = True) -> Dict[str, Any]:
        """修复文件中的API调用问题"""
        result = {
            "file": str(file_path),
            "success": False,
            "fixes_applied": [],
            "error": None
        }

        try:
            # 备份原文件
            if backup:
                backup_path = file_path.with_suffix(f"{file_path.suffix}.backup")
                with open(file_path, 'r', encoding='utf-8') as original:
                    with open(backup_path, 'w', encoding='utf-8') as backup_file:
                        backup_file.write(original.read())
                self.logger.info(f"已备份文件: {backup_path}")

            # 读取文件内容
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 应用修复
            fixed_content, fixes = self._apply_fixes(content)

            # 写入修复后的内容
            if fixes:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)

                result["success"] = True
                result["fixes_applied"] = fixes
                self.logger.info(f"成功修复文件: {file_path}, 应用修复: {len(fixes)}")
            else:
                result["success"] = True
                result["fixes_applied"] = ["无需修复"]
                self.logger.info(f"文件无需修复: {file_path}")

        except Exception as e:
            result["error"] = str(e)
            self.logger.error(f"修复文件失败 {file_path}: {e}")

        return result

    def _apply_fixes(self, content: str) -> Tuple[str, List[str]]:
        """应用修复规则"""
        fixes = []
        fixed_content = content

        # 修复1: 替换错误的todos内容格式
        todos_pattern = r'"content":\s*\[.*?"todos".*?\]'
        matches = re.findall(todos_pattern, fixed_content, re.DOTALL)

        for match in matches:
            try:
                # 尝试解析todos数据
                todos_data_match = re.search(r'"todos":\s*(\[.*?\])', match, re.DOTALL)
                if todos_data_match:
                    todos_str = todos_data_match.group(1)
                    todos_data = json.loads(todos_str)

                    # 创建正确的内容格式
                    todos_text = self.fixer._format_todos_as_text(todos_data)
                    correct_content = f'"content": [{{"type": "text", "text": "请处理以下任务列表:\\n\\n{todos_text}"}}]'

                    fixed_content = fixed_content.replace(match, correct_content)
                    fixes.append(f"修复todos内容格式: 将{len(todos_data)}个任务转换为文本格式")

            except json.JSONDecodeError:
                fixes.append("跳过无效的todos JSON格式")
                continue

        # 修复2: 替换直接传递todos数据的API调用
        api_call_pattern = r'(\w+)\s*=\s*(anthropic\.messages\.create|claude.*api)\s*\(\s*{[^}]*"content":\s*{[^}]*"todos"'
        api_matches = re.findall(api_call_pattern, fixed_content, re.DOTALL)

        for match in api_matches:
            var_name, api_name = match
            # 找到完整的API调用
            full_call_pattern = rf'{var_name}\s*=\s*{re.escape(api_name)}\s*\([^)]*\)'
            full_match = re.search(full_call_pattern, fixed_content, re.DOTALL)

            if full_match:
                # 创建修复后的API调用
                fixed_call = f'''
# 修复后的API调用
import sys
sys.path.append('/Users/zhimingdeng/Projects/女王条纹测试2')
from claude_api_422_fix import create_claude_request

# 创建格式正确的请求
claude_request = create_claude_request(
    user_message="请处理当前任务",
    todos_data=current_todos  # 你的todos数据
)

# 执行API调用
{var_name} = anthropic.messages.create(**claude_request)
'''
                fixed_content = fixed_content.replace(full_match.group(0), fixed_call.strip())
                fixes.append(f"修复API调用: {api_name}")

        # 修复3: 更新导入语句
        if fixes and "claude_api_422_fix" not in fixed_content:
            import_pattern = r'(import\s+[^n]|from\s+[^n])'
            if re.search(import_pattern, fixed_content):
                # 在第一个import后添加我们的导入
                fixed_content = re.sub(
                    r'(import\s+.*?)\n',
                    r'\1\n# Claude API 422错误修复\nsys.path.append("/Users/zhimingdeng/Projects/女王条纹测试2")\nfrom claude_api_422_fix import create_claude_request, fix_claude_api_request\n',
                    fixed_content,
                    count=1
                )
                fixes.append("添加Claude API修复导入")

        return fixed_content, fixes

    def create_global_fix_summary(self) -> Dict[str, Any]:
        """创建全局修复摘要"""
        summary = {
            "project_root": str(self.project_root),
            "scan_time": "",
            "files_scanned": 0,
            "problem_files_found": 0,
            "fixes_applied": 0,
            "files_fixed": 0,
            "errors": [],
            "details": []
        }

        # 查找问题文件
        problem_files = self.find_problem_files()
        summary["problem_files_found"] = len(problem_files)

        if not problem_files:
            summary["message"] = "未发现需要修复的文件"
            return summary

        # 分析和修复文件
        for file_path in problem_files:
            try:
                # 分析问题
                issues = self.analyze_file_issues(file_path)
                summary["details"].append(issues)

                if issues["needs_fix"]:
                    # 修复文件
                    fix_result = self.fix_file(file_path)
                    if fix_result["success"]:
                        summary["files_fixed"] += 1
                        summary["fixes_applied"] += len(fix_result["fixes_applied"])
                    else:
                        summary["errors"].append({
                            "file": str(file_path),
                            "error": fix_result["error"]
                        })

                summary["files_scanned"] += 1

            except Exception as e:
                summary["errors"].append({
                    "file": str(file_path),
                    "error": str(e)
                })

        # 设置扫描时间
        import datetime
        summary["scan_time"] = datetime.datetime.now().isoformat()

        return summary

    def run_global_fix(self) -> Dict[str, Any]:
        """运行全局修复"""
        self.logger.info("开始全局Claude API修复...")
        self.logger.info(f"项目目录: {self.project_root}")

        summary = self.create_global_fix_summary()

        # 输出结果
        self.logger.info("=" * 50)
        self.logger.info("全局修复完成!")
        self.logger.info(f"扫描文件数: {summary['files_scanned']}")
        self.logger.info(f"发现问题文件: {summary['problem_files_found']}")
        self.logger.info(f"修复文件数: {summary['files_fixed']}")
        self.logger.info(f"应用修复数: {summary['fixes_applied']}")
        self.logger.info(f"错误数: {len(summary['errors'])}")

        if summary['errors']:
            self.logger.warning("修复过程中遇到错误:")
            for error in summary['errors']:
                self.logger.warning(f"  {error['file']}: {error['error']}")

        # 保存修复报告
        report_path = self.project_root / "claude_fix_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)

        self.logger.info(f"修复报告已保存到: {report_path}")

        return summary

def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="全局Claude API 422错误修复工具")
    parser.add_argument(
        "--project-root",
        type=str,
        default="/Users/zhimingdeng/Projects/女王条纹测试2",
        help="项目根目录路径"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="只分析不修复"
    )

    args = parser.parse_args()

    # 创建修复器
    fixer = GlobalClaudeFixer(args.project_root)

    if args.dry_run:
        # 只分析
        print("=== 干运行模式 - 只分析不修复 ===")
        problem_files = fixer.find_problem_files()
        print(f"发现 {len(problem_files)} 个潜在问题文件:")

        for file_path in problem_files:
            issues = fixer.analyze_file_issues(file_path)
            print(f"\n文件: {file_path}")
            if issues["needs_fix"]:
                print("  状态: 需要修复")
                print(f"  问题类型: {len(issues['todos_format_issues'])} 个todos格式问题")
            else:
                print("  状态: 无需修复")
    else:
        # 执行修复
        result = fixer.run_global_fix()

        if result["files_fixed"] > 0:
            print(f"\n🎉 修复完成! 成功修复 {result['files_fixed']} 个文件")
            print(f"📊 总共应用 {result['fixes_applied']} 个修复")
        else:
            print("\n✅ 未发现需要修复的问题")

if __name__ == "__main__":
    main()