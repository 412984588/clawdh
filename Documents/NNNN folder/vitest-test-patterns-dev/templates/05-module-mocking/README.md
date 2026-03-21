# 05 — Module Mocking

Mock dependencies with `vi.fn()`, `vi.mocked()`, `mockResolvedValue`, and `mockImplementation`.

## Patterns shown

- `vi.fn()` for creating mock functions
- `mockResolvedValue` / `mockResolvedValueOnce` for async stubs
- `vi.mocked()` for TypeScript type-safe access to mocked functions
- `mockImplementation` for dynamic response per argument
- `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`, `not.toHaveBeenCalled`

## Run

```bash
npx vitest run example.test.ts
```
