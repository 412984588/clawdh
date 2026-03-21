# payment_intent.succeeded

Triggered when a one-time payment completes successfully.

## What to Do
1. Mark the order as paid in your database
2. Fulfill the order (send digital download link, provision access, etc.)
3. Send a receipt email

## Key Fields
- `id` — PaymentIntent ID (use as idempotency key)
- `amount` — in smallest currency unit (cents for USD)
- `receipt_email` — customer email (if provided)
- `metadata` — custom data you attached at payment creation (e.g., `orderId`)

## Idempotency
Stripe may deliver the same event more than once. Check if the order is already paid before updating.
