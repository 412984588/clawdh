# 09 — Error Handling

Test custom error classes, typed throws, and async rejections with full instance inspection.

## Patterns shown

- `toThrow(ErrorClass)` — check error type
- `toThrow("message substring")` — check error message
- `try/catch` + `expect(err).toBeInstanceOf()` — inspect custom fields
- `expect.fail("should have thrown")` — explicit failure in catch-free paths
- `resolves.toBe` / `rejects.toThrow` for async errors
- Custom error classes extending `Error` with extra fields

## Run

```bash
npx vitest run example.test.ts
```
