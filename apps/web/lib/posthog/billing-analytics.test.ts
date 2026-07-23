import { describe, expect, it } from "vitest";
import {
  billingInsertId,
  buildPaymentSucceededCapture,
  isNorthStarFunnelEvent,
  NORTH_STAR_FUNNEL_EVENTS,
} from "./billing-analytics";

describe("billing-analytics", () => {
  it("billingInsertId is stable per Stripe event", () => {
    expect(billingInsertId("payment_succeeded", "evt_123")).toBe(
      "payment_succeeded:evt_123"
    );
  });

  it("buildPaymentSucceededCapture includes dedupe id and defaults", () => {
    const capture = buildPaymentSucceededCapture({
      stripeEventId: "evt_abc",
      planTier: "premium",
      interval: "month",
      amountCents: 999,
      currency: "usd",
    });
    expect(capture.$insert_id).toBe("payment_succeeded:evt_abc");
    expect(capture.plan_tier).toBe("premium");
    expect(capture.interval).toBe("month");
    expect(capture.amount_cents).toBe(999);
    expect(capture.is_upgrade).toBe(false);
  });

  it("north-star funnel lists checkout before subscription", () => {
    expect(NORTH_STAR_FUNNEL_EVENTS).toEqual([
      "user_signed_up",
      "receipt_added",
      "case_status_check_completed",
      "upgrade_prompt_shown",
      "checkout_started",
      "subscription_started",
    ]);
    expect(isNorthStarFunnelEvent("checkout_started")).toBe(true);
    expect(isNorthStarFunnelEvent("payment_failed")).toBe(false);
  });
});
