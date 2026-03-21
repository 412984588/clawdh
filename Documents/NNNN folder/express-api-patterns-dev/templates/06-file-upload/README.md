# 06 — File Upload

Multer integration, file type validation, magic bytes checking, and S3-compatible storage.

## Patterns

- `FILE_LIMITS` — preset limits for images (5 MB), documents (20 MB), videos (200 MB)
- `validateFile` — MIME type and size validation
- `validateMagicBytes` — signature-based file content verification
- `generateSafeFilename` — timestamp + random hex, prevents path traversal
- `generateStorageKey` — year/month folder structure
- `saveToLocal` — disk storage with recursive directory creation
- `uploadToS3` — S3/R2/MinIO wrapper (AWS SDK pattern)
- `uploadImageHandler`, `uploadMultipleHandler` — route handler examples
