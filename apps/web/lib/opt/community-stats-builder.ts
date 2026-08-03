import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { isApproved } from "@/lib/immigration/uscis-checker";
import { normalizeStatusHistory } from "@/lib/case-status/normalize-status-history";

export type ToolType = "opt-apply" | "opt-clock" | "stem-apply" | "stem-clock";
export type Trend = "faster" | "slower" | "stable";

type CommunityStatsBlock = {
  mainStat: { value: number; label: string; unit: string };
  secondaryStat: { value: number; label: string };
  trend: Trend;
  recentReports: Array<{
    value: number;
    label: string;
    timestamp: string;
    positive: boolean;
  }>;
  lastUpdated: string;
  sampleSize: number;
  dataSource: "trackmyopt" | "baseline";
};

type ApprovalSample = { days: number; approvedAt: Date };

const CACHE_TTL_MS = 60 * 60 * 1000;
let cache: { builtAt: number; data: Record<ToolType, CommunityStatsBlock> } | null =
  null;

function relativeTime(iso: string | Date): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function daysBetween(a: string | Date, b: string | Date): number {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function isRfeStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("evidence") || s.includes("rfe");
}

function isI765Case(caseType: string | null): boolean {
  if (!caseType) return true;
  const normalized = caseType.toUpperCase();
  return normalized.includes("765");
}

function isStemCase(
  row: { label: string | null; user_id: string },
  stemUserIds: Set<string>
): boolean {
  if (row.label?.toLowerCase().includes("stem")) return true;
  return stemUserIds.has(row.user_id);
}

function computeApprovalSample(row: {
  created_at: string | null;
  received_date: string | null;
  last_status_change_at: string | null;
  status_history: unknown;
  current_status: string | null;
}): ApprovalSample | null {
  if (!isApproved(row.current_status)) return null;

  const history = normalizeStatusHistory(row.status_history);
  const approvalEntry = [...history].reverse().find((h) => isApproved(h.status));
  const endDate = approvalEntry?.date || row.last_status_change_at;
  const startDate = row.received_date || row.created_at;
  if (!endDate || !startDate) return null;

  const days = daysBetween(startDate, endDate);
  if (days <= 0 || days > 500) return null;

  return { days, approvedAt: new Date(endDate) };
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]!
    : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

function computeTrend(recent: number[], prior: number[]): Trend {
  if (recent.length < 3 || prior.length < 3) return "stable";
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;
  if (!priorAvg) return "stable";
  const delta = (recentAvg - priorAvg) / priorAvg;
  if (delta < -0.08) return "faster";
  if (delta > 0.08) return "slower";
  return "stable";
}

function baselineStats(): Record<ToolType, CommunityStatsBlock> {
  const now = new Date().toISOString();
  const mk = (
    tool: ToolType,
    main: number,
    secondary: number,
    unit: string,
    mainLabel: string,
    secondaryLabel: string,
    reportLabel: string
  ): CommunityStatsBlock => ({
    mainStat: { value: main, label: mainLabel, unit },
    secondaryStat: { value: secondary, label: secondaryLabel },
    trend: "stable",
    recentReports: [
      { value: main - 10, label: reportLabel, timestamp: "2 days ago", positive: true },
      { value: main + 5, label: reportLabel, timestamp: "4 days ago", positive: true },
      { value: main + 15, label: "RFE received", timestamp: "1 week ago", positive: false },
      { value: main - 5, label: reportLabel, timestamp: "2 weeks ago", positive: true },
    ],
    lastUpdated: now,
    sampleSize: 0,
    dataSource: "baseline",
  });

  return {
    "opt-apply": mk("opt-apply", 90, 12, "days", "Average Approval Time", "Approvals in 24h", "days to approval"),
    "opt-clock": mk("opt-clock", 35, 24, "days", "Avg. Time to Find Job", "Found jobs this week", "days to employment"),
    "stem-apply": mk("stem-apply", 100, 10, "days", "Average Approval Time", "Approvals in 24h", "days to approval"),
    "stem-clock": mk("stem-clock", 18, 40, "days", "Avg. Document Upload", "Uploads this week", "days to upload docs"),
  };
}

