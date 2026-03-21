# TanStack Query Patterns Pack

**10 battle-tested TanStack Query v5 patterns. TypeScript. Production-ready.**

Stop googling the same TanStack Query patterns. This pack gives you copy-paste-ready examples for every common data-fetching scenario — from basic queries to optimistic updates.

## Pricing

| Tier | Patterns | Price |
|------|----------|-------|
| Starter | 5 patterns (core data fetching) | $19 |
| Pro | 10 patterns (full toolkit) | $39 |

## Templates

### Starter ($19) — 5 patterns
| # | Pattern | What It Solves |
|---|---------|----------------|
| 01 | Basic Query | useQuery + query key factory + error/loading |
| 02 | Pagination | Offset pagination with `keepPreviousData` |
| 03 | Infinite Scroll | Cursor-based `useInfiniteQuery` + IntersectionObserver |
| 04 | Mutations | Create/update/delete with cache invalidation |
| 05 | Prefetching | SSR prefetch with Next.js App Router + hover prefetch |

### Pro ($39) — All 10 patterns
Includes all Starter patterns plus:

| # | Pattern | What It Solves |
|---|---------|----------------|
| 06 | Real-Time Polling | Smart polling that auto-stops when condition met |
| 07 | Dependent Queries | Sequential + fan-out query chains |
| 08 | Parallel Queries | Static parallel + dynamic `useQueries` batch |
| 09 | Cache Invalidation | Key hierarchy, invalidation strategies, staleTime/gcTime |
| 10 | Optimistic Updates | Instant UI updates with automatic rollback |

## Quick Start

```bash
npm install @tanstack/react-query
```

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
export function App() {
  return <QueryClientProvider client={queryClient}><YourApp /></QueryClientProvider>;
}
```

## Requirements

- TanStack Query v5 (`@tanstack/react-query@^5`)
- React 18+
- TypeScript recommended

## License

One-time purchase. Use on unlimited personal and commercial projects.
