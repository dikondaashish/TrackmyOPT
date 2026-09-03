import assert from "node:assert/strict";
import {
  communityStatsToolType,
  filingCategoryFromJourneyStatus,
  filingCategoryToCaseKind,
  getCommunityCaseKindLabel,
  getFilingCategoryFormMismatch,
  getFilingCategoryLabel,
  getFilingCategoryShortLabel,
  isOptFilingCategory,
  normalizeFilingCategory,
} from "./filing-category";
import { inferCaseKind } from "@/lib/community-opt/centers";

assert.equal(getFilingCategoryLabel("initial_opt"), "Initial OPT (EAD)");
assert.equal(getFilingCategoryLabel("stem_extension"), "STEM OPT Extension (EAD)");
assert.equal(getFilingCategoryLabel("h1b"), "H-1B (I-129)");
assert.equal(getFilingCategoryShortLabel("stem_extension"), "STEM");
assert.equal(normalizeFilingCategory(null), "initial_opt");
assert.equal(normalizeFilingCategory("h4_ead"), "h4_ead");
assert.equal(normalizeFilingCategory("bogus"), "initial_opt");
assert.equal(filingCategoryFromJourneyStatus("stem_opt"), "stem_extension");
assert.equal(filingCategoryToCaseKind("h1b"), "initial_opt");
assert.equal(isOptFilingCategory("stem_extension"), true);
assert.equal(communityStatsToolType("stem_extension"), "stem-apply");
assert.equal(communityStatsToolType("initial_opt"), "opt-apply");
assert.equal(getCommunityCaseKindLabel("stem_extension"), "STEM OPT extension");
assert.equal(isOptFilingCategory("h1b"), false);
assert.equal(
  inferCaseKind({ caseType: "I-765", filingCategory: "stem_extension" }),
  "stem_extension"
);
assert.equal(getFilingCategoryFormMismatch("h1b", "I-129"), null);
assert.match(
  getFilingCategoryFormMismatch("h1b", "I-539") ?? "",
  /H-1B/
);
