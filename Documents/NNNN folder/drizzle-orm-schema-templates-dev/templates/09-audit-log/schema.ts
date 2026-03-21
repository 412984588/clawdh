import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Immutable audit log — insert-only, never update or delete
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Who
  actorId: uuid("actor_id"),          // user/agent who performed the action
  actorEmail: text("actor_email"),    // snapshot at time of action
  actorType: text("actor_type").notNull().default("user"), // user | system | api_key
  // What
  action: text("action").notNull(),   // e.g. "user.created", "order.cancelled", "settings.updated"
  entityType: text("entity_type"),    // e.g. "user", "order", "subscription"
  entityId: text("entity_id"),        // ID of the affected entity
  // Context
  organizationId: uuid("organization_id"), // for multi-tenant apps
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestId: text("request_id"),      // trace/request ID for correlation
  // Data
  before: text("before"),             // JSON snapshot before change
  after: text("after"),               // JSON snapshot after change
  metadata: text("metadata"),         // JSON extra context
  // When
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Field-level change tracking
export const fieldChanges = pgTable("field_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditLogId: uuid("audit_log_id").notNull().references(() => auditLog.id),
  fieldName: text("field_name").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  dataType: text("data_type").notNull().default("string"),
});
