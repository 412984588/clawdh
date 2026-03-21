# 08 — Snapshot Testing

Capture and assert complex output shapes with `toMatchInlineSnapshot`.

## Patterns shown

- `toMatchInlineSnapshot` — snapshot stored in test file (no `.snap` files)
- Partial snapshots for nested objects
- When to use snapshots vs exact assertions
- Updating snapshots: `vitest run --update`

## When to use snapshots

- Config objects / navigation trees — catch accidental structural changes
- UI serialization — catch unintended renders
- Do NOT use for frequently-changing data (dates, ids)

## Run

```bash
# Run tests
npx vitest run example.test.ts

# Update snapshots after intentional changes
npx vitest run example.test.ts --update
```
