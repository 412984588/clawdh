# tRPC v11 Patterns

10 production-ready tRPC v11 patterns — covering routers, context/middleware, error handling, Zod validation, subscriptions, file uploads, batching, testing, Next.js integration, and infinite queries.

## What's Inside

| # | Template | Description |
|---|----------|-------------|
| 01 | Router Basics | initTRPC, procedures, input/output schemas, nested routers |
| 02 | Context & Middleware | createContext, auth middleware, role-based procedures |
| 03 | Error Handling | TRPCError, custom error classes, errorFormatter, onError |
| 04 | Zod Input | Transforms, refinements, discriminated unions, cross-field validation |
| 05 | Subscriptions | WebSocket observable, event emitter, live metrics |
| 06 | File Upload | Presigned S3 URLs, metadata validation, batch uploads |
| 07 | Batch Requests | httpBatchLink, splitLink, deduplication, timeout handling |
| 08 | Testing tRPC | createCallerFactory, mock context, unit tests, role tests |
| 09 | Next.js Integration | App Router, server components, React Query hooks, prefetch |
| 10 | Infinite Queries | Cursor pagination, useInfiniteQuery, bidirectional loading |

## Tiers

- **Starter** ($19) — Templates 01–05
- **Pro** ($39) — All 10 templates

## Quick Start

```bash
npm install @trpc/server @trpc/client @trpc/react-query zod
```

```ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `Hello, ${input.name}!`),
});

export type AppRouter = typeof appRouter;
```

## Requirements

- Node.js 18+
- TypeScript 5.0+
- @trpc/server v11
- zod v3.22+

## License

MIT — use in personal and commercial projects.
