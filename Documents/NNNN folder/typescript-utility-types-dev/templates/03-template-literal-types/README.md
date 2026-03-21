# 03 — Template Literal Types

String composition at the type level, CSS utilities, object path types, and camelCase↔snake_case.

## Patterns

- Event name generation: `` `on${Capitalize<T>}` ``
- Cartesian product of unions: `ButtonClass` — 12 combinations from 3×4 union
- Built-in string types: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`
- Store event map: `` `${Key}:update` | `${Key}:reset` ``
- CSS value types: `CSSValue`, `TailwindColorClass`
- Dot-path types: `Paths<T>` — flatten nested object keys to "a.b.c" strings
- HTTP endpoint types: `ApiEndpoint`
- `CamelToSnake` — transform object keys to snake_case at type level
