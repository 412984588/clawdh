import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export interface CreatePostInput { title: string; content: string; }
export interface Post { id: string; title: string; content: string; createdAt: string; }

export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete post");
}

// Create mutation with cache invalidation
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate the posts list so it refetches fresh data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: Error) => {
      console.error("Create post failed:", error.message);
    },
  });
}

// Delete mutation with cache invalidation
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.removeQueries({ queryKey: ["posts", deletedId] });
    },
  });
}

// Example component using both mutations
export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { mutate: createPost, isPending, isError, error } = useCreatePost();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createPost({ title, content }, {
      onSuccess: () => { setTitle(""); setContent(""); },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Post"}
      </button>
      {isError && <p style={{ color: "red" }}>{(error as Error).message}</p>}
    </form>
  );
}
