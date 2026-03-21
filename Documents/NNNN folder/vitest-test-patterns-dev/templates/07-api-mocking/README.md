# 07 — API Mocking

Mock `fetch` with `vi.spyOn(globalThis, 'fetch')`, test HTTP error codes, and assert request shapes.

## Patterns shown

- `vi.spyOn(globalThis, 'fetch')` — intercept native fetch
- `mockResponse` helper for building Response objects
- Asserting URL, method, headers, body with `expect.objectContaining`
- 4xx/5xx error handling
- Network-level error simulation with `mockRejectedValue`
- `vi.restoreAllMocks()` in afterEach for clean state

## Run

```bash
npx vitest run example.test.ts
```
