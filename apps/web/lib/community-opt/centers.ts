import type { CommunityCaseKind, CommunityServiceCenter } from "./types";

const CENTER_ALIASES: Record<string, CommunityServiceCenter> = {
  potomac: "potomac",
  psc: "potomac",
  ysc: "potomac",
  nebraska: "nebraska",
  nsc: "nebraska",
  nbc: "nbc",
  lin: "nebraska",
  texas: "texas",
  tsc: "texas",
  src: "texas",
  vermont: "vermont",
  vsc: "vermont",
  eac: "vermont",
  california: "california",
  csc: "california",
  wac: "california",
};

/** Map USCIS receipt prefix → community center key (best-effort). */
const RECEIPT_PREFIX_TO_CENTER: Record<string, CommunityServiceCenter> = {
  YSC: "potomac",
  LIN: "nebraska",
  SRC: "texas",
  EAC: "vermont",
  WAC: "california",
  // Online filings often sit under NBC / IOE — partner data uses nbc sometimes.
  IOE: "nbc",
  MSC: "nbc",
  NBC: "nbc",
};

export function normalizeServiceCenter(
  raw: string | null | undefined
): CommunityServiceCenter | null {
  if (!raw?.trim()) return null;
  return CENTER_ALIASES[raw.trim().toLowerCase()] ?? null;
}

export function serviceCenterFromReceipt(
  receiptNumber: string | null | undefined
): CommunityServiceCenter | null {
  const prefix = (receiptNumber ?? "").trim().toUpperCase().slice(0, 3);
  if (!prefix) return null;
  return RECEIPT_PREFIX_TO_CENTER[prefix] ?? null;
}

export function inferCaseKind(input: {
  partnerType?: string | null;
  caseType?: string | null;
  label?: string | null;
  filingCategory?: string | null;
}): CommunityCaseKind {
  if (input.filingCategory === "stem_extension") return "stem_extension";
  if (input.filingCategory === "initial_opt") return "initial_opt";

  const blob = [input.partnerType, input.caseType, input.label]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (blob.includes("stem")) return "stem_extension";
  if (blob.includes("extension") && !blob.includes("initial")) return "stem_extension";
  return "initial_opt";
}
