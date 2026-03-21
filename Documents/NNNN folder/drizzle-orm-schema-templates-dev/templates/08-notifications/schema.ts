import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const notificationTypes = pgTable("notification_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // "new_comment", "subscription_renewal", "team_invite"
  description: text("description"),
  defaultChannels: text("default_channels").notNull().default('["in_app"]'), // JSON array
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  notificationTypeId: uuid("notification_type_id").notNull().references(() => notificationTypes.id),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  pushEnabled: boolean("push_enabled").notNull().default(true),
  inAppEnabled: boolean("in_app_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  typeId: uuid("type_id").references(() => notificationTypes.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  actionUrl: text("action_url"),
  imageUrl: text("image_url"),
  data: text("data"), // JSON payload for extra context
  channel: text("channel").notNull().default("in_app"), // in_app | email | push | sms
  read: boolean("read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pushTokens = pgTable("push_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  token: text("token").notNull().unique(), // FCM / APNs token
  provider: text("provider").notNull().default("fcm"), // fcm | apns
  deviceId: text("device_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  type: one(notificationTypes, { fields: [notifications.typeId], references: [notificationTypes.id] }),
}));

export const notificationTypesRelations = relations(notificationTypes, ({ many }) => ({
  preferences: many(userNotificationPreferences),
}));
