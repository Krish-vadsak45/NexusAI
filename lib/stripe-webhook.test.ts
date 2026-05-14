import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { handleStripeWebhookEvent } from "./stripe-webhook";

describe("handleStripeWebhookEvent", () => {
  it("updates subscription on checkout completion", async () => {
    const updateSubscription = vi.fn();
    const createAudit = vi.fn();
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          subscription: "sub_123",
          customer: "cus_123",
          metadata: { userId: "user_1", planId: "pro" },
        },
      },
    } as unknown as Stripe.Event;

    await handleStripeWebhookEvent(event, {
      retrieveSubscription: vi.fn().mockResolvedValue({
        id: "sub_123",
        current_period_end: 1710000000,
      }),
      findUserExists: vi.fn().mockResolvedValue(true),
      updateSubscription,
      getPlanIdFromPriceId: vi.fn(),
      createAudit,
    });

    expect(updateSubscription).toHaveBeenCalled();
    expect(createAudit).toHaveBeenCalled();
  });

  it("downgrades to free on subscription deletion", async () => {
    const updateSubscription = vi.fn();
    const event = {
      type: "customer.subscription.deleted",
      data: {
        object: { id: "sub_456" },
      },
    } as unknown as Stripe.Event;

    await handleStripeWebhookEvent(event, {
      retrieveSubscription: vi.fn(),
      findUserExists: vi.fn(),
      updateSubscription,
      getPlanIdFromPriceId: vi.fn(),
      createAudit: vi.fn(),
    });

    expect(updateSubscription).toHaveBeenCalledWith(
      { stripeSubscriptionId: "sub_456" },
      { status: "cancelled", planId: "free" },
    );
  });
});
