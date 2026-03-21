import { pgTable, text, timestamp, boolean, uuid, integer, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  priceMonthly: numeric("price_monthly", { precision: 10, scale: 2 }).notNull(),
  priceYearly: numeric("price_yearly", { precision: 10, scale: 2 }),
  stripePriceIdMonthly: text("stripe_price_id_monthly"),
  stripePriceIdYearly: text("stripe_price_id_yearly"),
  features: text("features"), // JSON string
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  planId: uuid("plan_id").notNull().references(() => plans.id),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  status: text("status").notNull().default("active"), // active | cancelled | past_due | trialing
  billingInterval: text("billing_interval").notNull().default("monthly"), // monthly | yearly
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  cancelledAt: timestamp("cancelled_at"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  userId: uuid("user_id").notNull(),
  stripeInvoiceId: text("stripe_invoice_id").unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull().default("draft"), // draft | open | paid | void | uncollectible
  invoiceUrl: text("invoice_url"),
  pdfUrl: text("pdf_url"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usageRecords = pgTable("usage_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").notNull().references(() => subscriptions.id),
  metricName: text("metric_name").notNull(), // e.g. "api_calls", "storage_gb"
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
  invoices: many(invoices),
  usageRecords: many(usageRecords),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));
