# 03 — SaaS Billing

Stripe-compatible billing schema with plans, subscriptions, invoices, and usage metering.

## Models

- **Plan** — pricing plans with Stripe Price/Product IDs, limits as JSON
- **Subscription** — user subscriptions with status, trial dates, cancel flow
- **Invoice** — per-period invoices with line items
- **UsageRecord** — metered usage tracking by metric

## Key patterns

- Stripe IDs stored as `@unique` for webhook deduplication
- `cancelAtPeriodEnd` flag for graceful cancellation
- JSON `limits` field for flexible per-plan feature gating
