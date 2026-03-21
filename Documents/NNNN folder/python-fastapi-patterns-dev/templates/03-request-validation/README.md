# 03 — Request Validation

完整请求验证：查询参数、JSON body、表单数据、文件上传、跨字段约束。

## Patterns

- `Query(ge=1, le=100)` 约束查询参数范围
- `model_validator` 日期范围跨字段校验
- `File(...)` + `UploadFile` 文件上传
- `Form(...)` 多部分表单字段
- 文件类型白名单 + 文件大小限制
- `BatchDeleteRequest` — `list[int]` body 批量操作
- `status.HTTP_413_REQUEST_ENTITY_TOO_LARGE` 文件过大

## Files

- `routes.py` — 验证逻辑 + 路由

## Quick Start

```bash
pip install fastapi uvicorn python-multipart
uvicorn routes:app --reload
# GET  /validation-demo/items?page=1&q=hello
# POST /validation-demo/search  {"q":"test","page":1}
# POST /validation-demo/upload  (multipart/form-data)
```
