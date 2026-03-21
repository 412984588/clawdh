import Stripe from "stripe";

/**
 * Handle invoice.payment_failed
 * Triggered: subscription renewal payment failed (dunning)
 */
export async function handleInvoicePaymentFailed(
  event: Stripe.Event,
  deps: {
    db: {
      updateSubscriptionStatus: (stripeSubscriptionId: string, status: string) => Promise<void>;
      getNextRetryDate: (stripeSubscriptionId: string) => Promise<Date | null>;
      getUserByCustomerId: (customerId: string) => Promise<{ id: string; email: string } | null>;
    };
    email: {
      sendPaymentFailedDunningEmail: (to: string, retryDate: Date | null, updateUrl: string) => Promise<void>;
    };
  }
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const {
    subscription,
    customer,
    customer_email,
    attempt_count,
    next_payment_attempt,
    hosted_invoice_url,
  } = invoice;

  const customerId = typeof customer === "string" ? customer : customer?.id ?? "";
  const subscriptionId = typeof subscription === "string" ? subscription : subscription?.id ?? null;

  // Update subscription to past_due
  if (subscriptionId) {
    await deps.db.updateSubscriptionStatus(subscriptionId, "past_due");
  }

  const retryDate = next_payment_attempt ? new Date(next_payment_attempt * 1000) : null;
  const updateUrl = hosted_invoice_url ?? "https://billing.stripe.com";

  // Send dunning email
  const user = subscriptionId ? await deps.db.getUserByCustomerId(customerId) : null;
  const email = user?.email ?? customer_email;
  if (email) {
    await deps.email.sendPaymentFailedDunningEmail(email, retryDate, updateUrl);
  }

  console.warn(
    `Invoice payment failed: attempt ${attempt_count} for customer ${customerId}. ` +
    `Next retry: ${retryDate?.toISOString() ?? "none (subscription will cancel)"}`
  );
}
