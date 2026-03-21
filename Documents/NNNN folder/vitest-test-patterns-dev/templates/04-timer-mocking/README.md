# 04 — Timer Mocking

Test debounce, throttle, and scheduled callbacks with `vi.useFakeTimers` and `vi.advanceTimersByTime`.

## Patterns shown

- `vi.useFakeTimers()` + `vi.useRealTimers()` in beforeEach/afterEach
- `vi.advanceTimersByTime(ms)` — step forward precisely
- `vi.runAllTimers()` — flush all pending timers
- Testing debounce reset behavior
- Testing throttle window

## Run

```bash
npx vitest run example.test.ts
```
