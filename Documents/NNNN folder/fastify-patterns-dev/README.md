# Fastify Patterns Dev Pack

Production-ready Fastify patterns for TypeScript developers. 10 templates covering routes, schema validation, plugins, hooks, authentication, error handling, file uploads, WebSockets, testing, and deployment.

## What's Inside

| # | Template | Key Patterns |
|---|----------|--------------|
| 01 | **basic-routes** | GET/POST/PUT/DELETE, params, query strings, reply helpers, prefixing |
| 02 | **schema-validation** | TypeBox, JSON Schema, body/params/query validation, response serialization |
| 03 | **plugins** | fp(), decorators, encapsulation, module augmentation, shared state |
| 04 | **hooks-lifecycle** | onRequest, preHandler, onSend, onResponse, onClose, content type parser |
| 05 | **authentication** | @fastify/jwt, API key auth, role-based guards, refresh tokens |
| 06 | **error-handling** | Custom AppError classes, setErrorHandler, 404 handler, error response format |
| 07 | **file-upload** | @fastify/multipart, single/multiple files, form fields, streaming |
| 08 | **websockets** | @fastify/websocket, rooms, broadcast, ping/pong, typed messages |
| 09 | **testing** | inject(), app factory pattern, makeRequest helper, mock dependencies |
| 10 | **deployment** | Graceful shutdown, health checks, CORS, compression, helmet, rate limiting |

## Tiers

- **Starter** ($19) — Templates 01–05: routes, validation, plugins, hooks, authentication
- **Pro** ($39) — All 10 templates including error handling, uploads, WebSockets, testing, deployment

## Requirements

- Node.js 18+
- TypeScript 5+
- Fastify 4+

## Quick Start

```bash
npm install fastify @fastify/jwt @sinclair/typebox fastify-plugin
npx ts-node templates/01-basic-routes/example.ts
```

## Key Patterns Explained

### TypeBox Schema Validation
```typescript
const CreateUserBody = Type.Object({
  email: Type.String({ format: "email" }),
  name: Type.String({ minLength: 1 }),
});

fastify.post("/users", { schema: { body: CreateUserBody } }, async (req, reply) => {
  const { email, name } = req.body; // fully typed
});
```

### Plugin with Decorator (fp)
```typescript
const dbPlugin = fp(async (fastify) => {
  fastify.decorate("db", db);
});
// Available throughout the app after registration
```

### App Factory for Testing
```typescript
export async function buildApp() {
  const fastify = Fastify({ logger: false });
  // ... register plugins and routes
  await fastify.ready();
  return fastify;
}
// In tests: app.inject() instead of listen()
```

## License

MIT — see LICENSE file.
