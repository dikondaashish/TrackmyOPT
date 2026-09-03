import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cleanPartnerCase, daysBetweenDates } from "./clean";
import { inferCaseKind, serviceCenterFromReceipt } from "./centers";
import { fetchAllTimelines } from "./get-estimate";
import { dedupeByExternalId } from "./ingest";
import { buildSimilarFilingPeers } from "./similar-filing";
import {
  buildJourneyStages,
  deriveJourneyPhase,
  redactStagesForFree,
  type StageRow,
} from "./stages";
import type { CleanedCommunityCase } from "./types";
import {
  buildEstimateFromSamples,
  buildDistribution,
  buildProcessingHistogram,
  selectCohort,
  MIN_CASES_FOR_HISTOGRAM,
  MIN_COHORT_FOR_ESTIMATE,
  type TimelineSample,
} from "./estimate";
import {
  buildWeeklyProcessingTrend,
  filterMatureRows,
  isoWeekStart,
  type WeeklyTrendRow,
} from "./weekly-trend";

describe("daysBetweenDates", () => {
  it("returns calendar days and rejects negatives", () => {
    expect(daysBetweenDates("2026-01-01", "2026-01-31")).toBe(30);
    expect(daysBetweenDates("2026-02-01", "2026-01-01")).toBeNull();
  });
});

describe("cleanPartnerCase", () => {
  it("drops absurd approval gaps and keeps valid ones", () => {
    const bad = cleanPartnerCase({
      id: "a",
      type: "initial_opt",
      init_date: "2026-01-01",
      approve_date: "2026-01-03", // 2 days — too fast
      source: "reddit",
    });
    expect(bad?.days_to_approval).toBeNull();

    const good = cleanPartnerCase({
      id: "b",
      type: "stem_extension",
      service_center: "Potomac",
      premium_processing: true,
      init_date: "2026-01-01",
      approve_date: "2026-03-15",
      source: "registered",
    });
    expect(good?.case_kind).toBe("stem_extension");
    expect(good?.service_center).toBe("potomac");
    expect(good?.days_to_approval).toBe(73);
  });
});

describe("centers", () => {
  it("maps receipt prefixes and STEM labels", () => {
    expect(serviceCenterFromReceipt("YSC1234567890")).toBe("potomac");
    expect(serviceCenterFromReceipt("IOE1234567890")).toBe("nbc");
    expect(inferCaseKind({ label: "My STEM OPT" })).toBe("stem_extension");
    expect(inferCaseKind({ caseType: "I-765" })).toBe("initial_opt");
    expect(inferCaseKind({ filingCategory: "stem_extension" })).toBe("stem_extension");
    expect(inferCaseKind({ filingCategory: "initial_opt", label: "My STEM OPT" })).toBe(
      "initial_opt"
    );
    // opt-pulse uses "STEM OPT Extension" as opt_type
    expect(inferCaseKind({ partnerType: "STEM OPT Extension" })).toBe("stem_extension");
    expect(inferCaseKind({ partnerType: "Initial OPT" })).toBe("initial_opt");
  });
});

