/**
 * tRPC v11 — Batch Requests & Link Configuration
 * httpBatchLink, splitLink, deduplication, custom headers
 */
import { initTRPC } from "@trpc/server";
import { z } from "zod";

// ── Server side ───────────────────────────────────────────────────────────────

const t = initTRPC.create();
const publicProcedure = t.procedure;

// Simulated latency for demo
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Demo data
const products = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  name: `Product ${i + 1}`,
  price: Math.round(Math.random() * 10000) / 100,
  stock: Math.floor(Math.random() * 100),
  categoryId: String(Math.floor(i / 10) + 1),
}));

const categories = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1),
  name: `Category ${i + 1}`,
  slug: `category-${i + 1}`,
}));

export const appRouter = t.router({
  // Multiple procedures clients batch into a single HTTP request
  products: t.router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(10),
        offset: z.number().int().min(0).default(0),
      }))
      .query(async ({ input }) => {
        await delay(10); // simulate DB query
        const filtered = input.categoryId
          ? products.filter((p) => p.categoryId === input.categoryId)
          : products;
        return {
          items: filtered.slice(input.offset, input.offset + input.limit),
          total: filtered.length,
        };
      }),

    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        await delay(5);
        return products.find((p) => p.id === input.id) ?? null;
      }),

    byIds: publicProcedure
      .input(z.object({ ids: z.array(z.string()).min(1).max(50) }))
      .query(async ({ input }) => {
        await delay(10);
        return products.filter((p) => input.ids.includes(p.id));
      }),
  }),

  categories: t.router({
    list: publicProcedure.query(async () => {
      await delay(5);
      return categories;
    }),

    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        await delay(5);
        return categories.find((c) => c.id === input.id) ?? null;
      }),
  }),

  // Intentionally slow — useful to test httpBatchLink timeout
  slow: publicProcedure
    .input(z.object({ ms: z.number().int().min(0).max(10_000).default(2000) }))
    .query(async ({ input }) => {
      await delay(input.ms);
      return { tookMs: input.ms };
    }),
});

export type AppRouter = typeof appRouter;

// ── Client side configuration ─────────────────────────────────────────────────
//
// import { createTRPCProxyClient, httpBatchLink, splitLink, httpLink } from "@trpc/client";
// import superjson from "superjson";
//
// const trpc = createTRPCProxyClient<AppRouter>({
//   transformer: superjson, // serialize Dates, Maps, Sets automatically
//   links: [
//     // Route subscriptions to WebSocket, everything else to HTTP batch
//     splitLink({
//       condition: (op) => op.type === "subscription",
//       true: wsLink({ client: wsClient }),
//       false: httpBatchLink({
//         url: "http://localhost:3000/trpc",
//         // Customize batch max size (default: no limit)
//         maxURLLength: 2083,
//         // Add auth header to every request
//         headers: async () => ({
//           Authorization: `Bearer ${await getToken()}`,
//         }),
//         // Per-request fetch options
//         fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
//       }),
//     }),
//   ],
// });
//
// ── Batching in action ────────────────────────────────────────────────────────
//
// These 3 calls fire simultaneously and are batched into 1 HTTP request:
//
// const [productList, categories, featuredProduct] = await Promise.all([
//   trpc.products.list.query({ limit: 10 }),
//   trpc.categories.list.query(),
//   trpc.products.byId.query({ id: "1" }),
// ]);
//
// ── Deduplication ─────────────────────────────────────────────────────────────
//
// tRPC deduplicates identical queries within the same batch automatically.
// Two components calling trpc.categories.list.query() at the same time
// will result in only one HTTP request.
//
// ── Per-procedure timeout with splitLink ─────────────────────────────────────
//
// splitLink({
//   condition: (op) => op.path.startsWith("slow"),
//   true: httpLink({ url: "/trpc" }), // separate request, no batch timeout pressure
//   false: httpBatchLink({ url: "/trpc", maxURLLength: 2083 }),
// })
