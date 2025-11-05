#!/usr/bin/env python3
"""
工具调用结果格式化工具
专门解决Claude API中工具调用结果的422格式错误
作者: Jenny团队
版本: 1.0.0
"""

import json
import logging
from typing import Dict, List, Any, Union

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ToolResultFormatter:
    """工具调用结果格式化器"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def format_tool_result(self, tool_call_data: Dict) -> Dict[str, Any]:
        """格式化工具调用结果为API要求的格式"""

        try:
            # 提取工具调用信息
            tool_id = tool_call_data.get("id", "")
            tool_name = tool_call_data.get("name", "")
            tool_input = tool_call_data.get("input", [])

            # 将工具输入转换为字符串
            if isinstance(tool_input, list):
                # 特殊处理TodoWrite工具
                if tool_name == "TodoWrite":
                    content_str = self._format_todo_write_result(tool_input)
                else:
                    content_str = json.dumps(tool_input, ensure_ascii=False, indent=2)
            elif isinstance(tool_input, dict):
                content_str = json.dumps(tool_input, ensure_ascii=False, indent=2)
            else:
                content_str = str(tool_input)

            # 构造正确的tool_result格式
            formatted_result = {
                "type": "tool_result",
                "tool_use_id": tool_id,
                "content": content_str
            }

            return {
                "success": True,
                "formatted_result": formatted_result,
                "original_data": tool_call_data
            }

        except Exception as e:
            self.logger.error(f"格式化工具结果失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "original_data": tool_call_data
            }

    def _format_todo_write_result(self, todo_input: List) -> str:
        """格式化TodoWrite工具的结果"""
        try:
            if not todo_input:
                return "Todo列表已更新"

            # 提取todos信息
            todos = []
            for item in todo_input:
                if isinstance(item, dict) and "todos" in item:
                    todos.extend(item["todos"])
                elif isinstance(item, dict):
                    todos.append(item)

            # 生成用户友好的描述
            if not todos:
                return "Todo列表已更新"

            completed_count = sum(1 for todo in todos if todo.get("status") == "completed")
            pending_count = sum(1 for todo in todos if todo.get("status") == "pending")
            in_progress_count = sum(1 for todo in todos if todo.get("status") == "in_progress")

            result_parts = []
            if completed_count > 0:
                result_parts.append(f"已完成 {completed_count} 项任务")
            if in_progress_count > 0:
                result_parts.append(f"正在进行 {in_progress_count} 项任务")
            if pending_count > 0:
                result_parts.append(f"待处理 {pending_count} 项任务")

            # 添加具体的任务信息
            task_details = []
            for todo in todos[:5]:  # 只显示前5个任务
                status_icon = {
                    "completed": "✅",
                    "in_progress": "🔄",
                    "pending": "⏳"
                }.get(todo.get("status", ""), "📝")

                task_info = f"{status_icon} {todo.get('content', '未知任务')}"
                task_details.append(task_info)

            if task_details:
                result_parts.append("\\n具体任务:")
                result_parts.extend(task_details)

            return "\\n".join(result_parts)

        except Exception as e:
            self.logger.error(f"格式化TodoWrite结果失败: {e}")
            return "Todo列表已更新"

    def fix_api_message_format(self, messages: List[Dict]) -> List[Dict]:
        """修复API消息格式中的工具结果问题"""

        fixed_messages = []

        for message in messages:
            if message.get("role") == "assistant" and isinstance(message.get("content"), list):
                # 处理助手消息中的内容块
                fixed_content = []

                for content_block in message["content"]:
                    if isinstance(content_block, dict):
                        block_type = content_block.get("type")

                        if block_type == "tool_use":
                            # 保持tool_use块不变
                            fixed_content.append(content_block)
                        elif block_type == "tool_result":
                            # 修复tool_result块格式
                            if "content" not in content_block and "input" in content_block:
                                # 这种情况通常发生在工具结果没有被正确格式化
                                formatted_result = self.format_tool_result(content_block)
                                if formatted_result["success"]:
                                    fixed_content.append(formatted_result["formatted_result"])
                                else:
                                    # 创建一个基本的tool_result
                                    fixed_content.append({
                                        "type": "tool_result",
                                        "tool_use_id": content_block.get("id", ""),
                                        "content": json.dumps(content_block.get("input", []), ensure_ascii=False)
                                    })
                            else:
                                fixed_content.append(content_block)
                        elif block_type == "text":
                            # 确保text块有text字段
                            if "text" not in content_block:
                                content_block["text"] = ""
                            fixed_content.append(content_block)
                        else:
                            # 其他类型的块，保持原样
                            fixed_content.append(content_block)
                    else:
                        # 非字典类型的内容，转换为text块
                        fixed_content.append({
                            "type": "text",
                            "text": str(content_block)
                        })

                # 创建修复后的消息
                fixed_message = message.copy()
                fixed_message["content"] = fixed_content
                fixed_messages.append(fixed_message)
            else:
                # 其他类型的消息，保持原样
                fixed_messages.append(message)

        return fixed_messages

    def validate_and_fix_request(self, api_request: Dict) -> Dict[str, Any]:
        """验证并修复API请求格式"""

        try:
            fixed_request = api_request.copy()

            # 检查并修复messages字段
            if "messages" in fixed_request:
                fixed_messages = self.fix_api_message_format(fixed_request["messages"])
                fixed_request["messages"] = fixed_messages

            # 检查必需字段
            if "max_tokens" not in fixed_request:
                fixed_request["max_tokens"] = 4000

            if "model" not in fixed_request:
                fixed_request["model"] = "claude-3-5-sonnet-20240620"

            return {
                "success": True,
                "fixed_request": fixed_request,
                "validation_passed": True
            }

        except Exception as e:
            self.logger.error(f"验证修复请求失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "fixed_request": api_request
            }

def create_sample_request_with_tool_result() -> Dict:
    """创建包含工具结果的示例请求"""
    return {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 4000,
        "messages": [
            {
                "role": "user",
                "content": "请帮我管理任务列表"
            },
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "我来帮您管理任务列表。"
                    },
                    {
                        "type": "tool_use",
                        "id": "call_example123",
                        "name": "TodoWrite",
                        "input": [
                            {
                                "todos": [
                                    {
                                        "content": "完成项目报告",
                                        "status": "in_progress",
                                        "activeForm": "正在撰写报告内容"
                                    },
                                    {
                                        "content": "回复客户邮件",
                                        "status": "completed",
                                        "activeForm": "已回复"
                                    },
                                    {
                                        "content": "准备明天的会议",
                                        "status": "pending",
                                        "activeForm": "待准备"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "role": "user",
                "content": "工具调用完成了吗？"
            }
        ]
    }

def main():
    """主函数 - 演示工具结果格式化"""
    print("🔧 工具调用结果格式化工具")
    print("=" * 50)

    formatter = ToolResultFormatter()

    # 创建示例请求
    sample_request = create_sample_request_with_tool_result()

    print("\\n📋 示例API请求:")
    print(json.dumps(sample_request, indent=2, ensure_ascii=False))

    print("\\n🔍 验证和修复请求格式...")
    validation_result = formatter.validate_and_fix_request(sample_request)

    if validation_result["success"]:
        print("✅ 请求格式验证和修复成功!")

        print("\\n📄 修复后的请求:")
        print(json.dumps(validation_result["fixed_request"], indent=2, ensure_ascii=False))

        # 显示具体的修复内容
        fixed_request = validation_result["fixed_request"]
        original_messages = sample_request["messages"]
        fixed_messages = fixed_request["messages"]

        print("\\n🔧 应用的修复:")
        if len(fixed_messages) > len(original_messages):
            print("   - 添加了tool_result消息块")

        for i, (orig_msg, fixed_msg) in enumerate(zip(original_messages, fixed_messages)):
            if isinstance(fixed_msg.get("content"), list):
                for j, block in enumerate(fixed_msg["content"]):
                    if block.get("type") == "tool_result":
                        print(f"   - 消息 {i+1} 块 {j+1}: 修复了tool_result格式")

    else:
        print(f"❌ 请求格式修复失败: {validation_result['error']}")

    print("\\n💡 使用说明:")
    print("1. 在API调用前使用此工具验证请求格式")
    print("2. 特别注意工具调用结果的格式化")
    print("3. 确保所有tool_result块都包含正确的字段")
    print("4. 可以集成到API调用流程中自动修复")

if __name__ == "__main__":
    main()