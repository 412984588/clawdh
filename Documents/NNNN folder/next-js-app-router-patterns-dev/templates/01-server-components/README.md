# 01 — Server Components

Async server components, parallel data fetching, client boundaries, and Suspense streaming.

## Patterns

- `async function Component()` — await directly in components
- `Promise.all([...])` — parallel fetches, no waterfall
- `notFound()` — render nearest `not-found.tsx`
- `'use client'` boundary — keep interactive islands minimal
- `<Suspense fallback={...}>` — stream slow sections independently
