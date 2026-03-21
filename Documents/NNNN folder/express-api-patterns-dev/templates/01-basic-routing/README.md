# 01 — Basic Routing

Express Router, typed request helpers, response utilities, pagination, and CRUD patterns.

## Patterns

- `TypedRequest<Params, Query, Body>` — typed route parameters
- Response helpers: `ok`, `created`, `noContent`, `badRequest`, `notFound`, `internalError`
- GET /resources — list with pagination and filter
- GET /resources/:id — single resource with 404 handling
- POST /resources — create with validation
- PUT/PATCH /resources/:id — full and partial updates
- DELETE /resources/:id — delete with 404 handling
