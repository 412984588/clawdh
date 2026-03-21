# 03 — Route Handlers

API routes in the App Router: GET/POST/DELETE, auth, streaming, CORS.

## Patterns

- Named exports: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- `NextRequest` / `NextResponse` for typed request/response
- `await params` — params is a Promise in Next.js 15
- Streaming with `ReadableStream` + SSE
- 401/403/404 error responses
- CORS preflight with `OPTIONS` handler
