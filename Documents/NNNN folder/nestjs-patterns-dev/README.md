# NestJS Patterns

10 production-ready NestJS patterns — covering modules, DTO validation, auth guards, interceptors, pipes/filters, TypeORM, Prisma, GraphQL, WebSockets, and microservices.

## What's Inside

| # | Template | Description |
|---|----------|-------------|
| 01 | Module Basics | @Module, @Controller, @Injectable, OnModuleInit/Destroy |
| 02 | DTO Validation | class-validator, class-transformer, ValidationPipe, serialisation |
| 03 | Auth Guards | JWT guard, roles guard, @SetMetadata, custom decorators |
| 04 | Interceptors | Transform response, logging, caching, timeout interceptors |
| 05 | Pipes & Filters | Custom pipes, exception filters, global error handling |
| 06 | TypeORM Entities | @Entity, @Column, relations, Repository pattern, soft-delete |
| 07 | Prisma Service | PrismaClient integration, transactions, typed queries |
| 08 | GraphQL Resolver | Code-first @Resolver, @Query, @Mutation, @ObjectType, DataLoader |
| 09 | WebSocket Gateway | @WebSocketGateway, rooms, presence tracking, broadcast |
| 10 | Microservices | TCP transport, @MessagePattern, @EventPattern, ClientProxy |

## Tiers

- **Starter** ($19) — Templates 01–05
- **Pro** ($39) — All 10 templates

## Quick Start

```bash
npm install @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata
```

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

## Requirements

- NestJS 10+
- TypeScript 5+
- Node.js 18+
- `reflect-metadata` (required for decorators)

## License

MIT — use in personal and commercial projects.
