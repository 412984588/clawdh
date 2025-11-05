#!/usr/bin/env python3
"""
紧急修复工具 - 修复422错误
"""

import json
import re
import os
from pathlib import Path

def emergency_fix():
    """紧急修复422错误"""
    print("🚨 紧急修复422错误...")

    current_dir = Path(".")
    fixed_files = []

    for py_file in current_dir.glob("*.py"):
        if py_file.name.startswith("emergency_fix") or py_file.name.startswith("quick_fix"):
            continue

        print(f"🔍 检查: {py_file.name}")

        try:
            content = py_file.read_text(encoding='utf-8', errors='ignore')
            original_content = content

            # 修复语法错误 - 删除错误的max_tokens行
            lines = content.split('\n')
            fixed_lines = []

            for i, line in enumerate(lines):
                # 检查是否是错误的max_tokens行
                if line.strip() == '"max_tokens": 4000' and i > 0:
                    prev_line = lines[i-1] if i > 0 else ""
                    # 如果前一行以逗号或括号结尾,这是错误的插入
                    if prev_line.rstrip().endswith(','):
                        # 修复前一行,去掉逗号
                        fixed_lines[-1] = prev_line.rstrip().rstrip(',')
                        continue
                    elif prev_line.rstrip().endswith(')'):
                        # 这是一个完全错误的插入,删除这行
                        continue

                fixed_lines.append(line)

            fixed_content = '\n'.join(fixed_lines)

            # 修复422错误 - 添加max_tokens到API调用
            if 'TodoWrite(' in fixed_content and 'max_tokens' not in fixed_content:
                print(f"🔧 为TodoWrite添加max_tokens...")
                fixed_content = re.sub(
                    r'TodoWrite\(',
                    'TodoWrite(max_tokens=4000, ',
                    fixed_content
                )

            # 写回文件
            if fixed_content != original_content:
                # 备份原文件
                backup_path = py_file.with_suffix(f'{py_file.suffix}.backup')
                if not backup_path.exists():
                    backup_path.write_text(original_content, encoding='utf-8')
                    print(f"💾 备份: {backup_path.name}")

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

    print("\n📝 修复内容:")
    print("- 移除错误的max_tokens插入")
    print("- 为TodoWrite调用添加max_tokens参数")
    print("- 修复语法错误")

if __name__ == "__main__":
    emergency_fix()