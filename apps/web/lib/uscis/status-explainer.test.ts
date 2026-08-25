import { describe, expect, it } from "vitest";
import { getStatusExplainer, isPlaceholderStatus } from "./status-explainer";

describe("getStatusExplainer", () => {
  it("maps pending statuses to reassuring copy", () => {
    const result = getStatusExplainer("Case Is Being Actively Reviewed By USCIS");
    expect(result.category).toBe("pending");
    expect(result.meaning).toMatch(/still processing/i);
    expect(result.nextStep).toMatch(/no action needed/i);
    expect(result.showUscisLink).toBe(false);
  });

  it("maps RFE statuses with urgent next step", () => {
    const result = getStatusExplainer("Request for Additional Evidence Was Sent");
    expect(result.category).toBe("rfe");
    expect(result.tone).toBe("urgent");
    expect(result.showUscisLink).toBe(true);
  });

  it("maps denied statuses", () => {
    const result = getStatusExplainer("Case Was Denied");
    expect(result.category).toBe("denied");
    expect(result.nextStep).toMatch(/DSO|attorney/i);
  });

  it("maps unrecognized text to other with USCIS link", () => {
    const result = getStatusExplainer("Some uncommon USCIS wording here");
    expect(result.category).toBe("other");
    expect(result.showUscisLink).toBe(true);
  });

  it("uses the current 30-business-day I-765 premium-processing timeframe", () => {
    const result = getStatusExplainer("Changed to Premium Processing");
    expect(result.meaning).toMatch(/30 business days/i);
    expect(result.nextStep).not.toMatch(/15 business days/i);
  });

  it("handles empty status as unknown", () => {
    const result = getStatusExplainer(null);
    expect(result.category).toBe("unknown");
    expect(result.showUscisLink).toBe(true);
  });
});

describe("isPlaceholderStatus", () => {
  it("detects fetch placeholders", () => {
    expect(isPlaceholderStatus("Status will be fetched shortly...")).toBe(true);
    expect(isPlaceholderStatus("Case Was Received")).toBe(false);
  });
});
