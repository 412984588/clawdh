# 05 — Rate Limiting

Fixed window limiter, sliding window limiter, per-user limits, and preset configurations.

## Patterns

- `createRateLimiter(config)` — configurable fixed-window limiter
- `createSlidingWindowLimiter` — smoother request distribution
- Preset limiters: `apiLimiter`, `authLimiter`, `createLimiter`, `searchLimiter`
- `perUserLimiter` — limit by user ID after authentication
- Custom `keyGenerator` — limit by IP + email for login endpoints
- `skip` option — exempt admin users or trusted IPs
- Rate limit response headers: X-RateLimit-Limit, Remaining, Reset
