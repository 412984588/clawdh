# 09 — Caching Patterns

`unstable_cache`, `revalidateTag`, `revalidatePath`, `fetch` cache options, and render mode control.

## Patterns

- `unstable_cache` — cache any async function with tags and TTL
- Per-user cache — dynamic tags for user-scoped data
- Cache factory — `createUserCache` helper for reusable patterns
- `fetch` with `next.tags` — tag-based cache for HTTP requests
- `cache: 'no-store'` — opt-out of caching for real-time data
- `revalidateTag` — on-demand cache invalidation from Server Actions
- `revalidatePath` — page-level cache busting
- `dynamic`, `revalidate`, `runtime` — route segment cache config
