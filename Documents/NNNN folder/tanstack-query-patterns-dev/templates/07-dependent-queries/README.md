# Dependent Queries

Queries that wait for other queries to complete before running.

## Key Concepts
- `enabled: !!someValue`: gates a query — runs only when the value is truthy
- No data = no unnecessary requests
- Fan-out pattern: one query gates multiple parallel follow-up queries

## Patterns
1. **Sequential chain**: user → org → billing (each waits for previous)
2. **Fan-out**: org ID → fetch org details AND org members in parallel

## Notes
- Never use `if` to conditionally call hooks — use `enabled` instead
- TypeScript: use `!` or optional chaining inside `queryFn` — `enabled` guarantees it's defined when the query runs
