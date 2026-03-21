import Stripe from "stripe";

// ── Dependency injection interface ────────────────────────────────────────
export interface WebhookDeps {
  db: {
    upsertSubscription: (data: unknown) => Promise<void>;
    updateSubscriptionStatus: (id: string, status: string) => Promise<void>;
    cancelSubscription: (id: string, at: Date) => Promise<void>;
    createInvoiceRecord: (data: unknown) => Promise<void>;
    fulfillOrder: (id: string, customerId: string) => Promise<void>;
    getUserByCustomerId: (id: string) => Promise<{ email: string } | null>;
  };
  email: {
    send: (to: string, template: string, data: Record<string, unknown>) => Promise<void>;
  };
}

// ── Event handler registry ────────────────────────────────────────────────
type StripeEventHandler = (event: Stripe.Event, deps: WebhookDeps) => Promise<void>;

export const handlers: Partial<Record<Stripe.Event["type"], StripeEventHandler>> = {
  "checkout.session.completed": handleCheckoutSessionCompleted,
  "payment_intent.succeeded": handlePaymentIntentSucceeded,
  "payment_intent.payment_failed": handlePaymentIntentFailed,
  "customer.subscription.created": handleSubscriptionCreated,
  "customer.subscription.updated": handleSubscriptionUpdated,
  "customer.subscription.deleted": handleSubscriptionDeleted,
  "customer.subscription.trial_will_end": handleTrialWillEnd,
  "invoice.paid": handleInvoicePaid,
  "invoice.payment_failed": handleInvoicePaymentFailed,
};

// ── Individual handlers (implement or import from other templates) ─────────
async function handleCheckoutSessionCompleted(event: Stripe.Event, deps: WebhookDeps): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? "";
  if (session.mode === "subscription") await deps.db.upsertSubscription(session);
  if (session.mode === "payment") await deps.db.fulfillOrder(session.id, customerId);
}

async function handlePaymentIntentSucceeded(_event: Stripe.Event, _deps: WebhookDeps): Promise<void> {
  // see 01-payment-intent-succeeded/handler.ts
}

async function handlePaymentIntentFailed(_event: Stripe.Event, _deps: WebhookDeps): Promise<void> {
  // see 02-payment-intent-failed/handler.ts
}

async function handleSubscriptionCreated(event: Stripe.Event, deps: WebhookDeps): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  await deps.db.upsertSubscription(sub);
}

async function handleSubscriptionUpdated(event: Stripe.Event, deps: WebhookDeps): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  await deps.db.updateSubscriptionStatus(sub.id, sub.status);
}

async function handleSubscriptionDeleted(event: Stripe.Event, deps: WebhookDeps): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  await deps.db.cancelSubscription(sub.id, new Date());
}

async function handleTrialWillEnd(_event: Stripe.Event, _deps: WebhookDeps): Promise<void> {
  // see 08-trial-ending/handler.ts
}

async function handleInvoicePaid(event: Stripe.Event, deps: WebhookDeps): Promise<void> {
  await deps.db.createInvoiceRecord(event.data.object);
}

async function handleInvoicePaymentFailed(event: Stripe.Event, deps: WebhookDeps): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
  if (subscriptionId) await deps.db.updateSubscriptionStatus(subscriptionId, "past_due");
}

// ── Main webhook router ───────────────────────────────────────────────────
export async function stripeWebhookRouter(request: Request, deps: WebhookDeps): Promise<Response> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook verification failed:", err);
    return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 });
  }

  const handler = handlers[event.type];

  if (handler) {
    try {
      await handler(event, deps);
      console.log(`Handled ${event.type} (${event.id})`);
    } catch (err) {
      console.error(`Error handling ${event.type} (${event.id}):`, err);
      // Return 500 to trigger Stripe retry
      return new Response("Handler error", { status: 500 });
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Next.js App Router: app/api/webhooks/stripe/route.ts ─────────────────
// export { POST } from "./handler"; // export stripeWebhookRouter as POST
// import { WebhookDeps } from "./handler";
// export async function POST(request: Request) {
//   const deps: WebhookDeps = { db: yourDb, email: yourEmailService };
//   return stripeWebhookRouter(request, deps);
// }
