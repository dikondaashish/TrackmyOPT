import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryLive: vi.fn(),
}));

vi.mock("@/lib/upstash-redis", () => ({
  hasUpstashRedisConfig: () => false,
}));

vi.mock("./live-lookup", () => ({
  normalizeCompanyName: (value: string) => value.trim().toLowerCase(),
  fetchRobotsPolicy: vi.fn(async () => ({
    crawlDelaySeconds: 0,
    rawText: "User-agent: *",
  })),
  queryEVerifyLive: mocks.queryLive,
  selectBestEmployerMatch: (
    _company: string,
    records: Array<Record<string, unknown>>
  ) => records[0] ?? null,
}));

import { lookupEVerifyCompany } from "./lookup-service";

describe("E-Verify lookup cache and in-flight coordination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs one live query for simultaneous same-company requests", async () => {
    mocks.queryLive.mockResolvedValue([
      {
        employer_name: "Concurrent Test Company",
        dba_name: null,
        status: "enrolled",
        enrollment_date: "2026-01-01",
        termination_date: null,
        workforce_size_band: "5 to 9",
        hiring_site_states: ["NY"],
      },
    ]);

    const [first, second] = await Promise.all([
      lookupEVerifyCompany("Concurrent Test Company"),
      lookupEVerifyCompany("Concurrent Test Company"),
    ]);

    expect(mocks.queryLive).toHaveBeenCalledTimes(1);
    expect(first.source).toBe("live");
    expect(second.source).toBe("cache");
    expect(second.last_checked).toBe(first.last_checked);
  });

  it("uses the 24-hour cache for a later repeat lookup", async () => {
    mocks.queryLive.mockResolvedValue([
      {
        employer_name: "Later Cache Test Company",
        dba_name: null,
        status: "enrolled",
        enrollment_date: "2026-01-02",
        termination_date: null,
        workforce_size_band: "10 to 19",
        hiring_site_states: ["CA"],
      },
    ]);

    const first = await lookupEVerifyCompany("Later Cache Test Company");
    const second = await lookupEVerifyCompany("Later Cache Test Company");

    expect(mocks.queryLive).toHaveBeenCalledTimes(1);
    expect(first.source).toBe("live");
    expect(second.source).toBe("cache");
  });
});
