# Prisma Schema Templates

**10 production-ready Prisma schemas. Skip the data modeling, ship faster.**

Every common app type — auth, blog, SaaS billing, e-commerce, multi-tenancy, analytics, file storage, notifications, audit logs, social — fully modeled with relations, indexes, and best practices.

## What's Included

| Template | Use case | Tier |
|----------|----------|------|
| 01-users-auth | Users, accounts, sessions, verification tokens (NextAuth-compatible) | Starter |
| 02-blog-cms | Authors, categories, tags, posts, comments | Starter |
| 03-saas-billing | Plans, subscriptions, invoices, usage records | Starter |
| 04-ecommerce | Products, variants, orders, order items, customers | Starter |
| 05-multi-tenancy | Organizations, memberships, invitations, API keys | Starter |
| 06-analytics | Page views, events, sessions, daily metrics | Pro |
| 07-file-storage | Folders, files, file versions, file shares | Pro |
| 08-notifications | Notification types, preferences, push tokens | Pro |
| 09-audit-log | Immutable audit log, field-level change tracking | Pro |
| 10-social | Follows, posts, likes, hashtags, post-hashtag junction | Pro |

## Tiers

- **Starter** ($19): Templates 01–05 — covers most SaaS/app data models
- **Pro** ($39): All 10 templates — complete database design toolkit

## Usage

Each template is immediately usable:
1. Copy `schema.prisma` to your `prisma/` directory
2. Run `npx prisma generate` to generate the client
3. Run `npx prisma migrate dev --name init` to create the database

## Requirements

- `prisma` CLI
- PostgreSQL (schemas use PostgreSQL features like `@db.Text`, arrays)

## License

One-time purchase. Use on unlimited personal and commercial projects.
