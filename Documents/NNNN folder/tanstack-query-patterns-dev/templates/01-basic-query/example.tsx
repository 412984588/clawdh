import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ── Query key factory (type-safe, centralised) ────────────────────────────
export const userKeys = {
  all: ["users"] as const,
  detail: (id: string) => ["users", id] as const,
};

// ── Fetcher function ──────────────────────────────────────────────────────
export async function fetchUser(id: string): Promise<{ id: string; name: string; email: string }> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.statusText}`);
  return res.json();
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// ── Component ─────────────────────────────────────────────────────────────
export function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, isError, error } = useUser(userId);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.email}</p>
    </div>
  );
}

// ── App wrapper ───────────────────────────────────────────────────────────
const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProfile userId="user-1" />
    </QueryClientProvider>
  );
}
