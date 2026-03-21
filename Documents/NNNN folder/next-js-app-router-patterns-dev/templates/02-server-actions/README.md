# 02 — Server Actions

Form actions, `useActionState`, revalidation, and programmatic calls.

## Patterns

- `"use server"` at file top — all exports are server actions
- `formData.get()` — form action with progressive enhancement (works without JS)
- `revalidatePath` / `revalidateTag` — invalidate cached data after mutation
- `redirect()` — server-side redirect after success
- Return `{ success, error }` for `useActionState` error display
- Direct call `await toggleLike(postId)` from client components
