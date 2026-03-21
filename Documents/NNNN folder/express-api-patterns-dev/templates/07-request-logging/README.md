# 07 — Request Logging

Structured JSON logs, request ID injection, correlation headers, slow request alerts.

## Patterns

- `ConsoleLogger` — JSON (production) or human-readable (development) output
- `requestIdMiddleware` — generate/propagate X-Request-Id header
- `accessLogMiddleware` — log method, path, status, duration on response finish
- `slowRequestMiddleware` — warn when requests exceed 1000ms threshold
- `debugBodyMiddleware` — log sanitized request bodies in development
- `sanitizeForLog` — redact password/token/secret fields before logging
- `correlationMiddleware` — X-Correlation-Id for microservice tracing
