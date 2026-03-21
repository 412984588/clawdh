# Frequently Asked Questions

**Q: What Redis version is required?**
Redis 7+ is recommended. Most patterns work with Redis 6.2+. The Streams template uses `XAUTOCLAIM` which requires Redis 6.2+.

**Q: What ioredis version?**
ioredis ^5.3. Compatible with ioredis 4.x for most templates, but 5.x is recommended.

**Q: Can I use these with Upstash or Redis Cloud?**
Yes. All patterns use standard Redis commands and work with any Redis-compatible service.

**Q: Are these TypeScript or JavaScript?**
TypeScript. Each file compiles cleanly with TypeScript 5+. You can strip types and use as plain JS.

**Q: Do I need to install any packages?**
Only `ioredis` (`npm install ioredis`). No other runtime dependencies.

**Q: Can I use these in a commercial project?**
Yes. MIT license — use in any project, commercial or otherwise.

**Q: What's the difference between the tiers?**
Starter (01–05) covers fundamental data structures and pub/sub. Pro (01–10) adds the infrastructure patterns: caching, rate limiting, sessions, distributed locks, and streams.

**Q: Is there a Lua script for rate limiting?**
Yes. The token bucket in `07-rate-limiting/example.ts` uses a Lua script for atomic read-modify-write.

**Q: How do I run the examples?**
```bash
npm install ioredis
npx ts-node templates/07-rate-limiting/example.ts
```

**Q: What if a pattern doesn't work for my use case?**
Each function is independently exported. Copy the relevant function and adapt the key naming and logic for your needs.
