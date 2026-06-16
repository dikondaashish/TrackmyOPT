import { describe, expect, it } from "vitest";
import { formatUscisStatusDate } from "./case-status-display";
import { getCurrentStatusDetail } from "./current-status-detail";
import { sanitizeUscisDescription } from "./uscis-status-text";

describe("sanitizeUscisDescription", () => {
  it("converts br tags to newlines and strips html", () => {
    const input =
      'We changed your case, Receipt Number IOE9822487119, from a standard case to a premium-processing case.<br> "^ more"';
    expect(sanitizeUscisDescription(input)).toBe(
      "We changed your case, Receipt Number IOE9822487119, from a standard case to a premium-processing case."
    );
  });
});

describe("formatUscisStatusDate", () => {
  it("formats YYYY-MM-DD as May 12, 2026", () => {
    expect(formatUscisStatusDate("2026-05-12")).toBe("May 12, 2026");
  });
});

describe("getCurrentStatusDetail", () => {
  it("sanitizes description and formats history date", () => {
    const detail = getCurrentStatusDetail({
      currentStatus: "Case Was Changed To A Premium Processing Case",
      statusHistory: [
        {
          status: "Case Was Changed To A Premium Processing Case",
          date: "2026-05-12",
          description:
            "We changed your case, Receipt Number IOE9822487119, from a standard case to a premium-processing case.<br>",
        },
      ],
    });

    expect(detail.description).toContain("Receipt Number IOE9822487119");
    expect(detail.description).not.toContain("<br>");
    expect(detail.date).toBe("May 12, 2026");
  });
});
