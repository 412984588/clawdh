import Stripe from "stripe";

/**
 * Handle payment_intent.payment_failed
 * Triggered: payment attempt failed (card declined, insufficient funds, etc.)
 */
export async function handlePaymentIntentFailed(
  event: Stripe.Event,
  deps: {
    db: { updateOrder: (paymentIntentId: string, status: string, error: string) => Promise<void> };
    email: { sendPaymentFailedEmail: (to: string, reason: string) => Promise<void> };
  }
): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const { id, last_payment_error, receipt_email } = paymentIntent;

  const declineCode = last_payment_error?.decline_code ?? "unknown";
  const errorMessage = last_payment_error?.message ?? "Payment failed";

  // Update order to failed state
  await deps.db.updateOrder(id, "payment_failed", declineCode);

  // Notify the customer
  if (receipt_email) {
    await deps.email.sendPaymentFailedEmail(receipt_email, errorMessage);
  }

  console.error(`Payment failed: ${id} — ${declineCode}: ${errorMessage}`);
}

// ── Decline code reference ─────────────────────────────────────────────────
// "card_declined"          — generic decline, ask customer to contact bank
// "insufficient_funds"     — ask customer to use different card
// "expired_card"           — ask customer to update card
// "incorrect_cvc"          — ask customer to re-enter CVC
// "do_not_honor"           — bank refused, try different card
// "fraudulent"             — Stripe blocked as likely fraud
// "card_not_supported"     — card type not accepted
export type StripeDeclineCode =
  | "card_declined" | "insufficient_funds" | "expired_card"
  | "incorrect_cvc" | "do_not_honor" | "fraudulent" | "card_not_supported";
