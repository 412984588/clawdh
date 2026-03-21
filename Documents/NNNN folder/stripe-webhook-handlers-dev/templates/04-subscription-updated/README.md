# customer.subscription.updated

Triggered on any subscription change: plan upgrades/downgrades, cancellation scheduling, trial end, renewal.

## What to Do
1. Update subscription record in your database
2. Detect what changed using `event.data.previous_attributes`
3. React to specific changes (plan change, cancellation scheduled, trial ended)

## Common Triggers
| Change | previous_attributes contains |
|--------|------------------------------|
| Plan upgraded/downgraded | `items` with old price ID |
| Cancellation scheduled | `cancel_at_period_end: false` |
| Cancellation reversed | `cancel_at_period_end: true` |
| Trial ended | `status: "trialing"` |
| Renewed | `current_period_start/end` changed |

## Key Pattern
Use `event.data.previous_attributes` to detect what specifically changed, rather than always reacting to every update.
