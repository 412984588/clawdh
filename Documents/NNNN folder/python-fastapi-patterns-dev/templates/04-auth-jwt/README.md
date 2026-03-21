# 04 — Auth JWT

JWT 认证全套模式：无第三方依赖的签发/验证、OAuth2 密码流、刷新令牌、角色授权。

## Patterns

- HMAC-SHA256 JWT（无第三方库，纯标准库实现）
- `OAuth2PasswordBearer` + `OAuth2PasswordRequestForm`
- `Depends(get_current_user)` 注入当前用户
- `require_role(*roles)` 角色守卫工厂函数
- `create_token_pair` — access + refresh 令牌对
- `hmac.compare_digest` 防时序攻击比较
- `exp` 过期校验

## Files

- `routes.py` — JWT 工具 + 认证路由 + 受保护路由

## Quick Start

```bash
pip install fastapi uvicorn
uvicorn routes:app --reload
# POST /auth/token  form: username=alice&password=secret
# GET  /auth/me     Authorization: Bearer <access_token>
# GET  /protected/admin-only
```
