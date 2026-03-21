# 02 — Error Handling

Custom error classes, async wrapper, global error handler, 404 middleware.

## Patterns

- `AppError` — base error with statusCode and code
- Specific errors: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`, `RateLimitError`
- `asyncHandler` — wrap async route handlers, auto-forward to next()
- `typedAsyncHandler` — typed version with Request generic params
- `globalErrorHandler` — 4-param middleware, handles all error types
- `notFoundHandler` — 404 fallback middleware
