# FAQ — tRPC v11 Patterns Pack

**Q: Does this work with tRPC v10?**  
A: No, these templates target tRPC v11 which has breaking changes. For v10, the patterns are similar but types differ.

**Q: Do these work with Next.js Pages Router?**  
A: Template 09 focuses on App Router. The adapter pattern works with Pages Router too — swap `fetchRequestHandler` for `createNextApiHandler`.

**Q: Can I use this with Express or Fastify?**  
A: Yes. Templates 01–08 are framework-agnostic. Template 09 is Next.js-specific but the router code works anywhere.

**Q: Do I need Prisma/database?**  
A: No. All templates use in-memory stores for demos. Swap with your real DB layer.

**Q: Is the subscription template production-ready?**  
A: The pattern is production-ready; replace the EventEmitter with Redis pub/sub for multi-instance deployments.

**Q: TypeScript version requirements?**  
A: TypeScript 5.0+ for satisfies keyword and const type parameters.
