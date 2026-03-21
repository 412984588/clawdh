# 02 — Mapped Types

`{ [K in keyof T]: ... }`, Readonly, Partial, Required, Pick, Omit, Record, and key remapping.

## Patterns

- Built-in utilities: `Readonly`, `Partial`, `Required`, `Pick`, `Omit`, `Record`
- Custom utilities: `Nullable`, `Promisify`, `Arrayify`
- Selective modifiers: `PartialBy`, `RequireFields`
- Key remapping with `as` (TS 4.1+): `Prefixed`, `Getters`, `Setters`
- Key filtering: `FunctionKeys`, `DataKeys`, `DataOnly`, `MethodsOnly`
- Recursive mapping: `DeepPartial`, `DeepReadonly`
