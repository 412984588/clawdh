import Stripe from "stripe";

/**
 * Handle customer.subscription.created
 * Triggered: new subscription created (after checkout or API call)
 */
export async function handleSubscriptionCreated(
  event: Stripe.Event,
  deps: {
    db: {
      upsertSubscription: (data: {
        stripeSubscriptionId: string;
        stripeCustomerId: string;
        status: string;
        planId: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        trialEnd: Date | null;
      }) => Promise<void>;
      getUserByCustomerId: (customerId: string) => Promise<{ id: string; email: string } | null>;
    };
    email: { sendSubscriptionWelcome: (to: string, planName: string) => Promise<void> };
  }
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const {
    id,
    customer,
    status,
    items,
    current_period_start,
    current_period_end,
    trial_end,
  } = subscription;

  const customerId = typeof customer === "string" ? customer : customer.id;
  const planId = items.data[0]?.price.id ?? "";

  await deps.db.upsertSubscription({
    stripeSubscriptionId: id,
    stripeCustomerId: customerId,
    status,
    planId,
    currentPeriodStart: new Date(current_period_start * 1000),
    currentPeriodEnd: new Date(current_period_end * 1000),
    trialEnd: trial_end ? new Date(trial_end * 1000) : null,
  });

  // Send welcome email
  const user = await deps.db.getUserByCustomerId(customerId);
  if (user && status === "active") {
    const planName = items.data[0]?.price.nickname ?? "Pro";
    await deps.email.sendSubscriptionWelcome(user.email, planName);
  }

  console.log(`Subscription created: ${id} (${status}) for customer ${customerId}`);
}
