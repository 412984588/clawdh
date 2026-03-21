# 07 — Parallel Routes

`@slot` convention, independent streaming per slot, and intercepting routes modal pattern.

## Patterns

- Parallel routes `@slot` — render multiple pages simultaneously in one layout
- Independent Suspense per slot — each slot streams separately, fails independently
- Conditional slots — render different content based on auth state
- Intercepting routes `(.)` — show route content in a modal without leaving current page
- `(..)`, `(...)` — intercept parent and root routes
- Modal pattern — photo gallery with modal preview + full page fallback
