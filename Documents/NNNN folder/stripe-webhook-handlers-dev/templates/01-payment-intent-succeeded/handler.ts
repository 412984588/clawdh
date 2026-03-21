import Stripe from "stripe";

/**
 * Handle payment_intent.succeeded
 * Triggered: one-time payment completed successfully
 */
export async function handlePaymentIntentSucceeded(
  event: Stripe.Event,
  deps: {
    db: { updateOrder: (paymentIntentId: string, status: string) => Promise<void> };
    email: { sendReceipt: (to: string, amount: number) => Promise<void> };
  }
): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  const { id, amount, currency, receipt_email, metadata } = paymentIntent;

  // Update order status in your database
  await deps.db.updateOrder(id, "paid");

  // Send receipt email if available
  if (receipt_email) {
    await deps.email.sendReceipt(receipt_email, amount / 100);
  }

  console.log(`Payment succeeded: ${id} — ${amount / 100} ${currency.toUpperCase()}`);
}

// ── Next.js App Router route handler (POST /api/webhooks/stripe) ──────────
export async function handleWebhookRequest(request: Request): Promise<Response> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    // Wire up your actual db/email dependencies here
    await handlePaymentIntentSucceeded(event, {
      db: { updateOrder: async (id, status) => { /* your DB call */ } },
      email: { sendReceipt: async (to, amount) => { /* your email call */ } },
    });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
