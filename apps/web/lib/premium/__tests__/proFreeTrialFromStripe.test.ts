import { describe, expect, it } from "vitest";
import type Stripe from "stripe";
import { stripeSubscriptionUsesProPrice } from "../proFreeTrialFromStripe";

function sub(partial: Partial<Stripe.Subscription> & { items: Stripe.Subscription["items"] }): Stripe.Subscription {
  return partial as Stripe.Subscription;
}

describe("stripeSubscriptionUsesProPrice", () => {
  const priceIds = new Set(["price_pro_m", "price_pro_y"]);

  it("returns true when metadata.planId is pro", () => {
    expect(
      stripeSubscriptionUsesProPrice(
        sub({
          metadata: { planId: "pro" },
          items: { data: [], object: "list", has_more: false, url: "" },
        }),
        new Set(),
      ),
    ).toBe(true);
  });

  it("returns true when an item price matches", () => {
    expect(
      stripeSubscriptionUsesProPrice(
        sub({
          metadata: {},
          items: {
            object: "list",
            has_more: false,
            url: "",
            data: [{ price: { id: "price_pro_m" } } as Stripe.SubscriptionItem],
          },
        }),
        priceIds,
      ),
    ).toBe(true);
  });

  it("returns false for dedicated-only price", () => {
    expect(
      stripeSubscriptionUsesProPrice(
        sub({
          metadata: { planId: "dedicated" },
          items: {
            object: "list",
            has_more: false,
            url: "",
            data: [{ price: { id: "price_dedicated_m" } } as Stripe.SubscriptionItem],
          },
        }),
        priceIds,
      ),
    ).toBe(false);
  });
});
