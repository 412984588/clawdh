/**
 * Prisma Relations
 * Demonstrates: one-to-many, many-to-many, nested create, include, select
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── One-to-many: User → Posts ─────────────────────────────────────────────────

export async function createUserWithPosts(data: {
  email: string;
  name: string;
  posts: Array<{ title: string; body: string }>;
}) {
  // Nested create — user + posts in one query
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      posts: {
        create: data.posts,
      },
    },
    include: { posts: true },
  });
  console.log(`[Create] User ${user.email} with ${user.posts.length} posts`);
  return user;
}

export async function getUserWithPosts(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function addPostToUser(userId: number, post: { title: string; body: string }) {
  return prisma.post.create({
    data: {
      ...post,
      authorId: userId,
    },
  });
}

// ── Many-to-many: Posts ↔ Tags ────────────────────────────────────────────────

export async function createPostWithTags(data: {
  title: string;
  body: string;
  authorId: number;
  tagNames: string[];
}) {
  return prisma.post.create({
    data: {
      title: data.title,
      body: data.body,
      authorId: data.authorId,
      tags: {
        connectOrCreate: data.tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true, author: true },
  });
}

export async function getPostsByTag(tagName: string) {
  return prisma.post.findMany({
    where: {
      tags: {
        some: { name: tagName },
      },
    },
    include: { author: true, tags: true },
  });
}

// ── Select (partial returns — avoid over-fetching) ────────────────────────────

export async function getUserSummaries() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Nested update ─────────────────────────────────────────────────────────────

export async function disconnectTagFromPost(postId: number, tagId: number) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      tags: {
        disconnect: { id: tagId },
      },
    },
  });
}

export async function addTagsToPost(postId: number, tagNames: string[]) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      tags: {
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  });
}

// ── Nested delete (cascade) ───────────────────────────────────────────────────

export async function deleteUserAndPosts(userId: number) {
  // In schema: Post has onDelete: Cascade on authorId relation
  // Or handle manually:
  await prisma.$transaction([
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
  console.log(`[Delete] User ${userId} and all their posts removed`);
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  // Prisma schema (reference):
  // model User {
  //   id    Int    @id @default(autoincrement())
  //   email String @unique
  //   name  String
  //   posts Post[]
  //   createdAt DateTime @default(now())
  // }
  // model Post {
  //   id        Int      @id @default(autoincrement())
  //   title     String
  //   body      String
  //   author    User     @relation(fields: [authorId], references: [id])
  //   authorId  Int
  //   tags      Tag[]
  //   createdAt DateTime @default(now())
  // }
  // model Tag {
  //   id    Int    @id @default(autoincrement())
  //   name  String @unique
  //   posts Post[]
  // }

  const alice = await createUserWithPosts({
    email: "alice@example.com",
    name: "Alice",
    posts: [
      { title: "Hello World", body: "My first post." },
      { title: "Prisma is great", body: "I love ORMs." },
    ],
  });

  const tagged = await createPostWithTags({
    title: "Tagged Post",
    body: "This post has tags.",
    authorId: alice.id,
    tagNames: ["typescript", "prisma", "orm"],
  });
  console.log(`[Tagged] Post tags: ${tagged.tags.map((t) => t.name).join(", ")}`);

  const byTag = await getPostsByTag("prisma");
  console.log(`[ByTag] Posts with 'prisma': ${byTag.length}`);

  const summaries = await getUserSummaries();
  console.log(`[Summaries] Users: ${JSON.stringify(summaries.map((u) => ({ name: u.name, posts: u._count.posts })))}`);

  await prisma.$disconnect();
}

main().catch(console.error);
