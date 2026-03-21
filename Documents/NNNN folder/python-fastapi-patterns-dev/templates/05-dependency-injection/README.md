# 05 — Dependency Injection

FastAPI `Depends()` 深度应用：简单依赖、链式依赖、作用域 session、类形式依赖、lifespan。

## Patterns

- 函数依赖：`Depends(get_pagination)` 注入分页参数
- 链式依赖：`get_db_url` 依赖 `get_settings`
- `AsyncGenerator` yield 依赖（自动关闭 session）
- `Annotated[T, Depends(...)]` 类型别名简化签名
- 类形式依赖：`Depends(FilterParams)` 直接实例化
- `lifespan` 上下文管理器替代旧版 `on_event`
- Header 依赖：从 `Authorization` 提取令牌

## Files

- `routes.py` — 依赖定义 + 路由

## Quick Start

```bash
pip install fastapi uvicorn
uvicorn routes:app --reload
# GET /di-demo/items?page=1&limit=10
# GET /di-demo/me  Authorization: Bearer 1:admin
# GET /di-demo/admin  Authorization: Bearer 1:admin
```
