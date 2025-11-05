#!/usr/bin/env python3
"""
女王条纹测试2项目专用Todo管理器
"""

import json
import os
from datetime import datetime

class ProjectTodoManager:
    def __init__(self, todo_file="project_todos.json"):
        self.todo_file = todo_file
        self.todos = self.load_todos()
        if not self.todos:
            self.init_project_todos()
    
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
    
    def init_project_todos(self):
        """初始化项目任务"""
        initial_todos = [
            {"content": "完成Claude Code Bug修复系统", "status": "completed", "priority": "高"},
            {"content": "测试女王条纹检测系统核心功能", "status": "pending", "priority": "高"},
            {"content": "验证Claude Flow集成状态", "status": "pending", "priority": "中"},
            {"content": "检查项目整体运行状况", "status": "pending", "priority": "中"},
            {"content": "生成项目状态报告", "status": "pending", "priority": "低"},
            {"content": "优化项目文档结构", "status": "pending", "priority": "低"},
            {"content": "清理和归档旧文件", "status": "completed", "priority": "低"}
        ]
        
        self.todos = []
        for i, todo in enumerate(initial_todos):
            self.todos.append({
                "id": i + 1,
                "content": todo["content"],
                "status": todo["status"],
                "priority": todo["priority"],
                "created_at": datetime.now().isoformat(),
                "activeForm": todo["content"]
            })
        
        self.save_todos()
    
    def add_todo(self, content, status="pending", priority="中"):
        todo = {
            "id": len(self.todos) + 1,
            "content": content,
            "status": status,
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "activeForm": content
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
        print("🎯 女王条纹测试2项目任务")
        print("=" * 60)
        
        # 按状态分组显示
        status_groups = {"completed": [], "in_progress": [], "pending": []}
        
        for todo in self.todos:
            status_groups[todo["status"]].append(todo)
        
        # 显示已完成")
        if status_groups["completed"]:
            print("✅ 已完成:")
            for todo in status_groups["completed"]:
                print(f"   [{todo['id']}] {todo['content']} ({todo['priority']})")
        
        # 显示进行中
        if status_groups["in_progress"]:
            print("\n🔄 进行中:")
            for todo in status_groups["in_progress"]:
                print(f"   [{todo['id']}] {todo['content']} ({todo['priority']})")
        
        # 显示待处理
        if status_groups["pending"]:
            print("\n⏳ 待处理:")
            for todo in status_groups["pending"]:
                print(f"   [{todo['id']}] {todo['content']} ({todo['priority']})")
        
        print(f"\n📊 进度: {len(status_groups['completed'])}/{len(self.todos')} 完成")
    
    def get_next_todo(self):
        """获取下一个待处理的高优先级任务"""
        pending_todos = [t for t in self.todos if t["status"] == "pending"]
        if pending_todos:
            # 按优先级排序
            priority_order = {"高": 0, "中": 1, "低": 2}
            pending_todos.sort(key=lambda x: priority_order.get(x["priority"], 2))
            return pending_todos[0]
        return None

def main():
    todo_manager = ProjectTodoManager()
    
    print("🚀 女王条纹测试2项目管理系统")
    print("基于Claude Code Bug修复系统的安全版本")
    print()
    
    # 显示所有任务
    todo_manager.display_todos()
    
    # 获取下一个任务
    next_todo = todo_manager.get_next_todo()
    if next_todo:
        print(f"\n🎯 建议下一个任务:")
        print(f"   {next_todo['content']} (优先级: {next_todo['priority']})")
    
    print(f"\n💡 使用方法:")
    print(f"   python3 project_todo_manager.py - 查看任务状态")
    print(f"   项目数据文件: project_todos.json")

if __name__ == "__main__":
    main()
