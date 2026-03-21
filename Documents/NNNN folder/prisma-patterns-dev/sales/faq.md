# Frequently Asked Questions

**Q: What Prisma version is required?**
Prisma 5+ is recommended. The Client Extensions (templates 06, 09) require Prisma 4.7+.

**Q: Does this work with MySQL or SQLite?**
Most patterns work with any Prisma-supported database. A few features are PostgreSQL-specific (full-text search in template 04, JSONB in template 08). These are clearly noted in the files.

**Q: Do I need a running database to use these?**
To run the `main()` functions you need a database. But each function is independently exported — you can copy the pattern without running the demo.

**Q: Are these TypeScript or JavaScript?**
TypeScript. Each file uses `@prisma/client` types. Strip the type annotations for plain JS.

**Q: What does the testing template include?**
Template 10 covers: a test PrismaClient, transaction rollback pattern for zero-cleanup test isolation, reusable fixture functions, and a mock PrismaClient pattern for unit tests using `jest-mock-extended`.

**Q: What's the difference between the $transaction approaches in template 05?**
Sequential transactions take an array of Prisma operations. Interactive transactions take an async callback with a `tx` client — use this when you need to read before writing (e.g. check stock before decrement).

**Q: Can I use these in a commercial project?**
Yes. MIT license — use in any project, commercial or otherwise.

**Q: What's the soft-delete extension doing?**
Template 06 adds `deletedAt: null` to every `findMany`, `findFirst`, and `count` call automatically via a Prisma Client Extension. You never have to remember to add the filter manually.

**Q: What's keyset pagination?**
Template 07 includes keyset pagination for composite sort keys (e.g. `publishedAt + id`). It's more efficient than offset pagination on large tables and handles ties correctly.

**Q: How do I run the examples?**
```bash
npm install prisma @prisma/client
npx prisma init
# configure DATABASE_URL in .env
npx prisma db push   # or migrate dev
npx ts-node templates/01-basic-crud/example.ts
```
