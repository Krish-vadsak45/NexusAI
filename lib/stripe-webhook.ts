import Stripe from "stripe";
import logger from "./logger";

export async function handleStripeWebhookEvent(
  event: Stripe.Event,
  deps: {
    retrieveSubscription: (subscriptionId: string) => Promise<Stripe.Subscription>;
    findUserExists: (userId: string) => Promise<boolean>;
    updateSubscription: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
    ) => Promise<unknown>;
    getPlanIdFromPriceId: (priceId: string) => string;
    createAudit: (entry: Record<string, unknown>) => Promise<unknown>;
  },
) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session.subscription) return;

      const subscription = await deps.retrieveSubscription(
        session.subscription as string,
      );
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (!userId || !planId) return;
      const userExists = await deps.findUserExists(userId);
      if (!userExists) {
        logger.error({ userId, planId }, "Webhook: User not found for subscription update");
        return;
      }

      const currentPeriodEnd = (subscription as Stripe.Subscription & {
        current_period_end?: number;
      }).current_period_end;

      await deps.updateSubscription(
        { user: userId },
        {
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          planId,
          status: "active",
          currentPeriodEnd:
            typeof currentPeriodEnd === "number"
              ? new Date(currentPeriodEnd * 1000)
              : new Date(),
        },
      );

      await deps.createAudit({
        action: "stripe.checkout.completed",
        actor: userId,
        targetType: "subscription",
        targetId: session.subscription,
        data: { planId },
      });
      return;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription;
      };
      const subscriptionId = invoice.subscription as string;
      if (!subscriptionId) return;

      const subscription = await deps.retrieveSubscription(subscriptionId);
      const currentPeriodEnd = (subscription as Stripe.Subscription & {
        current_period_end?: number;
      }).current_period_end;

      await deps.updateSubscription(
        { stripeSubscriptionId: subscription.id },
        {
          status: "active",
          currentPeriodEnd:
            typeof currentPeriodEnd === "number"
              ? new Date(currentPeriodEnd * 1000)
              : new Date(),
        },
      );
      return;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0].price.id;
      await deps.updateSubscription(
        { stripeSubscriptionId: subscription.id },
        {
          planId: deps.getPlanIdFromPriceId(priceId),
          status: subscription.status,
          currentPeriodEnd:
            typeof (subscription as Stripe.Subscription & { current_period_end?: number })
              .current_period_end === "number"
              ? new Date(
                  ((subscription as Stripe.Subscription & {
                    current_period_end?: number;
                  }).current_period_end as number) * 1000,
                )
              : new Date(),
        },
      );
      return;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await deps.updateSubscription(
        { stripeSubscriptionId: subscription.id },
        { status: "cancelled", planId: "free" },
      );
    }
  }
}
