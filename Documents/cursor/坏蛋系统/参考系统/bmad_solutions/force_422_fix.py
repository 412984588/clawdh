#!/usr/bin/env python3
"""
强制422错误修复补丁
直接在API调用层面强制拦截和修复422错误
作者: BMad-Method团队
版本: 1.0.0 - 紧急修复版
"""

import json
import re
import sys
import logging
from pathlib import Path
from typing import Dict, List, Any, Union

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def force_fix_422_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """强制修复422错误的请求"""
    logger.info("🚨 启动强制422错误修复...")

    if not isinstance(request_data, dict):
        logger.warning("请求数据不是字典格式")
        return request_data

    if "messages" not in request_data:
        logger.warning("请求中没有messages字段")
        return request_data

    messages = request_data["messages"]
    if not isinstance(messages, list):
        logger.warning("messages字段不是列表格式")
        return request_data

    logger.info(f"🔍 检查 {len(messages)} 条消息...")

    fixed_messages = []
    issues_found = 0
    fixes_applied = 0

    for idx, message in enumerate(messages):
        fixed_message = force_fix_single_message(message, idx)
        if fixed_message != message:
            issues_found += 1
            fixes_applied += 1
            logger.info(f"🔧 修复消息 {idx}")

        fixed_messages.append(fixed_message)

    if issues_found > 0:
        logger.info(f"✅ 强制修复完成: {issues_found} 个问题, {fixes_applied} 个修复")
        request_data["messages"] = fixed_messages
    else:
        logger.info("✅ 消息格式正常，无需修复")

    return request_data

def force_fix_single_message(message: Dict[str, Any], index: int) -> Dict[str, Any]:
    """强制修复单条消息"""
    if not isinstance(message, dict):
        return {"role": "user", "content": "【消息格式已自动修复】"}

    fixed_message = message.copy()

    # 确保有role字段
    if "role" not in fixed_message:
        fixed_message["role"] = "user"

    # 重点修复content字段
    if "content" in fixed_message:
        content = fixed_message["content"]

        # 处理列表类型的content
        if isinstance(content, list):
            fixed_content = []

            for item in content:
                if isinstance(item, dict):
                    item_type = item.get("type", "")

                    # 🚨 关键修复：移除所有tool_use类型
                    if item_type == "tool_use":
                        logger.warning(f"  移除tool_use类型: {item.get('name', 'unknown')}")
                        continue

                    # 修复其他类型
                    if item_type == "text":
                        if "text" not in item:
                            item["text"] = "【文本内容已自动补充】"
                    elif item_type == "tool_result":
                        if "tool_use_id" not in item:
                            item["tool_use_id"] = "unknown"
                        if "content" not in item:
                            item["content"] = "【工具结果已自动补充】"
                    else:
                        # 未知类型，转换为text
                        item = {
                            "type": "text",
                            "text": f"【{item_type}类型内容已自动转换】"
                        }

                    fixed_content.append(item)
                else:
                    # 非字典项，转换为text
                    fixed_content.append({
                        "type": "text",
                        "text": str(item)
                    })

            fixed_message["content"] = fixed_content

        # 处理字典类型的content
        elif isinstance(content, dict):
            # 如果是tool_use格式，完全替换
            if content.get("type") == "tool_use":
                logger.warning(f"  完全替换tool_use内容: {content.get('name', 'unknown')}")
                fixed_message["content"] = "【工具调用内容已自动清理】"
            else:
                # 其他字典类型，转换为字符串
                fixed_message["content"] = json.dumps(content, ensure_ascii=False)

        # 处理其他类型
        elif not isinstance(content, str):
            fixed_message["content"] = str(content)

        # 确保字符串不为空
        elif isinstance(content, str) and content.strip() == "":
            fixed_message["content"] = "【空内容已自动补充】"

    else:
        # 如果没有content字段，添加默认内容
        fixed_message["content"] = "【缺失内容已自动补充】"

    return fixed_message

def create_emergency_patch():
    """创建紧急补丁文件"""
    patch_content = '''
"""
紧急422错误防护补丁
在API调用前自动应用
"""

import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 导入强制修复函数
from bmad_solutions.force_422_fix import force_fix_422_request

# 自动补丁函数
def auto_patch_request(request_data):
    """自动应用422错误防护补丁"""
    return force_fix_422_request(request_data)

# 立即应用补丁
if hasattr(sys.modules.get('anthropic', None), 'Anthropic'):
    try:
        import anthropic

        # 保存原始messages.create方法
        original_create = anthropic.Anthropic.messages.create

        def patched_create(*args, **kwargs):
            # 自动修复请求数据
            if kwargs:
                kwargs = auto_patch_request(kwargs)

            # 调用原始方法
            return original_create(*args, **kwargs)

        # 应用补丁
        anthropic.Anthropic.messages.create = patched_create
        print("✅ 紧急422错误防护补丁已应用")

    except Exception as e:
        print(f"⚠️ 补丁应用失败: {e}")

print("🛡️ 紧急422错误防护补丁已加载")
'''

    patch_file = Path("/Users/zhimingdeng/Projects/女王条纹测试2/emergency_422_patch.py")
    with open(patch_file, 'w', encoding='utf-8') as f:
        f.write(patch_content)

    print(f"✅ 紧急补丁已创建: {patch_file}")
    return patch_file

def main():
    """主函数 - 测试强制修复"""
    print("🚨 启动强制422错误修复测试...")

    # 测试用例：模拟有问题的请求
    problematic_request = {
        "model": "claude-3-5-sonnet-20241022",
        "messages": [
            {"role": "user", "content": "你好"},
            {"role": "assistant", "content": [
                {"type": "text", "text": "我理解您的需求"},
                {"type": "tool_use", "id": "call_test", "name": "TodoWrite", "input": [{"todos": []}]},  # 这会导致422错误
                {"type": "text", "text": "继续回复"}
            ]},
            {"role": "user", "content": "请继续"}
        ]
    }

    print("🔍 测试原始请求...")
    print(f"原始消息数: {len(problematic_request['messages'])}")

    # 检查原始请求中的问题
    for i, msg in enumerate(problematic_request["messages"]):
        if isinstance(msg.get("content"), list):
            for j, item in enumerate(msg["content"]):
                if isinstance(item, dict) and item.get("type") == "tool_use":
                    print(f"⚠️ 发现问题: 消息{i}, content[{j}] 包含tool_use")

    print("\n🔧 应用强制修复...")
    fixed_request = force_fix_422_request(problematic_request)

    print("✅ 修复完成，检查结果...")

    # 检查修复后的请求
    tool_use_count = 0
    for i, msg in enumerate(fixed_request["messages"]):
        if isinstance(msg.get("content"), list):
            for j, item in enumerate(msg["content"]):
                if isinstance(item, dict) and item.get("type") == "tool_use":
                    tool_use_count += 1
                    print(f"❌ 仍然存在问题: 消息{i}, content[{j}] 包含tool_use")

    if tool_use_count == 0:
        print("✅ 成功移除所有tool_use类型，请求现在是安全的")
    else:
        print(f"⚠️ 仍有 {tool_use_count} 个tool_use类型未移除")

    # 创建紧急补丁
    print("\n📝 创建紧急补丁文件...")
    patch_file = create_emergency_patch()

    print(f"\n🎯 使用方法:")
    print(f"1. 在您的代码开头导入: import emergency_422_patch")
    print(f"2. 或者在API调用前执行: emergency_422_patch.auto_patch_request(request_data)")

    print(f"\n🛡️ 强制422错误修复系统已准备就绪！")

if __name__ == "__main__":
    main()