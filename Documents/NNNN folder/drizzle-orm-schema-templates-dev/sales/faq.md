# FAQ — Drizzle ORM Schema Templates Pack

**Q: Which version of Drizzle ORM is required?**
Drizzle ORM 0.30+ (`drizzle-orm/pg-core`). Install: `npm install drizzle-orm drizzle-kit`.

**Q: Do these work with SQLite or MySQL?**
These schemas use `pgTable` for PostgreSQL. You can adapt them to `sqliteTable` or `mysqlTable` with minor changes to column types.

**Q: Which PostgreSQL providers are supported?**
Any PostgreSQL host: Neon, Supabase, Railway, PlanetScale (Postgres mode), local Docker, or bare metal.

**Q: Can I customize the schemas?**
Yes — these are starting points, not locked-in structures. Add columns, rename fields, extend relations as needed.

**Q: Do the schemas include migrations?**
No — use `drizzle-kit generate` + `drizzle-kit push` to generate and apply migrations from the schema files.

**Q: Are relations required?**
No. The `relations()` exports are optional and only needed if you use Drizzle's relational query API (`db.query.*`). You can ignore them and use raw `select/join` queries.

**Q: Is this a subscription?**
No — one-time purchase. Download and use forever on unlimited projects.

**Q: Can I use this for client projects?**
Yes. MIT license allows commercial use including client work.

**Q: Does Starter include multi-tenancy?**
Yes — multi-tenancy (05) is in the Starter tier.
