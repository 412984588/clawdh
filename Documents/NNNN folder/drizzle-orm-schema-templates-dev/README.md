# Drizzle ORM Schema Templates Pack

**10 production-ready Drizzle ORM database schema templates. TypeScript. PostgreSQL. Drop-in ready.**

Stop designing database schemas from scratch. This pack gives you battle-tested Drizzle ORM schemas for the most common application patterns.

## Pricing

| Tier | Templates | Price |
|------|-----------|-------|
| Starter | 5 schemas (core SaaS patterns) | $19 |
| Pro | 10 schemas (full stack coverage) | $39 |

## Templates

### Starter ($19) — 5 schemas
| # | Schema | Use Case |
|---|--------|----------|
| 01 | Users & Auth | Users, sessions, OAuth accounts, verification tokens |
| 02 | Blog / CMS | Posts, authors, categories, tags, comments |
| 03 | SaaS Billing | Plans, subscriptions, invoices, usage metering |
| 04 | E-Commerce | Products, variants, orders, order items |
| 05 | Multi-Tenancy | Organizations, memberships, invitations, API keys |

### Pro ($39) — All 10 schemas
Includes all Starter schemas plus:

| # | Schema | Use Case |
|---|--------|----------|
| 06 | Analytics | Page views, events, sessions, daily metrics |
| 07 | File Storage | Files, folders, versions, sharing (S3/R2/GCS) |
| 08 | Notifications | Multi-channel notifications + user preferences |
| 09 | Audit Log | Immutable audit trail, field-level change tracking |
| 10 | Social Network | Follows, posts, likes, hashtags, threading |

## Quick Start

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

```ts
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./01-users-auth/schema";

const db = drizzle(process.env.DATABASE_URL!, { schema });

const users = await db.select().from(schema.users).limit(10);
```

## Works With

- PostgreSQL (Neon, Supabase, Railway, local)
- Any Drizzle-compatible PostgreSQL driver

## License

One-time purchase. Use on unlimited personal and commercial projects.
