# Frequently Asked Questions

**Q: What Fastify version is required?**
Fastify 4+. The templates use the Fastify 4 API and @fastify/* official plugins.

**Q: Do I need TypeBox?**
Template 02 uses @sinclair/typebox for type-safe schema generation. You can replace it with raw JSON Schema — both approaches are shown.

**Q: What's the difference between fp() and a regular plugin?**
Without fp(), plugins are encapsulated — decorators added inside don't leak to the parent scope. fp() breaks encapsulation intentionally, so decorators (like `fastify.db`) are available everywhere.

**Q: Can I use these with Fastify 3?**
Most patterns work with Fastify 3 but @fastify/* plugin versions differ. Template 09 (testing) uses `fastify.inject()` which is the same in v3 and v4.

**Q: How does the testing pattern work without a real server?**
Fastify's `app.inject()` method sends requests directly to the router in memory — no network, no port binding. This makes tests fast and portable.

**Q: What's in the deployment template?**
Template 10 covers: production logger config, @fastify/helmet for security headers, @fastify/cors, @fastify/compress for gzip/brotli, @fastify/rate-limit, health check endpoints (/health and /health/ready), and graceful SIGTERM/SIGINT shutdown.

**Q: Can I use these in a commercial project?**
Yes. MIT license.

**Q: How do I run the examples?**
```bash
npm install fastify @fastify/jwt @sinclair/typebox fastify-plugin
npx ts-node templates/01-basic-routes/example.ts
```
