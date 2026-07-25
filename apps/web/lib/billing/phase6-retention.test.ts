import { describe, expect, it } from "vitest";
import { DEDICATED_OPEN_FOR_NEW_PURCHASES } from "@/lib/pricing/dedicated-availability";
import { shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";
import {
  buildSubscriptionEndedEmailBodies,
  buildUnusedCancelWinbackEmailBodies,
} from "@/lib/notifications/transactional-emails";
import { resolveCheckoutResumeUrl } from "@/lib/billing/checkout-recovery";

describe("Phase 6 Dedicated + win-back", () => {
  it("keeps Dedicated closed for new purchases", () => {
    expect(DEDICATED_OPEN_FOR_NEW_PURCHASES).toBe(false);
    expect(shouldShowDedicatedPlanForSale()).toBe(false);
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

  it("checkout recovery never resumes Dedicated while closed", () => {
    const result = resolveCheckoutResumeUrl({
      appBaseUrl: "https://www.trackmyopt.com",
      planId: "dedicated",
      billingInterval: "year",
      stripeSession: null,
    });
    expect(result.url).toContain("planId=pro");
    expect(result.url).not.toContain("planId=dedicated");
  });
});
