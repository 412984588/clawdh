# Redis Patterns Dev Pack

**10 production-ready Redis patterns for TypeScript developers**

Stop re-inventing the wheel on every project. This pack gives you battle-tested implementations of the most important Redis patterns — ready to copy, adapt, and ship.

## What You Get

**Starter ($19) — Templates 01–05**
- String operations, counters, TTL management
- Hash maps for user profiles and product catalogs
- List-based FIFO queues with blocking consumers
- Sets and sorted sets for leaderboards and online tracking
- Pub/sub channels with pattern subscriptions and event bus

**Pro ($39) — All 10 Templates**
Everything in Starter, plus:
- Cache-aside and write-through with stampede prevention
- Rate limiting (fixed window, sliding window, token bucket)
- Session store with sliding TTL and forced logout
- Distributed locks with Redlock and fencing tokens
- Redis Streams with consumer groups and event sourcing

## Who Is This For

- Backend developers adding Redis to Node.js / TypeScript apps
- Engineers who know Redis basics but want production patterns
- Teams looking for consistent, reviewed implementations to standardize on

## Format

Each template is a single TypeScript file using `ioredis`. Functions are exported so you can import exactly what you need. A `main()` function demonstrates end-to-end usage.

Requires: Node.js 18+, TypeScript 5+, Redis 7+, ioredis ^5.3
