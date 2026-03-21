# Audit Log Schema

Immutable audit trail for compliance and debugging.

## Tables
- `audit_log` — append-only action log with actor, entity, before/after snapshots
- `field_changes` — field-level diff records linked to audit log entries

## Design Principles
- **Immutable**: never UPDATE or DELETE rows in this table
- **Self-contained**: snapshot `actorEmail` at write time — don't rely on joins for historical data
- **Structured actions**: use dot-notation like `user.created`, `invoice.paid`, `settings.updated`

## Querying

```ts
// All actions on a specific user
await db.select().from(auditLog)
  .where(and(eq(auditLog.entityType, "user"), eq(auditLog.entityId, userId)))
  .orderBy(desc(auditLog.timestamp));
```

## Compliance Use Cases
- GDPR data access logs
- SOC 2 change management
- Debug trail for customer support