describe("weekly processing trend", () => {
  const NOW = Date.parse("2026-08-05T00:00:00Z");

  function week(initDate: string, days: number | null): WeeklyTrendRow {
    return { init_date: initDate, days_to_approval: days };
  }

  function weeks(initDate: string, days: number[]): WeeklyTrendRow[] {
    return days.map((d) => week(initDate, d));
  }

  it("snaps dates to the Monday of their week", () => {
    // 2026-08-05 is a Wednesday
    expect(isoWeekStart("2026-08-05")).toBe("2026-08-03");
    expect(isoWeekStart("2026-08-03")).toBe("2026-08-03");
    // Sunday belongs to the week that started the previous Monday
    expect(isoWeekStart("2026-08-09")).toBe("2026-08-03");
    expect(isoWeekStart(null)).toBeNull();
  });

  it("drops weeks below the minimum sample size", () => {
    const rows = [
      ...weeks("2026-01-05", [60, 60, 60, 60, 60, 60]),
      ...weeks("2026-01-12", [60, 60, 60]), // only 3 → dropped
    ];
    const points = buildWeeklyProcessingTrend(rows, { now: NOW });
    expect(points.map((p) => p.weekStart)).toEqual(["2026-01-05"]);
    expect(points[0]!.sampleSize).toBe(6);
  });

  it("drops weeks too recent to have their slow cases decided yet", () => {
    // p75 of the pool is ~60d, so weeks newer than ~60 days are immature.
    const rows = [
      ...weeks("2026-01-05", [40, 50, 55, 60, 60, 65]),
      // Filed 2 weeks before "now": only its fastest cases could be approved.
      // Unguarded, this plots as a dramatic speed-up that never happened.
      ...weeks("2026-07-20", [12, 13, 14, 15, 16, 17]),
    ];
    const points = buildWeeklyProcessingTrend(rows, { now: NOW });
    expect(points.map((p) => p.weekStart)).toEqual(["2026-01-05"]);
  });

  it("keeps recent weeks when the cohort itself is fast", () => {
    // An all-premium cohort settles in ~15d, so the horizon floor (30d) lets
    // a 5-week-old week through instead of blanking the chart.
    const rows = [
      ...weeks("2026-05-04", [12, 14, 15, 16, 18]),
      ...weeks("2026-06-29", [12, 13, 15, 16, 17]),
    ];
    const points = buildWeeklyProcessingTrend(rows, { now: NOW });
    expect(points.map((p) => p.weekStart)).toEqual(["2026-05-04", "2026-06-29"]);
  });

  it("ignores out-of-range day values and reports percentiles", () => {
    const rows = [
      ...weeks("2026-01-05", [30, 40, 50, 60, 70, 80]),
      week("2026-01-05", 3676), // AI parse error, must not skew output
      week("2026-01-05", 2), // impossibly fast, likely a bad parse
    ];
    const points = buildWeeklyProcessingTrend(rows, { now: NOW });
    expect(points).toHaveLength(1);
    const point = points[0]!;
    expect(point.sampleSize).toBe(6);
    expect(point.medianDays).toBe(55);
    expect(point.p25Days).toBeLessThan(point.medianDays);
    expect(point.p75Days).toBeGreaterThan(point.medianDays);
    expect(point.label).toBe("01-05");
  });

  it("keeps only the most recent maxWeeks in chronological order", () => {
    const rows = ["2026-01-05", "2026-01-12", "2026-01-19"].flatMap((w) =>
      weeks(w, [60, 60, 60, 60, 60])
    );
    const points = buildWeeklyProcessingTrend(rows, { now: NOW, maxWeeks: 2 });
    expect(points.map((p) => p.weekStart)).toEqual(["2026-01-12", "2026-01-19"]);
  });

  it("exposes the maturity filter for other duration analyses", () => {
    const rows = [
      ...weeks("2026-01-05", [60, 60, 60]),
      ...weeks("2026-07-27", [10, 11]), // filed a week ago → immature
    ];
    expect(filterMatureRows(rows, NOW).map((r) => r.init_date)).toEqual([
      "2026-01-05",
      "2026-01-05",
      "2026-01-05",
    ]);
    expect(filterMatureRows([], NOW)).toEqual([]);
  });

  it("returns nothing when no row has a usable approval duration", () => {
    expect(
      buildWeeklyProcessingTrend(
        [week("2026-01-05", null), week(null as unknown as string, 60)],
        { now: NOW }
      )
    ).toEqual([]);
  });
});

describe("ingest dedupe", () => {
  const row = (external_id: string, days: number | null) =>
    ({ external_id, days_to_approval: days }) as CleanedCommunityCase;

  it("collapses ids repeated across pages, keeping the newest", () => {
    const deduped = dedupeByExternalId([
      row("optt_1", 40),
      row("optt_2", 50),
      row("optt_1", 60), // same case re-served on a later page
    ]);
    expect(deduped).toHaveLength(2);
    expect(deduped.find((r) => r.external_id === "optt_1")?.days_to_approval).toBe(60);
  });

  it("leaves already-unique batches untouched", () => {
    const rows = [row("optt_1", 40), row("optp_1", 50)];
    expect(dedupeByExternalId(rows)).toEqual(rows);
    expect(dedupeByExternalId([])).toEqual([]);
  });
});

