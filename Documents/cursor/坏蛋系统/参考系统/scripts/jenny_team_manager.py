#!/usr/bin/env python3
"""
Jenny团队管理器 - 女王条纹测试2项目
负责项目管理、任务分配、进度跟踪和质量控制
"""

import json
import time
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import asyncio

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/jenny_team_manager.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class TeamMember:
    """团队成员信息"""
    name: str
    role: str
    responsibilities: List[str]
    status: str = "active"
    current_task: Optional[str] = None
    last_active: str = ""

@dataclass
class ProjectTask:
    """项目任务"""
    id: str
    name: str
    description: str
    assignee: str
    status: str
    priority: str
    created_time: str
    deadline: str
    estimated_hours: float
    actual_hours: float = 0.0
    progress: float = 0.0

@dataclass
class ProjectMetrics:
    """项目指标"""
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    overall_progress: float
    team_productivity: float
    code_quality_score: float
    bug_count: int

class JennyTeamManager:
    """Jenny团队管理器"""

    def __init__(self, project_path: str = "."):
        self.project_path = Path(project_path)
        self.management_dir = self.project_path / "management_logs"
        self.management_dir.mkdir(exist_ok=True)

        # 初始化管理文件
        self.takeover_file = self.management_dir / "jenny_team_takeover.json"
        self.tasks_file = self.management_dir / "project_tasks.json"
        self.metrics_file = self.management_dir / "project_metrics.json"
        self.daily_log_file = self.management_dir / "daily_logs.json"

        # 加载数据
        self.team_info = self._load_takeover_info()
        self.tasks = self._load_tasks()
        self.metrics = self._load_metrics()
        self.daily_logs = self._load_daily_logs()

    def _load_takeover_info(self) -> Dict:
        """加载接管信息"""
        if self.takeover_file.exists():
            with open(self.takeover_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def _load_tasks(self) -> List[ProjectTask]:
        """加载任务列表"""
        if self.tasks_file.exists():
            with open(self.tasks_file, 'r', encoding='utf-8') as f:
                tasks_data = json.load(f)
                return [ProjectTask(**task) for task in tasks_data]
        return []

    def _load_metrics(self) -> Dict:
        """加载项目指标"""
        if self.metrics_file.exists():
            with open(self.metrics_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def _load_daily_logs(self) -> List[Dict]:
        """加载日志记录"""
        if self.daily_log_file.exists():
            with open(self.daily_log_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []

    def save_all_data(self):
        """保存所有数据"""
        # 保存任务
        with open(self.tasks_file, 'w', encoding='utf-8') as f:
            json.dump([asdict(task) for task in self.tasks], f, indent=2, ensure_ascii=False)

        # 保存指标
        with open(self.metrics_file, 'w', encoding='utf-8') as f:
            json.dump(self.metrics, f, indent=2, ensure_ascii=False)

        # 保存日志
        with open(self.daily_log_file, 'w', encoding='utf-8') as f:
            json.dump(self.daily_logs, f, indent=2, ensure_ascii=False)

    def create_task(self, name: str, description: str, assignee: str,
                   priority: str = "medium", estimated_hours: float = 4.0) -> str:
        """创建新任务"""
        task_id = f"task_{len(self.tasks) + 1:03d}"
        created_time = datetime.now().isoformat()
        deadline = (datetime.now() + timedelta(days=3)).isoformat()

        task = ProjectTask(
            id=task_id,
            name=name,
            description=description,
            assignee=assignee,
            status="pending",
            priority=priority,
            created_time=created_time,
            deadline=deadline,
            estimated_hours=estimated_hours
        )

        self.tasks.append(task)

        # 记录日志
        self.add_daily_log(f"创建新任务: {name}", "task_creation", assignee)

        logger.info(f"任务已创建: {task_id} - {name}")
        return task_id

    def update_task_status(self, task_id: str, status: str, progress: float = None):
        """更新任务状态"""
        for task in self.tasks:
            if task.id == task_id:
                old_status = task.status
                task.status = status

                if progress is not None:
                    task.progress = progress

                # 记录日志
                self.add_daily_log(
                    f"任务状态更新: {task.name} ({old_status} -> {status})",
                    "task_update",
                    task.assignee
                )

                logger.info(f"任务状态已更新: {task_id} -> {status}")
                return True

        logger.warning(f"未找到任务: {task_id}")
        return False

    def assign_task(self, task_id: str, assignee: str):
        """分配任务"""
        for task in self.tasks:
            if task.id == task_id:
                old_assignee = task.assignee
                task.assignee = assignee

                # 记录日志
                self.add_daily_log(
                    f"任务重新分配: {task.name} ({old_assignee} -> {assignee})",
                    "task_assignment",
                    assignee
                )

                logger.info(f"任务已分配: {task_id} -> {assignee}")
                return True

        logger.warning(f"未找到任务: {task_id}")
        return False

    def get_tasks_by_assignee(self, assignee: str) -> List[ProjectTask]:
        """获取指定人员的任务"""
        return [task for task in self.tasks if task.assignee == assignee]

    def get_tasks_by_status(self, status: str) -> List[ProjectTask]:
        """获取指定状态的任务"""
        return [task for task in self.tasks if task.status == status]

    def calculate_metrics(self) -> ProjectMetrics:
        """计算项目指标"""
        total_tasks = len(self.tasks)
        completed_tasks = len([t for t in self.tasks if t.status == "completed"])
        in_progress_tasks = len([t for t in self.tasks if t.status == "in_progress"])
        pending_tasks = len([t for t in self.tasks if t.status == "pending"])

        overall_progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

        # 计算团队生产力（完成任务的平均时间）
        completed_tasks_with_time = [t for t in self.tasks if t.status == "completed" and t.actual_hours > 0]
        team_productivity = sum(t.estimated_hours / t.actual_hours for t in completed_tasks_with_time) / len(completed_tasks_with_time) if completed_tasks_with_time else 1.0

        # 代码质量评分（基于进度和bug数量）
        code_quality_score = min(100, overall_progress - (len([t for t in self.tasks if "bug" in t.name.lower()]) * 5))

        # Bug数量
        bug_count = len([t for t in self.tasks if "bug" in t.name.lower() or "fix" in t.name.lower()])

        metrics = ProjectMetrics(
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            in_progress_tasks=in_progress_tasks,
            pending_tasks=pending_tasks,
            overall_progress=overall_progress,
            team_productivity=team_productivity,
            code_quality_score=code_quality_score,
            bug_count=bug_count
        )

        self.metrics = asdict(metrics)
        return metrics

    def add_daily_log(self, message: str, log_type: str, operator: str):
        """添加日志记录"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "type": log_type,
            "operator": operator
        }

        self.daily_logs.append(log_entry)

        # 限制日志数量，保留最近1000条
        if len(self.daily_logs) > 1000:
            self.daily_logs = self.daily_logs[-1000:]

    def generate_daily_report(self) -> Dict:
        """生成日报"""
        today = datetime.now().date()
        today_logs = [
            log for log in self.daily_logs
            if datetime.fromisoformat(log["timestamp"]).date() == today
        ]

        # 统计今日活动
        task_creations = len([log for log in today_logs if log["type"] == "task_creation"])
        task_updates = len([log for log in today_logs if log["type"] == "task_update"])
        bug_fixes = len([log for log in today_logs if "bug" in log["message"].lower()])

        # 今日完成的任务
        today_completed = [
            task for task in self.tasks
            if task.status == "completed" and
            datetime.fromisoformat(task.created_time).date() == today
        ]

        report = {
            "date": today.isoformat(),
            "summary": {
                "tasks_created": task_creations,
                "tasks_updated": task_updates,
                "tasks_completed": len(today_completed),
                "bugs_fixed": bug_fixes,
                "total_activities": len(today_logs)
            },
            "completed_tasks": [asdict(task) for task in today_completed],
            "recent_activities": today_logs[-10:],  # 最近10条活动
            "current_metrics": self.calculate_metrics().__dict__,
            "team_status": "活跃" if len(today_logs) > 0 else "待机"
        }

        return report

    def get_team_workload(self) -> Dict:
        """获取团队工作负载"""
        workload = {}

        for member in self.team_info.get("team_members", []):
            member_name = member["name"]
            member_tasks = self.get_tasks_by_assignee(member_name)

            workload[member_name] = {
                "role": member["role"],
                "total_tasks": len(member_tasks),
                "completed_tasks": len([t for t in member_tasks if t.status == "completed"]),
                "in_progress_tasks": len([t for t in member_tasks if t.status == "in_progress"]),
                "pending_tasks": len([t for t in member_tasks if t.status == "pending"]),
                "total_estimated_hours": sum(t.estimated_hours for t in member_tasks),
                "workload_percentage": 0  # 将在下面计算
            }

        # 计算工作负载百分比
        max_workload = max(w["total_estimated_hours"] for w in workload.values()) if workload else 1
        for member_name in workload:
            if max_workload > 0:
                workload[member_name]["workload_percentage"] = (workload[member_name]["total_estimated_hours"] / max_workload) * 100

        return workload

    def run_daily_standup(self):
        """运行每日站会"""
        metrics = self.calculate_metrics()
        workload = self.get_team_workload()
        today_report = self.generate_daily_report()

        standup_info = {
            "meeting_time": datetime.now().isoformat(),
            "meeting_type": "每日站会",
            "project_metrics": asdict(metrics),
            "team_workload": workload,
            "today_report": today_report,
            "action_items": []
        }

        # 生成行动项
        if metrics.overall_progress < 50:
            standup_info["action_items"].append("需要加快项目进度")

        if metrics.bug_count > 5:
            standup_info["action_items"].append("需要集中处理Bug")

        for member_name, member_data in workload.items():
            if member_data["pending_tasks"] > 3:
                standup_info["action_items"].append(f"{member_name}有较多待处理任务，需要支持")

        # 记录站会日志
        self.add_daily_log(f"每日站会完成 - 项目进度: {metrics.overall_progress:.1f}%",
                          "daily_standup", "系统自动")

        return standup_info

def main():
    """主函数 - 演示Jenny团队管理器功能"""
    print("🚀 Jenny团队管理系统启动 - 女王条纹测试2项目")
    print("=" * 50)

    # 初始化管理器
    manager = JennyTeamManager()

    # 创建初始任务
    if len(manager.tasks) == 0:
        print("📋 创建初始任务...")

        task_ids = [
            manager.create_task("系统架构重构", "重构Stripe检测系统架构", "技术主管", "high", 8),
            manager.create_task("核心算法优化", "优化Stripe检测算法精度", "技术主管", "high", 12),
            manager.create_task("数据迁移", "迁移历史数据到新系统", "数据分析师", "medium", 4),
            manager.create_task("测试用例编写", "编写完整的测试用例", "测试工程师", "medium", 6),
            manager.create_task("文档编写", "编写项目操作文档", "Jenny", "low", 3)
        ]

        # 更新任务状态
        manager.update_task_status(task_ids[0], "in_progress", 25)
        manager.update_task_status(task_ids[1], "pending")
        manager.update_task_status(task_ids[2], "pending")
        manager.update_task_status(task_ids[3], "pending")
        manager.update_task_status(task_ids[4], "pending")

        print(f"✅ 已创建 {len(task_ids)} 个初始任务")

    # 运行每日站会
    print("\n📊 运行每日站会...")
    standup_result = manager.run_daily_standup()

    print(f"📈 项目整体进度: {standup_result['project_metrics']['overall_progress']:.1f}%")
    print(f"👥 团队生产力: {standup_result['project_metrics']['team_productivity']:.2f}")
    print(f"🐛 当前Bug数量: {standup_result['project_metrics']['bug_count']}")

    print("\n👷 团队工作负载:")
    for member, data in standup_result['team_workload'].items():
        print(f"  {member} ({data['role']}): {data['total_tasks']}个任务, {data['total_estimated_hours']}小时")

    if standup_result['action_items']:
        print("\n⚠️  行动项:")
        for item in standup_result['action_items']:
            print(f"  • {item}")

    # 生成日报
    print("\n📝 生成今日报告...")
    daily_report = manager.generate_daily_report()

    print(f"今日活动: {daily_report['summary']['total_activities']}次")
    print(f"完成任务: {daily_report['summary']['tasks_completed']}个")
    print(f"修复Bug: {daily_report['summary']['bugs_fixed']}个")

    # 保存所有数据
    manager.save_all_data()

    print("\n💾 所有数据已保存")
    print("✅ Jenny团队管理系统运行完成")

if __name__ == "__main__":
    main()