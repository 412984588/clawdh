# 02 — Pydantic Models

Pydantic v2 数据模型深度使用：字段约束、跨字段验证、嵌套模型、序列化控制。

## Patterns

- `ConfigDict(str_strip_whitespace=True)` 自动清理字符串
- `field_validator` 单字段校验（名称不含数字、自动 title-case）
- `model_validator(mode="after")` 跨字段验证（密码确认）
- `EmailStr` 邮箱格式校验
- 嵌套模型（`Address` 嵌入 `UserOut`）
- `from_attributes=True` — ORM 对象直接转 Pydantic
- 判别联合：`DigitalProduct | PhysicalProduct`
- `model_json_schema()` — 导出 JSON Schema

## Files

- `routes.py` — 模型定义 + API 端点

## Quick Start

```bash
pip install fastapi uvicorn pydantic[email]
uvicorn routes:app --reload
# POST /models-demo/users
# POST /models-demo/products
# GET  /models-demo/schema/user
```
