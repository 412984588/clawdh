import { useQueries, useQuery } from "@tanstack/react-query";

export interface UserStats { userId: string; posts: number; followers: number; likes: number; }
export interface Post { id: string; title: string; }

async function fetchUserStats(userId: string): Promise<UserStats> {
  const res = await fetch(`/api/users/${userId}/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats for ${userId}`);
  return res.json();
}

async function fetchPost(postId: string): Promise<Post> {
  const res = await fetch(`/api/posts/${postId}`);
  if (!res.ok) throw new Error(`Failed to fetch post ${postId}`);
  return res.json();
}

// Pattern 1: Static parallel queries — fixed number known at compile time
export function useDashboardData(userId: string) {
  const statsQuery = useQuery({ queryKey: ["users", userId, "stats"], queryFn: () => fetchUserStats(userId) });
  const recentPostsQuery = useQuery({ queryKey: ["users", userId, "posts"], queryFn: () => fetch(`/api/users/${userId}/posts`).then(r => r.json()) });

  return {
    stats: statsQuery.data,
    recentPosts: recentPostsQuery.data,
    isLoading: statsQuery.isLoading || recentPostsQuery.isLoading,
  };
}

// Pattern 2: Dynamic parallel queries — variable count (useQueries)
export function useMultipleUserStats(userIds: string[]) {
  return useQueries({
    queries: userIds.map((userId) => ({
      queryKey: ["users", userId, "stats"],
      queryFn: () => fetchUserStats(userId),
      staleTime: 5 * 60 * 1000,
    })),
    // Combine results into a single object
    combine: (results) => ({
      data: results.map((r) => r.data).filter(Boolean) as UserStats[],
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
    }),
  });
}

// Pattern 3: Batch-fetch multiple posts by ID
export function usePostBatch(postIds: string[]) {
  const results = useQueries({
    queries: postIds.map((id) => ({
      queryKey: ["posts", id],
      queryFn: () => fetchPost(id),
    })),
  });

  return {
    posts: results.map((r) => r.data).filter(Boolean) as Post[],
    allLoaded: results.every((r) => !r.isLoading),
    errors: results.filter((r) => r.isError).map((r) => r.error),
  };
}

export function TeamStatsDisplay({ userIds }: { userIds: string[] }) {
  const { data, isLoading } = useMultipleUserStats(userIds);

  if (isLoading) return <div>Loading team stats...</div>;

  return (
    <ul>
      {data.map((s) => (
        <li key={s.userId}>{s.userId}: {s.posts} posts, {s.followers} followers</li>
      ))}
    </ul>
  );
}
