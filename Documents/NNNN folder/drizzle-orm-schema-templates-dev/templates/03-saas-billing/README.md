# SaaS Billing Schema

Complete billing schema for SaaS apps. Stripe-compatible.

## Tables
- `plans` — pricing plans with monthly/yearly pricing and Stripe price IDs
- `subscriptions` — user subscriptions with full lifecycle (trial, active, cancelled, past_due)
- `invoices` — billing invoices linked to subscriptions
- `usage_records` — metered billing usage tracking

## Features
- Stripe webhook-ready status fields
- Trial period support
- Metered usage recording
- Yearly billing interval support
