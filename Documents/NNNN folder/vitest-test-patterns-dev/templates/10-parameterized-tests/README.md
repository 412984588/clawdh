# 10 — Parameterized Tests

Data-driven testing with `it.each`, `describe.each`, and named column tables.

## Patterns shown

- `it.each([[...], [...]])` — inline 2D array table
- `it.each([{ name, expected }])` — named columns with `$name` interpolation
- `describe.each` — run a whole suite for each variant
- Type annotation for discriminated union test data
- Combining parameterized tests with custom matchers

## When to use

Use `it.each` when you have 3+ cases with the same structure. Prefer named columns for readability in test output.

## Run

```bash
npx vitest run example.test.ts
```
