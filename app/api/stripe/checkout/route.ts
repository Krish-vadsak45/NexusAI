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
    const priceId =
      PLAN_ID_TO_PRICE_ID[planId as keyof typeof PLAN_ID_TO_PRICE_ID];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // 1. Check if user already has a subscription
    const subscription = await Subscription.findOne({ user: session.user.id });

    let customerId = subscription?.stripeCustomerId;

    // 2. If no customer ID, create one in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    // 3. If user is already subscribed, redirect to portal instead of checkout
    if (
      subscription?.status === "active" &&
      subscription?.stripeSubscriptionId
    ) {
      return NextResponse.json({ url: "/dashboard/billing" }); // Or handle upgrade logic here
    }

    // 4. Create Checkout Session
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
