# 01 — Basic Routing

FastAPI 基础路由模式：APIRouter、路径参数、查询参数、响应模型、HTTP 状态码。

## Patterns

- `APIRouter` 模块化拆分路由
- 路径参数类型注解与校验（`Path(ge=1)`）
- 查询参数分页（`page` / `limit`）
- 枚举路径参数（`str, Enum`）
- `response_model` 过滤输出字段
- `status_code=201` 显式指定创建状态

## Files

- `routes.py` — 完整路由实现

## Quick Start

```bash
pip install fastapi uvicorn
uvicorn routes:app --reload
# GET  http://127.0.0.1:8000/users?page=1&limit=10
# GET  http://127.0.0.1:8000/users/1
# POST http://127.0.0.1:8000/users  {"name":"Carol","email":"carol@example.com"}
```
