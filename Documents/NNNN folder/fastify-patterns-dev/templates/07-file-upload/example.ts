/**
 * Fastify File Upload
 * Demonstrates: @fastify/multipart, single upload, multiple files, file validation, streaming
 */
import Fastify, { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import path from "path";

const UPLOAD_DIR = "/tmp/uploads";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function buildApp(): FastifyInstance {
  const fastify = Fastify({ logger: false });

  // Register multipart plugin
  fastify.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 5,
    },
  });

  // ── Single file upload ────────────────────────────────────────────────────────

  fastify.post("/upload/single", async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: "No file provided" });
    }

    // Validate content type
    if (!ALLOWED_TYPES.includes(data.mimetype)) {
      return reply.code(415).send({
        error: `File type not allowed. Allowed: ${ALLOWED_TYPES.join(", ")}`,
      });
    }

    const filename = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await pipeline(data.file, createWriteStream(filepath));

    return reply.code(201).send({
      filename,
      originalName: data.filename,
      mimetype: data.mimetype,
      size: data.file.bytesRead,
    });
  });

  // ── Multiple files ────────────────────────────────────────────────────────────

  fastify.post("/upload/multiple", async (request, reply) => {
    const files = request.files();
    const uploaded: Array<{ filename: string; size: number }> = [];

    for await (const data of files) {
      if (!ALLOWED_TYPES.includes(data.mimetype)) {
        // Drain the stream to avoid memory leak
        data.file.resume();
        continue;
      }

      const filename = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filepath = path.join(UPLOAD_DIR, filename);

      await pipeline(data.file, createWriteStream(filepath));
      uploaded.push({ filename, size: data.file.bytesRead });
    }

    return reply.send({ uploaded, count: uploaded.length });
  });

  // ── Upload with form fields ───────────────────────────────────────────────────

  fastify.post("/upload/with-metadata", async (request, reply) => {
    const parts = request.parts();
    const metadata: Record<string, string> = {};
    let fileInfo: { filename: string; size: number } | null = null;

    for await (const part of parts) {
      if (part.type === "file") {
        const filename = `${Date.now()}-${part.filename}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        await pipeline(part.file, createWriteStream(filepath));
        fileInfo = { filename, size: part.file.bytesRead };
      } else {
        // Text field
        metadata[part.fieldname] = part.value as string;
      }
    }

    if (!fileInfo) {
      return reply.code(400).send({ error: "No file provided" });
    }

    return reply.code(201).send({ file: fileInfo, metadata });
  });

  // ── Stream to cloud storage ───────────────────────────────────────────────────
  // In production, pipe to S3/GCS/R2 instead of disk

  fastify.post("/upload/stream", async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.code(400).send({ error: "No file" });

    // Simulate streaming to S3
    let bytes = 0;
    for await (const chunk of data.file) {
      bytes += (chunk as Buffer).length;
      // In production: write to S3 upload stream
    }

    return reply.send({
      message: "Streamed to storage",
      bytes,
      url: `https://cdn.example.com/uploads/${data.filename}`,
    });
  });

  return fastify;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

async function main() {
  const app = buildApp();
  await app.listen({ port: 3000 });
  console.log("Fastify file upload demo on http://localhost:3000");
}

if (require.main === module) {
  main().catch(console.error);
}

export default buildApp;
