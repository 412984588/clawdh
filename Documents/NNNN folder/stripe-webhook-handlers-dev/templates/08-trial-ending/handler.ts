import Stripe from "stripe";

/**
 * Handle customer.subscription.trial_will_end
 * Triggered: 3 days before a trial ends (configurable in Stripe Dashboard)
 */
export async function handleTrialWillEnd(
  event: Stripe.Event,
  deps: {
    db: {
      getUserByCustomerId: (customerId: string) => Promise<{ id: string; email: string; name: string } | null>;
      hasPaymentMethod: (stripeCustomerId: string) => Promise<boolean>;
    };
    email: {
      sendTrialEndingEmail: (to: string, name: string, trialEnd: Date, hasCard: boolean) => Promise<void>;
    };
    stripe: Stripe;
  }
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const { customer, trial_end } = subscription;

  const customerId = typeof customer === "string" ? customer : customer.id;
  const trialEndDate = trial_end ? new Date(trial_end * 1000) : new Date();

  const [user, hasCard] = await Promise.all([
    deps.db.getUserByCustomerId(customerId),
    deps.db.hasPaymentMethod(customerId),
  ]);

  if (!user) {
    console.warn(`trial_will_end: no user found for customer ${customerId}`);
    return;
  }

  // Send targeted email — different CTA depending on whether card is on file
  await deps.email.sendTrialEndingEmail(user.email, user.name, trialEndDate, hasCard);

  console.log(
    `Trial ending in 3 days for ${user.email}. ` +
    `Ends: ${trialEndDate.toISOString()}. Has card: ${hasCard}`
  );
}
