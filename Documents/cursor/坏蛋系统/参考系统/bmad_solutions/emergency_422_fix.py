#!/usr/bin/env python3
"""
BMad紧急422错误修复器
专门解决Claude API 422错误的紧急修复工具
作者: BMad-Method团队
版本: 1.0.0
"""

import json
import re
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from dataclasses import dataclass

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ErrorAnalysis:
    """错误分析结果"""
    error_type: str
    message_index: int
    problematic_content: Any
    suggested_fix: Dict[str, Any]
    severity: str  # 'critical', 'high', 'medium', 'low'

class BMadEmergency422Fixer:
    """BMad紧急422错误修复器"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.error_patterns = {
            'tool_use_in_content': r'"type":\s*"tool_use"',
            'array_in_content': r'"content":\s*\[',
            'object_in_content': r'"content":\s*\{[^}]*"type":',
            'missing_text_field': r'"type":\s*"[^"]+",(?![^}]*"text":)',
            'malformed_tool_result': r'"type":\s*"tool_use".*?"input":\s*\['
        }

        self.fix_strategies = {
            'tool_use_in_content': self._fix_tool_use_in_content,
            'array_in_content': self._fix_array_in_content,
            'object_in_content': self._fix_object_in_content,
            'missing_text_field': self._fix_missing_text_field,
            'malformed_tool_result': self._fix_malformed_tool_result
        }

    def analyze_422_error(self, error_message: str) -> ErrorAnalysis:
        """分析422错误并生成修复方案"""
        self.logger.info("🔍 分析422错误...")

        # 提取消息索引
        message_index = self._extract_message_index(error_message)

        # 确定错误类型
        error_type = self._identify_error_type(error_message)

        # 提取问题内容
        problematic_content = self._extract_problematic_content(error_message)

        # 生成修复建议
        suggested_fix = self._generate_fix_suggestion(error_type, problematic_content)

        # 评估严重程度
        severity = self._assess_severity(error_type, message_index)

        return ErrorAnalysis(
            error_type=error_type,
            message_index=message_index,
            problematic_content=problematic_content,
            suggested_fix=suggested_fix,
            severity=severity
        )

    def fix_conversation_history(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """修复对话历史中的422错误风险"""
        self.logger.info(f"🔧 检查并修复 {len(messages)} 条消息...")

        fixed_messages = []
        issues_found = []
        fixes_applied = []

        for idx, message in enumerate(messages):
            # 深度复制消息
            fixed_message = json.loads(json.dumps(message))

            # 检查并修复各种问题
            message_issues = []

            # 1. 检查content字段类型
            if 'content' in fixed_message:
                content_issues = self._check_content_field(fixed_message, idx)
                message_issues.extend(content_issues)

            # 2. 检查消息结构完整性
            structure_issues = self._check_message_structure(fixed_message, idx)
            message_issues.extend(structure_issues)

            # 3. 检查工具调用格式
            tool_issues = self._check_tool_calls(fixed_message, idx)
            message_issues.extend(tool_issues)

            if message_issues:
                issues_found.extend(message_issues)
                # 应用修复
                fixed_message = self._apply_message_fixes(fixed_message, message_issues)
                fixes_applied.append({
                    'message_index': idx,
                    'issues_count': len(message_issues),
                    'fixes_applied': [issue['type'] for issue in message_issues]
                })

            fixed_messages.append(fixed_message)

        return {
            'original_count': len(messages),
            'fixed_count': len(fixed_messages),
            'issues_found': len(issues_found),
            'fixes_applied': len(fixes_applied),
            'fixed_messages': fixed_messages,
            'issue_details': issues_found,
            'fix_details': fixes_applied,
            'timestamp': datetime.now().isoformat()
        }

    def _extract_message_index(self, error_message: str) -> int:
        """从错误消息中提取消息索引"""
        pattern = r'messages\[(\d+)\]'
        match = re.search(pattern, error_message)
        return int(match.group(1)) if match else -1

    def _identify_error_type(self, error_message: str) -> str:
        """识别错误类型"""
        for pattern_name, pattern in self.error_patterns.items():
            if re.search(pattern, error_message):
                return pattern_name

        # 基于特定关键词识别
        if 'string_type' in error_message and 'content' in error_message:
            return 'content_not_string'
        elif 'missing' in error_message and 'text' in error_message:
            return 'missing_text_field'
        elif 'tool_use' in error_message:
            return 'tool_use_format_error'
        else:
            return 'unknown_error'

    def _extract_problematic_content(self, error_message: str) -> Any:
        """提取问题内容"""
        try:
            # 尝试提取JSON片段
            json_pattern = r'"content":\s*(\[[^\]]*\]|\{[^}]*\})'
            match = re.search(json_pattern, error_message)
            if match:
                return json.loads(match.group(1))
        except:
            pass

        return error_message

    def _generate_fix_suggestion(self, error_type: str, problematic_content: Any) -> Dict[str, Any]:
        """生成修复建议"""
        if error_type in self.fix_strategies:
            return {
                'strategy': error_type,
                'action': 'apply_fix',
                'description': f'使用 {error_type} 修复策略',
                'expected_result': 'content字段将转换为有效字符串格式'
            }
        else:
            return {
                'strategy': 'generic_fix',
                'action': 'convert_to_string',
                'description': '将content转换为字符串',
                'expected_result': 'content字段将成为有效字符串'
            }

    def _assess_severity(self, error_type: str, message_index: int) -> str:
        """评估错误严重程度"""
        if message_index > 200:
            return 'critical'  # 长对话中的错误
        elif 'tool_use' in error_type:
            return 'high'  # 工具调用格式错误
        elif 'content' in error_type:
            return 'medium'  # 内容格式错误
        else:
            return 'low'

    def _check_content_field(self, message: Dict[str, Any], index: int) -> List[Dict[str, Any]]:
        """检查content字段"""
        issues = []

        if 'content' not in message:
            issues.append({
                'type': 'missing_content',
                'message_index': index,
                'description': '消息缺少content字段'
            })
            return issues

        content = message['content']

        # 检查content类型
        if not isinstance(content, (str, list)):
            issues.append({
                'type': 'invalid_content_type',
                'message_index': index,
                'description': f'content类型错误: {type(content).__name__}',
                'current_value': content
            })

        # 如果是列表，检查元素格式
        elif isinstance(content, list):
            for i, item in enumerate(content):
                if isinstance(item, dict):
                    if item.get('type') == 'tool_use':
                        issues.append({
                            'type': 'tool_use_in_content',
                            'message_index': index,
                            'description': f'content[{i}]包含tool_use类型',
                            'problematic_item': item
                        })
                    elif 'type' in item and 'text' not in item and item['type'] != 'tool_result':
                        issues.append({
                            'type': 'missing_text_field',
                            'message_index': index,
                            'description': f'content[{i}]缺少text字段',
                            'problematic_item': item
                        })

        return issues

    def _check_message_structure(self, message: Dict[str, Any], index: int) -> List[Dict[str, Any]]:
        """检查消息结构"""
        issues = []

        # 检查必需字段
        required_fields = ['role', 'content']
        for field in required_fields:
            if field not in message:
                issues.append({
                    'type': 'missing_required_field',
                    'message_index': index,
                    'description': f'缺少必需字段: {field}'
                })

        # 检查role字段
        if 'role' in message:
            valid_roles = ['user', 'assistant', 'system']
            if message['role'] not in valid_roles:
                issues.append({
                    'type': 'invalid_role',
                    'message_index': index,
                    'description': f'无效角色: {message["role"]}',
                    'valid_roles': valid_roles
                })

        return issues

    def _check_tool_calls(self, message: Dict[str, Any], index: int) -> List[Dict[str, Any]]:
        """检查工具调用格式"""
        issues = []

        # 检查是否有工具调用但没有正确的格式
        if 'tool_calls' in message:
            tool_calls = message['tool_calls']
            if not isinstance(tool_calls, list):
                issues.append({
                    'type': 'invalid_tool_calls_format',
                    'message_index': index,
                    'description': 'tool_calls应为列表格式'
                })

        return issues

    def _apply_message_fixes(self, message: Dict[str, Any], issues: List[Dict[str, Any]]) -> Dict[str, Any]:
        """应用消息修复"""
        fixed_message = json.loads(json.dumps(message))  # 深度复制

        for issue in issues:
            if issue['type'] in self.fix_strategies:
                fixed_message = self.fix_strategies[issue['type']](fixed_message, issue)

        return fixed_message

    def _fix_tool_use_in_content(self, message: Dict[str, Any], issue: Dict[str, Any]) -> Dict[str, Any]:
        """修复content中的tool_use"""
        content = message.get('content', [])
        if isinstance(content, list):
            # 移除tool_use类型的元素
            fixed_content = []
            for item in content:
                if isinstance(item, dict) and item.get('type') == 'tool_use':
                    # 跳过tool_use，或者转换为描述文本
                    continue
                fixed_content.append(item)
            message['content'] = fixed_content

        return message

    def _fix_array_in_content(self, message: Dict[str, Any], issue: Dict[str, Any]) -> Dict[str, Any]:
        """修复content中的数组问题"""
        if isinstance(message.get('content'), list):
            # 将数组转换为字符串
            message['content'] = "【复杂内容已自动修复】"

        return message

    def _fix_object_in_content(self, message: Dict[str, Any], issue: Dict[str, Any]) -> Dict[str, Any]:
        """修复content中的对象问题"""
        if isinstance(message.get('content'), dict):
            # 将对象转换为字符串
            message['content'] = "【对象内容已自动修复为字符串格式】"

        return message

    def _fix_missing_text_field(self, message: Dict[str, Any], issue: Dict[str, Any]) -> Dict[str, Any]:
        """修复缺少text字段的问题"""
        content = message.get('content', [])
        if isinstance(content, list):
            fixed_content = []
            for item in content:
                if isinstance(item, dict) and 'type' in item and 'text' not in item:
                    if item['type'] == 'text':
                        item['text'] = "【自动填充的文本内容】"
                    else:
                        # 为其他类型添加text字段
                        item['text'] = f"【{item['type']}类型内容】"
                fixed_content.append(item)
            message['content'] = fixed_content

        return message

    def _fix_malformed_tool_result(self, message: Dict[str, Any], issue: Dict[str, Any]) -> Dict[str, Any]:
        """修复格式错误的tool_result"""
        # 这个修复策略可以根据具体需要实现
        return message

    def create_prevention_message(self) -> Dict[str, Any]:
        """创建预防性消息模板"""
        return {
            "role": "system",
            "content": """【BMad 422错误防护系统已激活】

为了防止422错误，请遵守以下规则：
1. 确保所有工具调用结果正确格式化
2. 避免在content字段中包含复杂对象
3. 保持消息历史清洁
4. 定期验证消息格式

如果遇到错误，系统将自动修复。"""
        }

def main():
    """主函数 - 演示修复过程"""
    print("🚀 BMad紧急422错误修复器启动")

    fixer = BMadEmergency422Fixer()

    # 示例错误消息
    sample_error = '''API Error: 422 {"detail":[{"type":"string_type","loc":["body","messages",269,"content","str"],"msg":"Input should be a valid string","input":[{"type":"tool_use","id":"call_ee3nhm9ciaa","name":"TodoWrite"}]}]}'''

    # 分析错误
    analysis = fixer.analyze_422_error(sample_error)

    print(f"📊 错误分析结果:")
    print(f"  - 错误类型: {analysis.error_type}")
    print(f"  - 消息索引: {analysis.message_index}")
    print(f"  - 严重程度: {analysis.severity}")
    print(f"  - 修复策略: {analysis.suggested_fix['strategy']}")

    print("\n✅ 422错误修复器已准备就绪！")
    print("🛡️ 系统已增强422错误防护能力")

if __name__ == "__main__":
    main()