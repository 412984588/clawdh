import Stripe from "stripe";

/**
 * Handle customer.subscription.deleted
 * Triggered: subscription has ended (at period end or immediately cancelled)
 */
export async function handleSubscriptionDeleted(
  event: Stripe.Event,
  deps: {
    db: {
      cancelSubscription: (stripeSubscriptionId: string, cancelledAt: Date) => Promise<void>;
      revokeUserAccess: (stripeCustomerId: string) => Promise<void>;
      getUserByCustomerId: (customerId: string) => Promise<{ id: string; email: string } | null>;
    };
    email: { sendCancellationConfirmedEmail: (to: string) => Promise<void> };
  }
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const { id, customer, ended_at } = subscription;
  const customerId = typeof customer === "string" ? customer : customer.id;

  // Mark subscription as cancelled
  const cancelledAt = ended_at ? new Date(ended_at * 1000) : new Date();
  await deps.db.cancelSubscription(id, cancelledAt);

  // Revoke feature access
  await deps.db.revokeUserAccess(customerId);

  // Notify the customer
  const user = await deps.db.getUserByCustomerId(customerId);
  if (user) {
    await deps.email.sendCancellationConfirmedEmail(user.email);
  }

  console.log(`Subscription deleted: ${id} for customer ${customerId}`);
}
