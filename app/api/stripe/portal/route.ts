import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import Subscription from "@/models/Subscription.model";
import connectToDatabase from "@/lib/db";
import { NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/errors";

export const POST = withApiHandler(async () => {
  await connectToDatabase();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const subscription = await Subscription.findOne({ user: session.user.id });

  if (!subscription?.stripeCustomerId) {
    throw new NotFoundError("No subscription found");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
});
