import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Post { id: string; title: string; createdAt: string; }

export async function fetchPosts(page: number, pageSize = 10): Promise<PaginatedResponse<Post>> {
  const res = await fetch(`/api/posts?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export const postKeys = {
  list: (page: number, pageSize: number) => ["posts", "list", { page, pageSize }] as const,
};

export function usePosts(page: number, pageSize = 10) {
  return useQuery({
    queryKey: postKeys.list(page, pageSize),
    queryFn: () => fetchPosts(page, pageSize),
    placeholderData: keepPreviousData, // prevents flicker during page transitions
    staleTime: 30 * 1000,
  });
}

export function PostList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isPlaceholderData } = usePosts(page);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
            {data?.data.map((post) => <li key={post.id}>{post.title}</li>)}
          </ul>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page} of {data?.totalPages ?? "?"}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={isPlaceholderData || page === data?.totalPages}
            >
              Next {isFetching ? "..." : ""}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
