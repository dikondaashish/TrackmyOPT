import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  row: null as Record<string, unknown> | null,
  upserted: null as Record<string, unknown> | null,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
    from: mocks.from,
  })),
}));

import { GET, PUT } from "./route";

function query() {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => ({
    data: mocks.row,
    error: null,
  }));
  builder.upsert = vi.fn(async (value: Record<string, unknown>) => {
    mocks.upserted = value;
    mocks.row = value;
    return { error: null };
  });
  return builder;
}

describe("/api/application-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.row = null;
    mocks.upserted = null;
    mocks.getUser.mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    });
    mocks.from.mockImplementation((table: string) => {
      expect(table).toBe("application_profile");
      return query();
    });
  });

  it("returns the complete empty dedicated extension profile", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(body.data).toMatchObject({
      first_name: null,
      last_name: null,
      application_email: null,
      country: null,
      street_address: null,
      zip_code: null,
      county_district: null,
      github_url: null,
    });
  });

  it("validates and stores all ordinary job-portal contact fields", async () => {
    const response = await PUT(
      new NextRequest("https://www.trackmyopt.com/api/application-profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: " Asha ",
          last_name: " Candidate ",
          application_email: "jobs@example.com",
          phone: "+1 555 0100",
          country: "United States",
          street_address: "1 Main Street",
          city: "Boston",
          state: "MA",
          zip_code: "02110",
          county_district: "Suffolk County",
          years_experience: "5",
          linkedin_url: "https://linkedin.com/in/asha",
          github_url: "https://github.com/asha",
          portfolio_url: "https://asha.example.com",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.upserted).toMatchObject({
      user_id: USER_ID,
      first_name: "Asha",
      last_name: "Candidate",
      application_email: "jobs@example.com",
      country: "United States",
      zip_code: "02110",
      county_district: "Suffolk County",
      years_experience: 5,
      github_url: "https://github.com/asha",
    });
  });

  it("rejects invalid email and URL values before writing", async () => {
    const response = await PUT(
      new NextRequest("https://www.trackmyopt.com/api/application-profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          application_email: "not-an-email",
          github_url: "not-a-url",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.upserted).toBeNull();
  });
});
