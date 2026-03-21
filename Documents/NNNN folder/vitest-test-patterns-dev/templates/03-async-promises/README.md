# 03 — Async / Promises

Test async functions with `await`, `rejects.toThrow`, retry logic, and `Promise.allSettled`.

## Patterns shown

- `async/await` in test bodies
- `await expect(fn()).rejects.toThrow()`
- Retry-on-failure with call counting
- `Promise.race` timeout pattern
- `Promise.allSettled` mixed results

## Run

```bash
npx vitest run example.test.ts
```
