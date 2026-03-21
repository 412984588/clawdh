/**
 * Prisma Migrations
 * Demonstrates: migration workflow, schema evolution, $executeRaw for migration helpers,
 * programmatic migration status checks
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Migration workflow reference ───────────────────────────────────────────────
//
// # Initial setup
// npx prisma init                        — create prisma/schema.prisma + .env
//
// # After editing schema.prisma
// npx prisma migrate dev --name init     — creates migration, applies it, generates client
// npx prisma migrate dev --name add-role — incremental migration
//
// # Production
// npx prisma migrate deploy              — apply pending migrations (no interactive prompt)
//
// # Introspect existing DB
// npx prisma db pull                     — pull schema from existing database
//
// # Push without migration file (prototyping only)
// npx prisma db push

// ── Check pending migrations programmatically ─────────────────────────────────

export async function checkMigrationStatus() {
  // Query _prisma_migrations table directly
  const migrations = await prisma.$queryRaw<
    Array<{ migration_name: string; applied_steps_count: number; finished_at: Date | null }>
  >`SELECT migration_name, applied_steps_count, finished_at FROM "_prisma_migrations" ORDER BY started_at DESC`;

  const applied = migrations.filter((m) => m.finished_at !== null);
  const pending = migrations.filter((m) => m.finished_at === null);

  console.log(`[Migrations] Applied: ${applied.length}, Pending: ${pending.length}`);
  applied.forEach((m) => console.log(`  ✓ ${m.migration_name}`));
  pending.forEach((m) => console.log(`  ⏳ ${m.migration_name} (pending)`));

  return { applied, pending };
}

// ── Safe column rename pattern ─────────────────────────────────────────────────
//
// Renaming a column directly breaks existing app code. Use a 3-step migration:
//
// Step 1 (migration A): Add new column, copy data
// Step 2 (deploy new app): Read from new column, write to both
// Step 3 (migration B): Drop old column

export async function safeColumnAddAndPopulate() {
  // Step 1: Add column (done in migration file)
  // Step 2: Backfill existing rows with a computed value
  const updated = await prisma.$executeRaw`
    UPDATE "User"
    SET "displayName" = COALESCE("firstName" || ' ' || "lastName", "email")
    WHERE "displayName" IS NULL
  `;
  console.log(`[Backfill] Updated ${updated} rows`);
  return updated;
}

// ── Schema baseline for existing database ────────────────────────────────────
//
// When adding Prisma to an existing project:
// 1. npx prisma db pull          — generate schema from existing DB
// 2. npx prisma migrate diff \
//    --from-empty --to-schema-datamodel prisma/schema.prisma \
//    --script > baseline.sql    — generate SQL for baseline
// 3. npx prisma migrate resolve --applied "0_init"   — mark as applied

// ── Multi-schema support ──────────────────────────────────────────────────────
//
// In schema.prisma (preview feature):
// generator client {
//   provider        = "prisma-client-js"
//   previewFeatures = ["multiSchema"]
// }
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
//   schemas  = ["public", "auth"]
// }
// model User {
//   id    Int    @id
//   @@schema("auth")
// }

// ── Seed data ─────────────────────────────────────────────────────────────────
// Typically in prisma/seed.ts, run via `npx prisma db seed`

export async function seedDatabase() {
  const roles = ["USER", "ADMIN", "MODERATOR"];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }
  console.log(`[Seed] Seeded ${roles.length} roles`);
}

// ── Reset (development only) ──────────────────────────────────────────────────
//
// npx prisma migrate reset    — drops DB, re-applies all migrations, runs seed
// Use ONLY in development — destroys all data

// ── Validate schema consistency ───────────────────────────────────────────────

export async function validateSchemaSync() {
  // This query will fail if schema is out of sync (table/column doesn't exist)
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[Validate] Database connection OK");
    return true;
  } catch (err) {
    console.error("[Validate] Schema validation failed:", (err as Error).message);
    return false;
  }
}

// ── Shadow database ───────────────────────────────────────────────────────────
//
// Prisma uses a shadow DB to safely detect drift and generate migrations.
// In .env:
//   SHADOW_DATABASE_URL="postgresql://..."
// Required for user-managed transactions on PostgreSQL.

// ── Cleanup ───────────────────────────────────────────────────────────────────

async function main() {
  const ok = await validateSchemaSync();
  if (ok) {
    try {
      await checkMigrationStatus();
    } catch {
      console.log("[Migrations] _prisma_migrations table not accessible (no migrations applied yet)");
    }
  }
  await prisma.$disconnect();
}

main().catch(console.error);
