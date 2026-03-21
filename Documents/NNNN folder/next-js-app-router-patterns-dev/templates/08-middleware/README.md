# 08 — Middleware

Auth redirect, locale detection, A/B testing, rate limiting, security headers, and `matcher` config.

## Patterns

- Auth middleware — JWT verification, protected routes, cookie management
- Locale detection — cookie → Accept-Language → default locale chain
- A/B testing — random variant assignment with persistent cookie
- Rate limiting — per-IP request counting (Edge-compatible)
- Security headers — CSP, X-Frame-Options, HSTS, Permissions-Policy
- `matcher` config — exclude static files from middleware execution
- Response chaining — compose multiple middleware handlers cleanly