function buildApprovalBlock(
  samples: ApprovalSample[],
  rfeCases: Array<{ changedAt: string; days: number }>,
  mainLabel: string,
  secondaryLabel: string,
  reportLabel: string
): CommunityStatsBlock {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  if (samples.length < 5) {
    const baseline = baselineStats()["opt-apply"];
    return {
      ...baseline,
      mainStat: { ...baseline.mainStat, label: mainLabel },
      secondaryStat: { ...baseline.secondaryStat, label: secondaryLabel },
      sampleSize: samples.length,
      dataSource: "baseline",
    };
  }

  const approvals24h = samples.filter(
    (s) => now - s.approvedAt.getTime() < day
  ).length;

  const recent30 = samples.filter(
    (s) => now - s.approvedAt.getTime() <= 30 * day
  );
  const prior30 = samples.filter((s) => {
    const age = now - s.approvedAt.getTime();
    return age > 30 * day && age <= 60 * day;
  });

  const recentReports = [
    ...samples
      .slice()
      .sort((a, b) => b.approvedAt.getTime() - a.approvedAt.getTime())
      .slice(0, 3)
      .map((s) => ({
        value: s.days,
        label: reportLabel,
        timestamp: relativeTime(s.approvedAt),
        positive: true,
      })),
    ...rfeCases
      .slice()
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, 1)
      .map((r) => ({
        value: r.days,
        label: "RFE received",
        timestamp: relativeTime(r.changedAt),
        positive: false,
      })),
  ].slice(0, 4);

  return {
    mainStat: {
      value: median(samples.map((s) => s.days)),
      label: mainLabel,
      unit: "days",
    },
    secondaryStat: { value: approvals24h, label: secondaryLabel },
    trend: computeTrend(
      recent30.map((s) => s.days),
      prior30.map((s) => s.days)
    ),
    recentReports,
    lastUpdated: new Date().toISOString(),
    sampleSize: samples.length,
    dataSource: "trackmyopt",
  };
}

export async function buildCommunityStats(): Promise<
  Record<ToolType, CommunityStatsBlock>
