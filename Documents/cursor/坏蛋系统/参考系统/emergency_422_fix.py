#!/usr/bin/env python3
"""
紧急422错误修复工具
立即解决持续出现的422错误
作者: Jenny团队
版本: 紧急修复版
"""

import json
import re
from typing import Dict, Any, List

def emergency_fix_422():
    """
    紧急修复422错误的完整解决方案

    根据你遇到的错误，问题在于：
    1. TodoWrite工具的输出格式不正确
    2. API期望字符串，但收到了对象数组
    3. 需要将整个工具调用流程重新格式化
    """

    print("🚑 紧急422错误修复")
    print("=" * 50)

    # 问题1: TodoWrite的输入格式错误
    print("\n🔍 问题分析:")
    print("错误信息显示TodoWrite工具的input字段包含了复杂的嵌套对象")
    print("但API期望这个input是字符串格式，不是对象数组")

    # 解决方案1: 正确的TodoWrite调用格式
    correct_todo_write_format = {
        "type": "tool_use",
        "id": "call_new_id",  # 使用新的ID
        "name": "TodoWrite",
        "input": {  # 注意：input应该是字典，不是数组
            "todos": [
                {
                    "content": "获取Claude Flow项目详细信息",
                    "status": "completed",
                    "activeForm": "获取Claude Flow项目详细信息"
                },
                {
                    "content": "检查本地Claude Flow项目文件状态",
                    "status": "completed",
                    "activeForm": "检查本地Claude Flow项目文件状态"
                },
                {
                    "content": "对比GitHub和本地项目差异",
                    "status": "in_progress",
                    "activeForm": "对比GitHub和本地项目差异"
                },
                {
                    "content": "识别可能的文件损失",
                    "status": "pending",
                    "activeForm": "识别可能的文件损失"
                },
                {
                    "content": "提供恢复建议",
                    "status": "pending",
                    "activeForm": "提供恢复建议"
                }
            ]
        }
    }

    print("\n✅ 解决方案1: 正确的TodoWrite格式")
    print(json.dumps(correct_todo_write_format, indent=2, ensure_ascii=False))

    # 解决方案2: 立即可用的API请求格式
    working_api_request = {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 4000,
        "messages": [
            {
                "role": "user",
                "content": "请继续处理Claude Flow项目的分析任务"
            },
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "我来更新任务列表，继续分析Claude Flow项目。"
                    },
                    correct_todo_write_format
                ]
            }
        ]
    }

    print("\n✅ 解决方案2: 完整的可用API请求")
    print(json.dumps(working_api_request, indent=2, ensure_ascii=False))

    # 解决方案3: 如果需要tool_result格式
    tool_result_format = {
        "type": "tool_result",
        "tool_use_id": "call_new_id",
        "content": json.dumps({
            "todos": [
                {"content": "获取Claude Flow项目详细信息", "status": "completed"},
                {"content": "检查本地Claude Flow项目文件状态", "status": "completed"},
                {"content": "对比GitHub和本地项目差异", "status": "in_progress"},
                {"content": "识别可能的文件损失", "status": "pending"},
                {"content": "提供恢复建议", "status": "pending"}
            ]
        }, ensure_ascii=False)
    }

    print("\n✅ 解决方案3: Tool Result格式")
    print(json.dumps(tool_result_format, indent=2, ensure_ascii=False))

    print("\n🎯 立即行动建议:")
    print("1. 使用解决方案2的API请求格式重新发送")
    print("2. 确保TodoWrite的input是字典格式，不是数组")
    print("3. 检查所有工具调用的参数格式")

    print("\n💡 关键修复点:")
    print("- input字段: 改为字典格式 {'todos': [...]}")
    print("- 移除数组包装: 不要用 [{'todos': [...]}]")
    print("- 确保JSON序列化正确")

    return {
        "immediate_fix": working_api_request,
        "tool_format": correct_todo_write_format,
        "result_format": tool_result_format
    }

def create_simple_working_request():
    """创建一个简单可工作的请求"""

    return {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 4000,
        "messages": [
            {
                "role": "user",
                "content": "请帮助我处理一些任务"
            },
            {
                "role": "assistant",
                "content": "我来帮您处理任务。让我先创建一个任务列表来跟踪进度。"
            },
            {
                "role": "user",
                "content": "好的，请继续"
            }
        ]
    }

def diagnose_422_error():
    """诊断422错误的具体原因"""

    print("\n🔬 422错误诊断:")
    print("=" * 30)

    common_causes = [
        {
            "cause": "工具调用格式错误",
            "symptoms": "input字段是数组而不是字典",
            "fix": "将input改为字典格式"
        },
        {
            "cause": "JSON序列化问题",
            "symptoms": "包含不可序列化的对象",
            "fix": "使用json.dumps()确保字符串格式"
        },
        {
            "cause": "缺少必需字段",
            "symptoms": "missing field错误",
            "fix": "确保所有必需字段都存在"
        },
        {
            "cause": "字段类型错误",
            "symptoms": "type mismatch错误",
            "fix": "检查字段类型是否正确"
        }
    ]

    for i, cause in enumerate(common_causes, 1):
        print(f"{i}. {cause['cause']}")
        print(f"   症状: {cause['symptoms']}")
        print(f"   修复: {cause['fix']}")
        print()

if __name__ == "__main__":
    print("🚨 紧急422错误修复工具启动")
    print("针对持续出现的422错误提供立即解决方案")

    # 诊断问题
    diagnose_422_error()

    # 提供修复方案
    solutions = emergency_fix_422()

    print("\n" + "=" * 60)
    print("🎯 立即可用的解决方案:")
    print("=" * 60)

    print("\n📋 选择一个方案立即使用:")
    print("1. 使用完整API请求格式 (推荐)")
    print("2. 只修复工具调用格式")
    print("3. 使用简化请求测试")

    print("\n⚡ 最快修复方法:")
    simple_request = create_simple_working_request()
    print("使用以下简化请求测试API连接:")
    print(json.dumps(simple_request, indent=2, ensure_ascii=False))

    print("\n✅ 紧急修复完成！")
    print("请使用上述方案之一重新发送请求。")