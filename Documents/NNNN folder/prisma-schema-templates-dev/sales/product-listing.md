# Prisma Schema Templates

**10 production-ready Prisma schemas. Skip the data modeling, ship faster.**

Designing a database schema from scratch takes hours — figuring out the right relations, indexes, enum values, and edge cases. These templates give you battle-tested starting points for every common app type.

---

## What's Inside

### Starter — $19
**5 schemas covering the most common SaaS and app patterns**

| Template | What you get |
|----------|--------------|
| `01-users-auth` | NextAuth.js-compatible user, account, session, verification token |
| `02-blog-cms` | Authors, categories, tags (M2M), posts, nested comments |
| `03-saas-billing` | Plans, subscriptions, invoices, usage records (Stripe-ready) |
| `04-ecommerce` | Products, variants, orders, customers (prices in cents) |
| `05-multi-tenancy` | Organizations, memberships, invitations, hashed API keys |

### Pro — $39
**All 10 schemas — complete database design toolkit**

Everything in Starter, plus:

| Template | What you get |
|----------|--------------|
| `06-analytics` | Sessions, page views, events, daily aggregated metrics |
| `07-file-storage` | Folders, files, versions, share links (S3/GCS-ready) |
| `08-notifications` | Multi-channel notifications, user preferences, push tokens |
| `09-audit-log` | Immutable audit trail, field-level change tracking |
| `10-social` | Follow graph, posts, likes, nested comments, hashtags |

---

## Who This Is For

- TypeScript/Node.js developers starting a new Prisma project
- Teams who keep reinventing the same data models
- Developers who want to see how complex schemas (multi-tenancy, audit logs) are structured

---

## Every Schema Includes

- `datasource` + `generator` blocks — immediately runnable
- Proper `@id`, `@unique`, `@@index` for query performance
- Relations with `onDelete` cascade rules
- Enums for all status/type fields
- PostgreSQL-specific features where appropriate (arrays, `@db.Text`, `@db.Date`)

---

## Save Time on Every Project

Avg time to design a schema from scratch: 2-4 hours per domain
This pack: copy, adapt, run `prisma migrate dev` — **under 10 minutes**

**Starter: ~~$100 value~~ $19 | Pro: ~~$200 value~~ $39**

---

## Requirements

- `prisma` CLI
- PostgreSQL 14+ (or adjust for MySQL/SQLite)

## License

One-time purchase. Use on unlimited personal and commercial projects.
