import Stripe from "stripe";

/**
 * Handle customer.subscription.updated
 * Triggered: plan change, trial end, renewal, payment method update, etc.
 */
export async function handleSubscriptionUpdated(
  event: Stripe.Event,
  deps: {
    db: {
      updateSubscription: (data: {
        stripeSubscriptionId: string;
        status: string;
        planId: string;
        cancelAtPeriodEnd: boolean;
        currentPeriodEnd: Date;
      }) => Promise<void>;
      getUserByCustomerId: (customerId: string) => Promise<{ id: string; email: string } | null>;
    };
    email: {
      sendPlanChangedEmail: (to: string, newPlan: string) => Promise<void>;
      sendCancellationScheduledEmail: (to: string, accessUntil: Date) => Promise<void>;
    };
  }
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription> | undefined;

  const {
    id,
    customer,
    status,
    items,
    cancel_at_period_end,
    current_period_end,
  } = subscription;

  const customerId = typeof customer === "string" ? customer : customer.id;
  const planId = items.data[0]?.price.id ?? "";

  await deps.db.updateSubscription({
    stripeSubscriptionId: id,
    status,
    planId,
    cancelAtPeriodEnd: cancel_at_period_end,
    currentPeriodEnd: new Date(current_period_end * 1000),
  });

  const user = await deps.db.getUserByCustomerId(customerId);
  if (!user) return;

  // Detect plan change
  const previousPriceId = (previousAttributes?.items as Stripe.SubscriptionItem[] | undefined)?.[0]?.price?.id;
  if (previousPriceId && previousPriceId !== planId) {
    const planName = items.data[0]?.price.nickname ?? planId;
    await deps.email.sendPlanChangedEmail(user.email, planName);
  }

  // Detect cancellation scheduled
  const wasCancelScheduled = !(previousAttributes as { cancel_at_period_end?: boolean })?.cancel_at_period_end;
  if (cancel_at_period_end && wasCancelScheduled) {
    await deps.email.sendCancellationScheduledEmail(user.email, new Date(current_period_end * 1000));
  }

  console.log(`Subscription updated: ${id} — status=${status} cancelAtEnd=${cancel_at_period_end}`);
}
