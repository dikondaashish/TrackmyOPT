import { describe, expect, it } from "vitest";
import { buildCheckoutRecoveryEmailBodies } from "@/lib/notifications/transactional/reengagement";
import { buildPaymentFailedEmailBodies } from "@/lib/notifications/transactional/billing";

describe("Phase 5 payment recovery emails", () => {
  it("payment-failed CTA prefers portal update URL", () => {
    const { html, text } = buildPaymentFailedEmailBodies({
      firstName: "Ada",
      planLabel: "TrackMyOPT Premium (pro)",
      amountCents: 499,
      currency: "usd",
      updatePaymentUrl: "https://billing.stripe.com/p/session/test",
    });
    expect(html).toContain("https://billing.stripe.com/p/session/test");
    expect(html).toContain("Update payment method");
    expect(text).toContain("https://billing.stripe.com/p/session/test");
  });

  it("checkout recovery can resume an open session URL", () => {
    const { html, text } = buildCheckoutRecoveryEmailBodies("Ada", {
      checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_abc",
      resumeKind: "open_session",
    });
    expect(html).toContain("https://checkout.stripe.com/c/pay/cs_test_abc");
    expect(html).toMatch(/resumes your open Stripe checkout/i);
    expect(text).toMatch(/resumes your open Stripe checkout/i);
  });

  it("checkout recovery defaults to annual Pro fresh checkout", () => {
    const { html } = buildCheckoutRecoveryEmailBodies(null);
    expect(html).toContain("/premium/checkout?planId=pro&interval=year");
  });
});
