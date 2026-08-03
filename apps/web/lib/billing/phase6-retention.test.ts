import { describe, expect, it } from "vitest";
import { DEDICATED_OPEN_FOR_NEW_PURCHASES } from "@/lib/pricing/dedicated-availability";
import { shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";
import {
  buildSubscriptionEndedEmailBodies,
  buildUnusedCancelWinbackEmailBodies,
} from "@/lib/notifications/transactional/billing";
import { resolveCheckoutResumeUrl } from "@/lib/billing/checkout-recovery";

describe("Phase 6 Dedicated + win-back", () => {
  it("offers Dedicated for new purchases now that attorney scheduling is delivered", () => {
    expect(DEDICATED_OPEN_FOR_NEW_PURCHASES).toBe(true);
    expect(shouldShowDedicatedPlanForSale()).toBe(true);
  });

  it("subscription-ended CTA pushes annual Pro auto-check reopen", () => {
    const { subject, html, text } = buildSubscriptionEndedEmailBodies({
      firstName: "Ada",
      accessEndedDate: "Jul 23, 2026",
    });
    expect(subject).toMatch(/auto-checks your case daily/i);
    expect(html).toContain("/premium/checkout?planId=pro&interval=year");
    expect(text).toMatch(/reopen alerts/i);
  });

  it("unused cancel win-back leads with daily auto-check message", () => {
    const { subject, html } = buildUnusedCancelWinbackEmailBodies({ firstName: "Ada" });
    expect(subject).toMatch(/auto-checks your case daily/i);
    expect(html).toContain("/premium/checkout?planId=pro&interval=year");
    expect(html).toMatch(/getting used/i);
  });

  it("checkout recovery resumes Dedicated while it is open for sale", () => {
    const result = resolveCheckoutResumeUrl({
      appBaseUrl: "https://www.trackmyopt.com",
      planId: "dedicated",
      billingInterval: "year",
      stripeSession: null,
    });
    // An abandoned Dedicated checkout should resume as Dedicated. It is
    // downgraded to Pro only while DEDICATED_OPEN_FOR_NEW_PURCHASES is false,
    // so this assertion tracks the flag rather than hardcoding a plan.
    expect(result.url).toContain(
      DEDICATED_OPEN_FOR_NEW_PURCHASES ? "planId=dedicated" : "planId=pro"
    );
  });
});
