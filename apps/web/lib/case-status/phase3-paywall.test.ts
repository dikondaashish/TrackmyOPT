import { describe, expect, it } from "vitest";
import { CHECKOUT_UPSELL_TRIGGER } from "./free-change-wedge";
import { CASE_STATUS_MESSAGING, PRODUCT_CTAS } from "@/lib/messaging/product-copy";

describe("Phase 3 paywall triggers", () => {
  it("exports at least three instrumented checkout upsell triggers", () => {
    const triggers = Object.values(CHECKOUT_UPSELL_TRIGGER);
    expect(triggers.length).toBeGreaterThanOrEqual(3);
    expect(triggers).toContain("status_change_wedge");
    expect(triggers).toContain("second_manual_refresh");
    expect(triggers).toContain("stale_status");
    expect(triggers).toContain("receipt_added");
    expect(triggers.every((t) => typeof t === "string" && t.length > 0)).toBe(
      true
    );
  });

  it("uses trial CTA and canonical Free/Pro copy", () => {
    expect(PRODUCT_CTAS.startTrial).toMatch(/7-day/i);
    expect(CASE_STATUS_MESSAGING.statusChangeHeadline).toMatch(/Alerts \+ daily/i);
    expect(CASE_STATUS_MESSAGING.receiptAddedNotice).toMatch(/Manual refresh/i);
    expect(CASE_STATUS_MESSAGING.trialCtaStrip).toMatch(/7-day free trial/i);
    expect(CASE_STATUS_MESSAGING.freeProCanonical).toMatch(/Free:/);
    expect(CASE_STATUS_MESSAGING.freeProCanonical).toMatch(/Pro:/);
  });
});
