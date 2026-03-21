# 07 — File Storage

Folder tree, file metadata, versioning, and share links for cloud storage (S3/GCS).

## Models

- **Folder** — self-referential tree with materialized path
- **File** — metadata pointing to cloud storage object; soft-delete
- **FileVersion** — version history per file
- **FileShare** — token-based share links with expiry, password, access limits

## Key patterns

- `BigInt` for file size (handles files > 2GB)
- `storageKey` unique constraint prevents duplicate uploads
- Materialized `path` field enables fast subtree queries
- Soft delete via `deletedAt`
