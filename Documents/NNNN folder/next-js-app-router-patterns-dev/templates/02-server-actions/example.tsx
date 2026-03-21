"use server"; // This file's exports are all Server Actions

// Next.js App Router: Server Actions
// Server Actions run on the server, called from client or server components

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Pattern 1: Form action (progressive enhancement) ────────────────────────

// Use with <form action={createPost}> — works without JS
export async function createPost(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Validate
  if (!title?.trim()) throw new Error("Title is required");
  if (!content?.trim()) throw new Error("Content is required");

  // Save to database
  // await db.post.create({ data: { title, content, authorId: session.user.id } })
  console.log("Creating post:", { title, content });

  // Invalidate cached data
  revalidatePath("/posts");
  revalidateTag("posts");

  // Redirect after successful creation
  redirect("/posts");
}

// ─── Pattern 2: Action with return value (for useActionState) ────────────────

export async function updateProfile(
  prevState: ActionResult<{ name: string }>,
  formData: FormData
): Promise<ActionResult<{ name: string }>> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name?.trim()) {
    return { success: false, error: "Name is required" };
  }

  try {
    // await db.user.update({ where: { id: session.user.id }, data: { name, email } })
    console.log("Updating profile:", { name, email });

    revalidatePath("/profile");
    return { success: true, data: { name } };
  } catch {
    return { success: false, error: "Failed to update profile" };
  }
}

// ─── Pattern 3: Programmatic call with optimistic update ─────────────────────

// Called directly: await toggleLike(postId)
export async function toggleLike(postId: string): Promise<ActionResult<{ liked: boolean }>> {
  try {
    // const existing = await db.like.findUnique({ where: { userId_postId: { userId, postId } } })
    // if (existing) {
    //   await db.like.delete({ where: { id: existing.id } })
    //   return { success: true, data: { liked: false } }
    // }
    // await db.like.create({ data: { userId, postId } })

    revalidateTag(`post-${postId}`);
    return { success: true, data: { liked: true } };
  } catch {
    return { success: false, error: "Failed to toggle like" };
  }
}

// ─── Pattern 4: Delete with confirmation ─────────────────────────────────────

export async function deletePost(postId: string): Promise<ActionResult> {
  // Verify ownership before deleting
  // const post = await db.post.findUnique({ where: { id: postId } })
  // if (!post || post.authorId !== session.user.id) {
  //   return { success: false, error: 'Unauthorized' }
  // }

  // await db.post.delete({ where: { id: postId } })
  console.log("Deleting post:", postId);

  revalidatePath("/posts");
  return { success: true };
}

// ─── Client component that uses server actions ────────────────────────────────

// In components/CreatePostForm.tsx:
// 'use client'
// import { useActionState } from 'react'
// import { updateProfile } from './actions'  // ← import the server action
//
// export function ProfileForm() {
//   const [state, action, isPending] = useActionState(updateProfile, { success: false })
//
//   return (
//     <form action={action}>
//       <input name="name" />
//       <button type="submit" disabled={isPending}>
//         {isPending ? 'Saving...' : 'Save'}
//       </button>
//       {state.error && <p>{state.error}</p>}
//       {state.success && <p>Saved!</p>}
//     </form>
//   )
// }

export {};
