# 01 — Users & Authentication

NextAuth.js / Auth.js compatible schema. Supports OAuth providers, email/password, and magic links.

## Models

- **User** — core user profile with role enum
- **Account** — linked OAuth/credential accounts per user
- **Session** — active user sessions
- **VerificationToken** — email verification, password reset, magic links

## Compatibility

Works as-is with the NextAuth.js Prisma adapter. Add `@auth/prisma-adapter` and pass the Prisma client.

## Usage

```bash
npx prisma migrate dev --name init-auth
```
