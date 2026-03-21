# 08 — Middleware & CORS

中间件全套：请求 ID、访问日志、固定窗口限流、安全 Headers、CORS 配置。

## Patterns

- `BaseHTTPMiddleware` 自定义中间件基类
- `RequestIdMiddleware` — 注入 / 透传 `X-Request-Id`
- `AccessLogMiddleware` — 方法/路径/状态码/耗时日志
- `RateLimitMiddleware` — 按 IP 固定窗口限流，`X-RateLimit-*` 响应头
- `SecurityHeadersMiddleware` — CSP/X-Frame-Options/HSTS 等
- `CORSMiddleware` — 生产 vs 开发双配置
- 中间件注册顺序：外层先执行（洋葱模型）

## Files

- `routes.py` — 所有中间件 + CORS 配置 + 示例路由

## Quick Start

```bash
pip install fastapi uvicorn
uvicorn routes:app --reload
# GET /middleware-demo/echo-headers
# GET /middleware-demo/slow
```
