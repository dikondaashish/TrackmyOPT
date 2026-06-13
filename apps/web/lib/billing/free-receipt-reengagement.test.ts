import { describe, expect, it } from "vitest";
import { FREE_RECEIPT_REENGAGEMENT_DEFAULT_BATCH } from "./free-receipt-reengagement";

describe("free-receipt-reengagement constants", () => {
  it("uses a conservative default batch size", () => {
    expect(FREE_RECEIPT_REENGAGEMENT_DEFAULT_BATCH).toBe(25);
  });
});
