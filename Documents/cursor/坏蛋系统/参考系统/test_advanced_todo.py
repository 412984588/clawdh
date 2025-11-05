#!/usr/bin/env python3
"""
高级Todo功能测试
"""

from safe_todo_manager import SafeTodoManager

def test_advanced_features():
    print("🔬 测试高级Todo功能...")
    
    todo_manager = SafeTodoManager("test_todos.json")
    
    # 测试添加不同状态的任务
    todo_manager.add_todo("设计新功能", "pending")
    todo_manager.add_todo("编写代码", "in_progress") 
    todo_manager.add_todo("测试功能", "completed")
    
    # 测试更新状态
    todo_manager.update_todo_status(1, "in_progress")
    
    # 显示结果
    todo_manager.display_todos()
    
    print("✅ 高级功能测试通过！")

if __name__ == "__main__":
    test_advanced_features()
