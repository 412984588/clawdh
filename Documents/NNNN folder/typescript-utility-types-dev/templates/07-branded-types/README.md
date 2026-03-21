# 07 — Branded Types

Nominal typing to prevent ID mixups, currency confusion, unit errors, and injection vulnerabilities.

## Patterns

- `Brand<T, B>` — base branded type utility using `unique symbol`
- ID types: `UserId`, `PostId`, `OrderId` — compiler prevents swapping them
- Currency types: `USD`, `EUR`, `CNY` — type-safe arithmetic
- Validated strings: `ValidEmail`, `SanitizedHtml`, `HashedPassword`
- Measurement units: `Meters`, `Kilograms`, `Seconds`, `MetersPerSecond`
- Value constraints: `NonEmptyString`, `PositiveNumber`, `Percentage`
- Generic brands: `Frozen<T>`, `Validated<T>` — mark objects as processed
