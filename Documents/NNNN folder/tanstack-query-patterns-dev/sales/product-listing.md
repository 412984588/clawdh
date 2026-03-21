# TanStack Query Patterns Pack

**10 production-ready TanStack Query v5 patterns. TypeScript. Stop googling the same examples.**

## Pricing

- **Starter** — $19 (5 patterns: essential data-fetching toolkit)
- **Pro** — $39 (all 10 patterns: complete coverage)

## What's Included

### Starter ($19)
1. **Basic Query** — useQuery with query key factory, typed fetcher, error/loading states, staleTime.
2. **Pagination** — Offset pagination with `keepPreviousData` for flicker-free page transitions.
3. **Infinite Scroll** — Cursor-based `useInfiniteQuery` + IntersectionObserver auto-trigger.
4. **Mutations** — Create/update/delete with `useMutation`, `onSuccess` cache invalidation.
5. **Prefetching** — SSR prefetch with Next.js App Router + `dehydrate`/`HydrationBoundary` + hover prefetch.

### Pro ($39) — Everything in Starter plus:
6. **Real-Time Polling** — Smart polling with `refetchInterval` that auto-stops when job completes.
7. **Dependent Queries** — Sequential query chains and fan-out patterns using `enabled`.
8. **Parallel Queries** — Static `useQuery` × N and dynamic `useQueries` with `combine`.
9. **Cache Invalidation** — Query key hierarchy, `invalidateQueries` levels, staleTime vs gcTime.
10. **Optimistic Updates** — Instant UI with `onMutate` snapshot + `onError` rollback.

## Who This Is For

- React/Next.js developers building data-heavy UIs
- Teams adopting TanStack Query v5 and needing real-world patterns
- Developers who've read the docs but want production-tested examples
