# Basic Query

Core useQuery pattern with query key factory, typed fetcher, and proper error/loading handling.

## Key Concepts
- Query key factory: centralised, type-safe, collision-free
- `staleTime`: cache freshness window (avoids unnecessary refetches)
- `retry: 2`: retries failed requests twice before showing error

## When to Use
Default pattern for any read-only data fetch. Start here and add complexity only when needed.
