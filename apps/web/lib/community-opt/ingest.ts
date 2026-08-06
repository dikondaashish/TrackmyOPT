import { createClient } from "@supabase/supabase-js";
import { cleanPartnerCase } from "./clean";
import type { CleanedCommunityCase, PartnerCasePayload } from "./types";

const OPT_TRACKER_DEFAULT = "https://opt-tracker.com";
const OPT_TRACKER_PER_PAGE = 50;
const OPT_TRACKER_MAX_PAGES = 120;

const OPT_PULSE_DEFAULT_URL = "https://agkagshxgeavfbbpmbcz.supabase.co";
const OPT_PULSE_DEFAULT_KEY = "sb_publishable_Xn9rnx_g2fOiKNjK0X3JHQ_bgB4vO7o";
const OPT_PULSE_PAGE = 1000;
const OPT_PULSE_MAX_ROWS = 20000;

type PartnerListResponse = {
  cases?: PartnerCasePayload[];
  total?: number;
  total_pages?: number;
};

function optTrackerBase(): string {
  return (
    process.env.COMMUNITY_OPT_API_BASE?.replace(/\/$/, "") || OPT_TRACKER_DEFAULT
  );
}

/** What one partner feed yielded, plus counters for the ingest audit row. */
type SourceFetch = {
  cases: PartnerCasePayload[];
  pages: number;
  /** Row count the partner claims to hold, when it reports one. */
  total: number | null;
};

/** opt-tracker.com — paginated JSON feed. Ids namespaced `optt_`. */
async function fetchOptTrackerCases(): Promise<SourceFetch> {
  const base = optTrackerBase();
  const page1 = await fetchJson<PartnerListResponse>(
    `${base}/api/cases?page=1&per_page=${OPT_TRACKER_PER_PAGE}&sort_col=updated_at&sort_dir=desc`
  );
  const totalPages = Math.min(
    typeof page1.total_pages === "number" ? page1.total_pages : 1,
    OPT_TRACKER_MAX_PAGES
  );
  const raw: PartnerCasePayload[] = [...(page1.cases ?? [])];
  for (let page = 2; page <= totalPages; page++) {
    const body = await fetchJson<PartnerListResponse>(
      `${base}/api/cases?page=${page}&per_page=${OPT_TRACKER_PER_PAGE}&sort_col=updated_at&sort_dir=desc`
    );
    raw.push(...(body.cases ?? []));
  }
  return {
    cases: raw.map((r) => ({
      ...r,
      id: `optt_${r.id}`,
      source: r.source ?? "reddit",
    })),
    pages: totalPages,
    total: typeof page1.total === "number" ? page1.total : null,
  };
}

type OptPulseRow = {
  id: string;
  opt_type?: string | null;
  premium_processing?: boolean | null;
  date_applied?: string | null;
  biometrics_completed?: string | null;
  pp_date?: string | null;
  date_approved?: string | null;
  date_card_produced?: string | null;
  date_card_received?: string | null;
  country_of_citizenship?: string | null;
  processing_center?: string | null;
};

/** opt-pulse.vercel.app — public Supabase `cases` table. Ids namespaced `optp_`. */
async function fetchOptPulseCases(): Promise<SourceFetch> {
  const url =
    process.env.COMMUNITY_OPT_PULSE_URL?.replace(/\/$/, "") || OPT_PULSE_DEFAULT_URL;
  const key = process.env.COMMUNITY_OPT_PULSE_KEY || OPT_PULSE_DEFAULT_KEY;

  const out: PartnerCasePayload[] = [];
  let pages = 0;
  for (let offset = 0; offset < OPT_PULSE_MAX_ROWS; offset += OPT_PULSE_PAGE) {
    const rows = await fetchJson<OptPulseRow[]>(
      `${url}/rest/v1/cases?select=id,opt_type,premium_processing,date_applied,biometrics_completed,pp_date,date_approved,date_card_produced,date_card_received,country_of_citizenship,processing_center&order=id.asc&limit=${OPT_PULSE_PAGE}&offset=${offset}`,
      { apikey: key, Authorization: `Bearer ${key}` }
    );
    if (!rows.length) break;
    pages += 1;
    for (const r of rows) {
      out.push({
        id: `optp_${r.id}`,
        source: "reddit",
        type: r.opt_type ?? null,
        service_center: r.processing_center ?? null,
        premium_processing: r.premium_processing ?? null,
        init_date: r.date_applied ?? null,
        biometrics_date: r.biometrics_completed ?? null,
        pp_date: r.pp_date ?? null,
        approve_date: r.date_approved ?? null,
        card_produce_date: r.date_card_produced ?? null,
        delivered_date: r.date_card_received ?? null,
        nationality: r.country_of_citizenship ?? null,
        updated_at: null,
      });
    }
    if (rows.length < OPT_PULSE_PAGE) break;
  }
  return { cases: out, pages, total: out.length };
}

