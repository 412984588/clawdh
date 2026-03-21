/**
 * Hono.js — App Basics
 * routing, path params, query params, error handling, grouped routes
 */
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// ── 1. App instance ───────────────────────────────────────────────────────────

const app = new Hono();

// ── 2. Built-in middleware ────────────────────────────────────────────────────

app.use("*", logger());        // request/response logging
app.use("*", prettyJSON());    // pretty-print JSON in development

// ── 3. Route groups ───────────────────────────────────────────────────────────

// Products route group
const products = new Hono();

const db: { id: string; name: string; price: number; category: string }[] = [
  { id: "1", name: "Widget Pro", price: 29.99, category: "tools" },
  { id: "2", name: "Gadget Plus", price: 49.99, category: "electronics" },
  { id: "3", name: "Donut Machine", price: 199.99, category: "kitchen" },
];

// GET /products — list with optional query filtering
products.get("/", (c) => {
  const category = c.req.query("category");
  const minPrice = Number(c.req.query("min_price") ?? 0);
  const maxPrice = Number(c.req.query("max_price") ?? Infinity);
  const q = c.req.query("q")?.toLowerCase();

  const filtered = db.filter(
    (p) =>
      (!category || p.category === category) &&
      p.price >= minPrice &&
      p.price <= maxPrice &&
      (!q || p.name.toLowerCase().includes(q))
  );

  return c.json({ data: filtered, total: filtered.length });
});

// GET /products/:id — get by ID
products.get("/:id", (c) => {
  const product = db.find((p) => p.id === c.req.param("id"));
  if (!product) throw new HTTPException(404, { message: "Product not found" });
  return c.json(product);
});

// POST /products — create
products.post("/", async (c) => {
  const body = await c.req.json<{ name: string; price: number; category: string }>();
  if (!body.name || !body.price || !body.category) {
    throw new HTTPException(400, { message: "name, price, category are required" });
  }
  const product = { id: String(db.length + 1), ...body };
  db.push(product);
  return c.json(product, 201);
});

// PUT /products/:id — update
products.put("/:id", async (c) => {
  const idx = db.findIndex((p) => p.id === c.req.param("id"));
  if (idx === -1) throw new HTTPException(404, { message: "Product not found" });
  const body = await c.req.json<Partial<{ name: string; price: number; category: string }>>();
  db[idx] = { ...db[idx], ...body };
  return c.json(db[idx]);
});

// DELETE /products/:id — delete
products.delete("/:id", (c) => {
  const idx = db.findIndex((p) => p.id === c.req.param("id"));
  if (idx === -1) throw new HTTPException(404, { message: "Product not found" });
  db.splice(idx, 1);
  return c.json({ deleted: true });
});

// ── 4. Mount sub-app ──────────────────────────────────────────────────────────

app.route("/products", products);

// ── 5. Root & health ──────────────────────────────────────────────────────────

app.get("/", (c) => c.json({ message: "Welcome to Hono API" }));

app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// ── 6. Global error handler ───────────────────────────────────────────────────

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// 404 fallback
app.notFound((c) =>
  c.json({ error: `Route ${c.req.method} ${c.req.path} not found` }, 404)
);

export default app;

// ── 7. Start (Node.js) ────────────────────────────────────────────────────────
//
// import { serve } from "@hono/node-server";
// serve({ fetch: app.fetch, port: 3000 }, () => console.log("http://localhost:3000"));
//
// ── Bun ────────────────────────────────────────────────────────────────────────
//
// export default { port: 3000, fetch: app.fetch };
//
// ── Cloudflare Workers ────────────────────────────────────────────────────────
//
// export default app; // app.fetch is auto-detected
