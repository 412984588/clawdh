/**
 * tRPC v11 — Infinite Queries (Cursor Pagination)
 * useInfiniteQuery, cursor patterns, TanStack Query integration
 */
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

// ── 1. Cursor types ───────────────────────────────────────────────────────────

interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;   // null = no more pages
  prevCursor: string | null;   // null = first page (for bidirectional)
  hasMore: boolean;
  total?: number;              // optional total count for progress indicator
}

// Encode cursor as base64 JSON for opacity
function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

function decodeCursor(cursor: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
}

// ── 2. Demo datasets ──────────────────────────────────────────────────────────

interface Post {
  id: string;
  title: string;
  excerpt: string;
  authorId: string;
  createdAt: Date;
  likes: number;
  tags: string[];
}

const generatePosts = (count: number): Post[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    title: `Post ${i + 1}: ${["TypeScript Tips", "React Patterns", "tRPC Guide", "Next.js 15", "Zustand Tutorial"][i % 5]}`,
    excerpt: `This is a sample excerpt for post ${i + 1}. It contains some preview text.`,
    authorId: `user-${(i % 5) + 1}`,
    createdAt: new Date(Date.now() - i * 3_600_000), // 1 hour apart
    likes: Math.floor(Math.random() * 500),
    tags: [["typescript", "nextjs", "react", "trpc", "zustand"][i % 5]],
  }));

const ALL_POSTS = generatePosts(200);

// ── 3. Router ─────────────────────────────────────────────────────────────────

export const appRouter = t.router({
  // ── 3a. Forward-only cursor (most common pattern) ──────────────────────────
  posts: t.router({
    list: publicProcedure
      .input(
        z.object({
          cursor: z.string().optional(),       // null/undefined = first page
          limit: z.number().int().min(1).max(50).default(20),
          orderBy: z.enum(["createdAt", "likes"]).default("createdAt"),
          tag: z.string().optional(),
        })
      )
      .output(
        z.object({
          items: z.array(z.object({
            id: z.string(),
            title: z.string(),
            excerpt: z.string(),
            authorId: z.string(),
            createdAt: z.date(),
            likes: z.number(),
            tags: z.array(z.string()),
          })),
          nextCursor: z.string().nullable(),
          hasMore: z.boolean(),
          total: z.number().optional(),
        })
      )
      .query(({ input }) => {
        let posts = input.tag
          ? ALL_POSTS.filter((p) => p.tags.includes(input.tag!))
          : [...ALL_POSTS];

        // Sort
        posts.sort((a, b) =>
          input.orderBy === "likes"
            ? b.likes - a.likes
            : b.createdAt.getTime() - a.createdAt.getTime()
        );

        // Decode cursor to find start index
        let startIdx = 0;
        if (input.cursor) {
          const { id } = decodeCursor(input.cursor) as { id: string };
          const idx = posts.findIndex((p) => p.id === id);
          startIdx = idx >= 0 ? idx + 1 : 0;
        }

        const page = posts.slice(startIdx, startIdx + input.limit);
        const lastItem = page[page.length - 1];
        const nextCursor =
          page.length === input.limit && lastItem
            ? encodeCursor({ id: lastItem.id, createdAt: lastItem.createdAt.toISOString() })
            : null;

        return {
          items: page,
          nextCursor,
          hasMore: nextCursor !== null,
          total: posts.length,
        };
      }),

    // ── 3b. Bidirectional cursor (for "load older" + "load newer") ────────
    listBidirectional: publicProcedure
      .input(
        z.object({
          cursor: z.string().optional(),
          limit: z.number().int().min(1).max(50).default(20),
          direction: z.enum(["forward", "backward"]).default("forward"),
        })
      )
      .query(({ input }) => {
        const sorted = [...ALL_POSTS].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        let startIdx = 0;
        if (input.cursor) {
          const { id } = decodeCursor(input.cursor) as { id: string };
          const idx = sorted.findIndex((p) => p.id === id);
          startIdx = input.direction === "forward" ? idx + 1 : Math.max(0, idx - input.limit);
        }

        const page = sorted.slice(startIdx, startIdx + input.limit);
        const first = page[0];
        const last = page[page.length - 1];

        return {
          items: input.direction === "backward" ? page.reverse() : page,
          nextCursor: page.length === input.limit && last
            ? encodeCursor({ id: last.id })
            : null,
          prevCursor: startIdx > 0 && first
            ? encodeCursor({ id: first.id })
            : null,
          hasMore: page.length === input.limit,
        } satisfies CursorPage<Post>;
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ── 4. React client with useInfiniteQuery ─────────────────────────────────────
//
// "use client";
// import { trpc } from "@/trpc/client";
//
// export function InfinitePostList() {
//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     isLoading,
//   } = trpc.posts.list.useInfiniteQuery(
//     { limit: 20, orderBy: "createdAt" },
//     {
//       getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
//       initialCursor: undefined,
//     }
//   );
//
//   const posts = data?.pages.flatMap((page) => page.items) ?? [];
//
//   return (
//     <div>
//       {posts.map((post) => (
//         <article key={post.id}>
//           <h2>{post.title}</h2>
//           <p>{post.excerpt}</p>
//         </article>
//       ))}
//       {hasNextPage && (
//         <button
//           onClick={() => fetchNextPage()}
//           disabled={isFetchingNextPage}
//         >
//           {isFetchingNextPage ? "Loading..." : "Load more"}
//         </button>
//       )}
//     </div>
//   );
// }
//
// ── 5. Intersection observer auto-load ────────────────────────────────────────
//
// const sentinelRef = useRef<HTMLDivElement>(null);
// useEffect(() => {
//   const obs = new IntersectionObserver(([entry]) => {
//     if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
//   });
//   if (sentinelRef.current) obs.observe(sentinelRef.current);
//   return () => obs.disconnect();
// }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
//
// return <div ref={sentinelRef} style={{ height: 1 }} />;
