# Changelog

All notable changes to Prisma Patterns Dev Pack are documented here.

## [1.0.0] - 2024-01-01

### Added
- `01-basic-crud` — create, findUnique/Many, update, upsert, delete, count, aggregate
- `02-relations` — one-to-many, many-to-many, nested writes, include, select, cascade delete
- `03-migrations` — migrate dev/deploy workflow, seeding, column rename strategy, validation
- `04-filtering-sorting` — where operators, OR/AND/NOT/IN, relation filters, dynamic where builder
- `05-transactions` — sequential $transaction, interactive callback, retry with backoff, nested writes
- `06-soft-delete` — deletedAt pattern, Client Extension auto-filter, restore, purge, cascade soft-delete
- `07-pagination` — offset, cursor-based, Relay connection (edges/pageInfo), keyset pagination
- `08-raw-queries` — $queryRaw/$executeRaw, parameterized templates, JSONB, dynamic sort allowlist
- `09-middleware` — Client Extensions (result/model/query), computed fields, soft-delete, logging, metrics
- `10-testing` — test PrismaClient, transaction rollback, fixtures, mock pattern, Vitest example
- Starter ZIP (templates 01–05, $19)
- Pro ZIP (all 10 templates, $39)
- MIT License
