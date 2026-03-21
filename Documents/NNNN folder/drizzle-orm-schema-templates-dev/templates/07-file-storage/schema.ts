import { pgTable, text, timestamp, boolean, uuid, integer, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  parentId: uuid("parent_id"), // self-referential for nesting
  ownerId: uuid("owner_id").notNull(),
  path: text("path").notNull(), // materialized path: "/root/docs/images"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  folderId: uuid("folder_id").references(() => folders.id, { onDelete: "set null" }),
  ownerId: uuid("owner_id").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  storageKey: text("storage_key").notNull().unique(), // S3/R2 object key
  storageProvider: text("storage_provider").notNull().default("s3"), // s3 | r2 | gcs
  checksum: text("checksum"), // SHA-256 for dedup
  deleted: boolean("deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const fileVersions = pgTable("file_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileId: uuid("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  storageKey: text("storage_key").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  checksum: text("checksum"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fileShares = pgTable("file_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileId: uuid("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
  sharedByUserId: uuid("shared_by_user_id").notNull(),
  sharedWithUserId: uuid("shared_with_user_id"), // null = public link
  token: text("token").unique(), // for public link access
  permission: text("permission").notNull().default("view"), // view | edit
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const filesRelations = relations(files, ({ one, many }) => ({
  folder: one(folders, { fields: [files.folderId], references: [folders.id] }),
  versions: many(fileVersions),
  shares: many(fileShares),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
  files: many(files),
}));
