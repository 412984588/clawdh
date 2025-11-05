#!/usr/bin/env python3
"""
干净版本的Todo管理器
"""

import json
import os
from datetime import datetime

class CleanTodoManager:
    def __init__(self, todo_file="clean_todos.json"):
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
    
    def update_todo_status(self, todo_id, status):
        for todo in self.todos:
            if todo["id"] == todo_id:
                todo["status"] = status
                todo["updated_at"] = datetime.now().isoformat()
                self.save_todos()
                return True
        return False
    
    def display_todos(self):
        print("📋 Todo列表:")
        print("=" * 40)
        for todo in self.todos:
            status_emoji = {"pending": "⏳", "in_progress": "🔄", "completed": "✅"}
            emoji = status_emoji.get(todo["status"], "❓")
            print(f"{emoji} [{todo['id']}] {todo['content']}")

def main():
    todo_manager = CleanTodoManager()
    
    # 添加测试任务
    todo_manager.add_todo("Claude Code Bug修复测试", "completed")
    todo_manager.add_todo("验证系统稳定性", "in_progress")
    todo_manager.add_todo("性能优化", "pending")
    
    # 测试状态更新
    todo_manager.update_todo_status(2, "completed")
    
    # 显示结果
    todo_manager.display_todos()
    print("✅ 测试完成 - 系统工作正常！")

if __name__ == "__main__":
    main()
