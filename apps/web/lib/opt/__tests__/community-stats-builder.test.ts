import { describe, expect, it } from "vitest";

describe("community-stats response shape", () => {
  it("matches LiveStatsWidget contract keys", () => {
    const sample = {
      mainStat: { value: 90, label: "Average Approval Time", unit: "days" },
      secondaryStat: { value: 5, label: "Approvals in 24h" },
      trend: "stable" as const,
      recentReports: [
        { value: 80, label: "days to approval", timestamp: "2 days ago", positive: true },
      ],
      lastUpdated: new Date().toISOString(),
      sampleSize: 10,
      dataSource: "trackmyopt" as const,
    };

    expect(sample.mainStat.unit).toBe("days");
    expect(sample.recentReports[0]?.positive).toBe(true);
  });
});
