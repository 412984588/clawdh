# Prefetching

SSR prefetch with Next.js App Router + hover prefetch pattern.

## Key Concepts
- `prefetchQuery`: loads data into cache ahead of use
- `dehydrate` + `HydrationBoundary`: transfers server-fetched state to client without double-fetch
- Hover prefetch: call `prefetchQuery` on `onMouseEnter` for instant navigation feel

## Next.js App Router Setup

1. Create a `QueryClientProvider` in your root layout
2. In server page components, create a `QueryClient`, prefetch, then wrap with `<HydrationBoundary>`
3. Client components call `useQuery` with the same key — cache hit, no loading state

## Notes
- `staleTime` on prefetch should match the hook's `staleTime` to avoid immediate refetch
