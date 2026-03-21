# Redis Patterns Dev Pack

Production-ready Redis patterns for TypeScript developers. 10 battle-tested templates covering caching, queuing, pub/sub, rate limiting, sessions, distributed locks, and event streams.

## What's Inside

| # | Template | Key Patterns |
|---|----------|--------------|
| 01 | **string-operations** | GET/SET, INCR/DECR, EXPIRE/TTL, JSON storage, bit operations |
| 02 | **hash-maps** | HSET/HGET/HGETALL, HINCRBY, HSCAN cursor iteration |
| 03 | **lists-queues** | FIFO queue, BLPOP blocking consumer, stack, activity feed |
| 04 | **sets-sorted-sets** | Set operations, leaderboard, time series with sorted sets |
| 05 | **pub-sub** | Publish/subscribe, PSUBSCRIBE patterns, event bus, presence |
| 06 | **caching-strategy** | Cache-aside, write-through, stampede prevention, TTL jitter |
| 07 | **rate-limiting** | Fixed window, sliding window log, sliding counter, token bucket |
| 08 | **session-store** | Session CRUD, sliding expiry, rotation, force logout |
| 09 | **distributed-locks** | SET NX EX, Redlock multi-node, lock extension, fencing tokens |
| 10 | **streams-events** | XADD/XREAD, consumer groups, dead letter queue, event sourcing |

## Tiers

- **Starter** ($19) — Templates 01–05: string ops, hashes, lists, sets/sorted sets, pub/sub
- **Pro** ($39) — All 10 templates including caching, rate limiting, sessions, locks, and streams

## Requirements

- Node.js 18+
- TypeScript 5+
- Redis 7+ (or Redis Cloud / Upstash)
- ioredis `^5.3`

## Quick Start

```bash
# Install deps
npm install ioredis

# Run any template
npx ts-node templates/01-string-operations/example.ts
```

## Template Structure

Each template is a standalone TypeScript file with:
- Exported async functions demonstrating the pattern
- Inline comments explaining key Redis commands
- A `main()` function showing end-to-end usage
- A `cleanup()` function for safe teardown

## Key Patterns Explained

### Cache-Aside with Stampede Prevention
```typescript
// Check cache → miss → acquire mutex lock → load from DB → set cache → release
const lock = await redis.set(lockKey, "1", "EX", 10, "NX");
```

### Token Bucket Rate Limiting
```typescript
// Lua script for atomic read-modify-write
const result = await redis.eval(tokenBucketLua, 1, key, capacity, refillRate, now, tokens);
```

### Consumer Groups
```typescript
// XREADGROUP delivers each message to exactly one consumer in the group
await redis.xreadgroup("GROUP", groupName, consumerName, "COUNT", 10, "STREAMS", stream, ">");
```

### Redlock
```typescript
// Acquire lock on majority of N Redis nodes for fault tolerance
const quorum = Math.floor(clients.length / 2) + 1;
```

## License

MIT — see LICENSE file.
