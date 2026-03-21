# invoice.payment_failed

Triggered when a subscription renewal payment fails.

## What to Do
1. Mark subscription as `past_due`
2. Send a dunning email with update payment link and retry date
3. On final failure (Stripe auto-cancels), handle `customer.subscription.deleted`

## Dunning Strategy
Stripe retries automatically based on your Smart Retries or manual retry schedule.

| `attempt_count` | Action |
|----------------|--------|
| 1 | Friendly email: "We couldn't process your payment" |
| 2 | Urgent email: "Please update your payment method" |
| 3+ | Final warning: "Your subscription will be cancelled" |

## Key Fields
- `attempt_count` — how many times payment has been attempted
- `next_payment_attempt` — Unix timestamp of next retry (null = last attempt)
- `hosted_invoice_url` — link to pay/update payment method

## Stripe Smart Retries
Enable in Dashboard → Billing → Subscriptions → Smart Retries. Stripe optimizes retry timing automatically.
