# FAQ — Prisma Schema Templates

**Q: Are these schemas immediately runnable?**
Yes. Each schema includes the `datasource` and `generator` blocks. Run `npx prisma migrate dev --name init` after copying to your `prisma/` directory.

**Q: Do these work with MySQL or SQLite?**
The schemas are optimized for PostgreSQL. For MySQL/SQLite, remove PostgreSQL-specific types (`@db.Text`, `@db.Date`, `BigInt` for SQLite, array fields) and they'll work with minor adjustments.

**Q: Is the auth schema (01) compatible with NextAuth.js?**
Yes. It implements the Prisma adapter model structure for NextAuth.js / Auth.js. Add `@auth/prisma-adapter` and you're done.

**Q: How do I use the SaaS billing schema with Stripe?**
Store your Stripe Price IDs in `Plan.stripePriceId`, Stripe Customer IDs in `User.stripeCustomerId`, and Stripe Subscription IDs in `Subscription.stripeSubscriptionId`. The schema maps directly to Stripe objects.

**Q: What Prisma version are these compatible with?**
Prisma 4.x and 5.x. These schemas use standard Prisma Schema Language features.

**Q: Can I combine multiple schemas?**
Yes — merge the models from multiple templates into one `schema.prisma`. Resolve any naming conflicts between shared models (e.g., if two schemas both have a `User` model, merge them).

**Q: Do you have schemas for other databases (MongoDB, SQLite)?**
These are PostgreSQL schemas. MongoDB uses a different Prisma schema structure (no relations). SQLite-compatible versions require removing array fields and some type annotations.

**Q: Do I get updates?**
Yes — future template additions are free updates.
