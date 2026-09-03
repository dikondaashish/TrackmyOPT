/** Short filing-category labels for the Chrome extension (mirrors web app). */
const SHORT_LABELS: Record<string, string> = {
  initial_opt: "OPT",
  stem_extension: "STEM OPT",
  h1b: "H-1B",
  h4: "H-4",
  h4_ead: "H-4 EAD",
  i485: "I-485",
  i130: "I-130",
  i140: "I-140",
  i131: "I-131",
  other: "Other",
};

export function filingCategoryShortLabel(
  category: string | null | undefined
): string {
  if (category && category in SHORT_LABELS) return SHORT_LABELS[category];
  return SHORT_LABELS.initial_opt;
}