describe("timeline paging", () => {
  /** Stands in for PostgREST, which caps any single response at max_rows. */
  function stubClient(totalRows: number, maxRows = 1000) {
    let requests = 0;
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({
            range: (from: number, to: number) => {
              requests += 1;
              const end = Math.min(to + 1, from + maxRows, totalRows);
              const data = Array.from({ length: Math.max(0, end - from) }, (_, i) => ({
                days_to_approval: 40 + ((from + i) % 10),
                approve_date: null,
                init_date: "2026-01-05",
                biometrics_date: null,
                card_produce_date: null,
                delivered_date: null,
                service_center: null,
                premium_processing: false,
                case_kind: "initial_opt",
              }));
              return Promise.resolve({ data, error: null });
            },
          }),
        }),
      }),
    };
    return { client, requests: () => requests };
  }

  it("pages past the server row cap instead of silently truncating", async () => {
    const { client, requests } = stubClient(2500);
    const rows = await fetchAllTimelines(
      client as unknown as SupabaseClient,
      "initial_opt"
    );
    expect(rows).toHaveLength(2500);
    expect(requests()).toBe(3);
  });

  it("stops after a single request when the table is small", async () => {
    const { client, requests } = stubClient(120);
    const rows = await fetchAllTimelines(
      client as unknown as SupabaseClient,
      "initial_opt"
    );
    expect(rows).toHaveLength(120);
    expect(requests()).toBe(1);
  });
});

describe("partner date parsing", () => {
  it("rejects calendar-impossible dates instead of rolling them over", () => {
    // Date.UTC(2026, 1, 31) silently becomes March 3 rather than NaN, and
    // Postgres rejects '2026-02-31', failing the whole upsert batch.
    const bad = cleanPartnerCase({ id: "x1", init_date: "2026-02-31" });
    expect(bad?.init_date).toBeNull();

    expect(cleanPartnerCase({ id: "x2", init_date: "2026-13-01" })?.init_date).toBeNull();
    expect(cleanPartnerCase({ id: "x3", init_date: "2026-00-10" })?.init_date).toBeNull();
    expect(cleanPartnerCase({ id: "x4", init_date: "2025-02-29" })?.init_date).toBeNull();
  });

  it("keeps real dates, including leap days", () => {
    expect(cleanPartnerCase({ id: "y1", init_date: "2024-02-29" })?.init_date).toBe(
      "2024-02-29"
    );
    expect(cleanPartnerCase({ id: "y2", init_date: "2026-01-31" })?.init_date).toBe(
      "2026-01-31"
    );
  });
});

describe("processing time histogram", () => {
  const spread = Array.from({ length: 60 }, (_, i) => 20 + (i % 30));

  it("refuses to draw a shape from too few cases", () => {
    const thin = Array.from({ length: MIN_CASES_FOR_HISTOGRAM - 1 }, () => 45);
    expect(buildProcessingHistogram(thin)).toBeNull();
    expect(buildProcessingHistogram([])).toBeNull();
  });

  it("bins into contiguous 7-day ranges covering every case", () => {
    const hist = buildProcessingHistogram(spread)!;
    expect(hist).not.toBeNull();
    expect(hist.totalCases).toBe(spread.length);
    expect(hist.bins.reduce((s, b) => s + b.count, 0)).toBe(spread.length);

    for (let i = 1; i < hist.bins.length; i += 1) {
      expect(hist.bins[i]!.from).toBe(hist.bins[i - 1]!.to + 1);
    }
    const first = hist.bins[0]!;
    expect(first.to - first.from).toBe(6);
    expect(first.label).toBe(`${first.from}–${first.to}d`);
  });

  it("counts extreme outliers in the final bin instead of stretching the axis", () => {
    // One 390-day case must not create ~50 empty bins.
    const hist = buildProcessingHistogram([...spread, 390])!;
    const last = hist.bins[hist.bins.length - 1]!;
    expect(hist.totalCases).toBe(spread.length + 1);
    expect(hist.bins.reduce((s, b) => s + b.count, 0)).toBe(spread.length + 1);
    expect(last.count).toBeGreaterThan(0);
    expect(last.to).toBeLessThan(200);
  });

  it("rejects implausible durations the same way the trend chart does", () => {
    // 1-day approvals and 3676-day values are parse errors, not fast cases.
    const hist = buildProcessingHistogram([...spread, 1, 2, 3676])!;
    expect(hist.totalCases).toBe(spread.length);
    expect(hist.bins[0]!.from).toBeGreaterThanOrEqual(7);
  });

  it("reports the median of the same cases it plots", () => {
    const hist = buildProcessingHistogram(Array.from({ length: 41 }, (_, i) => i + 10))!;
    expect(hist.medianDays).toBe(30);
    const medianBin = hist.bins.find(
      (b) => hist.medianDays >= b.from && hist.medianDays <= b.to
    );
    expect(medianBin).toBeDefined();
  });
});

