import { pgTable, text, timestamp, uuid, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Page views / web analytics
export const pageViews = pgTable("page_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull(),
  sessionId: text("session_id").notNull(),
  userId: uuid("user_id"),
  url: text("url").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  country: text("country"),
  city: text("city"),
  device: text("device"), // desktop | mobile | tablet
  browser: text("browser"),
  os: text("os"),
  duration: integer("duration"), // seconds on page
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Custom event tracking
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull(),
  sessionId: text("session_id").notNull(),
  userId: uuid("user_id"),
  name: text("name").notNull(), // e.g. "button_click", "form_submit", "purchase"
  properties: text("properties"), // JSON
  url: text("url"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// User sessions for funnel analysis
export const analyticsSessions = pgTable("analytics_sessions", {
  id: text("id").primaryKey(), // client-generated UUID
  siteId: uuid("site_id").notNull(),
  userId: uuid("user_id"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  pageViewCount: integer("page_view_count").notNull().default(0),
  entryUrl: text("entry_url"),
  exitUrl: text("exit_url"),
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  country: text("country"),
  device: text("device"),
  bounced: boolean("bounced").notNull().default(false),
});

// Daily aggregate metrics (pre-computed for performance)
export const dailyMetrics = pgTable("daily_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  pageViews: integer("page_views").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  sessions: integer("sessions").notNull().default(0),
  bounceRate: numeric("bounce_rate", { precision: 5, scale: 2 }),
  avgSessionDuration: integer("avg_session_duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
