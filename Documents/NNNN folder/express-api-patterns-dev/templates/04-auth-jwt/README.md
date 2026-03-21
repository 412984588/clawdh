# 04 — JWT Authentication

JWT sign/verify, authentication middleware, role authorization, refresh token rotation.

## Patterns

- `signJwt` / `verifyJwt` — lightweight JWT without external dependencies
- `authenticate` — Bearer token middleware, extracts and verifies JWT
- `authorize(...roles)` — role-based access control middleware
- `createTokenPair` — issue access + refresh token pair
- `rotateRefreshToken` — single-use refresh with rotation
- `revokeRefreshToken` — revoke on logout
- Login/logout/refresh route handlers
- HttpOnly cookie for refresh token storage
