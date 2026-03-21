# 10 — Type Guards

Runtime type narrowing: `typeof`, `instanceof`, `is` predicates, `asserts`, `in`, and array filtering.

## Patterns

- `typeof` guard — string/number/boolean narrowing
- `instanceof` guard — custom error class discrimination
- User-defined type predicates (`is`): `isUser`, `isAdmin`, `isNonNull`
- `asserts` functions: `assertIsString`, `assertIsDefined` — throw or narrow
- `in` operator guard — check property existence to narrow union
- `filterDefined` — filter `null | undefined` from arrays with type predicate
- `hasKey<K>` — generic key existence guard
- `isEnumValue` — check if string is a valid enum member
