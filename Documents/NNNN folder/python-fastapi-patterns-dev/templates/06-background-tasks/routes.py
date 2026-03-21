"""FastAPI 后台任务模式 — BackgroundTasks、异步 worker、任务队列、调度"""

import asyncio
import time
from collections import deque
from datetime import datetime
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, FastAPI, HTTPException
from pydantic import BaseModel, EmailStr

# ===== 1. 任务状态跟踪 =====


class TaskStatus(BaseModel):
    task_id: str
    status: str  # pending / running / done / failed
    created_at: datetime
    completed_at: datetime | None = None
    result: Any = None
    error: str | None = None


_task_store: dict[str, TaskStatus] = {}


def _new_task() -> TaskStatus:
    tid = str(uuid4())
    task = TaskStatus(task_id=tid, status="pending", created_at=datetime.utcnow())
    _task_store[tid] = task
    return task


# ===== 2. 后台任务函数（同步 & 异步）=====


def send_welcome_email(email: str, name: str) -> None:
    """模拟发送欢迎邮件（同步，在线程池中运行）"""
    time.sleep(0.1)  # 模拟 SMTP 延迟
    print(f"[Email] Sent welcome email to {email} for {name}")


async def process_report(task_id: str, report_data: dict) -> None:
    """模拟异步报表生成"""
    task = _task_store[task_id]
    task.status = "running"
    try:
        await asyncio.sleep(0.5)  # 模拟 CPU/IO 密集型处理
        result = {
            "rows_processed": len(report_data.get("rows", [])),
            "generated_at": datetime.utcnow().isoformat(),
        }
        task.status = "done"
        task.result = result
        task.completed_at = datetime.utcnow()
    except Exception as exc:
        task.status = "failed"
        task.error = str(exc)


async def send_notification_batch(user_ids: list[int], message: str) -> None:
    """并发发送通知（模拟）"""
    async def _send_one(uid: int) -> None:
        await asyncio.sleep(0.05)
        print(f"[Notify] user={uid}: {message}")

    await asyncio.gather(*[_send_one(uid) for uid in user_ids])


# ===== 3. 简易内存任务队列 =====


class SimpleTaskQueue:
    def __init__(self) -> None:
        self._queue: deque = deque()
        self._running = False

    def enqueue(self, fn, *args, **kwargs) -> str:
        task_id = str(uuid4())
        self._queue.append((task_id, fn, args, kwargs))
        return task_id

    async def drain(self) -> None:
        while self._queue:
            task_id, fn, args, kwargs = self._queue.popleft()
            try:
                if asyncio.iscoroutinefunction(fn):
                    await fn(*args, **kwargs)
                else:
                    fn(*args, **kwargs)
            except Exception as exc:
                print(f"[Queue] Task {task_id} failed: {exc}")


task_queue = SimpleTaskQueue()


# ===== 4. 请求模型 =====


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr


class ReportRequest(BaseModel):
    rows: list[dict]
    format: str = "json"


class NotifyRequest(BaseModel):
    user_ids: list[int]
    message: str


# ===== 5. 路由 =====

router = APIRouter(prefix="/tasks", tags=["background-tasks"])


@router.post("/register")
async def register(body: RegisterRequest, bg: BackgroundTasks) -> dict:
    """注册后异步发送欢迎邮件"""
    bg.add_task(send_welcome_email, body.email, body.name)
    return {"message": "Registered. Welcome email will be sent.", "email": body.email}


@router.post("/reports")
async def generate_report(body: ReportRequest, bg: BackgroundTasks) -> dict:
    """提交报表生成任务，立即返回 task_id"""
    task = _new_task()
    bg.add_task(process_report, task.task_id, body.model_dump())
    return {"task_id": task.task_id, "status": "pending"}


@router.get("/reports/{task_id}")
async def get_report_status(task_id: str) -> TaskStatus:
    task = _task_store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/notify")
async def notify(body: NotifyRequest, bg: BackgroundTasks) -> dict:
    """批量推送通知"""
    bg.add_task(send_notification_batch, body.user_ids, body.message)
    return {"queued_for": len(body.user_ids), "message": body.message}


def create_app() -> FastAPI:
    app = FastAPI(title="Background Tasks Demo", version="1.0.0")
    app.include_router(router)
    return app


app = create_app()
