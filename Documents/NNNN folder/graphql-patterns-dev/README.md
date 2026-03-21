# GraphQL Patterns

10 production-ready GraphQL patterns — covering schema design, resolvers, mutations, subscriptions, DataLoaders, auth directives, pagination, file uploads, federation, and testing.

## What's Inside

| # | Template | Description |
|---|----------|-------------|
| 01 | Schema Basics | typeDefs, resolvers, custom scalars, interfaces, unions |
| 02 | Resolvers | Context, field resolvers, resolver composition, viewer-dependent fields |
| 03 | Mutations | Input types, error union pattern, validation, auth |
| 04 | Subscriptions | PubSub, withFilter, filtered subscriptions, WebSocket transport |
| 05 | DataLoaders | Batching, caching, N+1 problem solution, per-request loaders |
| 06 | Auth Directives | @auth, @hasRole schema directives, context-based authorization |
| 07 | Pagination | Relay cursor pagination, offset/limit, keyset pagination |
| 08 | File Upload | Upload scalar, multipart/form-data, validation, multi-upload |
| 09 | Federation | Apollo Federation v2, subgraphs, entity resolvers, @key |
| 10 | Testing GraphQL | executeOperation, mocking resolvers, test helpers |

## Tiers

- **Starter** ($19) — Templates 01–05
- **Pro** ($39) — All 10 templates

## Quick Start

```bash
npm install apollo-server graphql
```

```ts
import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`type Query { hello: String! }`;
const resolvers = { Query: { hello: () => "Hello GraphQL!" } };

const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: 4000 });
```

## Requirements

- Node.js 18+
- TypeScript 5+
- apollo-server 3.x / @apollo/server 4.x

## License

MIT — use in personal and commercial projects.
