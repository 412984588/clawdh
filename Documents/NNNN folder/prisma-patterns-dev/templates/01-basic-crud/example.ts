/**
 * Prisma Basic CRUD
 * Demonstrates: PrismaClient, create, findUnique, findMany, update, delete, upsert
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Create ────────────────────────────────────────────────────────────────────

export async function createUser(data: {
  email: string;
  name: string;
  role?: string;
}) {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role ?? "USER",
    },
  });
  console.log(`[Create] User ${user.id}: ${user.email}`);
  return user;
}

// ── Read — single record ───────────────────────────────────────────────────────

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    console.log(`[Read] User ${id} not found`);
    return null;
  }
  console.log(`[Read] Found: ${user.email}`);
  return user;
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

// ── Read — multiple records ────────────────────────────────────────────────────

export async function getAllUsers() {
  const users = await prisma.user.findMany();
  console.log(`[Read] Total users: ${users.length}`);
  return users;
}

export async function getActiveUsers() {
  return prisma.user.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateUserName(id: number, name: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { name, updatedAt: new Date() },
  });
  console.log(`[Update] User ${id} → name: ${user.name}`);
  return user;
}

export async function deactivateUser(id: number) {
  return prisma.user.update({
    where: { id },
    data: { active: false },
  });
}

// ── Upsert ────────────────────────────────────────────────────────────────────
// Create if not exists, update if exists

export async function upsertUser(email: string, name: string) {
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name, role: "USER" },
    update: { name, updatedAt: new Date() },
  });
  console.log(`[Upsert] User ${user.id}: ${user.email}`);
  return user;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteUser(id: number) {
  const user = await prisma.user.delete({ where: { id } });
  console.log(`[Delete] Removed user ${user.id}`);
  return user;
}

export async function deleteAllInactiveUsers() {
  const result = await prisma.user.deleteMany({
    where: { active: false },
  });
  console.log(`[DeleteMany] Removed ${result.count} inactive users`);
  return result.count;
}

// ── Count ─────────────────────────────────────────────────────────────────────

export async function countUsers(filter?: { active?: boolean }) {
  const count = await prisma.user.count({
    where: filter,
  });
  console.log(`[Count] Users: ${count}`);
  return count;
}

// ── Aggregate ─────────────────────────────────────────────────────────────────

export async function userStats() {
  const stats = await prisma.user.aggregate({
    _count: { id: true },
    _min: { createdAt: true },
    _max: { createdAt: true },
  });
  return stats;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  // Prisma schema (reference — not executed here):
  // model User {
  //   id        Int      @id @default(autoincrement())
  //   email     String   @unique
  //   name      String
  //   role      String   @default("USER")
  //   active    Boolean  @default(true)
  //   createdAt DateTime @default(now())
  //   updatedAt DateTime @updatedAt
  // }

  const alice = await createUser({ email: "alice@example.com", name: "Alice" });
  await createUser({ email: "bob@example.com", name: "Bob" });

  await getUserById(alice.id);
  await getAllUsers();

  await updateUserName(alice.id, "Alice Smith");
  await upsertUser("carol@example.com", "Carol");
  await upsertUser("carol@example.com", "Carol Updated");

  await deactivateUser(alice.id);
  await deleteAllInactiveUsers();

  const count = await countUsers();
  console.log(`[Done] Remaining users: ${count}`);

  await prisma.$disconnect();
}

main().catch(console.error);
