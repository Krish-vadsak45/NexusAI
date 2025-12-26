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
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          await SubscriptionModel.findOneAndUpdate(
            { user: userId },
            {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              planId: planId,
              status: "active",
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
            },
            { upsert: true, new: true }
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(
          (invoice as any).subscription as string
        );

        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: "active",
            currentPeriodEnd: new Date(
              (subscription as any).current_period_end * 1000
            ),
          }
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const priceId = subscription.items.data[0].price.id;
        const planId = getPlanIdFromPriceId(priceId);

        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            planId: planId,
            status: subscription.status,
            currentPeriodEnd: new Date(
              (subscription as any).current_period_end * 1000
            ),
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
