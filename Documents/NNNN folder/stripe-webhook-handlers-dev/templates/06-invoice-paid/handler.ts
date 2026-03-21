import Stripe from "stripe";

/**
 * Handle invoice.paid
 * Triggered: subscription renewed successfully, or first payment completed
 */
export async function handleInvoicePaid(
  event: Stripe.Event,
  deps: {
    db: {
      createInvoiceRecord: (data: {
        stripeInvoiceId: string;
        stripeSubscriptionId: string | null;
        stripeCustomerId: string;
        amount: number;
        currency: string;
        status: string;
        paidAt: Date;
        invoiceUrl: string | null;
        pdfUrl: string | null;
      }) => Promise<void>;
      resetUsageCounters: (stripeSubscriptionId: string) => Promise<void>;
    };
    email: { sendInvoiceReceiptEmail: (to: string, invoiceUrl: string) => Promise<void> };
  }
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const {
    id,
    subscription,
    customer,
    amount_paid,
    currency,
    status,
    customer_email,
    hosted_invoice_url,
    invoice_pdf,
    status_transitions,
  } = invoice;

  const customerId = typeof customer === "string" ? customer : customer?.id ?? "";
  const subscriptionId = typeof subscription === "string" ? subscription : subscription?.id ?? null;

  await deps.db.createInvoiceRecord({
    stripeInvoiceId: id,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
    amount: amount_paid / 100,
    currency,
    status: status ?? "paid",
    paidAt: new Date((status_transitions.paid_at ?? Date.now() / 1000) * 1000),
    invoiceUrl: hosted_invoice_url ?? null,
    pdfUrl: invoice_pdf ?? null,
  });

  // Reset usage-based billing counters on renewal
  if (subscriptionId) {
    await deps.db.resetUsageCounters(subscriptionId);
  }

  // Send receipt with link to invoice
  if (customer_email && hosted_invoice_url) {
    await deps.email.sendInvoiceReceiptEmail(customer_email, hosted_invoice_url);
  }

  console.log(`Invoice paid: ${id} — ${amount_paid / 100} ${currency.toUpperCase()}`);
}
