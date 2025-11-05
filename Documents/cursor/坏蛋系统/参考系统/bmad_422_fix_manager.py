#!/usr/bin/env python3
"""
BMad团队422错误修复任务管理器
专门解决Claude Code TodoWrite 422错误问题
"""

import json
import os
from datetime import datetime
from pathlib import Path

class BMadErrorFixManager:
    def __init__(self, todo_file="bmad_422_fix_todos.json"):
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

    def add_todo(self, content, status="pending", priority="high"):
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
        return todo

    def get_todos_by_status(self, status):
        return [todo for todo in self.todos if todo["status"] == status]

    def update_todo_status(self, todo_id, new_status):
        for todo in self.todos:
            if todo["id"] == todo_id:
                todo["status"] = new_status
                todo["updated_at"] = datetime.now().isoformat()
                self.save_todos()
                return True
        return False

    def display_todos(self):
        print("🚀 BMad团队 422错误修复任务")
        print("=" * 60)

        for todo in self.todos:
            status_emoji = {"pending": "⏳", "in_progress": "🔄", "completed": "✅"}
            priority_emoji = {"high": "🔥", "medium": "⚡", "low": "💡"}

            status = status_emoji.get(todo["status"], "❓")
            priority = priority_emoji.get(todo["priority"], "📌")

            print(f"{status} {priority} [{todo['id']}] {todo['content']}")
            print(f"   团队: {todo['team']} | 优先级: {todo['priority']}")
            print()

def create_bmad_fix_plan():
    """创建BMad团队修复计划"""
    manager = BMadErrorFixManager()

    # 高优先级任务
    manager.add_todo("深入分析TodoWrite 422错误的具体原因", "in_progress", "high")
    manager.add_todo("启动BMad Orchestrator协调修复工作", "pending", "high")
    manager.add_todo("使用BMad Infrastructure DevOps专家设计系统性解决方案", "pending", "high")

    # 中优先级任务
    manager.add_todo("创建Claude Code兼容性补丁工具", "pending", "medium")
    manager.add_todo("开发BMad SafeTodo集成方案", "pending", "medium")
    manager.add_todo("测试修复方案在多种场景下的稳定性", "pending", "medium")

    # 低优先级任务
    manager.add_todo("编写用户使用指南和最佳实践", "pending", "low")
    manager.add_todo("创建自动化监控和报告系统", "pending", "low")

    return manager

def main():
    print("🎭 启动BMad团队422错误修复任务...")
    manager = create_bmad_fix_plan()
    manager.display_todos()

    print("\n📋 BMad团队建议:")
    print("1. 立即启动BMad Orchestrator协调多专家团队")
    print("2. 使用Infrastructure DevOps专家系统性解决问题")
    print("3. 采用Creative Writing专家优化用户体验文档")
    print("4. 避开原生TodoWrite工具，使用BMad安全替代方案")

if __name__ == "__main__":
    main()