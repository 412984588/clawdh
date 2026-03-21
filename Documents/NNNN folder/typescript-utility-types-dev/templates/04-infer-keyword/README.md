# 04 — infer Keyword

Capture types inside `extends` clauses: function parameters, return types, tuple heads, string parts.

## Patterns

- Built-in re-implementations: `ReturnType_`, `Parameters_`, `ConstructorParameters_`, `InstanceType_`
- Promise unwrapping: `UnwrapPromise` (recursive, handles nested Promises)
- Tuple operations: `Head`, `Last`, `Tail` — extract elements by position
- String inference: `RemovePrefix`, URL param extraction `ExtractParams<"/users/:id">`
- Async return type: `AsyncReturnType<T>` — unwrap Promise from async function
- Multiple infer positions: `Split` — string → tuple
