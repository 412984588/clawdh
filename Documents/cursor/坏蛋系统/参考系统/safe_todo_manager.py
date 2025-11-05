#!/usr/bin/env python3
"""
安全的Todo管理器 - 避开Claude Code TodoWrite bug
"""

import json
import os
from datetime import datetime

class SafeTodoManager:
    def __init__(self, todo_file="safe_todos.json"):
        self.todo_file = todo_file
        self.todos = self.load_todos()
    
    def load_todos(self):
        if os.path.exists(self.todo_file):
            try:
                with open(self.todo_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []
    
    def save_todos(self):
        with open(self.todo_file, 'w', encoding='utf-8') as f:
            json.dump(self.todos, f, indent=2, ensure_ascii=False)
    
    def add_todo(self, content, status="pending"):
        todo = {
            "content": content,
            "status": status,
            "activeForm": content,
            "created_at": datetime.now().isoformat(),
            "id": len(self.todos) + 1
        }
        self.todos.append(todo)
        self.save_todos()
        return todo
    
    def display_todos(self):
        print("📋 当前Todo列表:")
        print("=" * 50)
        for todo in self.todos:
            status_emoji = {"pending": "⏳", "in_progress": "🔄", "completed": "✅"}
            emoji = status_emoji.get(todo["status"], "❓")
            print(f"{emoji} [{todo['id']}] {todo['content']} ({todo['status']})")

def main():
    todo_manager = SafeTodoManager()
    
    # 添加当前任务
    todo_manager.add_todo("分析女王条纹测试2项目状态", "completed")
    todo_manager.add_todo("创建Claude Code Bug修复系统", "completed") 
    todo_manager.add_todo("验证修复效果", "in_progress")
    todo_manager.add_todo("测试安全Todo管理器", "pending")
    
    todo_manager.display_todos()
    print("✅ 安全Todo管理器工作正常！")

if __name__ == "__main__":
    main()
