# Stripe Webhook Handlers Pack

10 production-ready Stripe webhook handlers (TypeScript). Stop writing ad-hoc webhook code.

## Two Tiers

**Starter — $19**
- payment_intent.succeeded
- payment_intent.payment_failed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted

**Pro — $39**
All 5 Starter handlers plus:
- invoice.paid
- invoice.payment_failed
- customer.subscription.trial_will_end
- checkout.session.completed
- Full webhook router (signature verification + handler registry)

## Requirements
- Stripe SDK (`npm install stripe`)
- Node.js 18+ / Edge runtime
