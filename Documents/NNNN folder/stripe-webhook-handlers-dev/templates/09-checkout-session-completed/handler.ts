import Stripe from "stripe";

/**
 * Handle checkout.session.completed
 * Triggered: customer completed Stripe Checkout (payment OR subscription)
 */
export async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  deps: {
    db: {
      provisionAccess: (customerId: string, sessionId: string, mode: string) => Promise<void>;
      fulfillOrder: (orderId: string, customerId: string) => Promise<void>;
    };
    email: { sendPurchaseConfirmation: (to: string, mode: string) => Promise<void> };
  }
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const {
    id,
    mode,            // "payment" | "subscription" | "setup"
    customer,
    customer_email,
    payment_status,  // "paid" | "unpaid" | "no_payment_required"
    client_reference_id, // your custom order/user ID passed at checkout creation
    subscription,
    payment_intent,
  } = session;

  const customerId = typeof customer === "string" ? customer : customer?.id ?? "";

  // Only process if payment is complete
  if (payment_status !== "paid" && mode !== "setup") {
    console.log(`Checkout session ${id} not paid yet (status: ${payment_status})`);
    return;
  }

  if (mode === "subscription") {
    // Subscription checkout — provision access
    await deps.db.provisionAccess(customerId, id, mode);
  } else if (mode === "payment") {
    // One-time payment checkout — fulfill order
    const orderId = client_reference_id ?? (typeof payment_intent === "string" ? payment_intent : payment_intent?.id ?? id);
    await deps.db.fulfillOrder(orderId, customerId);
  }

  // Send confirmation
  if (customer_email) {
    await deps.email.sendPurchaseConfirmation(customer_email, mode);
  }

  console.log(`Checkout session completed: ${id} (mode=${mode}, status=${payment_status})`);
}
