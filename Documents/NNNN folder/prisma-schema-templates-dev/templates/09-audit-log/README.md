# 09 — Audit Log

Append-only audit trail with field-level change tracking and optional resource snapshots.

## Models

- **AuditLog** — immutable event records (NEVER update/delete)
- **FieldChange** — before/after values per changed field
- **ResourceSnapshot** — full state capture at time of event

## Key patterns

- Denormalized `actorEmail` — preserves accuracy even after user deletion
- `isSensitive` flag for masking password/token fields in UI
- `requestId` for distributed tracing correlation
- Composite indexes for time-range queries per org/actor/resource

## Important

These tables should be `INSERT`-only at the application layer. Consider PostgreSQL row-level security or a dedicated write-only role for extra enforcement.
