#!/usr/bin/env python3
"""
全局Claude Code检查和修复工具
扫描整个电脑中的Claude Code相关文件并应用修复
作者: Jenny团队
版本: 1.0.0
"""

import os
import re
import json
import time
import logging
from typing import List, Dict, Any, Tuple
from pathlib import Path

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GlobalClaudeCodeChecker:
    """全局Claude Code检查器"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.scan_results = {
            "total_files_scanned": 0,
            "files_with_claude_code": 0,
            "files_fixed": 0,
            "files_with_errors": 0,
            "fixes_applied": [],
            "errors_found": []
        }

    def find_claude_code_files(self, base_path: str = "/Users/zhimingdeng") -> List[str]:
        """查找所有Claude Code相关文件"""
        claude_files = []

        # 搜索模式
        search_patterns = [
            r"claude.*code",
            r"Claude.*Code",
            r"claude_code",
            r"max_tokens",
            r"No response requested"
        ]

        self.logger.info(f"开始扫描 {base_path}...")

        try:
            for root, dirs, files in os.walk(base_path):
                # 跳过一些不需要扫描的目录
                dirs[:] = [d for d in dirs if not d.startswith('.') and
                          d not in ['node_modules', '__pycache__', '.git', 'Library']]

                for file in files:
                    if file.endswith('.py'):
                        file_path = os.path.join(root, file)
                        self.scan_results["total_files_scanned"] += 1

                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()

                            # 检查是否包含Claude Code相关内容
                            for pattern in search_patterns:
                                if re.search(pattern, content, re.IGNORECASE):
                                    claude_files.append(file_path)
                                    self.scan_results["files_with_claude_code"] += 1
                                    break

                        except Exception as e:
                            self.logger.warning(f"无法读取文件 {file_path}: {e}")
                            self.scan_results["files_with_errors"] += 1

                # 限制扫描深度避免太慢
                if len(claude_files) > 100:
                    self.logger.info("已找到超过100个Claude Code文件,停止扫描")
                    break

        except Exception as e:
            self.logger.error(f"扫描过程中出错: {e}")

        return claude_files

    def check_file_for_issues(self, file_path: str) -> Dict[str, Any]:
        """检查文件中的问题"""
        issues = {
            "missing_max_tokens": False,
            "no_response_risk": False,
            "chinese_punctuation": False,
            "syntax_errors": False,
            "missing_validation": False
        }

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 检查max_tokens
            if "claude" in content.lower() and "max_tokens" not in content:
                issues["missing_max_tokens"] = True

            # 检查No response requested风险
            if "claude" in content.lower() and len(content.strip()) < 100:
                issues["no_response_risk"] = True

            # 检查中文标点
            chinese_punctuation = [',', '.', ':', ';', '!', '?', '"', '"', ''', ''', '(', ')']
            if any(punct in content for punct in chinese_punctuation):
                issues["chinese_punctuation"] = True

            # 检查语法错误
            try:
                compile(content, file_path, 'exec')
            except SyntaxError:
                issues["syntax_errors"] = True

            # 检查验证逻辑
            if "api" in content.lower() and "validate" not in content.lower():
                issues["missing_validation"] = True

        except Exception as e:
            self.logger.error(f"检查文件 {file_path} 时出错: {e}")

        return issues

    def apply_fixes_to_file(self, file_path: str, issues: Dict[str, Any]) -> bool:
        """应用修复到文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content
            fixes_applied = []

            # 修复中文标点
            if issues["chinese_punctuation"]:
                punctuation_map = {
                    ',': ',', '.': '.', ':': ':', ';': ';',
                    '!': '!', '?': '?', '"': '"', '"': '"',
                    "'": "'", "(": '(', ')': ')'
                }

                for chinese, english in punctuation_map.items():
                    content = content.replace(chinese, english)

                if content != original_content:
                    fixes_applied.append("修复中文标点符号")

            # 添加max_tokens(如果需要)
            if issues["missing_max_tokens"] and "api" in content.lower():
                # 简单的max_tokens添加逻辑
                if '"max_tokens"' not in content:
                    # 在适当位置插入max_tokens
                    content = content.replace('"temperature":', '"max_tokens": 4000,\n    "temperature":')
                    fixes_applied.append("添加max_tokens参数")

            # 增强内容以防止No response requested
            if issues["no_response_risk"]:
                # 添加更详细的提示
                enhanced_content = content + """

# Claude Code 错误预防增强
# 确保请求包含详细内容和max_tokens参数
def enhance_claude_request(user_input):
    if not user_input or len(user_input.strip()) < 10:
        user_input = "请详细执行当前任务并提供分析结果、步骤和建议"

    return {
        "messages": [{"role": "user", "content": user_input}],
        "max_tokens": 4000,
        "temperature": 0.7
    }
"""
                if content != enhanced_content:
                    content = enhanced_content
                    fixes_applied.append("增强请求内容防止No response requested")

            # 保存修复后的文件
            if fixes_applied:
                # 创建备份
                backup_path = file_path + ".backup_" + str(int(time.time()))
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(original_content)

                # 保存修复后的文件
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                self.logger.info(f"已修复文件 {file_path}: {', '.join(fixes_applied)}")
                return True

        except Exception as e:
            self.logger.error(f"修复文件 {file_path} 时出错: {e}")
            self.scan_results["errors_found"].append(f"{file_path}: {str(e)}")

        return False

    def scan_and_fix(self, base_path: str = "/Users/zhimingdeng", apply_fixes: bool = False) -> Dict[str, Any]:
        """扫描并修复所有Claude Code文件"""
        self.logger.info("开始全局Claude Code检查和修复...")

        # 1. 找到所有Claude Code相关文件
        claude_files = self.find_claude_code_files(base_path)

        # 2. 检查每个文件的问题
        files_with_issues = []
        for file_path in claude_files:
            issues = self.check_file_for_issues(file_path)
            if any(issues.values()):
                files_with_issues.append({
                    "file": file_path,
                    "issues": issues
                })

        # 3. 应用修复(如果启用)
        if apply_fixes:
            self.logger.info(f"开始修复 {len(files_with_issues)} 个问题文件...")
            for file_info in files_with_issues:
                if self.apply_fixes_to_file(file_info["file"], file_info["issues"]):
                    self.scan_results["files_fixed"] += 1

        # 4. 生成报告
        report = {
            "scan_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "base_path": base_path,
            "summary": self.scan_results,
            "claude_files_found": len(claude_files),
            "files_with_issues": len(files_with_issues),
            "issue_details": files_with_issues[:10],  # 只显示前10个
            "recommendations": self.generate_recommendations(files_with_issues)
        }

        return report

    def generate_recommendations(self, files_with_issues: List[Dict[str, Any]]) -> List[str]:
        """生成修复建议"""
        recommendations = []

        if files_with_issues:
            recommendations.append("建议对发现的Claude Code文件应用错误处理增强")
            recommendations.append("确保所有API请求包含max_tokens参数")
            recommendations.append("添加输入验证和错误处理逻辑")
            recommendations.append("实施全面的422错误预防机制")

        # 统计最常见的问题
        issue_counts = {
            "missing_max_tokens": 0,
            "no_response_risk": 0,
            "chinese_punctuation": 0,
            "syntax_errors": 0,
            "missing_validation": 0
        }

        for file_info in files_with_issues:
            for issue, has_issue in file_info["issues"].items():
                if has_issue:
                    issue_counts[issue] += 1

        if issue_counts["chinese_punctuation"] > 0:
            recommendations.append(f"修复 {issue_counts['chinese_punctuation']} 个文件的中文标点符号问题")

        if issue_counts["missing_max_tokens"] > 0:
            recommendations.append(f"为 {issue_counts['missing_max_tokens']} 个文件添加max_tokens参数")

        if issue_counts["no_response_risk"] > 0:
            recommendations.append(f"增强 {issue_counts['no_response_risk']} 个文件以防止No response requested错误")

        return recommendations

