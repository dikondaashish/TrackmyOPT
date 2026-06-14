import { describe, expect, it } from "vitest";
import { parseNearbyScanCronParams } from "../nearby-scan-cron-params";

describe("parseNearbyScanCronParams", () => {
  it("uses defaults when params are missing", () => {
    expect(parseNearbyScanCronParams(new URLSearchParams())).toEqual({
      centers: 5,
      range: 100,
    });
  });

  it("clamps centers and range to allowed bounds", () => {
    const params = parseNearbyScanCronParams(
      new URLSearchParams({ centers: "99", range: "9999" })
    );
    expect(params.centers).toBe(20);
    expect(params.range).toBe(500);
  });

  it("clamps low values up to minimums", () => {
    const params = parseNearbyScanCronParams(
      new URLSearchParams({ centers: "0", range: "-5" })
    );
    expect(params.centers).toBe(1);
    expect(params.range).toBe(1);
  });

  it("falls back to defaults for non-numeric input", () => {
    const params = parseNearbyScanCronParams(
      new URLSearchParams({ centers: "abc", range: "xyz" })
    );
    expect(params).toEqual({ centers: 5, range: 100 });
  });
});