async function fetchJson<T>(
  url: string,
  headers: Record<string, string> = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...headers },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Partner API ${res.status} on ${url.split("?")[0]}`);
  }
  return (await res.json()) as T;
}

/**
 * Collapse repeated external_ids, keeping the last occurrence.
 *
 * opt-tracker paginates over a feed sorted by updated_at, so a row touched
 * mid-crawl can shift pages and be returned twice. Postgres aborts the whole
 * batch on a repeated conflict target ("ON CONFLICT DO UPDATE command cannot
 * affect row a second time"), which would fail the entire ingest.
 */
export function dedupeByExternalId(
  rows: CleanedCommunityCase[]
): CleanedCommunityCase[] {
  return [...new Map(rows.map((r) => [r.external_id, r])).values()];
}

export type IngestResult = {
  ok: boolean;
  rowsUpserted: number;
  rowsSkipped: number;
  bySource: Record<string, number>;
  error?: string;
  runId?: string;
};

/**
 * Pull all partner feeds (opt-tracker + opt-pulse), clean, and upsert.
 * Service-role only. No USCIS API calls. Both partners: written permission.
 * A single failing source does not abort the other.
 */
export async function ingestCommunityOptTimelines(): Promise<IngestResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return {
      ok: false,
      rowsUpserted: 0,
      rowsSkipped: 0,
      bySource: {},
      error: "Supabase not configured",
    };
  }

  const supabase = createClient(url, key);

  const { data: run, error: runErr } = await supabase
    .from("community_opt_ingest_runs")
    .insert({ status: "running" })
    .select("id")
    .single();

  if (runErr || !run) {
    return {
      ok: false,
      rowsUpserted: 0,
      rowsSkipped: 0,
      bySource: {},
      error: runErr?.message ?? "Failed to open ingest run",
    };
  }

  let rowsUpserted = 0;
  let rowsSkipped = 0;
  let pagesFetched = 0;
  const bySource: Record<string, number> = {};
  const sourceErrors: string[] = [];

  const sources: Array<{ name: string; fetch: () => Promise<SourceFetch> }> = [
    { name: "opt-tracker", fetch: fetchOptTrackerCases },
    { name: "opt-pulse", fetch: fetchOptPulseCases },
  ];

  let sourceTotal: number | null = null;

  try {
    const cleaned: CleanedCommunityCase[] = [];
    for (const src of sources) {
      try {
        const { cases: raw, pages, total } = await src.fetch();
        pagesFetched += pages;
        if (total !== null) sourceTotal = (sourceTotal ?? 0) + total;
        let kept = 0;
        for (const r of raw) {
          const row = cleanPartnerCase(r);
          if (!row) {
            rowsSkipped += 1;
            continue;
          }
          cleaned.push(row);
          kept += 1;
        }
        bySource[src.name] = kept;
      } catch (err) {
        sourceErrors.push(
          `${src.name}: ${err instanceof Error ? err.message : String(err)}`
        );
        bySource[src.name] = 0;
      }
    }

    const deduped = dedupeByExternalId(cleaned);
    rowsSkipped += cleaned.length - deduped.length;

    const CHUNK = 200;
    for (let i = 0; i < deduped.length; i += CHUNK) {
      const slice = deduped.slice(i, i + CHUNK);
      const { error } = await supabase.from("community_opt_timelines").upsert(
        slice.map((r) => ({
          external_id: r.external_id,
          source: r.source,
          case_kind: r.case_kind,
          service_center: r.service_center,
          premium_processing: r.premium_processing,
          init_date: r.init_date,
          biometrics_date: r.biometrics_date,
          pp_date: r.pp_date,
          approve_date: r.approve_date,
          card_produce_date: r.card_produce_date,
          delivered_date: r.delivered_date,
          nationality: r.nationality,
          days_to_approval: r.days_to_approval,
          days_to_produce: r.days_to_produce,
          days_to_deliver: r.days_to_deliver,
          external_updated_at: r.external_updated_at,
        })),
        { onConflict: "external_id" }
      );
      if (error) throw new Error(error.message);
      rowsUpserted += slice.length;
    }

    // All sources failed to yield anything → treat as error.
    const ok = cleaned.length > 0 || sourceErrors.length < sources.length;
    await supabase
      .from("community_opt_ingest_runs")
      .update({
        status: ok ? "ok" : "error",
        finished_at: new Date().toISOString(),
        pages_fetched: pagesFetched,
        rows_upserted: rowsUpserted,
        rows_skipped: rowsSkipped,
        source_total: sourceTotal,
        error_message: sourceErrors.length ? sourceErrors.join(" | ").slice(0, 2000) : null,
      })
      .eq("id", run.id);

    return {
      ok,
      rowsUpserted,
      rowsSkipped,
      bySource,
      error: sourceErrors.length ? sourceErrors.join(" | ") : undefined,
      runId: run.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from("community_opt_ingest_runs")
      .update({
        status: "error",
        finished_at: new Date().toISOString(),
        pages_fetched: pagesFetched,
        rows_upserted: rowsUpserted,
        rows_skipped: rowsSkipped,
        source_total: sourceTotal,
        error_message: message.slice(0, 2000),
      })
      .eq("id", run.id);

    return {
      ok: false,
      rowsUpserted,
      rowsSkipped,
      bySource,
      error: message,
      runId: run.id,
    };
  }
}
