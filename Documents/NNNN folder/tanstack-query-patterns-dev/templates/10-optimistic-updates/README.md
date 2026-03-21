# Optimistic Updates

Instant UI feedback with automatic rollback on error.

## The 3-Step Pattern
1. `onMutate`: snapshot → cancel queries → apply optimistic update → return snapshot
2. `onError`: rollback using the snapshot from context
3. `onSettled`: invalidate to sync with server (runs after both success and error)

## Key APIs
- `cancelQueries`: prevents refetches from overwriting your optimistic state
- `getQueryData`: read current cache for snapshotting
- `setQueryData`: write directly to cache without a network request

## When to Use
- Toggle/checkbox interactions (feels instant)
- Like/follow buttons
- Delete actions
- Any mutation where <200ms latency matters for UX

## When NOT to Use
- Mutations where the server response contains new data (e.g., generated IDs)
- Complex operations where rollback logic is unclear
- Use regular invalidation instead — it's simpler and correct
