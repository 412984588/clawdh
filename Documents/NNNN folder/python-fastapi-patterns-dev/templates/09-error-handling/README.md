# 09 — Error Handling

完整错误处理：自定义异常层级、统一响应格式、全局处理器、Pydantic 验证错误格式化。

## Patterns

- `AppError` 基类 + 6 个子类（NotFound/Validation/Auth/Authz/Conflict/RateLimit）
- 统一 `ErrorResponse` 格式：`{"success":false,"error":{"code":"...","message":"..."}}`
- `app.add_exception_handler(AppError, handler)` 注册自定义处理器
- `RequestValidationError` 处理器 — 逐字段错误提示
- `HTTPException` 处理器 — 覆盖默认格式
- 兜底 `Exception` 处理器 — 防止泄露敏感信息
- `status_code` / `error_code` 类级别定义，子类直接覆盖

## Files

- `routes.py` — 异常类 + 处理器 + 演示路由

## Quick Start

```bash
pip install fastapi uvicorn
uvicorn routes:app --reload
# GET  /error-demo/not-found/999
# POST /error-demo/validate  {"name":"","price":-1}
# GET  /error-demo/auth-error
```
