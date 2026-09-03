import { z } from "zod";
import type { CommunityCaseKind } from "@/lib/community-opt/types";

/** User-selected filing types tracked in the portal. */
export const FILING_CATEGORIES = [
  "initial_opt",
  "stem_extension",
  "h1b",
  "h4",
  "h4_ead",
  "i485",
  "i130",
  "i140",
  "i131",
  "other",
] as const;

export type FilingCategory = (typeof FILING_CATEGORIES)[number];

export const DEFAULT_FILING_CATEGORY: FilingCategory = "initial_opt";

export const filingCategorySchema = z.enum(FILING_CATEGORIES);

export const FILING_CATEGORY_GROUPS: ReadonlyArray<{
  label: string;
  categories: readonly FilingCategory[];
}> = [
  {
    label: "OPT / EAD",
    categories: ["initial_opt", "stem_extension"],
  },
  {
    label: "Other USCIS Cases",
    categories: ["h1b", "h4", "h4_ead", "i485", "i130", "i140", "i131", "other"],
  },
];

const FILING_CATEGORY_LABELS: Record<FilingCategory, string> = {
  initial_opt: "Initial OPT (EAD)",
  stem_extension: "STEM OPT Extension (EAD)",
  h1b: "H-1B (I-129)",
  h4: "H-4 Extension (I-539)",
  h4_ead: "H-4 EAD (I-765)",
  i485: "Green Card AOS (I-485)",
  i130: "Family Petition (I-130)",
  i140: "Employment Petition (I-140)",
  i131: "Advance Parole / Travel (I-131)",
  other: "Other USCIS Case",
};

/** Typical USCIS formType for each category (used for mismatch hints). */
const EXPECTED_USCIS_FORM: Partial<Record<FilingCategory, string>> = {
  initial_opt: "I-765",
  stem_extension: "I-765",
  h1b: "I-129",
  h4: "I-539",
  h4_ead: "I-765",
  i485: "I-485",
  i130: "I-130",
  i140: "I-140",
  i131: "I-131",
};

export function getFilingCategoryLabel(
  category: FilingCategory | string | null | undefined
): string {
  if (category && category in FILING_CATEGORY_LABELS) {
    return FILING_CATEGORY_LABELS[category as FilingCategory];
  }
  return FILING_CATEGORY_LABELS.initial_opt;
}

/** Compact label for tabs, extension, and chips. */
export function getFilingCategoryShortLabel(
  category: FilingCategory | string | null | undefined
): string {
  const normalized = normalizeFilingCategory(category);
  const short: Record<FilingCategory, string> = {
    initial_opt: "OPT",
    stem_extension: "STEM",
    h1b: "H-1B",
    h4: "H-4",
    h4_ead: "H-4 EAD",
    i485: "I-485",
    i130: "I-130",
    i140: "I-140",
    i131: "I-131",
    other: "Other",
  };
  return short[normalized];
}

export function normalizeFilingCategory(
  value: string | null | undefined
): FilingCategory {
  if (value && FILING_CATEGORIES.includes(value as FilingCategory)) {
    return value as FilingCategory;
  }
  return DEFAULT_FILING_CATEGORY;
}

export const COMMUNITY_CASE_KIND_LABEL: Record<CommunityCaseKind, string> = {
  initial_opt: "initial OPT",
  stem_extension: "STEM OPT extension",
};

export function getCommunityCaseKindLabel(
  kind: CommunityCaseKind | string | null | undefined
): string {
  if (kind === "stem_extension") return COMMUNITY_CASE_KIND_LABEL.stem_extension;
  return COMMUNITY_CASE_KIND_LABEL.initial_opt;
}

/** Live stats widget key for community reports on the case status page. */
export function communityStatsToolType(
  category: FilingCategory | string | null | undefined
): "opt-apply" | "stem-apply" {
  return normalizeFilingCategory(category) === "stem_extension"
    ? "stem-apply"
    : "opt-apply";
}

export function isOptFilingCategory(
  category: FilingCategory | string | null | undefined
): boolean {
  const normalized = normalizeFilingCategory(category);
  return normalized === "initial_opt" || normalized === "stem_extension";
}

export function filingCategoryToCaseKind(
  category: FilingCategory | string | null | undefined
): CommunityCaseKind {
  return normalizeFilingCategory(category) === "stem_extension"
    ? "stem_extension"
    : "initial_opt";
}

/** Default from onboarding journey step when present. */
export function filingCategoryFromJourneyStatus(
  status: "applying_opt" | "on_opt" | "stem_opt" | null | undefined
): FilingCategory {
  return status === "stem_opt" ? "stem_extension" : DEFAULT_FILING_CATEGORY;
}

export function getExpectedUscisForm(
  category: FilingCategory | string | null | undefined
): string | null {
  return EXPECTED_USCIS_FORM[normalizeFilingCategory(category)] ?? null;
}

function normalizeFormToken(form: string): string {
  return form.toUpperCase().replace(/[\s_-]/g, "");
}

/** Soft warning when USCIS formType does not match the user's filing category. */
export function getFilingCategoryFormMismatch(
  category: FilingCategory | string | null | undefined,
  uscisFormType: string | null | undefined
): string | null {
  const expected = getExpectedUscisForm(category);
  if (!expected || !uscisFormType?.trim()) return null;

  const normalizedCategory = normalizeFilingCategory(category);
  if (normalizedCategory === "other") return null;

  const expectedToken = normalizeFormToken(expected);
  const actualToken = normalizeFormToken(uscisFormType);
  if (actualToken.includes(expectedToken) || expectedToken.includes(actualToken)) {
    return null;
  }

  return `You selected ${getFilingCategoryLabel(category)} (typically ${expected}), but USCIS shows ${uscisFormType.trim()}. Double-check your receipt or update your filing type.`;
}
