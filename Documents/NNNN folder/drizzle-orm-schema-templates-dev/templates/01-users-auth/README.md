# Users & Auth Schema

Complete user authentication schema compatible with auth.js (NextAuth) and Lucia Auth.

## Tables
- `users` — core identity (email, name, image)
- `accounts` — OAuth provider accounts (Google, GitHub, etc.)
- `sessions` — server-side session tokens
- `verification_tokens` — email verification / magic link tokens

## Usage

```ts
import { db } from "./db";
import { users, sessions } from "./schema";
import { eq } from "drizzle-orm";

const user = await db.select().from(users).where(eq(users.email, "alice@example.com")).get();
```
