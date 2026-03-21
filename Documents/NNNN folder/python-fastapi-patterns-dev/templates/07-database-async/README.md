# 07 — Database Async

异步数据库全模式：Async SQLAlchemy 架构、Repository 模式、连接池配置、事务处理。

## Patterns

- `AsyncSession` yield 依赖（每请求独立 session，失败自动 rollback）
- `UserRepository` 封装所有 DB 操作（findById/findAll/create/delete）
- 分页：`find_all(offset, limit)` + `count()` 分离
- `409 Conflict` — 邮箱唯一性校验
- `DatabaseConfig` 从环境变量读取配置
- 真实项目接入：替换 `AsyncSessionMock` 为 `async_sessionmaker(engine)`
- Alembic 迁移建议：`alembic init alembic && alembic revision --autogenerate`

## Files

- `routes.py` — 完整异步数据库架构

## Quick Start

```bash
pip install fastapi uvicorn sqlalchemy[asyncio] aiosqlite
uvicorn routes:app --reload
# GET  /db-demo/users
# POST /db-demo/users  {"name":"Carol","email":"carol@example.com"}
```
