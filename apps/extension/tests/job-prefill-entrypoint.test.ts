import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { API_ENDPOINTS } from "../src/config";

assert.equal(
  API_ENDPOINTS.DASHBOARD_JOB_PREFILL,
  "https://www.trackmyopt.com/dashboard/extension"
);

const popupHome = readFileSync("src/home.ts", "utf8");
assert.match(
  popupHome,
  /id="manage-job-prefill-link"[\s\S]+API_ENDPOINTS\.DASHBOARD_JOB_PREFILL/,
  "the signed-in extension popup must link to the job-prefill setup page"
);

const jobPortal = readFileSync("src/content-job-portal.ts", "utf8");
assert.match(
  jobPortal,
  /Manage saved prefill data[\s\S]+API_ENDPOINTS\.DASHBOARD_JOB_PREFILL/,
  "the in-page extension assistant must expose the same setup link"
);
assert.match(
  jobPortal,
  /max-height:\s*calc\(100dvh - 16px\)/,
  "the expanded widget must stay within the visible browser height"
);
assert.match(
  jobPortal,
  /tmo-job-widget-scroll-body[\s\S]+max-height:calc\(100dvh - 72px\)[\s\S]+overflow-y:auto/,
  "the expanded widget body must provide its own vertical scroll area"
);
assert.match(
  jobPortal,
  /body\.hidden = true;[\s\S]+display:none;gap:7px;margin-top:8px/,
  "private answers must start collapsed instead of making every widget oversized"
);
assert.match(
  jobPortal,
  /new ResizeObserver[\s\S]+clampWidgetToViewport/,
  "the widget must remain onscreen when expandable content changes its height"
);
const prefillCoverageUi = readFileSync("src/job-portal-prefill-coverage-ui.ts", "utf8");
assert.match(
  prefillCoverageUi,
  /TrackMyOPT scanned this page[\s\S]+role', 'progressbar'[\s\S]+Required[\s\S]+Optional/,
  "the widget must show truthful required/optional scan progress after prefill"
);
assert.match(
  jobPortal,
  /paintPrefillCoverage\(prefillResultLine/,
  "the widget must still paint prefill coverage into the result line"
);

// The popup's "Prefill this application" button injects easy-apply-fill.js.
// It previously called runPrefill() with no arguments, so that button could
// never attach a generated resume no matter what the user had tailored.
const popupPrefillEntry = readFileSync("src/easy-apply-fill.ts", "utf8");
assert.match(
  popupPrefillEntry,
  /RESOLVE_V1_PREFILL_PAYLOAD/,
  "the popup prefill entry must resolve the active resume artifact"
);
assert.match(
  popupPrefillEntry,
  /resume:\s*resolved\.resume/,
  "the popup prefill entry must pass the resolved resume through to runPrefill"
);
assert.match(
  popupPrefillEntry,
  /PREFILL_CHILD_FRAMES/,
  "the popup prefill entry must relay the resolved payload to child frames"
);
assert.match(
  popupPrefillEntry,
  /window\.top === window\.self/,
  "only the top frame may resolve the payload; a child frame's URL is the ATS iframe"
);
assert.doesNotMatch(
  popupPrefillEntry,
  /runPrefill\(\s*\{\s*quietIfNoForm/,
  "the popup prefill entry must not fall back to the old resume-less call"
);

// The popup button used to describe the action identically whether or not a
// tailored resume existed, so the most-reached entry point never hinted a
// resume was involved.
assert.match(
  popupHome,
  /RESOLVE_V1_PREFILL_PAYLOAD[\s\S]{0,800}prefillEntryCopy/,
  "the popup must resolve the active tab's resume state and relabel its Prefill button"
);
assert.match(
  popupHome,
  /discardRejectedArtifact:\s*false/,
  "opening the popup must never invalidate a generated resume"
);

console.log("job-prefill-entrypoint: web dashboard links are discoverable from the extension");
