# Drizzle ORM Schema Templates Pack

**10 production-ready Drizzle ORM database schemas. TypeScript. PostgreSQL. Stop designing from scratch.**

## Pricing

- **Starter** — $19 (5 schemas: core SaaS patterns)
- **Pro** — $39 (all 10 schemas: full application stack)

## What's Included

### Starter ($19)
1. **Users & Auth** — Users, sessions, OAuth accounts, email verification tokens. Compatible with auth.js and Lucia.
2. **Blog / CMS** — Posts, authors, categories, tags (many-to-many), comments with moderation.
3. **SaaS Billing** — Plans, subscriptions (trial/active/cancelled), invoices, usage metering. Stripe-compatible.
4. **E-Commerce** — Products, variants (size/color), orders, order items with price snapshots.
5. **Multi-Tenancy** — Organizations, memberships with roles (owner/admin/member), invitations, API keys (hashed).

### Pro ($39) — Everything in Starter plus:
6. **Analytics** — Page views, custom events, sessions (with UTM), pre-aggregated daily metrics.
7. **File Storage** — Files, nested folders, versions, sharing (public link + user-to-user). Works with S3/R2/GCS.
8. **Notifications** — Multi-channel (in-app/email/push/SMS), per-user preferences, push device tokens.
9. **Audit Log** — Immutable insert-only audit trail with before/after snapshots and field-level diffs.
10. **Social Network** — Follows (with private account requests), posts (threading + reposts), likes, hashtags.

## Tech

- Drizzle ORM `pgTable` + full `relations()` definitions
- TypeScript — all column types are inferred
- Works with PostgreSQL (Neon, Supabase, Railway, local)
- Every template has a README with table descriptions and query examples

## Who This Is For

- TypeScript developers building SaaS, e-commerce, or social apps
- Teams standardizing on Drizzle ORM for new projects
- Developers who want proven schemas they can trust in production
