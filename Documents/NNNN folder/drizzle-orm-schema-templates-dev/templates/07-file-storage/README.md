# File Storage Schema

File management with folders, versioning, and sharing. Works with S3, R2, and GCS.

## Tables
- `folders` — nested folder hierarchy using materialized paths
- `files` — file records with soft delete and storage provider info
- `file_versions` — version history for files
- `file_shares` — public link and user-to-user sharing with permissions

## Notes
- `storageKey` is the actual S3/R2/GCS object key — keep private
- Use `deleted` + `deletedAt` for soft delete (30-day recycle bin pattern)
- `checksum` enables deduplication across uploads