def main():
    """主函数"""
    print("🔍 全局Claude Code检查和修复工具")
    print("=" * 50)

    checker = GlobalClaudeCodeChecker()

    # 只扫描当前项目目录,避免扫描整个电脑耗时太长
    scan_paths = [
        "/Users/zhimingdeng/Projects",
        "/Users/zhimingdeng/.claude"
    ]

    total_report = {
        "scan_time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "paths_scanned": scan_paths,
        "reports": []
    }

    for path in scan_paths:
        if os.path.exists(path):
            print(f"\n📁 扫描路径: {path}")
            report = checker.scan_and_fix(path, apply_fixes=False)  # 只检查，不修复
            total_report["reports"].append(report)

            print(f"   找到Claude Code文件: {report['claude_files_found']}")
            print(f"   有问题的文件: {report['files_with_issues']}")
            print(f"   扫描的总文件数: {report['summary']['total_files_scanned']}")

    # 生成总报告
    print(f"\n📊 总体扫描结果:")
    total_claude_files = sum(r['claude_files_found'] for r in total_report['reports'])
    total_files_with_issues = sum(r['files_with_issues'] for r in total_report['reports'])
    total_files_scanned = sum(r['summary']['total_files_scanned'] for r in total_report['reports'])

    print(f"   总扫描文件数: {total_files_scanned}")
    print(f"   Claude Code相关文件: {total_claude_files}")
    print(f"   需要修复的文件: {total_files_with_issues}")

    # 显示建议
    all_recommendations = []
    for report in total_report['reports']:
        all_recommendations.extend(report['recommendations'])

    if all_recommendations:
        print(f"\n💡 建议:")
        for i, rec in enumerate(set(all_recommendations), 1):
            print(f"   {i}. {rec}")

    # 保存报告
    with open("global_claude_code_scan_report.json", "w", encoding="utf-8") as f:
        json.dump(total_report, f, ensure_ascii=False, indent=2)

    print(f"\n📄 详细报告已保存到: global_claude_code_scan_report.json")

    print(f"\n✅ 全局检查完成!")
    print(f"ℹ️  本次为检查模式，查看修复后的状态")

if __name__ == "__main__":
    main()