import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export interface Post { id: string; title: string; cursor: string; }
export interface PostsPage { items: Post[]; nextCursor: string | null; }

export async function fetchPostsPage({ pageParam }: { pageParam: string | null }): Promise<PostsPage> {
  const url = pageParam ? `/api/posts?cursor=${pageParam}` : "/api/posts";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts", "infinite"],
    queryFn: fetchPostsPage,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 60 * 1000,
  });
}

export function InfinitePostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfinitePosts();
  const loaderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer — auto-load on scroll to bottom
  useEffect(() => {
    const el = loaderRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchNextPage(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) return <div>Loading...</div>;

  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div>
      <ul>
        {allPosts.map((post) => <li key={post.id}>{post.title}</li>)}
      </ul>
      <div ref={loaderRef} style={{ height: "20px" }}>
        {isFetchingNextPage ? "Loading more..." : !hasNextPage ? "No more posts" : ""}
      </div>
    </div>
  );
}
