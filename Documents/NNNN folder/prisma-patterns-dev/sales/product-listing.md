# Prisma Patterns Dev Pack

**10 production-ready Prisma ORM patterns for TypeScript developers**

Prisma is the most popular TypeScript ORM — but most tutorials stop at basic CRUD. This pack shows you what production Prisma looks like.

## What You Get

**Starter ($19) — Templates 01–05**
- Basic CRUD with create, findMany, upsert, delete, count, aggregate
- Relations — one-to-many, many-to-many, nested writes, include vs select
- Migrations — migrate dev/deploy workflow, seeding, column rename strategy
- Filtering & sorting — where operators, OR/AND/NOT, relation filters, dynamic where
- Transactions — sequential, interactive callback, retry with backoff, nested writes

**Pro ($39) — All 10 Templates**
Everything in Starter, plus:
- Soft delete with PrismaClient Extension auto-filter
- Cursor-based and Relay-style pagination
- Raw SQL with $queryRaw/$executeRaw and JSONB support
- Client Extensions — computed fields, model methods, query hooks
- Testing patterns — fixtures, transaction rollback, mock PrismaClient

## Who Is This For

- Backend developers adopting Prisma for the first time
- Engineers who know the basics but want production-grade patterns
- Teams standardizing on consistent Prisma patterns across services

## Format

10 standalone TypeScript files using `@prisma/client`. Each file exports individual functions and includes a `main()` showing end-to-end usage.

Requires: Node.js 18+, TypeScript 5+, Prisma 5+, PostgreSQL 14+ (most patterns also work with MySQL/SQLite)
