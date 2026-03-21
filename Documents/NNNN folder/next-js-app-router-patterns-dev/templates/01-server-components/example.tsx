// Next.js App Router: Server Components
// Server Components run on the server — no client JS, direct DB/API access

import { Suspense } from "react";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  authorId: string;
}

// ─── Pattern 1: Async Server Component with data fetching ─────────────────────

// Server Components can be async — await directly, no useEffect
async function getUserById(id: string): Promise<User | null> {
  // In production: await db.user.findUnique({ where: { id } })
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    next: { revalidate: 60 }, // Cache for 60 seconds (ISR)
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { id: String(data.id), name: data.name, email: data.email };
}

async function UserProfile({ userId }: { userId: string }) {
  const user = await getUserById(userId);

  // notFound() renders the nearest not-found.tsx
  if (!user) notFound();

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// ─── Pattern 2: Parallel data fetching (no waterfall) ────────────────────────

async function getUserPosts(userId: string): Promise<Post[]> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
  const data = await res.json();
  return data.slice(0, 5).map((p: { id: number; title: string; body: string; userId: number }) => ({
    id: String(p.id),
    title: p.title,
    excerpt: p.body.slice(0, 100),
    authorId: String(p.userId),
  }));
}

// Fetch both in parallel — avoid sequential awaits (waterfall)
async function UserDashboard({ userId }: { userId: string }) {
  // Start both fetches simultaneously
  const [user, posts] = await Promise.all([getUserById(userId), getUserPosts(userId)]);

  if (!user) notFound();

  return (
    <div>
      <section>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </section>
      <section>
        <h2>Posts ({posts.length})</h2>
        {posts.map((post) => (
          <article key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

// ─── Pattern 3: Server + Client Component boundary ───────────────────────────

// This marker tells Next.js this file stays on the server
// Child components can still be client components

// Client component (in a separate file: components/LikeButton.tsx)
// 'use client'
// export function LikeButton({ postId }: { postId: string }) {
//   const [liked, setLiked] = useState(false)
//   return <button onClick={() => setLiked(t => !t)}>{liked ? '♥' : '♡'}</button>
// }

// Server component passes data to client component
// async function PostCard({ postId }: { postId: string }) {
//   const post = await getPost(postId)  // ← runs on server
//   return (
//     <div>
//       <h2>{post.title}</h2>
//       <LikeButton postId={postId} />  ← client island
//     </div>
//   )
// }

// ─── Pattern 4: Streaming with Suspense ──────────────────────────────────────

// Wrap slow components in Suspense — page renders, slow parts stream in
export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main>
      {/* Fast: render immediately */}
      <h1>Dashboard</h1>

      {/* Slow: stream in after data loads */}
      <Suspense fallback={<div>Loading user...</div>}>
        <UserProfile userId={id} />
      </Suspense>

      {/* Independent slow component — doesn't block UserProfile */}
      <Suspense fallback={<div>Loading activity...</div>}>
        <UserDashboard userId={id} />
      </Suspense>
    </main>
  );
}