describe("opt-pulse mapped payload", () => {
  it("cleans a pulse-shaped case (namespaced id, biometrics, PP)", () => {
    // Mirrors fetchOptPulseCases() output → cleanPartnerCase contract.
    const cleaned = cleanPartnerCase({
      id: "optp_zuliee",
      source: "reddit",
      type: "Initial OPT",
      premium_processing: true,
      init_date: "2026-03-05",
      biometrics_date: "2026-04-16",
      pp_date: "2026-05-11",
      approve_date: "2026-06-22",
    });
    expect(cleaned?.external_id).toBe("optp_zuliee");
    expect(cleaned?.premium_processing).toBe(true);
    expect(cleaned?.days_to_approval).toBe(109);
  });
});

describe("selectCohort + buildEstimateFromSamples", () => {
  function sample(
    days: number,
    extra: Partial<TimelineSample> = {}
  ): TimelineSample {
    return {
      days_to_approval: days,
      approve_date: "2026-08-01",
      init_date: "2026-03-01",
      service_center: "potomac",
      premium_processing: false,
      case_kind: "initial_opt",
      ...extra,
    };
  }

  it("falls back from center+pp to broader cohorts", () => {
    const rows = Array.from({ length: MIN_COHORT_FOR_ESTIMATE }, (_, i) =>
      sample(80 + i, { service_center: null })
    );
    const { matchLevel, samples } = selectCohort(rows, {
      caseKind: "initial_opt",
      serviceCenter: "potomac",
      premiumProcessing: false,
    });
    expect(matchLevel).toBe("pp");
    expect(samples.length).toBe(MIN_COHORT_FOR_ESTIMATE);
  });

  it("builds a timeline estimate with distribution buckets", () => {
    const rows = Array.from({ length: 20 }, (_, i) => sample(60 + i * 3));
    const { samples, matchLevel } = selectCohort(rows, {
      caseKind: "initial_opt",
      serviceCenter: "potomac",
      premiumProcessing: false,
    });
    const estimate = buildEstimateFromSamples(samples, {
      daysSinceFiled: 70,
      receivedDate: "2026-03-01",
      matchLevel,
      caseKind: "initial_opt",
      serviceCenter: "potomac",
      premiumProcessing: false,
      nowMs: Date.parse("2026-08-05T12:00:00Z"),
    });
    expect(estimate).not.toBeNull();
    expect(estimate!.cohortSize).toBe(20);
    expect(estimate!.medianDays).toBeGreaterThan(0);
    expect(estimate!.distribution).toHaveLength(6);
    expect(buildDistribution([50, 70, 100, 130]).map((d) => d.count)).toEqual([
      1, 1, 0, 1, 0, 1,
    ]);
    expect(estimate!.sourceNote.toLowerCase()).toContain("not affiliated with uscis");
    expect(estimate!.sourceNote.toLowerCase()).toContain("not a guarantee");
  });

  describe("estimated decision range", () => {
    const NOW = Date.parse("2026-08-05T12:00:00Z");

    /** 41 samples spanning 80–120d, giving p25=90 and p75=110. */
    function estimateFiledOn(receivedDate: string | null, daysSinceFiled: number) {
      const rows = Array.from({ length: 41 }, (_, i) => sample(80 + i));
      return buildEstimateFromSamples(rows, {
        daysSinceFiled,
        receivedDate,
        matchLevel: "pp",
        caseKind: "initial_opt",
        serviceCenter: null,
        premiumProcessing: false,
        nowMs: NOW,
      })!;
    }

    it("counts the window from the filing date, not from today", () => {
      // Filed 20d ago on 2026-07-16: p25/p75 land 90/110 days after filing.
      const estimate = estimateFiledOn("2026-07-16", 20);
      expect(estimate.p25Days).toBe(90);
      expect(estimate.p75Days).toBe(110);
      expect(estimate.estimatedDecisionRange).toEqual(["2026-10-14", "2026-11-03"]);
    });

    it("never quotes a decision date in the past", () => {
      // Filed 200d ago — already beyond p75, so the window is "any time now"
      // rather than a date that has been and gone.
      const estimate = estimateFiledOn("2026-01-17", 200);
      expect(estimate.estimatedDecisionRange).toEqual(["2026-08-05", "2026-08-05"]);
    });

    it("infers the filing date from days pending when it is unknown", () => {
      // 20d pending with no filing date implies 2026-07-16, same as above.
      const estimate = estimateFiledOn(null, 20);
      expect(estimate.estimatedDecisionRange).toEqual(["2026-10-14", "2026-11-03"]);
    });
  });
});

