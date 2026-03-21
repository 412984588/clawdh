# 09 — Database Patterns

Repository pattern, Service layer, transaction wrapper, and query builder helper.

## Patterns

- `DatabaseConfig` + `getDatabaseConfig()` — env-based configuration
- `IRepository<T, ID>` — standard CRUD interface with pagination
- `UserRepository` — concrete implementation (swap for Prisma/Drizzle/Knex)
- `PageOptions` / `PageResult<T>` — typed pagination
- `withTransaction(fn)` — async transaction wrapper with auto rollback
- `buildWhereClause(where)` — parameterized WHERE clause builder
- `UserService` — Service layer wrapping Repository with business logic
