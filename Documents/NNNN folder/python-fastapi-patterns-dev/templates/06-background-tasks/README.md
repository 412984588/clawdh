# 06 — Background Tasks

后台任务全模式：`BackgroundTasks`、任务状态跟踪、异步 worker、内存队列。

## Patterns

- `BackgroundTasks.add_task()` 请求返回后执行
- 同步任务（线程池执行）vs 异步任务（`await`）
- `TaskStatus` 模型跟踪任务生命周期（pending/running/done/failed）
- UUID task_id + 内存 store，用于轮询状态
- `asyncio.gather()` 并发批量通知
- `SimpleTaskQueue` — 手动入队 + drain 模式
- `EmailStr` 验证邮箱

## Files

- `routes.py` — 后台任务实现 + API

## Quick Start

```bash
pip install fastapi uvicorn pydantic[email]
uvicorn routes:app --reload
# POST /tasks/register  {"name":"Alice","email":"alice@example.com"}
# POST /tasks/reports   {"rows":[{"a":1},{"b":2}]}
# GET  /tasks/reports/{task_id}
```
