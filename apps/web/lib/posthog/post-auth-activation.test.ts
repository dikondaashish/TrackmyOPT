import { describe, expect, it } from "vitest";
import { DEFAULT_POST_AUTH_PATH } from "@/lib/auth/post-auth-landing";
import { safeInternalRedirectTarget } from "@/lib/auth/safe-oauth-redirect";
import {
  buildD1ActivationNudgeEmailBodies,
  buildFreeReceiptReengagementEmailBodies,
} from "@/lib/notifications/transactional/reengagement";

describe("Post-auth landing", () => {
  it("defaults to dashboard after auth", () => {
    expect(DEFAULT_POST_AUTH_PATH).toBe("/dashboard");
  });

  it("OAuth fallback lands on dashboard", () => {
    const url = safeInternalRedirectTarget(null, "https://www.trackmyopt.com");
    expect(url.pathname).toBe("/dashboard");
  });
});

describe("Activation emails", () => {
  it("D1 nudge pushes add-receipt → case-status → Pro trial", () => {
    const { subject, html, text } = buildD1ActivationNudgeEmailBodies({
      firstName: "Ada",
      hasCaseStatus: false,
      caseStatusText: null,
      optHeadline: null,
    });

    expect(subject.toLowerCase()).toMatch(/receipt|activat/);
    expect(html).toContain("/dashboard/case-status");
    expect(html).toMatch(/Add your receipt|Pro for \$0\.99 for 7 days/i);
    expect(html).not.toMatch(/completed onboarding/i);
    expect(text).toContain("/dashboard/case-status");
    expect(text).not.toMatch(/Open dashboard:\s*https?:\/\/[^/]+\/dashboard\s*$/m);
  });

  it("free-receipt reengagement CTA is Pro trial + case status", () => {
    const { subject, html, text } = buildFreeReceiptReengagementEmailBodies("Ada");

    expect(subject.toLowerCase()).toMatch(/pro|auto-check/);
    expect(html).toContain("/premium/checkout?planId=pro");
    expect(html).toContain("Get Pro");
    expect(html).toContain("/dashboard/case-status");
    expect(text).toContain("Get Pro");
  });
});
