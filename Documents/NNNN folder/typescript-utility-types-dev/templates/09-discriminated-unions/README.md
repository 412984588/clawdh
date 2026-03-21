# 09 — Discriminated Unions

Tagged unions with exhaustive switch, Redux-style actions, event systems, and state machines.

## Patterns

- `ApiResponse<T>` — loading/success/error states with precise field access
- `CounterAction` — Redux-style reducer with discriminated union actions
- `assertNever` — exhaustive check: compile error when new variant is added but not handled
- `Shape` — area calculation with `kind` discriminant
- `AppEvent` — typed event system with `EventPayload<T>` extraction
- `Expr` — recursive expression tree (AST-style)
- `TrafficLight` — finite state machine with discriminated transitions
- `ExtractVariant<T, K, V>` — filter union by discriminant value
