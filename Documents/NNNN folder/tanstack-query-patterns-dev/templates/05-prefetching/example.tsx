import { useQuery, QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

export interface User { id: string; name: string; email: string; }

export const userKeys = {
  detail: (id: string) => ["users", id] as const,
};

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Next.js App Router — Server Component prefetch ────────────────────────
// In your page.tsx (server component):
export async function generatePrefetchedState(userId: string) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUser(userId),
  });

  return dehydrate(queryClient);
}

// ── Next.js App Router Page (server component) ────────────────────────────
// export default async function UserPage({ params }: { params: { id: string } }) {
//   const dehydratedState = await generatePrefetchedState(params.id);
//   return (
//     <HydrationBoundary state={dehydratedState}>
//       <UserProfile userId={params.id} />
//     </HydrationBoundary>
//   );
// }

// ── Client Component — reads from prefetched cache ─────────────────────────
export function UserProfile({ userId }: { userId: string }) {
  // Data is already in cache from server prefetch — no loading state!
  const { data } = useUser(userId);

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.email}</p>
    </div>
  );
}

// ── Hover prefetch — prefetch on mouse enter ──────────────────────────────
export function usePrefetchUser(queryClient: QueryClient) {
  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(userId),
      queryFn: () => fetchUser(userId),
      staleTime: 5 * 60 * 1000,
    });
  };
}
