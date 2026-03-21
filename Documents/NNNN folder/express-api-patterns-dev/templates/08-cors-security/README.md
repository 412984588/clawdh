# 08 — CORS & Security

CORS middleware, security headers, Content Security Policy, CSRF double-submit cookie protection.

## Patterns

- `corsMiddleware(config)` — configurable CORS with origin function support
- `productionCors` / `developmentCors` — preset configurations
- `securityHeaders` — X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy
- `cspMiddleware` — Content-Security-Policy with nonce support
- `csrfProtection` — HMAC-based double-submit cookie, timing-safe comparison
- `sqlInjectionLogger` — defensive logging for suspicious query patterns
