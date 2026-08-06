import { inferCaseKind, normalizeServiceCenter } from "./centers";
import { isUsableDuration } from "./estimate";
import type {
  CleanedCommunityCase,
  CommunitySource,
  PartnerCasePayload,
} from "./types";

/**
 * Parse a partner date, rejecting calendar-impossible values.
 *
 * The round-trip check matters: `Date.UTC(2026, 1, 31)` silently rolls over to
 * March 3 rather than returning NaN, so a range check alone would let
 * "2026-02-31" through to Postgres, which rejects it and fails the entire
 * upsert batch it happens to land in.
 */
function parseDateOnly(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const m = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/** Calendar-day delta (UTC date parts). Negative → null (bad partner data). */
export function daysBetweenDates(
  start: string | null,
  end: string | null
): number | null {
  if (!start || !end) return null;
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const days = Math.round((b - a) / (1000 * 60 * 60 * 24));
  if (days < 0) return null;
  return days;
}

function normalizeSource(raw: string | null | undefined): CommunitySource {
  const s = (raw ?? "").toLowerCase();
  if (s === "reddit") return "reddit";
  if (s === "registered") return "registered";
  return "other";
}

/**
 * Clean one partner row. Drops unusable ids; keeps rows without approval
 * (still useful for future stage analytics) but nulls absurd day gaps.
 */
export function cleanPartnerCase(
  raw: PartnerCasePayload
): CleanedCommunityCase | null {
  const externalId = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!externalId) return null;

  const init_date = parseDateOnly(raw.init_date);
  const biometrics_date = parseDateOnly(raw.biometrics_date);
  const pp_date = parseDateOnly(raw.pp_date);
  const approve_date = parseDateOnly(raw.approve_date);
  const card_produce_date = parseDateOnly(raw.card_produce_date);
  const delivered_date = parseDateOnly(raw.delivered_date);

  const rawApproval = daysBetweenDates(init_date, approve_date);
  const days_to_approval = isUsableDuration(rawApproval) ? rawApproval : null;

  const rawProduce = daysBetweenDates(approve_date, card_produce_date);
  const days_to_produce =
    rawProduce !== null && rawProduce <= 120 ? rawProduce : null;

  const rawDeliver = daysBetweenDates(card_produce_date, delivered_date);
  const days_to_deliver =
    rawDeliver !== null && rawDeliver <= 90 ? rawDeliver : null;

  const premium =
    Boolean(raw.premium_processing) || Boolean(pp_date);

  return {
    external_id: externalId,
    source: normalizeSource(raw.source),
    case_kind: inferCaseKind({ partnerType: raw.type }),
    service_center: normalizeServiceCenter(raw.service_center),
    premium_processing: premium,
    init_date,
    biometrics_date,
    pp_date,
    approve_date,
    card_produce_date,
    delivered_date,
    nationality: raw.nationality?.trim() || null,
    days_to_approval,
    days_to_produce,
    days_to_deliver,
    external_updated_at: raw.updated_at ?? null,
  };
}
