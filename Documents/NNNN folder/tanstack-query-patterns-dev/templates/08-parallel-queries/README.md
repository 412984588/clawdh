# Parallel Queries

Fetch multiple independent datasets simultaneously.

## Patterns
1. **Static parallel** — `useQuery` × N when count is fixed at compile time
2. **Dynamic parallel** — `useQueries` when count varies (array of IDs)
3. **Batch fetch** — `useQueries` to load N entities by ID

## Key Concepts
- `useQueries`: accepts a `queries` array, returns an array of results in the same order
- `combine`: optional reducer to merge all results into a single derived value
- All queries run in parallel — no waterfall

## Notes
- Prefer `combine` over manual array processing to keep component code clean
- Each query in `useQueries` is cached independently — sharing the same queryKey reuses cache
