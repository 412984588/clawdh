# 08 — Builder Pattern

Fluent builders with type-safe chaining, compile-time required field enforcement, and immutability.

## Patterns

- `QueryBuilder` — SQL query builder with method chaining
- `RequestBuilder<State>` — generic state-tracked builder: `build()` only available after required fields set
- `SetField<State, K, V>` — type-level field tracking via intersection
- `ImmutableBuilder<T>` — each `set()` returns a new instance
- `ValidatedBuilder<T>` — builder with inline validation, returns `{ value, errors }`
