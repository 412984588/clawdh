# payment_intent.payment_failed

Triggered when a payment attempt fails.

## What to Do
1. Mark the order as failed in your database
2. Notify the customer with a user-friendly error message
3. Provide a link to retry payment

## Key Fields
- `last_payment_error.decline_code` — specific failure reason
- `last_payment_error.message` — human-readable error
- `receipt_email` — customer email

## Common Decline Codes
| Code | Customer Message |
|------|-----------------|
| `card_declined` | "Your card was declined. Please contact your bank or try another card." |
| `insufficient_funds` | "Your card has insufficient funds." |
| `expired_card` | "Your card has expired. Please update your payment method." |
| `incorrect_cvc` | "Your card's security code is incorrect." |
