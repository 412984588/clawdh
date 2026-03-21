/**
 * tRPC v11 — Next.js App Router Integration
 * App Router, server components, React Server Component queries, createTRPCNext
 */
import { initTRPC } from "@trpc/server";
import { z } from "zod";

// ── 1. Server-side tRPC setup (src/server/trpc.ts) ────────────────────────────

export interface Context {
  session: { userId: string; role: string } | null;
  headers: Record<string, string | string[] | undefined>;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    // In Next.js: redirect("/login") or throw UNAUTHORIZED
    throw new Error("UNAUTHORIZED");
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

// ── 2. App router definition ──────────────────────────────────────────────────

const posts = [
  { id: "1", title: "Getting Started with tRPC", slug: "getting-started", views: 0 },
  { id: "2", title: "Advanced Patterns", slug: "advanced", views: 0 },
];

export const appRouter = router({
  posts: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
      .query(({ input }) => posts.slice(0, input.limit)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => posts.find((p) => p.slug === input.slug) ?? null),

    create: protectedProcedure
      .input(z.object({ title: z.string().min(1), slug: z.string() }))
      .mutation(({ input }) => {
        const post = { id: Math.random().toString(36).slice(2), views: 0, ...input };
        posts.push(post);
        return post;
      }),
  }),

  health: publicProcedure.query(() => ({ ok: true })),
});

export type AppRouter = typeof appRouter;

// ── 3. Next.js route handler (app/api/trpc/[trpc]/route.ts) ──────────────────
//
// import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
// import { appRouter } from "@/server/trpc";
// import { cookies, headers } from "next/headers";
// import { auth } from "@/lib/auth";
//
// async function createContext() {
//   const session = await auth(); // your auth adapter
//   return { session, headers: Object.fromEntries(headers().entries()) };
// }
//
// const handler = (req: Request) =>
//   fetchRequestHandler({
//     endpoint: "/api/trpc",
//     req,
//     router: appRouter,
//     createContext,
//     onError: ({ error, path }) => {
//       if (error.code === "INTERNAL_SERVER_ERROR") {
//         console.error(`[tRPC] ${path}:`, error);
//       }
//     },
//   });
//
// export { handler as GET, handler as POST };

// ── 4. tRPC client (src/trpc/client.ts) ──────────────────────────────────────
//
// "use client";
// import { createTRPCReact } from "@trpc/react-query";
// import type { AppRouter } from "@/server/trpc";
//
// export const trpc = createTRPCReact<AppRouter>();

// ── 5. Provider (src/trpc/provider.tsx) ──────────────────────────────────────
//
// "use client";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { httpBatchLink } from "@trpc/client";
// import { useState } from "react";
// import { trpc } from "./client";
//
// export function TRPCProvider({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(() => new QueryClient());
//   const [trpcClient] = useState(() =>
//     trpc.createClient({
//       links: [httpBatchLink({ url: "/api/trpc", headers: () => ({ "x-trpc-source": "client" }) })],
//     })
//   );
//   return (
//     <trpc.Provider client={trpcClient} queryClient={queryClient}>
//       <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//     </trpc.Provider>
//   );
// }

// ── 6. Server Component query (app/posts/page.tsx) ────────────────────────────
//
// import { createCaller } from "@/server/trpc";
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
//
// export default async function PostsPage() {
//   // Direct server-side call — NO HTTP round trip
//   const session = await auth();
//   const caller = createCaller({ session, headers: Object.fromEntries(headers().entries()) });
//   const posts = await caller.posts.list({ limit: 20 });
//
//   return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
// }

// ── 7. Client Component with tRPC React Query hooks (app/posts/client.tsx) ────
//
// "use client";
// import { trpc } from "@/trpc/client";
//
// export function PostList() {
//   const { data, isLoading } = trpc.posts.list.useQuery({ limit: 10 });
//   const createPost = trpc.posts.create.useMutation({
//     onSuccess: () => utils.posts.list.invalidate(),
//   });
//   const utils = trpc.useUtils();
//
//   if (isLoading) return <div>Loading...</div>;
//   return (
//     <div>
//       {data?.map((post) => <div key={post.id}>{post.title}</div>)}
//       <button onClick={() => createPost.mutate({ title: "New Post", slug: "new" })}>
//         Add Post
//       </button>
//     </div>
//   );
// }

// ── 8. Prefetching for SSR (app/posts/page.tsx with prefetch) ─────────────────
//
// import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
// import { trpc } from "@/trpc/server"; // server-side trpc client
//
// export default async function PostsPage() {
//   const queryClient = new QueryClient();
//   await queryClient.prefetchQuery(trpc.posts.list.queryOptions({ limit: 10 }));
//
//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <PostList />
//     </HydrationBoundary>
//   );
// }

// Standalone export for the caller
export const createCaller = t.createCallerFactory(appRouter);
