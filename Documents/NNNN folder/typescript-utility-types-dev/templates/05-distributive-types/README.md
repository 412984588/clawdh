# 05 — Distributive Conditional Types

How conditional types distribute over unions, and how to control distribution.

## Patterns

- Distributive behavior: naked type parameter T distributes over union
- Preventing distribution: wrap T in `[T]` to treat union as a whole
- `ToArray<T>`, `ToPromise<T>` — wrap each union member independently
- `UnionToIntersection<U>` — convert union to intersection via function inference
- `UnionToLastMember<U>` — extract last member of a union
- `UnionToTuple<U>` — convert union to a typed tuple
- `UnionSize<U>` — count members in a union type
- Type-safe event system using distributive conditional types
