import { QueryClient } from "@tanstack/react-query";

// ── Centralised query key factory ─────────────────────────────────────────
export const keys = {
  users: {
    all: () => ["users"] as const,
    lists: () => ["users", "list"] as const,
    list: (filters: object) => ["users", "list", filters] as const,
    details: () => ["users", "detail"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  posts: {
    all: () => ["posts"] as const,
    byUser: (userId: string) => ["posts", "by-user", userId] as const,
    detail: (id: string) => ["posts", id] as const,
  },
};

export function invalidationExamples(queryClient: QueryClient, userId: string, postId: string) {
  // 1. Invalidate everything under "users" (all lists and details)
  queryClient.invalidateQueries({ queryKey: keys.users.all() });

  // 2. Invalidate only user lists (not details)
  queryClient.invalidateQueries({ queryKey: keys.users.lists() });

  // 3. Invalidate a specific user detail
  queryClient.invalidateQueries({ queryKey: keys.users.detail(userId) });

  // 4. Exact match invalidation (does NOT invalidate children)
  queryClient.invalidateQueries({ queryKey: ["posts", postId], exact: true });

  // 5. Remove from cache entirely (no background refetch)
  queryClient.removeQueries({ queryKey: keys.users.detail(userId) });

  // 6. Manually set cache data (skip refetch)
  queryClient.setQueryData(keys.users.detail(userId), (old: unknown) => ({
    ...(old as object),
    name: "Updated Name",
  }));

  // 7. Cross-entity invalidation after a mutation
  // e.g., after deleting a post: invalidate both post cache and user's post count
  queryClient.invalidateQueries({ queryKey: keys.posts.detail(postId) });
  queryClient.invalidateQueries({ queryKey: keys.posts.byUser(userId) });
  queryClient.invalidateQueries({ queryKey: keys.users.detail(userId) }); // user post count
}

// ── Cache time configuration ──────────────────────────────────────────────
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min: data is fresh, no background refetch
      gcTime: 10 * 60 * 1000,      // 10 min: how long unused cache stays in memory
      retry: 2,                    // retry failed queries twice
      refetchOnWindowFocus: true,  // refetch when user returns to tab
    },
  },
};
