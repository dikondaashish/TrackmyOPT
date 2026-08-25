import { describe, expect, it } from "vitest";
import {
  EVerifyLiveLookupError,
  mapTableauRows,
  normalizeCompanyName,
  normalizePublicDate,
  parseRobotsPolicy,
  selectBestEmployerMatch,
} from "./live-lookup";

const columns = [
  "Employer Name",
  "Doing Business As (DBA) Name",
  "Account Status",
  "Date Enrolled",
  "Date Terminated",
  "Workforce Size",
  "Hiring Site Locations",
];

describe("E-Verify public result normalization", () => {
  it("maps, normalizes, and deduplicates Tableau rows", () => {
    const sourceRow = [
      "GOOGLE INC.",
      "Google",
      "Open",
      "03/05/2026",
      "",
      "10,000 and over",
      "CA, WA",
    ];
    const records = mapTableauRows(columns, [sourceRow, sourceRow]);

    expect(records).toEqual([
      {
        employer_name: "GOOGLE INC.",
        dba_name: "Google",
        status: "enrolled",
        enrollment_date: "2026-03-05",
        termination_date: null,
        workforce_size_band: "10,000 and over",
        hiring_site_states: ["CA", "WA"],
      },
    ]);
  });

  it("selects an exact legal-name/DBA match instead of a substring", () => {
    const records = mapTableauRows(columns, [
      ["Googley LLC", "", "Open", "01/01/2026", "", "5 to 9", "TX"],
      ["GOOGLE INC.", "Google", "Open", "03/05/2026", "", "10,000+", "CA"],
    ]);

    expect(selectBestEmployerMatch("Google", records)?.employer_name).toBe(
      "GOOGLE INC."
    );
    expect(selectBestEmployerMatch("Goog", records)).toBeNull();
  });

  it("accepts one unambiguous legal-name prefix match", () => {
    const records = mapTableauRows(columns, [
      [
        "Infosys McCamish Systems LLC",
        "",
        "Open",
        "01/01/2026",
        "",
        "500 to 999",
        "GA",
      ],
    ]);
    expect(selectBestEmployerMatch("Infosys", records)?.employer_name).toBe(
      "Infosys McCamish Systems LLC"
    );
  });

  it("normalizes cache keys and validates public dates", () => {
    expect(normalizeCompanyName("  Microsoft   Corporation ")).toBe(
      "microsoft corporation"
    );
    expect(normalizePublicDate("8/1/2007")).toBe("2007-08-01");
    expect(normalizePublicDate("13/40/2026")).toBeNull();
  });
});

describe("E-Verify robots policy", () => {
  it("uses the live wildcard crawl delay with a 10-second safety floor", () => {
    const policy = parseRobotsPolicy(
      "User-agent: *\nCrawl-delay: 12\nDisallow: /export-employers-csv2\n"
    );
    expect(policy.crawlDelaySeconds).toBe(12);
  });

  it("fails closed if the public search path becomes disallowed", () => {
    expect(() =>
      parseRobotsPolicy(
        "User-agent: *\nCrawl-delay: 10\nDisallow: /e-verify-employer-search\n"
      )
    ).toThrow(EVerifyLiveLookupError);
  });
});