describe("similar filing peers", () => {
  const NOW = Date.parse("2026-08-05T00:00:00Z");

  function sample(
    init_date: string,
    days_to_approval: number,
    premium = false
  ): TimelineSample {
    return {
      init_date,
      days_to_approval,
      approve_date: "2026-06-01",
      service_center: null,
      premium_processing: premium,
      case_kind: "initial_opt",
    };
  }

  it("matches peers within ±7d when the sample is large enough", () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      sample(`2026-03-${String(10 + (i % 5)).padStart(2, "0")}`, 40 + (i % 10))
    );
    const peers = buildSimilarFilingPeers(rows, {
      receivedDate: "2026-03-12",
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(peers).not.toBeNull();
    expect(peers!.basis).toBe("recent");
    expect(peers!.windowDays).toBe(7);
    expect(peers!.sampleSize).toBe(20);
    expect(peers!.medianDays).toBeGreaterThan(0);
    expect(peers!.sourceNote.toLowerCase()).toContain("uscis");
  });

  it("reports the observed filing span, not the requested window", () => {
    // Rows only span Mar 10-14, so a ±7d window must not be advertised as Mar 5-19.
    const rows = Array.from({ length: 20 }, (_, i) =>
      sample(`2026-03-${String(10 + (i % 5)).padStart(2, "0")}`, 40 + (i % 10))
    );
    const peers = buildSimilarFilingPeers(rows, {
      receivedDate: "2026-03-12",
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(peers!.windowRange).toEqual(["2026-03-10", "2026-03-14"]);
  });

  it("widens the window before giving up", () => {
    // 8 cases within ±7, 20 within ±14 — must expand.
    const near = Array.from({ length: 8 }, (_, i) =>
      sample(`2026-03-${String(10 + (i % 3)).padStart(2, "0")}`, 50)
    );
    const far = Array.from({ length: 12 }, (_, i) =>
      sample(`2026-03-${String(20 + (i % 4)).padStart(2, "0")}`, 55)
    );
    const peers = buildSimilarFilingPeers([...near, ...far], {
      receivedDate: "2026-03-12",
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(peers!.windowDays).toBe(14);
    expect(peers!.sampleSize).toBe(20);
  });

  it("ignores the opposite premium segment and immature recent weeks", () => {
    const recent = Array.from({ length: 20 }, () => sample("2026-07-20", 12));
    const premium = Array.from({ length: 20 }, () =>
      sample("2026-03-12", 30, true)
    );
    expect(
      buildSimilarFilingPeers([...recent, ...premium], {
        receivedDate: "2026-03-12",
        premiumProcessing: false,
        nowMs: NOW,
      })
    ).toBeNull();
  });

  it("returns null without a filing date", () => {
    expect(
      buildSimilarFilingPeers([sample("2026-03-12", 40)], {
        receivedDate: null,
        premiumProcessing: false,
        nowMs: NOW,
      })
    ).toBeNull();
  });

  it("falls back to the same calendar window in earlier years", () => {
    // The user filed 16 days ago: their own window is entirely immature, and
    // its handful of fast approvals must not become the answer.
    const ownWindow = Array.from({ length: 20 }, () => sample("2026-07-20", 10));
    const lastYear = Array.from({ length: 20 }, (_, i) =>
      sample(`2025-07-${String(18 + (i % 5)).padStart(2, "0")}`, 100)
    );
    const peers = buildSimilarFilingPeers([...ownWindow, ...lastYear], {
      receivedDate: "2026-07-20",
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(peers!.basis).toBe("seasonal");
    expect(peers!.windowDays).toBe(7);
    expect(peers!.sampleSize).toBe(20);
    expect(peers!.medianDays).toBe(100);
    expect(peers!.seasonYears).toEqual([2025]);
  });

  it("prefers a real peer window over the seasonal fallback", () => {
    const ownWindow = Array.from({ length: 20 }, (_, i) =>
      sample(`2026-01-${String(8 + (i % 5)).padStart(2, "0")}`, 100)
    );
    const lastYear = Array.from({ length: 20 }, (_, i) =>
      sample(`2025-01-${String(8 + (i % 5)).padStart(2, "0")}`, 160)
    );
    const peers = buildSimilarFilingPeers([...ownWindow, ...lastYear], {
      receivedDate: "2026-01-10",
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(peers!.basis).toBe("recent");
    expect(peers!.medianDays).toBe(100);
    expect(peers!.seasonYears).toEqual([2026]);
  });

  it("does not reach across years when nothing seasonal resolved either", () => {
    const ownWindow = Array.from({ length: 20 }, () => sample("2026-07-20", 10));
    expect(
      buildSimilarFilingPeers(ownWindow, {
        receivedDate: "2026-07-20",
        premiumProcessing: false,
        nowMs: NOW,
      })
    ).toBeNull();
  });

  it("falls back to the latest resolved weeks when there is no year of history", () => {
    // Mirrors the real dataset: dense recent months, nothing a year back.
    const ownWindow = Array.from({ length: 20 }, () => sample("2026-07-20", 10));
    const resolved = Array.from({ length: 30 }, (_, i) =>
      sample(`2026-03-${String(1 + (i % 20)).padStart(2, "0")}`, 90 + (i % 20))
    );
    const peers = buildSimilarFilingPeers([...ownWindow, ...resolved], {
      receivedDate: "2026-07-20",
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(peers!.basis).toBe("latest");
    // Trailing span ends at the newest resolved filing (Mar 20) and reaches
    // back 2×7d — never forward into the weeks the maturity filter excluded.
    expect(peers!.windowRange).toEqual(["2026-03-06", "2026-03-20"]);
    expect(peers!.sampleSize).toBe(20);
  });

  it("prefers seasonal over the latest-weeks fallback", () => {
    const ownWindow = Array.from({ length: 20 }, () => sample("2026-07-20", 10));
    const lastYear = Array.from({ length: 20 }, (_, i) =>
      sample(`2025-07-${String(18 + (i % 5)).padStart(2, "0")}`, 100)
    );
    const recentResolved = Array.from({ length: 30 }, (_, i) =>
      sample(`2026-03-${String(1 + (i % 20)).padStart(2, "0")}`, 150)
    );
    const peers = buildSimilarFilingPeers(
      [...ownWindow, ...lastYear, ...recentResolved],
      {
        receivedDate: "2026-07-20",
        premiumProcessing: false,
        nowMs: NOW,
      }
    );
    expect(peers!.basis).toBe("seasonal");
    expect(peers!.medianDays).toBe(100);
  });
});

describe("journey stages", () => {
  const NOW = Date.parse("2026-08-05T00:00:00Z");
  const DAY = 86_400_000;

  function iso(daysAgo: number): string {
    return new Date(NOW - daysAgo * DAY).toISOString().slice(0, 10);
  }

  function row(over: Partial<StageRow> = {}): StageRow {
    return {
      init_date: null,
      biometrics_date: null,
      approve_date: null,
      card_produce_date: null,
      delivered_date: null,
      premium_processing: false,
      ...over,
    };
  }

  /** Filed long enough ago to be settled, with biometrics `gap` days later. */
  function biometricsRow(gap: number, filedDaysAgo = 200): StageRow {
    return row({
      init_date: iso(filedDaysAgo),
      biometrics_date: iso(filedDaysAgo - gap),
    });
  }

  it("summarises biometrics from rows that have no approval yet", () => {
    // These rows would be dropped by any approval-duration filter — they are
    // the bulk of the biometrics evidence.
    const rows = Array.from({ length: 20 }, (_, i) => biometricsRow(18 + (i % 9)));
    const stages = buildJourneyStages(rows, {
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(stages.biometrics).not.toBeNull();
    expect(stages.biometrics!.medianDays).toBe(22);
    expect(stages.biometrics!.sampleSize).toBe(20);
    expect(stages.biometrics!.p25Days).toBeLessThan(stages.biometrics!.medianDays);
  });

  it("excludes filings too recent to have reached the milestone", () => {
    // 20 settled rows plus 20 filed three days ago whose only visible
    // biometrics are the instant ones — the median must not move to 2.
    const settled = Array.from({ length: 20 }, () => biometricsRow(22));
    const censored = Array.from({ length: 20 }, () => biometricsRow(2, 3));
    const stages = buildJourneyStages([...settled, ...censored], {
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(stages.biometrics!.medianDays).toBe(22);
    expect(stages.biometrics!.sampleSize).toBe(20);
  });

  it("measures card steps from approval, not from filing", () => {
    const rows = Array.from({ length: 20 }, () =>
      row({
        init_date: iso(200),
        approve_date: iso(100),
        card_produce_date: iso(94), // 6 days after approval
        delivered_date: iso(90), // 10 days after approval
      })
    );
    const stages = buildJourneyStages(rows, {
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(stages.cardProduced!.medianDays).toBe(6);
    expect(stages.cardDelivered!.medianDays).toBe(10);
  });

  it("keeps premium and regular segments apart", () => {
    const regular = Array.from({ length: 20 }, () => biometricsRow(30));
    const premium = Array.from({ length: 20 }, () => ({
      ...biometricsRow(10),
      premium_processing: true,
    }));
    const all = [...regular, ...premium];
    expect(
      buildJourneyStages(all, { premiumProcessing: false, nowMs: NOW })
        .biometrics!.medianDays
    ).toBe(30);
    expect(
      buildJourneyStages(all, { premiumProcessing: true, nowMs: NOW })
        .biometrics!.medianDays
    ).toBe(10);
  });

  it("returns null for a stage with too few reports", () => {
    const rows = Array.from({ length: 5 }, () => biometricsRow(22));
    const stages = buildJourneyStages(rows, {
      premiumProcessing: false,
      nowMs: NOW,
    });
    expect(stages.biometrics).toBeNull();
    expect(stages.cardProduced).toBeNull();
  });

  it("strips spread and sample size for free plans", () => {
    const rows = Array.from({ length: 20 }, (_, i) => biometricsRow(18 + (i % 9)));
    const full = buildJourneyStages(rows, {
      premiumProcessing: false,
      nowMs: NOW,
    });
    const free = redactStagesForFree(full);
    expect(free.biometrics!.medianDays).toBe(full.biometrics!.medianDays);
    expect(free.biometrics!.p25Days).toBeUndefined();
    expect(free.biometrics!.p75Days).toBeUndefined();
    expect(free.biometrics!.sampleSize).toBeUndefined();
    expect(free.sourceNote).toBe(full.sourceNote);
  });

  it("separates the post-approval statuses the case switcher merges", () => {
    expect(deriveJourneyPhase("Case Was Approved")).toBe("approved");
    expect(deriveJourneyPhase("New Card Is Being Produced")).toBe("card_produced");
    expect(deriveJourneyPhase("Card Was Mailed To Me")).toBe("card_produced");
    expect(
      deriveJourneyPhase("Card Was Delivered To Me By The Post Office")
    ).toBe("delivered");
    expect(deriveJourneyPhase("Fingerprint Fee Received")).toBe("biometrics_done");
    expect(deriveJourneyPhase("Case Was Received")).toBe("filed");
    expect(deriveJourneyPhase(null)).toBe("filed");
  });
});
