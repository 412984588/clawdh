// Express.js 文件上传模式 — TypeScript (multer)
// 文件类型验证、大小限制、S3 兼容存储

import { Request, Response, NextFunction } from "express";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs/promises";

// ===== 1. 类型定义 =====

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

export interface UploadResult {
  key: string;           // 存储路径/键
  url: string;           // 访问 URL
  size: number;
  mimetype: string;
  originalname: string;
}

// ===== 2. 文件验证配置 =====

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_DOC_TYPES = ["application/pdf", "text/plain", "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export const FILE_LIMITS = {
  image: { maxSize: 5 * 1024 * 1024, types: ALLOWED_IMAGE_TYPES },     // 5 MB
  document: { maxSize: 20 * 1024 * 1024, types: ALLOWED_DOC_TYPES },   // 20 MB
  video: { maxSize: 200 * 1024 * 1024, types: ALLOWED_VIDEO_TYPES },   // 200 MB
  any: { maxSize: 10 * 1024 * 1024, types: [] },                        // 10 MB, 任意类型
} as const;

// ===== 3. 文件验证函数 =====

export interface FileValidationOptions {
  allowedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
}

export function validateFile(
  file: UploadedFile,
  options: FileValidationOptions = {}
): string | null {
  const { allowedTypes = [], maxSize = 10 * 1024 * 1024 } = options;

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    return `File type '${file.mimetype}' not allowed. Allowed: ${allowedTypes.join(", ")}`;
  }

  if (file.size > maxSize) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max: ${(maxSize / 1024 / 1024).toFixed(0)} MB`;
  }

  return null;
}

// Magic bytes 验证（防止 MIME 类型伪造）
export function validateMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures: Record<string, number[][]> = {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "image/gif": [[0x47, 0x49, 0x46, 0x38]],
    "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF
    "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
    "video/mp4": [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]], // ftyp
  };

  const sigs = signatures[mimetype];
  if (!sigs) return true; // 没有已知签名，不验证

  return sigs.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

// ===== 4. 安全文件名生成 =====

export function generateSafeFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  const hash = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

export function generateStorageKey(folder: string, filename: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${folder}/${year}/${month}/${filename}`;
}

// ===== 5. 本地磁盘存储实现 =====

export async function saveToLocal(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<UploadResult> {
  const uploadDir = path.join(process.cwd(), "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = generateSafeFilename(filename);
  const filePath = path.join(uploadDir, safeName);
  await fs.writeFile(filePath, buffer);

  return {
    key: `uploads/${folder}/${safeName}`,
    url: `/uploads/${folder}/${safeName}`,
    size: buffer.length,
    mimetype: getMimetype(filename),
    originalname: filename,
  };
}

// ===== 6. S3 兼容存储（AWS S3 / Cloudflare R2 / MinIO）=====

export interface S3Config {
  bucket: string;
  region: string;
  endpoint?: string;  // 自定义 endpoint（用于 R2/MinIO）
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string; // CDN/公网访问 URL 前缀
}

// S3 上传包装器（实际使用时需要 @aws-sdk/client-s3）
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  mimetype: string,
  _config: S3Config
): Promise<UploadResult> {
  // 实际实现：
  // const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  // const client = new S3Client({ ... });
  // await client.send(new PutObjectCommand({ Bucket, Key, Body, ContentType }));

  // 占位返回
  return {
    key,
    url: `https://cdn.example.com/${key}`,
    size: buffer.length,
    mimetype,
    originalname: path.basename(key),
  };
}

// ===== 7. 上传路由处理器示例 =====

export async function uploadImageHandler(req: Request, res: Response): Promise<void> {
  // 假设 multer 已将文件解析到 req.file
  const file = (req as Request & { file?: UploadedFile }).file;

  if (!file) {
    res.status(400).json({ success: false, error: { code: "NO_FILE", message: "No file uploaded" } });
    return;
  }

  const error = validateFile(file, FILE_LIMITS.image);
  if (error) {
    res.status(400).json({ success: false, error: { code: "INVALID_FILE", message: error } });
    return;
  }

  if (file.buffer && !validateMagicBytes(file.buffer, file.mimetype)) {
    res.status(400).json({ success: false, error: { code: "INVALID_FILE_CONTENT", message: "File content does not match declared type" } });
    return;
  }

  try {
    const filename = generateSafeFilename(file.originalname);
    const key = generateStorageKey("images", filename);
    const result = file.buffer
      ? await uploadToS3(file.buffer, key, file.mimetype, {} as S3Config)
      : await saveToLocal(Buffer.alloc(0), "images", file.originalname);

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "UPLOAD_FAILED", message: "Upload failed" } });
  }
}

// ===== 8. 批量上传处理器示例 =====

export async function uploadMultipleHandler(req: Request, res: Response): Promise<void> {
  const files = (req as Request & { files?: UploadedFile[] }).files ?? [];
  const MAX_FILES = 10;

  if (files.length === 0) {
    res.status(400).json({ success: false, error: { code: "NO_FILES", message: "No files uploaded" } });
    return;
  }

  if (files.length > MAX_FILES) {
    res.status(400).json({ success: false, error: { code: "TOO_MANY_FILES", message: `Maximum ${MAX_FILES} files allowed` } });
    return;
  }

  const results: Array<{ success: boolean; result?: UploadResult; error?: string }> = [];

  for (const file of files) {
    const error = validateFile(file, FILE_LIMITS.image);
    if (error) { results.push({ success: false, error }); continue; }

    const filename = generateSafeFilename(file.originalname);
    const key = generateStorageKey("images", filename);
    results.push({ success: true, result: { key, url: `/uploads/${key}`, size: file.size, mimetype: file.mimetype, originalname: file.originalname } });
  }

  res.json({ success: true, data: { uploaded: results.filter((r) => r.success).length, total: files.length, results } });
}

// 辅助函数
function getMimetype(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf" };
  return map[ext] ?? "application/octet-stream";
}

export { ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES, ALLOWED_VIDEO_TYPES };
