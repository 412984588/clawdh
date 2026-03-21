# Stripe Webhook Handlers Pack

**10 production-ready Stripe webhook handlers. TypeScript. Cover every critical SaaS billing event.**

Stripe webhooks are notoriously easy to get wrong. This pack gives you battle-tested handlers for every webhook event your SaaS app needs — with proper signature verification, idempotency guidance, and dependency injection.

## Pricing

| Tier | Handlers | Price |
|------|----------|-------|
| Starter | 5 handlers (core payment lifecycle) | $19 |
| Pro | 10 handlers (complete SaaS billing coverage) | $39 |

## Templates

### Starter ($19) — 5 handlers
| # | Event | What It Handles |
|---|-------|----------------|
| 01 | `payment_intent.succeeded` | Mark order paid, send receipt |
| 02 | `payment_intent.payment_failed` | Update order to failed, notify customer |
| 03 | `customer.subscription.created` | Activate subscription, send welcome email |
| 04 | `customer.subscription.updated` | Plan changes, cancellation scheduling |
| 05 | `customer.subscription.deleted` | Revoke access, send cancellation confirmation |

### Pro ($39) — All 10 handlers
Includes all Starter handlers plus:

| # | Event | What It Handles |
|---|-------|----------------|
| 06 | `invoice.paid` | Record payment, reset usage counters |
| 07 | `invoice.payment_failed` | Dunning emails, mark subscription past_due |
| 08 | `customer.subscription.trial_will_end` | Trial reminder (card vs no-card variant) |
| 09 | `checkout.session.completed` | Handle payment + subscription + setup modes |
| 10 | Webhook Router | Full router with signature verification + handler registry |

## Quick Start

```bash
npm install stripe
```

```ts
// app/api/webhooks/stripe/route.ts (Next.js App Router)
import { stripeWebhookRouter } from "./10-webhook-router/handler";
export async function POST(request: Request) {
  return stripeWebhookRouter(request, { db: myDb, email: myEmailService });
}
```

## License

One-time purchase. Use on unlimited personal and commercial projects.
