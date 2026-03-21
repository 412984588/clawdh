# Changelog

All notable changes to Redis Patterns Dev Pack are documented here.

## [1.0.0] - 2024-01-01

### Added
- `01-string-operations` — GET/SET, INCR/DECR, EXPIRE/TTL, JSON storage, bit operations
- `02-hash-maps` — HSET/HGET/HGETALL, HINCRBY/HINCRBYFLOAT, HSCAN cursor iteration
- `03-lists-queues` — FIFO queue, BLPOP blocking consumer, LTRIM stack, activity feed
- `04-sets-sorted-sets` — Set operations (SINTER/SUNION/SDIFF), leaderboard, time series
- `05-pub-sub` — Basic pub/sub, PSUBSCRIBE pattern matching, RedisEventBus class, presence
- `06-caching-strategy` — Cache-aside, write-through, mutex stampede prevention, TTL jitter
- `07-rate-limiting` — Fixed window, sliding window log, sliding counter, token bucket (Lua)
- `08-session-store` — Session create/get/update/rotate/invalidate, sliding TTL, cart example
- `09-distributed-locks` — SET NX EX lock, withLock helper, Redlock multi-node, fencing tokens
- `10-streams-events` — XADD/XREAD, consumer groups, XAUTOCLAIM, dead letter queue, event sourcing
- Starter ZIP (templates 01–05, $19)
- Pro ZIP (all 10 templates, $39)
- MIT License
