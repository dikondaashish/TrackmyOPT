import { beforeAll, describe, expect, it } from "vitest";
import type Stripe from "stripe";
import {
  compareSubscriptions,
  getPlanFromStripePriceId,
  getPlanFromSubscription,
  getTierRank,
  isValidAccessSubscription,
  pickBestSubscription,
  subscriptionCanGrantTargetPlan,
  subscriptionHasPendingUpdate,
} from "../stripeSubscriptionSync";

const PRICE_PRO = "price_test_pro_m";
const PRICE_DEDICATED = "price_test_dedicated_m";

function mockSub(partial: {
  id: string;
  status: Stripe.Subscription.Status;
  planId?: string;
  priceId?: string;
  pendingUpdate?: boolean;
}): Stripe.Subscription {
  return {
    id: partial.id,
    status: partial.status,
    metadata: partial.planId ? { planId: partial.planId } : {},
    items: {
      data: [
        {
          id: `si_${partial.id}`,
          price: { id: partial.priceId || "price_unknown" },
        },
      ],
    } as Stripe.Subscription["items"],
    ...(partial.pendingUpdate ? { pending_update: { expires_at: 1 } } : {}),
  } as Stripe.Subscription;
}

beforeAll(() => {
  process.env.STRIPE_PRICE_PRO_MONTHLY = PRICE_PRO;
  process.env.STRIPE_PRICE_PRO_YEARLY = "price_test_pro_y";
  process.env.STRIPE_PRICE_DEDICATED_MONTHLY = PRICE_DEDICATED;
  process.env.STRIPE_PRICE_DEDICATED_YEARLY = "price_test_dedicated_y";
});

describe("stripeSubscriptionSync", () => {
  it("ranks Dedicated above Pro", () => {
    expect(getTierRank("dedicated")).toBeGreaterThan(getTierRank("pro"));
  });

  it("pickBestSubscription prefers Dedicated active over Pro trialing", () => {
    const dedicated = mockSub({
      id: "sub_d",
      status: "active",
      priceId: PRICE_DEDICATED,
      planId: "dedicated",
    });
    const proTrial = mockSub({
      id: "sub_p",
      status: "trialing",
      priceId: PRICE_PRO,
      planId: "pro",
    });
    const best = pickBestSubscription([proTrial, dedicated]);
    expect(best?.id).toBe("sub_d");
  });

  it("excludes subscriptions with pending_update from pickBest", () => {
    const pendingDedicated = mockSub({
      id: "sub_pending",
      status: "active",
      priceId: PRICE_DEDICATED,
      planId: "dedicated",
      pendingUpdate: true,
    });
    const proTrial = mockSub({
      id: "sub_p",
      status: "trialing",
      priceId: PRICE_PRO,
      planId: "pro",
    });
    const best = pickBestSubscription([pendingDedicated, proTrial]);
    expect(best?.id).toBe("sub_p");
  });

  it("compareSubscriptions orders by tier then status", () => {
    const a = mockSub({ id: "a", status: "trialing", priceId: PRICE_PRO, planId: "pro" });
    const b = mockSub({ id: "b", status: "active", priceId: PRICE_PRO, planId: "pro" });
    expect(compareSubscriptions(a, b)).toBeGreaterThan(0);
  });

  it("detects pending_update", () => {
    const sub = mockSub({ id: "x", status: "active", pendingUpdate: true });
    expect(subscriptionHasPendingUpdate(sub)).toBe(true);
  });

  it("getPlanFromStripePriceId reads env map when set", () => {
    expect(getPlanFromStripePriceId(PRICE_PRO)).toBe("pro");
    expect(getPlanFromStripePriceId(PRICE_DEDICATED)).toBe("dedicated");
  });

  it("A: unpaid subscription is not access-valid", () => {
    const sub = mockSub({ id: "sub_u", status: "unpaid", priceId: PRICE_PRO, planId: "pro" });
    expect(isValidAccessSubscription(sub)).toBe(false);
    expect(subscriptionCanGrantTargetPlan(sub)).toBe(false);
  });

  it("B: Dedicated past_due does not grant Dedicated access", () => {
    const sub = mockSub({
      id: "sub_pd",
      status: "past_due",
      priceId: PRICE_DEDICATED,
      planId: "dedicated",
    });
    expect(isValidAccessSubscription(sub)).toBe(true);
    expect(subscriptionCanGrantTargetPlan(sub)).toBe(false);
    expect(subscriptionCanGrantTargetPlan(sub, "dedicated")).toBe(false);
  });

  it("C: Dedicated unpaid is not access-valid and cannot grant", () => {
    const sub = mockSub({
      id: "sub_ud",
      status: "unpaid",
      priceId: PRICE_DEDICATED,
      planId: "dedicated",
    });
    expect(isValidAccessSubscription(sub)).toBe(false);
    expect(subscriptionCanGrantTargetPlan(sub, "dedicated")).toBe(false);
  });

  it("D: Pro trialing still grants Pro trial access", () => {
    const sub = mockSub({
      id: "sub_pt",
      status: "trialing",
      priceId: PRICE_PRO,
      planId: "pro",
    });
    expect(subscriptionCanGrantTargetPlan(sub)).toBe(true);
    expect(subscriptionCanGrantTargetPlan(sub, "pro")).toBe(true);
    expect(getPlanFromSubscription(sub)).toBe("pro");
  });

  it("E: Pro past_due still grants Pro access (dunning grace)", () => {
    const sub = mockSub({
      id: "sub_pp",
      status: "past_due",
      priceId: PRICE_PRO,
      planId: "pro",
    });
    expect(subscriptionCanGrantTargetPlan(sub)).toBe(true);
    expect(getPlanFromSubscription(sub)).toBe("pro");
  });

  it("F: getPlanFromSubscription prefers price ID over metadata", () => {
    const proPriceDedicatedMeta = mockSub({
      id: "sub_1",
      status: "active",
      priceId: PRICE_PRO,
      planId: "dedicated",
    });
    expect(getPlanFromSubscription(proPriceDedicatedMeta)).toBe("pro");

    const dedicatedPriceProMeta = mockSub({
      id: "sub_2",
      status: "active",
      priceId: PRICE_DEDICATED,
      planId: "pro",
    });
    expect(getPlanFromSubscription(dedicatedPriceProMeta)).toBe("dedicated");
  });

  it("G: stale dedicated metadata with Pro price does not grant Dedicated", () => {
    const sub = mockSub({
      id: "sub_stale",
      status: "past_due",
      priceId: PRICE_PRO,
      planId: "dedicated",
    });
    expect(getPlanFromSubscription(sub)).toBe("pro");
    expect(subscriptionCanGrantTargetPlan(sub, "dedicated")).toBe(false);

    const best = pickBestSubscription([
      sub,
      mockSub({ id: "sub_trial", status: "trialing", priceId: PRICE_PRO, planId: "pro" }),
    ]);
    expect(best?.id).toBe("sub_trial");
    expect(getPlanFromSubscription(best!)).toBe("pro");
  });

  it("pickBest skips Dedicated past_due when Pro trialing exists", () => {
    const dedicatedPastDue = mockSub({
      id: "sub_d_pd",
      status: "past_due",
      priceId: PRICE_DEDICATED,
      planId: "dedicated",
    });
    const proTrial = mockSub({
      id: "sub_p",
      status: "trialing",
      priceId: PRICE_PRO,
      planId: "pro",
    });
    const best = pickBestSubscription([dedicatedPastDue, proTrial]);
    expect(best?.id).toBe("sub_p");
  });
});
