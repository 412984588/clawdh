# checkout.session.completed

Triggered when a customer completes a Checkout session (payment, subscription, or setup).

## What to Do
1. Check `mode` to determine what was purchased
2. Check `payment_status` — only fulfill if `"paid"` (or `"no_payment_required"`)
3. Provision access / fulfill order / save payment method

## Mode Handling
| `mode` | Use Case |
|--------|----------|
| `payment` | One-time purchase — fulfill order |
| `subscription` | New subscription — provision access |
| `setup` | Save card for later — store payment method |

## client_reference_id
Pass your internal order/user ID at Checkout creation to link back to your system:
```ts
await stripe.checkout.sessions.create({
  client_reference_id: orderId,
  // ...
});
```

## Idempotency
Store `session.id` and check for duplicates before processing. Stripe may send the same event twice.
