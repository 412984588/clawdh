/**
 * Hono.js — RPC Client (Type-Safe Client)
 * Hono RPC — end-to-end type safety without tRPC
 */
import { Hono } from "hono";
import { hc } from "hono/client";
import type { InferResponseType, InferRequestType } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// ── 1. Typed route definitions ────────────────────────────────────────────────

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  tags: z.array(z.string()).max(10).default([]),
  published: z.boolean().default(false),
});

const UpdatePostSchema = CreatePostSchema.partial();

interface Post {
  id: string;
  title: string;
  body: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const posts: Post[] = [
  {
    id: "1",
    title: "Hello Hono",
    body: "Hono is a fast web framework",
    tags: ["hono", "typescript"],
    published: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

// ── 2. Hono app with typed routes ─────────────────────────────────────────────

const app = new Hono()
  .get("/posts", (c) =>
    c.json(posts)
  )
  .get("/posts/:id", (c) => {
    const post = posts.find((p) => p.id === c.req.param("id"));
    if (!post) return c.json({ error: "Not found" }, 404);
    return c.json(post);
  })
  .post(
    "/posts",
    zValidator("json", CreatePostSchema),
    (c) => {
      const body = c.req.valid("json");
      const post: Post = {
        id: String(posts.length + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...body,
        tags: body.tags ?? [],
        published: body.published ?? false,
      };
      posts.push(post);
      return c.json(post, 201);
    }
  )
  .put(
    "/posts/:id",
    zValidator("json", UpdatePostSchema),
    (c) => {
      const idx = posts.findIndex((p) => p.id === c.req.param("id"));
      if (idx === -1) return c.json({ error: "Not found" }, 404);
      const body = c.req.valid("json");
      posts[idx] = { ...posts[idx], ...body, updatedAt: new Date().toISOString() };
      return c.json(posts[idx]);
    }
  )
  .delete("/posts/:id", (c) => {
    const idx = posts.findIndex((p) => p.id === c.req.param("id"));
    if (idx === -1) return c.json({ error: "Not found" }, 404);
    posts.splice(idx, 1);
    return c.json({ deleted: true });
  });

// ── 3. Export router type ─────────────────────────────────────────────────────

export type AppType = typeof app;
export default app;

// ── 4. Client usage (browser / another server) ────────────────────────────────
//
// import { hc } from "hono/client";
// import type { AppType } from "./app";
//
// const client = hc<AppType>("https://api.example.com");
//
// // Fully type-safe — TypeScript knows the request/response shapes
// const res = await client.posts.$get();
// const posts = await res.json();
// //    ^ Post[] — inferred automatically
//
// const created = await client.posts.$post({
//   json: { title: "My Post", body: "Content here", tags: ["hono"] },
// });
// const post = await created.json();
// //    ^ Post — inferred
//
// const deleted = await client.posts[":id"].$delete({
//   param: { id: "1" },
// });

// ── 5. Type inference helpers ─────────────────────────────────────────────────
//
// Infer types for reuse in other files:
//
// type PostListResponse = InferResponseType<typeof client.posts.$get>;
// // → Post[]
//
// type CreatePostRequest = InferRequestType<typeof client.posts.$post>["json"];
// // → { title: string; body: string; tags?: string[]; published?: boolean }

// ── 6. Chaining sub-apps for larger projects ──────────────────────────────────
//
// const users = new Hono().get("/users", (c) => c.json([]));
// const postsApp = new Hono().get("/posts", (c) => c.json([]));
//
// const rootApp = new Hono()
//   .route("/api", users)
//   .route("/api", postsApp);
//
// export type RootApp = typeof rootApp;
// const client = hc<RootApp>("https://api.example.com");
// const users = await client.api.users.$get();
