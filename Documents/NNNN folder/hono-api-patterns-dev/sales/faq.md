# FAQ — Hono.js API Patterns Pack

**Q: Does this work with Node.js?**
A: Yes. Use @hono/node-server. Templates 01-09 are runtime-agnostic; template 06 covers Cloudflare-specific bindings.

**Q: Can I use this with Bun or Deno?**
A: Yes. Hono is multi-runtime. Bun: `export default { port: 3000, fetch: app.fetch }`. Deno: same pattern.

**Q: Do I need zod installed?**
A: For templates 02, 04, 05, 10 yes. Run: `npm install zod @hono/zod-validator @hono/zod-openapi`.

**Q: Is the Cloudflare Workers template (06) usable without a Cloudflare account?**
A: The code is ready for Cloudflare. Use wrangler dev for local testing.
