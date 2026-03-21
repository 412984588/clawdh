# FAQ — TanStack Query Patterns Pack

**Q: Which version of TanStack Query is this for?**
TanStack Query v5 (`@tanstack/react-query@^5`). The API changed significantly in v5 (e.g., `keepPreviousData` is now imported separately, `cacheTime` renamed to `gcTime`). These examples use v5 syntax.

**Q: Do these work with React Query v4?**
Mostly yes, but some APIs differ. The pattern logic is the same; you'd need to adjust a few import names and option signatures.

**Q: Can I use these with Vue or Solid?**
These examples use React hooks. TanStack Query supports Vue/Solid/Svelte but the hook names and component syntax differ. The patterns and concepts apply universally.

**Q: Do these work with Next.js App Router?**
Yes — pattern 05 (Prefetching) specifically covers Next.js App Router SSR with `dehydrate` and `HydrationBoundary`.

**Q: Do I need TypeScript?**
No, but it's recommended. The examples are written in TypeScript and all types can be removed if you prefer plain JavaScript.

**Q: Is this a subscription?**
No — one-time purchase. Download once, use forever.

**Q: Can I use this for client projects?**
Yes. MIT license allows commercial use including client work.
