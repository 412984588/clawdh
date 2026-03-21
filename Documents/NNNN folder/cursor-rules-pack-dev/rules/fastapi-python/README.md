# FastAPI Python Cursor Rules

## 适用场景
FastAPI 后端 API 服务，使用异步 SQLAlchemy 2.0 + Pydantic v2 + PostgreSQL 技术栈。

## 核心规则摘要
- Router 层薄，业务逻辑在 Service 层
- 全面使用 async/await
- Pydantic v2 语法（field_validator, model_config, ConfigDict）
- SQLAlchemy 2.0 mapped_column 新语法
- 自定义异常类替代裸 HTTPException

## 使用方法
将 `.cursorrules` 文件复制到你的 FastAPI 项目根目录。
