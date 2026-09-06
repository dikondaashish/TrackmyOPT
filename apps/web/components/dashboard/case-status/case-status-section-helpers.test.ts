import { describe, expect, it } from "vitest";
import {
  findRfeDate,
  selectActiveCase,
} from "@/components/dashboard/case-status/case-status-section-helpers";

describe("case-status-section-helpers", () => {
  it("selectActiveCase prefers preferredId, then primaryCaseId, then is_primary", () => {
    const cases = [
      { id: "a", is_primary: false },
      { id: "b", is_primary: true },
      { id: "c", is_primary: false },
    ];
    expect(selectActiveCase(cases, "c").id).toBe("c");
    expect(selectActiveCase(cases, null, "a").id).toBe("a");
    expect(selectActiveCase(cases).id).toBe("b");
  });

  it("findRfeDate returns the RFE entry date when present", () => {
    expect(
      findRfeDate([
        { status: "Case Was Received", date: "2024-01-01" },
        { status: "Request for Evidence Was Sent", date: "2024-02-15" },
      ])
    ).toBe("2024-02-15");
    expect(findRfeDate([{ status: "Approved", date: "2024-03-01" }])).toBeNull();
  });
});
