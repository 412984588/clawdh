# Webhook Router

Full-featured Stripe webhook router with signature verification, event routing, error handling, and dependency injection.

## Features
- Signature verification with `stripe.webhooks.constructEvent`
- Handler registry pattern (add/remove handlers without touching the router)
- Dependency injection (testable — no global imports)
- Returns 500 on handler error to trigger Stripe retry
- TypeScript with full Stripe event types

## Setup

### 1. Environment Variables
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Next.js App Router
```ts
// app/api/webhooks/stripe/route.ts
import { stripeWebhookRouter } from "./handler";

export async function POST(request: Request) {
  return stripeWebhookRouter(request, { db: myDb, email: myEmailService });
}
```

### 3. Disable body parsing (Next.js App Router handles this automatically)

## Testing
Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` to forward events locally.

## Stripe Retry Behavior
- Stripe retries on any non-2xx response
- Return 500 intentionally when your handler fails
- Return 200 for unknown event types (don't retry unhandled events)
