# customer.subscription.deleted

Triggered when a subscription actually ends (not when cancellation is scheduled).

## What to Do
1. Mark subscription as cancelled in your database
2. Revoke access to paid features
3. Send a "your subscription has ended" confirmation email
4. Optionally trigger a win-back campaign

## Important Distinction
- `cancel_at_period_end = true` → cancellation scheduled, NOT yet deleted
- `subscription.deleted` event → subscription has ended, access must be revoked NOW

## Key Fields
- `ended_at` — Unix timestamp when subscription ended (null if cancelled immediately)
- `customer` — Stripe customer ID (look up your user by this)

## Idempotency
Check if subscription is already cancelled before revoking access to avoid double-processing.
