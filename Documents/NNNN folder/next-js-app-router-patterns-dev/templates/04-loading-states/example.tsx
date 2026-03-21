// Next.js App Router: Loading States
// loading.tsx, Suspense boundaries, and skeleton patterns

import { Suspense } from "react";

// ─── Pattern 1: loading.tsx (automatic Suspense wrapper) ─────────────────────
// File: app/dashboard/loading.tsx
// This wraps the page in a Suspense boundary automatically

export function Loading() {
  // Named "Loading" but file is loading.tsx
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <DashboardSkeleton />
    </div>
  );
}

// ─── Pattern 2: Skeleton components ──────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
      <div className="mt-4 h-20 rounded bg-gray-200" />
    </div>
  );
}

function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border p-4">
            <div className="h-3 w-1/2 rounded bg-gray-200" />
            <div className="mt-2 h-8 w-1/3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      {/* Content */}
      <SkeletonList count={5} />
    </div>
  );
}

// ─── Pattern 3: Granular Suspense boundaries ──────────────────────────────────

// Slow server components that each stream independently
async function SlowUserStats({ userId }: { userId: string }) {
  // Simulate slow data
  await new Promise((r) => setTimeout(r, 1000));
  return <div>Stats for {userId}</div>;
}

async function SlowActivityFeed({ userId }: { userId: string }) {
  await new Promise((r) => setTimeout(r, 1500));
  return <div>Activity for {userId}</div>;
}

// Main page — shows skeleton immediately, streams in each section
export default function DashboardPage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  return (
    <div className="space-y-6">
      {/* Instant: static header */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Streams in when stats load (~1s) */}
      <Suspense
        fallback={
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        }
      >
        <SlowUserStats userId={userId} />
      </Suspense>

      {/* Streams in when activity loads (~1.5s) — doesn't block stats */}
      <Suspense fallback={<SkeletonList count={5} />}>
        <SlowActivityFeed userId={userId} />
      </Suspense>
    </div>
  );
}

// ─── Pattern 4: useTransition for client-side loading ────────────────────────

// In a client component:
// 'use client'
// import { useTransition } from 'react'
//
// function SearchButton() {
//   const [isPending, startTransition] = useTransition()
//
//   return (
//     <button
//       onClick={() => startTransition(() => router.push('/search?q=...'))}
//       disabled={isPending}
//     >
//       {isPending ? <Spinner /> : 'Search'}
//     </button>
//   )
// }
