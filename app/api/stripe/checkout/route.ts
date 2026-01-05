import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe, PLAN_ID_TO_PRICE_ID } from "@/lib/stripe";
import Subscription from "@/models/Subscription.model";
import connectToDatabase from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // 1. Fetch current subscription
    const subscription = await Subscription.findOne({ user: session.user.id });

    // ============================================================
    // SCENARIO 1: User wants to switch to FREE (Cancel Subscription)
    // ============================================================
    if (planId === "free") {
      if (
        subscription?.stripeSubscriptionId &&
        subscription?.status === "active"
      ) {
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        // Optional: Update local DB immediately or wait for webhook
        // We'll wait for the webhook to handle the status change to 'past_due' or 'cancelled'

        return NextResponse.json({
          url: "/dashboard",
          message:
            "Subscription cancelled. You will remain on your plan until the end of the billing period.",
        });
      }
      return NextResponse.json({ url: "/dashboard" });
    }

    // ============================================================
    // SCENARIO 2: User wants to switch PAID plans (Pro <-> Premium)
    // ============================================================
    const priceId =
      PLAN_ID_TO_PRICE_ID[planId as keyof typeof PLAN_ID_TO_PRICE_ID];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // If user already has an active subscription, send them to the Portal to manage it
    // This handles Proration (charging the difference) automatically.
    if (
      subscription?.status === "active" &&
      subscription?.stripeSubscriptionId
    ) {
      // Create a portal session specifically for updating the subscription
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId!,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        flow_data: {
          type: "subscription_update",
          subscription_update: {
            subscription: subscription.stripeSubscriptionId,
          },
        },
      });

      return NextResponse.json({ url: portalSession.url });
    }

    // ============================================================
    // SCENARIO 3: New Subscription (Free -> Paid)
    // ============================================================
    let customerId = subscription?.stripeCustomerId;

    // If no customer ID, create one in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: planId,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
