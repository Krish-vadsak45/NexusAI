import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, getPlanIdFromPriceId } from "@/lib/stripe";
import SubscriptionModel from "@/models/Subscription.model";
import connectToDatabase from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  await connectToDatabase();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (!session.subscription) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          const currentPeriodEnd = (subscription as any).current_period_end;
          await SubscriptionModel.findOneAndUpdate(
            { user: userId },
            {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              planId: planId,
              status: "active",
              currentPeriodEnd:
                typeof currentPeriodEnd === "number"
                  ? new Date(currentPeriodEnd * 1000)
                  : new Date(),
            },
            { upsert: true, new: true }
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = (invoice as any).subscription as string;

        if (!subscriptionId) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        const currentPeriodEnd = (subscription as any).current_period_end;

        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: "active",
            currentPeriodEnd:
              typeof currentPeriodEnd === "number"
                ? new Date(currentPeriodEnd * 1000)
                : new Date(),
          }
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const planId = getPlanIdFromPriceId(priceId);

        const currentPeriodEnd = (subscription as any)?.current_period_end;

        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            planId: planId,
            status: subscription.status,
            currentPeriodEnd:
              typeof currentPeriodEnd === "number"
                ? new Date(currentPeriodEnd * 1000)
                : new Date(),
          }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: "cancelled",
            planId: "free",
          }
        );
        break;
      }
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
