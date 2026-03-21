# Cache Invalidation

Query key hierarchy, invalidation patterns, and cache management.

## Query Key Design
Keys should be hierarchical arrays so you can invalidate at any level:
- `["users"]` → invalidates ALL user queries
- `["users", "list"]` → invalidates only list queries
- `["users", "detail", id]` → invalidates one specific user

## Key Operations
| Operation | Effect |
|-----------|--------|
| `invalidateQueries` | Marks stale + refetches if observed |
| `removeQueries` | Removes from cache, no refetch |
| `setQueryData` | Writes directly to cache, no network call |
| `cancelQueries` | Cancels in-flight requests (useful for optimistic updates) |

## staleTime vs gcTime
- `staleTime`: how long data is considered fresh (no refetch during this window)
- `gcTime` (formerly cacheTime): how long unused data stays in memory before garbage collection

## Golden Rule
Always use a query key factory function. String literals scatter your keys and make invalidation brittle.
