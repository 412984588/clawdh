# customer.subscription.trial_will_end

Triggered 3 days before a trial ends (configure timing in Stripe Dashboard → Billing → Subscriptions).

## What to Do
1. Check if user has a payment method on file
2. Send a targeted email:
   - **No card**: "Add your card to continue after trial" (strong CTA)
   - **Has card**: "Your trial ends in 3 days — you'll be charged $X" (reminder)

## Key Fields
- `trial_end` — Unix timestamp when trial ends
- `customer` — Stripe customer ID

## Configuring the Reminder Timing
Default is 3 days before trial ends. Change in:
Stripe Dashboard → Settings → Billing → Subscriptions & Emails → Send reminders before trial ends

## Common Mistakes
- Don't send this email if the user has already converted to paid (subscription status = `active`)
- Use `hasPaymentMethod` check to send the right email variant
