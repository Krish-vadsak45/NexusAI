import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, getPlanIdFromPriceId } from "@/lib/stripe";
import SubscriptionModel from "@/models/Subscription.model";
import User from "@/models/user.model";
import connectToDatabase from "@/lib/db";
import logger from "@/lib/logger";
import { getErrorMessage } from "@/lib/error-utils";
import Audit from "@/models/Audit.model";
import { createRequestContext, logRequestCompleted } from "@/lib/observability";
import { handleStripeWebhookEvent } from "@/lib/stripe-webhook";

export async function POST(req: Request) {
  const requestContext = createRequestContext(req);
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: unknown) {
    return new NextResponse(
      `Webhook Error: ${getErrorMessage(error, "Invalid webhook payload")}`,
      { status: 400 },
    );
  }

  await connectToDatabase();

  try {
    await handleStripeWebhookEvent(event, {
      retrieveSubscription: (subscriptionId) =>
        stripe.subscriptions.retrieve(subscriptionId),
      findUserExists: async (userId) => Boolean(await User.exists({ _id: userId })),
      updateSubscription: (filter, update) =>
        SubscriptionModel.findOneAndUpdate(filter, update, {
          upsert: true,
          new: true,
        }),
      getPlanIdFromPriceId,
      createAudit: (entry) => Audit.create(entry),
    });
  } catch (error) {
    logger.error({ err: error }, "Error handling webhook");
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  const response = new NextResponse(null, { status: 200 });
  response.headers.set("x-request-id", requestContext.requestId);
  logRequestCompleted(requestContext, {
    statusCode: 200,
    eventType: event.type,
  });
  return response;
}
