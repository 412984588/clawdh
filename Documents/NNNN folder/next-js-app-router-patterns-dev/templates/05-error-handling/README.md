# 05 — Error Handling

`error.tsx`, `global-error.tsx`, `not-found.tsx`, and `notFound()`.

## Patterns

- `error.tsx` — route segment error boundary with `reset()` callback
- `global-error.tsx` — root layout error boundary (must include `<html>` + `<body>`)
- `not-found.tsx` — 404 page triggered by `notFound()` or unmatched routes
- `notFound()` — programmatic 404 from Server Components and Server Actions
- `AppError` class — typed error with `code` and `statusCode`
- `safeAsync` — generic Result wrapper for safe async execution
