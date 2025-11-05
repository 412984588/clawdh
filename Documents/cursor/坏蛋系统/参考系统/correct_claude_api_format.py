#!/usr/bin/env python3
"""
正确的Claude API格式修复方案
根据官方规范修复422错误
"""

import json

def create_correct_claude_api_request():
    """创建完全正确的Claude API请求"""
    
    print("🎯 创建正确的Claude API请求...")
    
    # 正确的消息结构
    correct_request = {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 4000,
        "messages": [
            # 1. 用户初始请求 - 只能包含text
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "请帮我处理Claude Flow项目的分析任务，包括对比GitHub和本地项目差异，识别文件损失并提供恢复建议。"
                    }
                ]
            },
            # 2. Assistant回复 - 包含tool_use（这是Claude应该输出的）
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "text",
                        "text": "我来帮你处理Claude Flow项目的分析任务。让我先创建一个任务清单来跟踪进度。"
                    },
                    {
                        "type": "tool_use",
                        "id": "call_1",
                        "name": "TodoWrite",
                        "input": {
                            "todos": [
                                {
                                    "content": "获取Claude Flow项目详细信息",
                                    "status": "completed"
                                },
                                {
                                    "content": "检查本地Claude Flow项目文件状态",
                                    "status": "completed"
                                },
                                {
                                    "content": "对比GitHub和本地项目差异",
                                    "status": "in_progress"
                                },
                                {
                                    "content": "识别可能的文件损失",
                                    "status": "pending"
                                },
                                {
                                    "content": "提供恢复建议",
                                    "status": "pending"
                                }
                            ]
                        }
                    }
                ]
            },
            # 3. 用户回传tool_result（模拟工具执行完成）
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": "call_1",
                        "content": [
                            {
                                "type": "text",
                                "text": "TodoWrite工具执行成功，任务清单已创建。现在开始分析GitHub和本地项目差异。"
                            }
                        ]
                    }
                ]
            }
        ]
    }
    
    return correct_request

def create_minimal_working_example():
    """创建最小可运行示例"""
    
    print("🔹 创建最小可运行示例...")
    
    minimal_request = {
        "model": "claude-3-5-sonnet-20240620",
        "max_tokens": 1000,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "你好，请简单介绍一下你自己。"
                    }
                ]
            }
        ]
    }
    
    return minimal_request

def show_key_rules():
    """显示关键规则"""
    
    print("\n📋 Claude API 关键规则:")
    print("=" * 50)
    print("1. user消息只能包含:")
    print("   - {\"type\": \"text\", \"text\": \"...\"}")
    print("   - {\"type\": \"tool_result\", \"tool_use_id\": \"...\", \"content\": [...]}")
    print()
    print("2. assistant消息只能包含:")
    print("   - {\"type\": \"text\", \"text\": \"...\"}")
    print("   - {\"type\": \"tool_use\", \"id\": \"...\", \"name\": \"...\", \"input\": {...}}")
    print()
    print("3. content必须是数组，不能是字符串或对象")
    print("4. tool_use只能出现在assistant角色中")
    print("5. tool_result只能出现在user角色中")
    print("6. 每个content对象都必须有type字段")

if __name__ == "__main__":
    print("🔧 Claude API 格式修复方案")
    print("=" * 50)
    
    # 显示关键规则
    show_key_rules()
    
    # 创建正确的请求
    correct_request = create_correct_claude_api_request()
    
    print("\n✅ 正确的完整API请求:")
    print(json.dumps(correct_request, indent=2, ensure_ascii=False))
    
    # 创建最小示例
    minimal_request = create_minimal_working_example()
    
    print("\n🔹 最小可运行示例:")
    print(json.dumps(minimal_request, indent=2, ensure_ascii=False))
    
    print("\n" + "=" * 50)
    print("🎯 修复总结:")
    print("1. 不再在user消息中放置tool_use")
    print("2. 所有content都是数组格式")
    print("3. 每个content对象都有正确的type字段")
    print("4. 遵循官方API规范")
    
    print("\n✅ 现在这个请求应该可以成功执行，不会出现422错误！")
