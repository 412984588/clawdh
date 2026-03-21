# 03 — Validation Middleware

Zod-based request validation, schema definitions, error formatting, and type inference.

## Patterns

- `validate({ body, query, params })` — middleware factory for multi-target validation
- `paginationSchema` — page/limit/sort/order with string→number coercion
- `idParamsSchema` — numeric ID validation
- `createUserSchema`, `updateUserSchema` — user CRUD schemas
- `loginSchema` — email + password validation
- `createPostSchema` — nested object, arrays, datetime strings
- `searchQuerySchema` — complex filters with cross-field refinement
- Type inference: `z.infer<typeof schema>` for request body types
