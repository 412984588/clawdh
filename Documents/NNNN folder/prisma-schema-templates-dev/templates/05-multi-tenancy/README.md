# 05 — Multi-Tenancy

Organization-based multi-tenancy with memberships, invitations, and API keys.

## Models

- **Organization** — tenant with slug, plan, metadata
- **Membership** — user-organization junction with roles
- **Invitation** — token-based email invitations with expiry
- **ApiKey** — hashed API keys with scopes, per-user or per-org

## Key patterns

- `@@unique([userId, organizationId])` — prevents duplicate memberships
- `keyHash` stores bcrypt hash; `keyPrefix` shows `sk_live_abc...` in UI
- `scopes String[]` — PostgreSQL array for granular permissions
- Invitation dedup: `@@unique([email, organizationId])`
