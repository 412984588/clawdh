#!/usr/bin/env python3
"""
BMad SafeTodo - Claude Code 422错误安全替代方案
BMad团队Infrastructure DevOps专家开发
"""

import json
import sys
from datetime import datetime
from pathlib import Path

class BMadSafeTodo:
    """BMad团队开发的安全Todo管理系统"""

    def __init__(self, todo_file="bmad_safe_todos.json"):
        self.todo_file = Path(todo_file)
        self.todos = self.load_todos()

    def load_todos(self):
        if self.todo_file.exists():
            try:
                with open(self.todo_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []

    def save_todos(self):
        with open(self.todo_file, 'w', encoding='utf-8') as f:
            json.dump(self.todos, f, indent=2, ensure_ascii=False)

    def add_todo(self, content, status="pending", priority="medium"):
        todo = {
            "id": len(self.todos) + 1,
            "content": content,
            "status": status,
            "activeForm": content,
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "team": "BMad-Method"
        }
        self.todos.append(todo)
        self.save_todos()
        print(f"✅ BMad任务已添加: {content}")
        return todo

    def update_status(self, todo_id, new_status):
        for todo in self.todos:
            if todo["id"] == todo_id:
                todo["status"] = new_status
                todo["updated_at"] = datetime.now().isoformat()
                self.save_todos()
                print(f"🔄 任务 {todo_id} 状态已更新为: {new_status}")
                return True
        print(f"❌ 未找到任务 {todo_id}")
        return False

    def display_todos(self):
        if not self.todos:
            print("📋 暂无任务")
            return

        print("🚀 BMad团队任务管理系统")
        print("=" * 50)

        for todo in self.todos:
            status_emoji = {"pending": "⏳", "in_progress": "🔄", "completed": "✅"}
            priority_emoji = {"high": "🔥", "medium": "⚡", "low": "💡"}

            status = status_emoji.get(todo["status"], "❓")
            priority = priority_emoji.get(todo["priority"], "📌")

            print(f"{status} {priority} [{todo['id']}] {todo['content']}")
            print(f"   团队: {todo['team']} | 优先级: {todo['priority']}")

    def get_stats(self):
        total = len(self.todos)
        completed = len([t for t in self.todos if t["status"] == "completed"])
        in_progress = len([t for t in self.todos if t["status"] == "in_progress"])
        pending = len([t for t in self.todos if t["status"] == "pending"])

        print(f"📊 任务统计: 总计 {total} | ✅ 完成 {completed} | 🔄 进行中 {in_progress} | ⏳ 待办 {pending}")

def main():
    if len(sys.argv) < 2:
        print("🚀 BMad SafeTodo - Claude Code 422错误解决方案")
        print("用法:")
        print("  python3 bmad_safe_todo.py add '任务内容' [优先级]")
        print("  python3 bmad_safe_todo.py update 任务ID 状态")
        print("  python3 bmad_safe_todo.py list")
        print("  python3 bmad_safe_todo.py stats")
        return

    todo = BMadSafeTodo()
    command = sys.argv[1]

    if command == "add":
        if len(sys.argv) < 3:
            print("❌ 请提供任务内容")
            return
        content = sys.argv[2]
        priority = sys.argv[3] if len(sys.argv) > 3 else "medium"
        todo.add_todo(content, "pending", priority)

    elif command == "update":
        if len(sys.argv) < 4:
            print("❌ 请提供任务ID和新状态")
            return
        todo_id = int(sys.argv[2])
        new_status = sys.argv[3]
        todo.update_status(todo_id, new_status)

    elif command == "list":
        todo.display_todos()

    elif command == "stats":
        todo.get_stats()

    else:
        print(f"❌ 未知命令: {command}")

if __name__ == "__main__":
    main()
