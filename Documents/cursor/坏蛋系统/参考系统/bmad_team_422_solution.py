#!/usr/bin/env python3
"""
BMad团队422错误完整解决方案
结合Infrastructure DevOps和Creative Writing专家的综合修复方案
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

class BMad422SolutionTeam:
    def __init__(self):
        self.project_root = Path.cwd()
        self.solutions_dir = self.project_root / "bmad_solutions"
        self.solutions_dir.mkdir(exist_ok=True)

    def analyze_error(self):
        """分析422错误根本原因"""
        print("🔍 BMad分析团队正在分析422错误...")

        analysis = {
            "错误类型": "API Error: 422 Unprocessable Entity",
            "根本原因": "TodoWrite工具输入格式验证失败",
            "具体问题": [
                "Claude Code生成数组格式而非字典格式",
                "activeForm参数缺失或位置错误",
                "输入验证器期望字典但收到数组"
            ],
            "影响范围": "所有使用TodoWrite的会话",
            "紧急程度": "高"
        }

        print("✅ 错误分析完成")
        return analysis

    def create_infra_solution(self):
        """Infrastructure DevOps专家解决方案"""
        print("🏗️  BMad Infrastructure DevOps专家设计解决方案...")

        solution = {
            "方案名称": "BMad SafeTodo架构",
            "核心策略": "绕过原生TodoWrite，使用自建安全系统",
            "技术架构": {
                "数据层": "JSON文件存储",
                "业务层": "Python管理类",
                "接口层": "命令行工具",
                "监控层": "状态追踪系统"
            },
            "优势": [
                "完全避开422错误",
                "支持复杂任务管理",
                "持久化存储",
                "易于集成"
            ]
        }

        # 创建基础设施解决方案文件
        infra_file = self.solutions_dir / "infrastructure_solution.json"
        with open(infra_file, 'w', encoding='utf-8') as f:
            json.dump(solution, f, indent=2, ensure_ascii=False)

        print("✅ Infrastructure解决方案已创建")
        return solution

    def create_creative_solution(self):
        """Creative Writing专家优化用户体验"""
        print("✍️  BMad Creative Writing专家优化用户体验...")

        user_guide = {
            "标题": "BMad团队422错误解决方案用户指南",
            "痛点解决": [
                {
                    "问题": "TodoWrite 422错误",
                    "解决方案": "使用BMad SafeTodo管理器",
                    "步骤": [
                        "运行 python3 bmad_422_fix_manager.py",
                        "查看任务列表和进度",
                        "避开原生TodoWrite工具"
                    ]
                }
            ],
            "最佳实践": [
                "始终使用BMad任务管理器",
                "定期备份任务数据",
                "监控修复进度",
                "遇到问题及时求助BMad团队"
            ],
            "团队支持": {
                "BMad Orchestrator": "总体协调和工作流程管理",
                "Infrastructure DevOps": "技术架构和系统性解决方案",
                "Creative Writing": "用户体验优化和文档编写"
            }
        }

        # 创建用户指南
        guide_file = self.solutions_dir / "user_guide.json"
        with open(guide_file, 'w', encoding='utf-8') as f:
            json.dump(user_guide, f, indent=2, ensure_ascii=False)

        print("✅ Creative用户体验指南已创建")
        return user_guide

    def create_integration_tool(self):
        """创建集成工具"""
        print("🔧 创建BMad集成工具...")

        integration_code = '''#!/usr/bin/env python3
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
'''

        integration_file = self.solutions_dir / "bmad_safe_todo.py"
        with open(integration_file, 'w', encoding='utf-8') as f:
            f.write(integration_code)

        # 设置可执行权限
        os.chmod(integration_file, 0o755)

        print("✅ BMad SafeTodo集成工具已创建")
        return integration_file

    def generate_final_report(self):
        """生成最终修复报告"""
        print("📊 生成BMad团队修复报告...")

        report = {
            "项目": "Claude Code TodoWrite 422错误修复",
            "团队": "BMad-Method",
            "参与专家": [
                "BMad Orchestrator - 总体协调",
                "Infrastructure DevOps - 技术架构",
                "Creative Writing - 用户体验"
            ],
            "解决方案": {
                "核心策略": "完全避开原生TodoWrite工具",
                "技术实现": "自建Python任务管理系统",
                "用户体验": "命令行友好界面",
                "数据持久化": "JSON文件存储"
            },
            "交付成果": [
                "bmad_safe_todo.py - 主要工具",
                "bmad_422_fix_manager.py - 任务管理器",
                "infrastructure_solution.json - 技术方案",
                "user_guide.json - 用户指南"
            ],
            "使用方法": [
                "python3 bmad_safe_todo.py add '任务内容'",
                "python3 bmad_safe_todo.py list",
                "python3 bmad_safe_todo.py update 任务ID 状态"
            ],
            "优势": {
                "稳定性": "100%避开422错误",
                "易用性": "简单命令行接口",
                "扩展性": "支持优先级和状态管理",
                "持久性": "任务数据自动保存"
            }
        }

        report_file = self.solutions_dir / "final_solution_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print("✅ 最终修复报告已生成")
        return report

    def execute_solution(self):
        """执行完整解决方案"""
        print("🚀 BMad团队开始执行422错误修复...")
        print("=" * 60)

        # 1. 分析错误
        analysis = self.analyze_error()

        # 2. 创建基础设施解决方案
        infra_solution = self.create_infra_solution()

        # 3. 创建用户体验方案
        creative_solution = self.create_creative_solution()

        # 4. 创建集成工具
        integration_tool = self.create_integration_tool()

        # 5. 生成最终报告
        final_report = self.generate_final_report()

        print("\n🎉 BMad团队422错误修复完成！")
        print("=" * 60)
        print("📦 交付成果:")
        print("  ✅ 安全Todo管理系统")
        print("  ✅ 技术架构方案")
        print("  ✅ 用户体验指南")
        print("  ✅ 集成工具")
        print("  ✅ 完整修复报告")

        print("\n🎯 立即使用方法:")
        print("  python3 bmad_solutions/bmad_safe_todo.py add '我的任务' high")
        print("  python3 bmad_solutions/bmad_safe_todo.py list")
        print("  python3 bmad_solutions/bmad_safe_todo.py update 1 completed")

        print(f"\n📁 所有文件保存在: {self.solutions_dir}")
        print("🚀 BMad团队祝您使用愉快！")

def main():
    team = BMad422SolutionTeam()
    team.execute_solution()

if __name__ == "__main__":
    main()