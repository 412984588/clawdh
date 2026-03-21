# invoice.paid

Triggered when a subscription renews or an invoice is paid.

## What to Do
1. Record the invoice in your database
2. Extend subscription access for the new period
3. Reset usage counters (for metered billing)
4. Send a payment receipt email with invoice link

## Key Fields
- `subscription` — Stripe subscription ID (null for one-time invoices)
- `amount_paid` — in smallest currency unit (cents)
- `hosted_invoice_url` — link to Stripe-hosted invoice page
- `invoice_pdf` — direct PDF download link

## Renewal Flow
1. `invoice.created` → invoice created at period end
2. `invoice.payment_action_required` → (if 3DS needed)
3. `invoice.paid` → payment succeeded, subscription renewed
4. `customer.subscription.updated` → period dates updated
