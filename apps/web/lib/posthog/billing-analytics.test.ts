import { describe, expect, it } from "vitest";
import {
  billingInsertId,
  buildPaymentSucceededCapture,
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
});
