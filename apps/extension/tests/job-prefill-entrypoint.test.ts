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
assert.match(
  jobPortal,
  /TrackMyOPT scanned this page[\s\S]+role', 'progressbar'[\s\S]+Required[\s\S]+Optional/,
  "the widget must show truthful required/optional scan progress after prefill"
);

console.log("job-prefill-entrypoint: web dashboard links are discoverable from the extension");
