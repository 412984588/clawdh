#!/usr/bin/env python3
"""
Claude消息内容修复器
专门用于修复和验证Claude API消息格式，防止422错误
作者: Jenny团队
版本: 1.0.0
"""

import logging
from typing import Dict, List, Any, Optional, NamedTuple
from dataclasses import dataclass
from datetime import datetime

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ValidationResult(NamedTuple):
    """验证结果"""
    is_valid: bool
    message_index: int
    issues: List[str]

@dataclass
class MessageValidationResult:
    """消息验证结果"""
    message_index: int
    is_valid: bool
    issues: List[str]
    suggested_fix: Optional[str] = None

class ClaudeMessagesFixer:
    """Claude消息修复器"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # 必需字段
        self.required_fields = ['role', 'content']

        # 有效角色
        self.valid_roles = ['user', 'assistant', 'system']

        # 内容替换策略
        self.content_replacements = {
            None: "我需要更多信息来回答这个问题。",
            "": "请告诉我更多详情，我会尽力帮助您。",
            "null": "我理解您的需求，请提供更多具体信息。"
        }

    def validate_and_fix_messages(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """验证并修复消息列表"""
        self.logger.info(f"🔍 验证 {len(messages)} 条消息...")

        validation_results = []
        fixed_messages = []
        fixes_applied = 0

        for idx, message in enumerate(messages):
            validation_result = self._validate_single_message(message, idx)
            validation_results.append(MessageValidationResult(
                message_index=idx,
                is_valid=validation_result.is_valid,
                issues=validation_result.issues
            ))

            if validation_result.is_valid:
                fixed_messages.append(message)
            else:
                fixed_message = self._fix_message(message, validation_result.issues)
                fixed_messages.append(fixed_message)
                fixes_applied += 1

                self.logger.info(f"🔧 修复消息 {idx}: {', '.join(validation_result.issues)}")

        return {
            "issues_found": len([r for r in validation_results if not r.is_valid]),
            "fixes_applied": fixes_applied,
            "fixed_messages": fixed_messages,
            "validation_results": validation_results
        }

    def _validate_single_message(self, message: Dict[str, Any], index: int) -> ValidationResult:
        """验证单条消息"""
        issues = []

        # 检查是否为字典
        if not isinstance(message, dict):
            issues.append(f"消息类型错误: 应为字典，实际为 {type(message).__name__}")
            return ValidationResult(False, index, issues)

        # 检查必需字段
        for field in self.required_fields:
            if field not in message:
                issues.append(f"缺少必需字段: {field}")
            elif message[field] is None:
                issues.append(f"字段值为None: {field}")
            elif field == 'content' and message[field] == "":
                issues.append(f"字段内容为空: {field}")

        # 检查角色有效性
        if 'role' in message:
            role = message['role']
            if role not in self.valid_roles:
                issues.append(f"无效角色: {role} (应为: {', '.join(self.valid_roles)})")

        # 检查内容类型
        if 'content' in message:
            content = message['content']
            if content is not None and not isinstance(content, (str, list)):
                issues.append(f"内容类型错误: 应为字符串或列表，实际为 {type(content).__name__}")

        return ValidationResult(len(issues) == 0, index, issues)

    def _fix_message(self, message: Dict[str, Any], issues: List[str]) -> Dict[str, Any]:
        """修复消息"""
        fixed_message = message.copy()

        # 修复缺失字段
        if 'role' not in fixed_message:
            fixed_message['role'] = 'user'
            self.logger.debug("  - 添加默认角色: user")

        if 'content' not in fixed_message or fixed_message['content'] in [None, "", "null"]:
            fixed_message['content'] = self.content_replacements.get(fixed_message.get('content'), "请提供更多信息。")
            self.logger.debug(f"  - 修复内容: {fixed_message['content'][:50]}...")

        # 修复无效角色
        if fixed_message.get('role') not in self.valid_roles:
            fixed_message['role'] = 'user'
            self.logger.debug("  - 修正为有效角色: user")

        # 修复内容类型
        content = fixed_message.get('content')
        if content is not None and not isinstance(content, (str, list)):
            fixed_message['content'] = str(content)
            self.logger.debug("  - 转换内容类型为字符串")

        return fixed_message

    def create_safe_message(self, role: str, content: str) -> Dict[str, Any]:
        """创建安全的消息"""
        if role not in self.valid_roles:
            role = 'user'
            self.logger.warning(f"无效角色 {role}，使用默认角色 user")

        if not content or content.strip() == "":
            content = "请告诉我如何帮助您。"
            self.logger.warning("内容为空，使用默认内容")

        return {
            "role": role,
            "content": content.strip()
        }

    def validate_conversation_flow(self, messages: List[Dict[str, Any]]) -> List[str]:
        """验证对话流程"""
        issues = []

        if len(messages) < 1:
            return ["对话消息数量过少"]

        # 检查对话开始
        first_message = messages[0]
        if first_message.get('role') != 'user':
            issues.append("对话应从用户消息开始")

        # 检查角色交替
        for i in range(1, len(messages)):
            prev_role = messages[i-1].get('role')
            curr_role = messages[i].get('role')

            if prev_role == curr_role:
                issues.append(f"消息 {i-1} 和 {i} 角色重复: {curr_role}")

        return issues

    def get_message_statistics(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """获取消息统计信息"""
        if not messages:
            return {"total_messages": 0}

        role_counts = {}
        content_lengths = []

        for message in messages:
            role = message.get('role', 'unknown')
            role_counts[role] = role_counts.get(role, 0) + 1

            content = message.get('content', '')
            if isinstance(content, str):
                content_lengths.append(len(content))
            elif isinstance(content, list):
                # 对于内容列表，计算总长度
                total_length = 0
                for item in content:
                    if isinstance(item, dict) and 'text' in item:
                        total_length += len(item['text'])
                    elif isinstance(item, str):
                        total_length += len(item)
                content_lengths.append(total_length)

        return {
            "total_messages": len(messages),
            "role_distribution": role_counts,
            "average_content_length": sum(content_lengths) / len(content_lengths) if content_lengths else 0,
            "max_content_length": max(content_lengths) if content_lengths else 0,
            "min_content_length": min(content_lengths) if content_lengths else 0
        }

# 示例使用
def main():
    """主函数示例"""
    fixer = ClaudeMessagesFixer()

    # 测试有问题的消息
    problematic_messages = [
        {"role": "user", "content": "你好"},
        {"role": "assistant"},  # 缺少content
        {"role": "user", "content": None},  # content为None
        {"role": "assistant", "content": ""},  # content为空
        {"role": "invalid_role", "content": "测试"}  # 无效角色
    ]

    print("🔧 测试消息修复器...")
    result = fixer.validate_and_fix_messages(problematic_messages)

    print(f"✅ 发现问题: {result['issues_found']}")
    print(f"🛠️ 应用修复: {result['fixes_applied']}")
    print(f"📊 修复后消息数: {len(result['fixed_messages'])}")

    # 获取统计信息
    stats = fixer.get_message_statistics(result['fixed_messages'])
    print(f"📈 消息统计: {stats}")

if __name__ == "__main__":
    main()