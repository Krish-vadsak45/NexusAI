import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import Subscription from "@/models/Subscription.model";
import connectToDatabase from "@/lib/db";
import { assertRecentStepUp } from "@/lib/security/step-up";
import { createAuditLog } from "@/lib/security/audit";

export async function POST() {
  try {
    await connectToDatabase();
    const session = await assertRecentStepUp(
      await headers(),
      "billing:manage",
    );

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await Subscription.findOne({ user: session.user.id });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    await createAuditLog({
      action: "billing.portal.open",
      actor: session.user.id,
      targetType: "subscription",
      targetId: subscription.stripeSubscriptionId ?? subscription.stripeCustomerId,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.toLowerCase().includes("step-up") ? 403 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 },
    );
  }
}
