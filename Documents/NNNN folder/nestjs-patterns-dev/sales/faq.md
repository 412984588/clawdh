# NestJS Patterns — FAQ

**Q: What NestJS version do these templates target?**
NestJS 10+. All patterns use the current decorator API and are compatible with NestJS 10 and 11.

**Q: Do I need the Pro tier to use TypeORM or Prisma?**
Yes — templates 06 (TypeORM) and 07 (Prisma) are Pro-only.

**Q: Are the templates runnable as-is?**
Each template is a ready-to-use TypeScript file with all imports declared. You'll need to install the relevant packages (listed in each file's header comment) and configure your database connection.

**Q: Can I use these in client projects?**
Yes. MIT license — personal and commercial use allowed.

**Q: What about NestJS testing (e.g., jest)?**
The templates focus on application patterns. Unit/e2e test setup is outside scope, though the Pipes & Filters template includes testable error handling patterns.

**Q: Do you cover NestJS CLI or project scaffolding?**
No — these are focused code-pattern templates, not project generators. Use `@nestjs/cli` to scaffold your project, then drop these patterns in.

**Q: Will these templates be updated?**
Buyers receive future updates for free when templates are revised for new NestJS major versions.