> {
  if (cache && Date.now() - cache.builtAt < CACHE_TTL_MS) {
    return cache.data;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return baselineStats();
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const [{ data: cases }, { data: employments }, { data: optRows }, { data: documents }] =
    await Promise.all([
      supabase
        .from("case_status")
        .select(
          "current_status, created_at, received_date, last_status_change_at, status_history, case_type, label, user_id"
        ),
      supabase.from("employment_spans").select("start_date, created_at, user_id"),
      supabase
        .from("opt_status")
        .select("user_id, opt_start_date, stem_start_date"),
      supabase.from("documents").select("created_at, user_id"),
    ]);

  const stemUserIds = new Set(
    (optRows ?? [])
      .filter((r) => r.stem_start_date)
      .map((r) => r.user_id)
  );

  const optStartByUser = new Map(
    (optRows ?? [])
      .filter((r) => r.opt_start_date)
      .map((r) => [r.user_id, r.opt_start_date!])
  );

  const stemStartByUser = new Map(
    (optRows ?? [])
      .filter((r) => r.stem_start_date)
      .map((r) => [r.user_id, r.stem_start_date!])
  );

  const i765Cases = (cases ?? []).filter((c) => isI765Case(c.case_type));
  const stemCases = (cases ?? []).filter((c) => isStemCase(c, stemUserIds));

  const collectSamples = (rows: typeof i765Cases) =>
    rows
      .map(computeApprovalSample)
      .filter((s): s is ApprovalSample => s !== null);

  const collectRfe = (rows: typeof i765Cases) =>
    rows
      .filter(
        (c) =>
          isRfeStatus(c.current_status ?? "") &&
          c.last_status_change_at &&
          c.created_at
      )
      .map((c) => ({
        changedAt: c.last_status_change_at!,
        days: daysBetween(c.created_at!, c.last_status_change_at!),
      }));

  const optApply = buildApprovalBlock(
    collectSamples(i765Cases),
    collectRfe(i765Cases),
    "Average Approval Time",
    "Approvals in 24h",
    "days to approval"
  );

  const stemApply = buildApprovalBlock(
    collectSamples(stemCases),
    collectRfe(stemCases),
    "Average Approval Time",
    "Approvals in 24h",
    "days to approval"
  );

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const jobGaps: number[] = [];
  let jobsThisWeek = 0;

  for (const job of employments ?? []) {
    if (!job.start_date || !job.user_id) continue;
    const optStart = optStartByUser.get(job.user_id);
    if (optStart) {
      const gap = daysBetween(optStart, job.start_date);
      if (gap > 0 && gap < 365) jobGaps.push(gap);
    }
    if (now - new Date(job.start_date).getTime() <= weekMs) {
      jobsThisWeek += 1;
    }
  }

  const optClock: CommunityStatsBlock =
    jobGaps.length >= 5
      ? {
          mainStat: {
            value: median(jobGaps),
            label: "Avg. Time to Find Job",
            unit: "days",
          },
          secondaryStat: {
            value: jobsThisWeek,
            label: "Found jobs this week",
          },
          trend: "stable",
          recentReports: jobGaps
            .slice()
            .sort((a, b) => a - b)
            .slice(0, 4)
            .map((gap, idx) => ({
              value: gap,
              label: "days to employment",
              timestamp: relativeTime(new Date(now - idx * 2 * 24 * 60 * 60 * 1000)),
              positive: gap <= median(jobGaps),
            })),
          lastUpdated: new Date().toISOString(),
          sampleSize: jobGaps.length,
          dataSource: "trackmyopt",
        }
      : {
          ...baselineStats()["opt-clock"],
          sampleSize: jobGaps.length,
        };

  const stemUploadGaps: number[] = [];
  let uploadsThisWeek = 0;
  const docsByUser = new Map<string, string[]>();

  for (const doc of documents ?? []) {
    if (!doc.created_at) continue;
    const list = docsByUser.get(doc.user_id) ?? [];
    list.push(doc.created_at);
    docsByUser.set(doc.user_id, list);
    if (now - new Date(doc.created_at).getTime() <= weekMs) {
      uploadsThisWeek += 1;
    }
  }

  for (const [userId, stemStart] of stemStartByUser) {
    const userDocs = (docsByUser.get(userId) ?? []).sort();
    const firstDoc = userDocs[0];
    if (!firstDoc) continue;
    const gap = daysBetween(stemStart, firstDoc);
    if (gap > 0 && gap < 180) stemUploadGaps.push(gap);
  }

  const stemClock: CommunityStatsBlock =
    stemUploadGaps.length >= 3
      ? {
          mainStat: {
            value: median(stemUploadGaps),
            label: "Avg. Document Upload",
            unit: "days",
          },
          secondaryStat: {
            value: uploadsThisWeek,
            label: "Uploads this week",
          },
          trend: "stable",
          recentReports: stemUploadGaps
            .slice(0, 4)
            .map((gap, idx) => ({
              value: gap,
              label: "days to upload docs",
              timestamp: relativeTime(new Date(now - idx * 3 * 24 * 60 * 60 * 1000)),
              positive: true,
            })),
          lastUpdated: new Date().toISOString(),
          sampleSize: stemUploadGaps.length,
          dataSource: "trackmyopt",
        }
      : {
          ...baselineStats()["stem-clock"],
          sampleSize: stemUploadGaps.length,
        };

  const data = {
    "opt-apply": optApply,
    "opt-clock": optClock,
    "stem-apply": stemApply,
    "stem-clock": stemClock,
  };

  cache = { builtAt: Date.now(), data };
  return data;
}
