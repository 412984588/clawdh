# Prisma Patterns Dev Pack

Production-ready Prisma ORM patterns for TypeScript developers. 10 templates covering CRUD, relations, migrations, filtering, transactions, soft delete, pagination, raw queries, middleware, and testing.

## What's Inside

| # | Template | Key Patterns |
|---|----------|--------------|
| 01 | **basic-crud** | create, findUnique, findMany, update, upsert, delete, count, aggregate |
| 02 | **relations** | one-to-many, many-to-many, nested create/update, include, select |
| 03 | **migrations** | migrate dev/deploy, seeding, column rename strategy, validation |
| 04 | **filtering-sorting** | where operators, OR/AND/NOT, relation filters, dynamic where, full-text |
| 05 | **transactions** | sequential $transaction, interactive callback, retry, nested writes |
| 06 | **soft-delete** | deletedAt pattern, Client Extension auto-filter, restore, purge |
| 07 | **pagination** | offset, cursor-based, Relay connection, keyset pagination |
| 08 | **raw-queries** | $queryRaw, $executeRaw, parameterized SQL, PostgreSQL-specific |
| 09 | **middleware** | Client Extensions (computed fields, model methods, query hooks), logging |
| 10 | **testing** | test client, transaction rollback, fixtures, mock PrismaClient, Vitest |

## Tiers

- **Starter** ($19) — Templates 01–05: CRUD, relations, migrations, filtering, transactions
- **Pro** ($39) — All 10 templates including soft delete, pagination, raw queries, middleware, testing

## Requirements

- Node.js 18+
- TypeScript 5+
- Prisma 5+
- PostgreSQL 14+ (most patterns work with MySQL/SQLite too)

## Quick Start

```bash
# Install Prisma
npm install prisma @prisma/client
npx prisma init

# Run any template
npx ts-node templates/01-basic-crud/example.ts
```

## Key Patterns Explained

### Client Extension for Soft Delete
```typescript
const prisma = new PrismaClient().$extends({
  query: {
    user: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});
```

### Interactive Transaction with Retry
```typescript
return prisma.$transaction(async (tx) => {
  const item = await tx.item.findUniqueOrThrow({ where: { id } });
  if (item.stock <= 0) throw new Error("Out of stock");
  return tx.item.update({ where: { id }, data: { stock: { decrement: 1 } } });
});
```

### Cursor Pagination
```typescript
const posts = await prisma.post.findMany({
  take: pageSize + 1, // +1 to detect next page
  cursor: cursor ? { id: cursor } : undefined,
  skip: cursor ? 1 : 0,
});
```

## License

MIT — see LICENSE file.
