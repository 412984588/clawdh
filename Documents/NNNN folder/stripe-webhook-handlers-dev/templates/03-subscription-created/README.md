# customer.subscription.created

Triggered when a new subscription is created.

## What to Do
1. Store the subscription in your database (use upsert for idempotency)
2. Unlock features for the subscribed plan
3. Send a welcome/confirmation email

## Status Values at Creation
- `active` — immediately active (no trial)
- `trialing` — subscription in trial period
- `incomplete` — payment required before activation

## Key Fields
- `id` — Stripe subscription ID
- `customer` — Stripe customer ID (look up your user by this)
- `status` — `active` | `trialing` | `incomplete`
- `items.data[0].price.id` — the Stripe Price ID (maps to your plan)
- `trial_end` — Unix timestamp (null if no trial)
- `current_period_start/end` — billing cycle boundaries

## Note on Timing
For subscriptions created via Checkout, `checkout.session.completed` fires first. You can provision access there and use `subscription.created` as a backup/sync.
