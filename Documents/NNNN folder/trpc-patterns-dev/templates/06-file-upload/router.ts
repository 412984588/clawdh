/**
 * tRPC v11 — File Upload Patterns
 * Multipart form data, S3 presigned URLs, file metadata validation
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

// ── 1. File metadata schemas ──────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const ALLOWED_DOC_TYPES = ["application/pdf", "text/plain", "application/msword"] as const;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DOC_SIZE = 50 * 1024 * 1024;   // 50 MB

const FileMetaSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
  checksum: z.string().regex(/^[a-f0-9]{64}$/, "Expected SHA-256 hex").optional(),
});

const ImageMetaSchema = FileMetaSchema.extend({
  mimeType: z.enum(ALLOWED_IMAGE_TYPES),
  size: z.number().max(MAX_IMAGE_SIZE, "Image too large (max 10 MB)"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const DocMetaSchema = FileMetaSchema.extend({
  mimeType: z.enum(ALLOWED_DOC_TYPES),
  size: z.number().max(MAX_DOC_SIZE, "Document too large (max 50 MB)"),
});

// ── 2. Upload destination types ───────────────────────────────────────────────

interface PresignedUploadUrl {
  uploadUrl: string;      // PUT this URL directly
  fileKey: string;        // S3 / storage key
  expiresAt: string;      // ISO timestamp
  fields: Record<string, string>; // extra POST fields for presigned forms
}

interface UploadRecord {
  id: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: "pending" | "confirmed" | "failed";
  url: string;
  createdAt: Date;
}

// ── 3. Mock storage service (replace with S3/GCS/R2 SDK) ─────────────────────

const uploads = new Map<string, UploadRecord>();

async function generatePresignedUrl(
  fileKey: string,
  mimeType: string
): Promise<PresignedUploadUrl> {
  // In production: use aws-sdk or @aws-sdk/s3-presigned-post
  return {
    uploadUrl: `https://mybucket.s3.amazonaws.com/${fileKey}`,
    fileKey,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
    fields: {
      "Content-Type": mimeType,
      "x-amz-meta-uploaded-by": "trpc-upload",
    },
  };
}

function buildPublicUrl(fileKey: string): string {
  return `https://cdn.example.com/${fileKey}`;
}

// ── 4. Router ─────────────────────────────────────────────────────────────────

export const appRouter = t.router({
  // ── 4a. Request a presigned URL for direct-to-S3 upload ───────────────────
  requestUploadUrl: publicProcedure
    .input(
      z.discriminatedUnion("kind", [
        z.object({ kind: z.literal("image"), meta: ImageMetaSchema }),
        z.object({ kind: z.literal("document"), meta: DocMetaSchema }),
      ])
    )
    .mutation(async ({ input }) => {
      const { meta } = input;
      const ext = meta.name.split(".").pop() ?? "";
      const fileKey = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const presigned = await generatePresignedUrl(fileKey, meta.mimeType);

      // Create pending record
      const record: UploadRecord = {
        id: Math.random().toString(36).slice(2),
        fileKey,
        fileName: meta.name,
        mimeType: meta.mimeType,
        size: meta.size,
        status: "pending",
        url: buildPublicUrl(fileKey),
        createdAt: new Date(),
      };
      uploads.set(record.id, record);

      return { uploadId: record.id, presigned };
    }),

  // ── 4b. Confirm upload completed ──────────────────────────────────────────
  confirmUpload: publicProcedure
    .input(
      z.object({
        uploadId: z.string(),
        // Client sends back checksum for server-side verification
        checksum: z.string().regex(/^[a-f0-9]{64}$/).optional(),
      })
    )
    .mutation(({ input }) => {
      const record = uploads.get(input.uploadId);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found" });
      if (record.status !== "pending") {
        throw new TRPCError({ code: "CONFLICT", message: `Upload already ${record.status}` });
      }
      record.status = "confirmed";
      uploads.set(record.id, record);
      return { ...record, status: "confirmed" as const };
    }),

  // ── 4c. Batch upload multiple files ──────────────────────────────────────
  batchRequestUploadUrls: publicProcedure
    .input(
      z.array(FileMetaSchema).min(1).max(20)
    )
    .mutation(async ({ input }) => {
      return Promise.all(
        input.map(async (meta) => {
          const ext = meta.name.split(".").pop() ?? "";
          const fileKey = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const presigned = await generatePresignedUrl(fileKey, meta.mimeType);
          return { fileName: meta.name, presigned };
        })
      );
    }),

  // ── 4d. List uploads ─────────────────────────────────────────────────────
  listUploads: publicProcedure
    .input(
      z.object({
        status: z.enum(["pending", "confirmed", "failed"]).optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(({ input }) => {
      const all = Array.from(uploads.values());
      const filtered = input.status ? all.filter((u) => u.status === input.status) : all;
      return filtered.slice(0, input.limit);
    }),

  // ── 4e. Delete upload ────────────────────────────────────────────────────
  deleteUpload: publicProcedure
    .input(z.object({ uploadId: z.string() }))
    .mutation(({ input }) => {
      const record = uploads.get(input.uploadId);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found" });
      uploads.delete(input.uploadId);
      // In production: also delete from S3
      return { deleted: true, fileKey: record.fileKey };
    }),
});

export type AppRouter = typeof appRouter;
