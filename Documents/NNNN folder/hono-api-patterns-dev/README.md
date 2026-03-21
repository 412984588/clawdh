# Hono.js API Patterns

10 production-ready Hono.js patterns — covering routing, Zod validation, JWT auth, CORS/security, RPC client, Cloudflare Workers bindings, SSE streaming, testing, WebSockets, and OpenAPI documentation.

## What's Inside

| # | Template | Description |
|---|----------|-------------|
| 01 | App Basics | Routing, path/query params, route groups, error handling |
| 02 | Zod Validation | @hono/zod-validator, typed bodies, query params, custom errors |
| 03 | JWT Auth | @hono/jwt, protected routes, refresh tokens, role-based guards |
| 04 | CORS & Middleware | CORS, security headers, body limit, rate limiting |
| 05 | RPC Client | Hono RPC type-safe client, InferResponseType, chained routes |
| 06 | Cloudflare Workers | KV, D1 SQLite, R2 storage, Queue bindings |
| 07 | Streaming & SSE | streamSSE, streamText, LLM output streaming, abort handling |
| 08 | Testing Hono | app.request(), testClient, factory pattern, inline tests |
| 09 | WebSockets | upgradeWebSocket, chat room, presence tracking, broadcast |
| 10 | OpenAPI Spec | @hono/zod-openapi, Swagger UI, security schemes, pagination |

## Tiers

- **Starter** ($19) — Templates 01–05
- **Pro** ($39) — All 10 templates

## Quick Start

```bash
npm install hono @hono/node-server
```

```ts
import { Hono } from "hono";
const app = new Hono();
app.get("/", (c) => c.json({ message: "Hello Hono!" }));
export default app;
```

## Runtimes

Hono runs anywhere: **Cloudflare Workers** · **Bun** · **Deno** · **Node.js** · **AWS Lambda** · **Vercel Edge**

## Requirements

- Hono 4.x
- TypeScript 5+
- Node.js 18+ (for Node.js adapter)

## License

MIT — use in personal and commercial projects.
