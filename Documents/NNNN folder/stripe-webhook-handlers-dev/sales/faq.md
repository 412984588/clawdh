# FAQ — Stripe Webhook Handlers Pack

**Q: Which version of the Stripe SDK do these use?**
Stripe Node.js SDK v14+ (`stripe@^14`). Install: `npm install stripe`.

**Q: Do these work with Next.js App Router?**
Yes — template 10 (Webhook Router) shows the exact App Router setup. The key is `export async function POST(request: Request)`.

**Q: How do I get my STRIPE_WEBHOOK_SECRET?**
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. For production, create an endpoint in Stripe Dashboard and copy the signing secret.

**Q: How do I test webhooks locally?**
Use `stripe listen --forward-to localhost:PORT/api/webhooks/stripe` to forward events from Stripe to your local server. Then use `stripe trigger payment_intent.succeeded` to fire specific events.

**Q: What about idempotency?**
Every handler README includes idempotency guidance. The golden rule: store Stripe event/object IDs and check for duplicates before processing. Stripe may deliver the same event more than once.

**Q: Can I use dependency injection with these?**
Yes — all handlers accept a `deps` parameter. Inject your actual db/email dependencies when calling them, making them fully testable.

**Q: Is this a subscription?**
No — one-time purchase. Use forever on unlimited projects.
