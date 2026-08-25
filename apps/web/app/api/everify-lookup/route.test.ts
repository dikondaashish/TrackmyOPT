import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  lookup: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
  })),
}));

vi.mock("@/lib/everify/lookup-service", () => ({
  EVerifyLookupUnavailableError: class extends Error {},
  lookupEVerifyCompany: mocks.lookup,
}));

vi.mock("@/lib/auth/api-rate-limit", () => ({
  checkRateLimitByUser: mocks.checkRateLimit,
  rateLimitResponse: vi.fn(),
  addRateLimitHeaders: (response: Response) => response,
}));

import { GET } from "./route";

function request(company: string) {
  return new NextRequest(
    `https://www.trackmyopt.com/api/everify-lookup?company=${encodeURIComponent(company)}`
  );
}

describe("GET /api/everify-lookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mocks.checkRateLimit.mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: 123,
    });
  });

  it("rejects invalid broad input before starting a lookup", async () => {
    const response = await GET(request("A"));
    expect(response.status).toBe(400);
    expect(mocks.lookup).not.toHaveBeenCalled();
  });

  it("requires an authenticated TrackMyOPT user", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await GET(request("Microsoft"));
    expect(response.status).toBe(401);
    expect(mocks.lookup).not.toHaveBeenCalled();
  });

  it("returns the consistent live response shape", async () => {
    mocks.lookup.mockResolvedValue({
      company: "Microsoft",
      found: true,
      employer_name: "Microsoft",
      dba_name: "Microsoft Corporation",
      status: "enrolled",
      enrollment_date: "2026-03-20",
      termination_date: null,
      workforce_size_band: "10,000 and over",
      hiring_site_states: ["WA"],
      source: "live",
      last_checked: "2026-08-25T04:00:00.000Z",
    });

    const response = await GET(request("  Microsoft  "));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      company: "Microsoft",
      found: true,
      status: "enrolled",
      source: "live",
    });
  });

  it("returns found false as a successful lookup", async () => {
    mocks.lookup.mockResolvedValue({
      company: "Deloitte",
      found: false,
      employer_name: null,
      dba_name: null,
      status: null,
      enrollment_date: null,
      termination_date: null,
      workforce_size_band: null,
      hiring_site_states: [],
      source: "cache",
      last_checked: "2026-08-25T04:00:00.000Z",
      message: "No exact employer match was found.",
    });

    const response = await GET(request("Deloitte"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      found: false,
      source: "cache",
    });
  });

  it("returns lookup_unavailable instead of crashing", async () => {
    mocks.lookup.mockRejectedValue(new Error("Tableau changed"));
    const response = await GET(request("Microsoft"));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      found: false,
      error: "lookup_unavailable",
    });
  });
});
