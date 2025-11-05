#!/usr/bin/env python3
"""
专门修复TodoWrite调用格式的工具
解决数组结构问题
"""

import re
import json
from pathlib import Path

def fix_todo_write_calls():
    """修复TodoWrite调用格式"""
    print("🔧 修复TodoWrite调用格式...")

    current_dir = Path(".")
    fixed_files = []

    # 要查找的文件模式
    file_patterns = [
        "*claude*.py",
        "*fix*.py",
        "*solution*.py",
        "*api*.py"
    ]

    files_to_check = []
    for pattern in file_patterns:
        files_to_check.extend(current_dir.glob(pattern))

    # 去重
    files_to_check = list(set(files_to_check))

    for py_file in files_to_check:
        if py_file.name.startswith('todo_write_fix'):
            continue

        print(f"🔍 检查: {py_file.name}")

        try:
            content = py_file.read_text(encoding='utf-8', errors='ignore')
            original_content = content

            # 修复TodoWrite调用 - 确保正确的格式
            fixed_content = fix_todo_format(content)

            if fixed_content != original_content:
                # 备份
                backup_path = py_file.with_suffix(f'{py_file.suffix}.backup')
                if not backup_path.exists():
                    backup_path.write_text(original_content, encoding='utf-8')

                py_file.write_text(fixed_content, encoding='utf-8')
                fixed_files.append(py_file.name)
                print(f"✅ 修复: {py_file.name}")
            else:
                print(f"ℹ️  无需修复: {py_file.name}")

        except Exception as e:
            print(f"❌ 修复失败 {py_file.name}: {e}")

    print(f"\n🎉 修复完成!修复了 {len(fixed_files)} 个文件:")
    for name in fixed_files:
        print(f"  - {name}")

def fix_todo_format(content):
    """修复TodoWrite格式"""
    # 查找所有TodoWrite调用
    pattern = r'TodoWrite\(\s*todos\s*=\s*(\[.*?\])\s*\)'

    def replace_match(match):
        todos_str = match.group(1)

        try:
            # 尝试解析为JSON
            todos_list = json.loads(todos_str)

            # 确保格式正确
            fixed_todos = []
            for item in todos_list:
                if isinstance(item, list):
                    # 处理错误格式: [{"content": "...", "status": "..."}, "activeForm", "status"]
                    if len(item) >= 3:
                        # 重新构建为正确的对象格式
                        todo_obj = {
                            "content": item[0] if isinstance(item[0], dict) else item[0],
                            "status": item[1] if len(item) > 1 else "pending",
                            "activeForm": item[2] if len(item) > 2 else item[0]
                        }
                        # 如果第一个元素是字典,合并其属性
                        if isinstance(item[0], dict):
                            todo_obj.update(item[0])
                        fixed_todos.append(todo_obj)
                elif isinstance(item, dict):
                    # 检查必要字段
                    if 'content' not in item:
                        item['content'] = item.get('activeForm', '未知任务')
                    if 'status' not in item:
                        item['status'] = 'pending'
                    if 'activeForm' not in item:
                        item['activeForm'] = item['content']
                    fixed_todos.append(item)

            # 生成新的调用
            fixed_todos_json = json.dumps(fixed_todos, ensure_ascii=False, indent=2)
            return f"TodoWrite(todos={fixed_todos_json})"

        except (json.JSONDecodeError, Exception):
            # 如果解析失败,返回原始调用但添加基本修复
            return match.group(0)

    # 应用修复
    fixed_content = re.sub(pattern, replace_match, content, flags=re.DOTALL)

    return fixed_content

def create_working_example():
    """创建一个正常工作的TodoWrite示例"""
    print("\n📝 创建正确的TodoWrite示例...")

    example_content = '''#!/usr/bin/env python3
"""
正确的TodoWrite使用示例
"""

# 正确的格式
todos = [
    {
        "content": "任务描述",
        "status": "pending",  # pending/in_progress/completed
        "activeForm": "任务进行中的描述"
    }
]

# 使用示例
# TodoWrite(todos=todos)
'''

    example_file = Path("correct_todo_example.py")
    example_file.write_text(example_content, encoding='utf-8')
    print(f"✅ 创建示例文件: {example_file}")

if __name__ == "__main__":
    fix_todo_write_calls()
    create_working_example()

    print("\n📋 修复说明:")
    print("- 修复TodoWrite调用中的数组格式错误")
    print("- 确保每个todo都是完整的对象结构")
    print("- 提供正确的content,status,activeForm字段")