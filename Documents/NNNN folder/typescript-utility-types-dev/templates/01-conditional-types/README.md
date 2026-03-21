# 01 — Conditional Types

`T extends U ? X : Y`, NonNullable, Extract, Exclude, and compound patterns.

## Patterns

- Basic conditional types: `IsString`, `IsArray`, `IsFunction`
- Built-in utilities: `NonNullable`, `Extract`, `Exclude`
- Promise unwrapping: `Awaited_`, recursive `UnwrapPromise`
- Array element extraction: `ElementType`
- Object key filtering: `KeysOfType` — pick keys whose values match a type
- Function type helpers: `ReturnType_`, `FirstArg`
- never pruning in mapped + conditional combinations
