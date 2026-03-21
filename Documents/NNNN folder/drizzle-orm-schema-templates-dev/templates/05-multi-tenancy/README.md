# Multi-Tenancy Schema

Organization-based multi-tenancy with role-based access control.

## Tables
- `organizations` — tenant orgs with plan (free/starter/pro/enterprise)
- `users` — user accounts (can belong to multiple orgs)
- `memberships` — user ↔ org with roles (owner/admin/member/viewer)
- `invitations` — pending email invitations with expiry tokens
- `api_keys` — org-scoped API keys (hashed storage)

## Security Notes
- Never store raw API keys — use `keyHash` (bcrypt/SHA-256)
- Invitation tokens should be cryptographically random (32+ bytes)
- Always scope queries by `organizationId` in your application layer
