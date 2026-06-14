import { describe, expect, it } from "vitest";
import {
  buildOptDistributionData,
  buildWeeklyUnemploymentTrend,
} from "../chart-data";

describe("chart-data", () => {
  it("buildOptDistributionData splits used vs remaining allowance", () => {
    const data = buildOptDistributionData(30, 90);
    expect(data[0].value).toBe(60);
    expect(data[1].value).toBe(30);
  });

  it("buildWeeklyUnemploymentTrend returns 7 points", () => {
    const points = buildWeeklyUnemploymentTrend(
      "2026-01-01",
      "2026-12-31",
      [],
      null,
      null
    );
    expect(points).toHaveLength(7);
    expect(points.every((p) => typeof p.days === "number")).toBe(true);
  });
});
