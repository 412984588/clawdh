# Fastify Patterns Dev Pack

**10 production-ready Fastify patterns for TypeScript developers**

Fastify is the fastest Node.js HTTP framework — but most tutorials stop at "hello world". This pack shows you what production Fastify looks like.

## What You Get

**Starter ($19) — Templates 01–05**
- Basic routes — GET/POST/PUT/DELETE with params, query strings, reply helpers
- Schema validation — TypeBox + JSON Schema, body/query/response validation
- Plugins — fp() pattern, decorators, encapsulation, shared state
- Hooks & lifecycle — onRequest, preHandler, onSend, content type parser
- Authentication — @fastify/jwt, API key auth, role-based guards, refresh tokens

**Pro ($39) — All 10 Templates**
Everything in Starter, plus:
- Error handling — custom AppError hierarchy, consistent error response format
- File upload — @fastify/multipart, validation, streaming to storage
- WebSockets — @fastify/websocket, rooms, broadcast, typed messages
- Testing — inject() pattern, app factory, makeRequest helper, mock DB
- Deployment — graceful shutdown, health checks, CORS, compression, helmet

## Who Is This For

- Node.js developers adopting Fastify for the first time
- Engineers migrating from Express who want idiomatic Fastify patterns
- Teams looking for consistent, reviewed implementations to standardize on

## Format

10 standalone TypeScript files. Each file exports a `buildApp()` factory and individual functions. A `main()` shows end-to-end usage.

Requires: Node.js 18+, TypeScript 5+, Fastify 4+
